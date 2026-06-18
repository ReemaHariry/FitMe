"""
Weekly Performance Summary Route

Analyzes the user's real exercise_sessions and reports data from the database
to generate a structured weekly performance summary with:
  - This week vs last week comparison (sessions, form score, mistakes, minutes)
  - Per-exercise breakdown with trend indicators
  - Top recurring mistakes extracted from full_report JSONB
  - Smart rule-based feedback and targeted recommendations
  - Consistency streak calculation

No AI API needed — all intelligence comes from real DB patterns.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import logging

from app.routes.users import get_current_user
from app.services.supabase_service import get_supabase_client, get_profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/weekly-summary", tags=["Weekly Summary"])


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class WeekComparison(BaseModel):
    sessions_this_week: int
    sessions_last_week: int
    avg_form_this_week: Optional[float]
    avg_form_last_week: Optional[float]
    total_mistakes_this_week: int
    total_mistakes_last_week: int
    total_minutes_this_week: float
    total_minutes_last_week: float
    form_trend: str        # "improving" | "declining" | "stable" | "no_data"
    mistake_trend: str     # "improving" | "declining" | "stable" | "no_data"


class ExerciseBreakdown(BaseModel):
    exercise_type: str
    sessions: int
    avg_form_score: Optional[float]
    total_mistakes: int
    best_form_score: Optional[int]
    trend: str             # "improving" | "declining" | "stable" | "new"


class RecurringMistake(BaseModel):
    mistake_type: str
    display_name: str
    total_occurrences: int
    affected_sessions: int
    severity: str          # "high" | "medium" | "low"
    correction_tip: str
    injury_risk: Optional[str]


class Recommendation(BaseModel):
    category: str          # "form" | "frequency" | "variety" | "recovery" | "milestone"
    priority: str          # "high" | "medium" | "low"
    title: str
    detail: str
    icon: str              # emoji for frontend display


class WeeklySummaryResponse(BaseModel):
    # Meta
    week_start: str
    week_end: str
    generated_at: str
    has_data: bool

    # Profile
    user_name: Optional[str]
    fitness_goal: Optional[str]
    target_training_days: Optional[int]

    # Overview
    comparison: WeekComparison
    consistency_streak: int           # consecutive weeks with ≥1 session
    all_time_sessions: int
    all_time_avg_form: Optional[float]

    # Breakdown
    exercise_breakdown: List[ExerciseBreakdown]
    recurring_mistakes: List[RecurringMistake]
    best_session_this_week: Optional[Dict[str, Any]]

    # Feedback
    performance_label: str            # "Great Week" | "Good Progress" | "Needs Attention" | "No Activity"
    headline_message: str             # 1-sentence summary
    recommendations: List[Recommendation]
    strengths: List[str]              # what they did well
    focus_areas: List[str]            # what to work on


# ============================================================================
# HELPERS
# ============================================================================

def _week_bounds(weeks_ago: int = 0):
    """Return (start, end) UTC datetimes for a given week offset."""
    now = datetime.now(timezone.utc)
    # Monday of current week
    monday = now - timedelta(days=now.weekday())
    monday = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    start = monday - timedelta(weeks=weeks_ago)
    end   = start + timedelta(days=7)
    return start, end


def _fmt_mistake_type(raw: str) -> str:
    """Convert snake_case mistake keys to readable labels."""
    labels = {
        "knees_past_toes":       "Knees Past Toes",
        "insufficient_depth":    "Insufficient Depth",
        "forward_lean":          "Excessive Forward Lean",
        "back_arch":             "Back Arch / Hyperextension",
        "elbow_flare":           "Elbow Flare",
        "hip_asymmetry":         "Hip Asymmetry",
        "head_position":         "Head / Neck Position",
        "foot_placement":        "Foot Placement",
        "knee_cave":             "Knee Cave (Valgus)",
        "wrist_alignment":       "Wrist Alignment",
        "core_engagement":       "Core Not Engaged",
        "shallow_breath":        "Breathing Pattern",
        "locked_knees":          "Locked Knees",
    }
    return labels.get(raw, raw.replace("_", " ").title())


def _default_tip(mistake_type: str) -> str:
    tips = {
        "knees_past_toes":    "Shift weight to heels and push hips back as you descend.",
        "insufficient_depth": "Work on hip flexor mobility; aim for hip crease below knee.",
        "forward_lean":       "Keep chest up and brace your core throughout the rep.",
        "back_arch":          "Engage your core and tuck your pelvis slightly.",
        "elbow_flare":        "Keep elbows at 45° to your torso, not flaring outward.",
        "knee_cave":          "Push knees outward in line with your toes; strengthen glutes.",
        "hip_asymmetry":      "Check foot placement symmetry and improve single-leg stability.",
        "head_position":      "Keep a neutral spine — don't crane neck up or tuck chin too hard.",
        "core_engagement":    "Brace your abs before each rep as if expecting a punch.",
    }
    return tips.get(mistake_type, "Focus on controlled movement and proper alignment.")


# ============================================================================
# CORE ANALYSIS FUNCTION
# ============================================================================

def _build_summary(user_id: str, profile: Optional[Dict]) -> WeeklySummaryResponse:
    sb = get_supabase_client()
    now = datetime.now(timezone.utc)

    this_start, this_end   = _week_bounds(0)
    last_start, last_end   = _week_bounds(1)

    # ── Fetch sessions ─────────────────────────────────────────────────────
    def fetch_sessions(start: datetime, end: datetime):
        r = sb.table("exercise_sessions").select(
            "id, exercise_type, session_name, duration_seconds, form_score, "
            "performance_rating, total_mistakes, started_at"
        ).eq("user_id", user_id).eq("status", "completed") \
         .gte("started_at", start.isoformat()) \
         .lt("started_at", end.isoformat()) \
         .order("started_at", desc=True).execute()
        return r.data or []

    this_sessions = fetch_sessions(this_start, this_end)
    last_sessions = fetch_sessions(last_start, last_end)

    # All-time sessions for streak + totals
    all_r = sb.table("exercise_sessions").select(
        "id, exercise_type, form_score, total_mistakes, duration_seconds, started_at"
    ).eq("user_id", user_id).eq("status", "completed") \
     .order("started_at", desc=True).execute()
    all_sessions = all_r.data or []

    # ── Fetch reports for this week (for mistake analysis) ─────────────────
    reports_r = sb.table("reports").select(
        "exercise_type, form_score, total_mistakes, full_report, generated_at"
    ).eq("user_id", user_id) \
     .gte("generated_at", this_start.isoformat()) \
     .lt("generated_at", this_end.isoformat()) \
     .execute()
    this_reports = reports_r.data or []

    # ── Helper aggregators ─────────────────────────────────────────────────
    def avg_form(sessions):
        scores = [s["form_score"] for s in sessions if s.get("form_score") is not None]
        return round(sum(scores) / len(scores), 1) if scores else None

    def total_mistakes(sessions):
        return sum(s.get("total_mistakes") or 0 for s in sessions)

    def total_minutes(sessions):
        return round(sum(s.get("duration_seconds") or 0 for s in sessions) / 60, 1)

    # ── Week comparison ────────────────────────────────────────────────────
    af_this  = avg_form(this_sessions)
    af_last  = avg_form(last_sessions)

    if af_this is not None and af_last is not None:
        diff = af_this - af_last
        form_trend = "improving" if diff >= 3 else ("declining" if diff <= -3 else "stable")
    elif af_this is not None:
        form_trend = "new"
    else:
        form_trend = "no_data"

    mk_this = total_mistakes(this_sessions)
    mk_last = total_mistakes(last_sessions)
    if this_sessions and last_sessions:
        # fewer mistakes per session = improving
        rate_this = mk_this / len(this_sessions)
        rate_last = mk_last / len(last_sessions)
        mistake_trend = "improving" if rate_this < rate_last - 0.5 else \
                        ("declining" if rate_this > rate_last + 0.5 else "stable")
    else:
        mistake_trend = "no_data"

    comparison = WeekComparison(
        sessions_this_week=len(this_sessions),
        sessions_last_week=len(last_sessions),
        avg_form_this_week=af_this,
        avg_form_last_week=af_last,
        total_mistakes_this_week=mk_this,
        total_mistakes_last_week=mk_last,
        total_minutes_this_week=total_minutes(this_sessions),
        total_minutes_last_week=total_minutes(last_sessions),
        form_trend=form_trend,
        mistake_trend=mistake_trend,
    )

    # ── Consistency streak (consecutive weeks with ≥1 session) ────────────
    streak = 0
    if all_sessions:
        for w in range(0, 52):
            ws, we = _week_bounds(w)
            week_has_session = any(
                ws <= datetime.fromisoformat(
                    s["started_at"].replace("Z", "+00:00")
                ) < we
                for s in all_sessions
                if s.get("started_at")
            )
            if week_has_session:
                streak += 1
            else:
                break

    # ── All-time stats ─────────────────────────────────────────────────────
    all_time_avg = avg_form(all_sessions)

    # ── Exercise breakdown (this week) ─────────────────────────────────────
    ex_map: Dict[str, list] = defaultdict(list)
    for s in this_sessions:
        ex_map[s.get("exercise_type", "unknown")].append(s)

    # For trend: compare this week's per-exercise avg vs all-time avg
    all_ex_map: Dict[str, list] = defaultdict(list)
    for s in all_sessions:
        all_ex_map[s.get("exercise_type", "unknown")].append(s)

    exercise_breakdown = []
    for ex, sessions in ex_map.items():
        scores_now = [s["form_score"] for s in sessions if s.get("form_score") is not None]
        avg_now = round(sum(scores_now) / len(scores_now), 1) if scores_now else None
        best = max((s["form_score"] for s in sessions if s.get("form_score") is not None), default=None)

        all_ex = all_ex_map.get(ex, [])
        # All-time excluding this week
        prior = [s for s in all_ex if s not in sessions]
        avg_prior = avg_form(prior)

        if avg_now is not None and avg_prior is not None:
            d = avg_now - avg_prior
            trend = "improving" if d >= 3 else ("declining" if d <= -3 else "stable")
        elif not prior:
            trend = "new"
        else:
            trend = "stable"

        exercise_breakdown.append(ExerciseBreakdown(
            exercise_type=ex,
            sessions=len(sessions),
            avg_form_score=avg_now,
            total_mistakes=total_mistakes(sessions),
            best_form_score=best,
            trend=trend,
        ))

    exercise_breakdown.sort(key=lambda x: x.sessions, reverse=True)

    # ── Recurring mistakes (from JSONB full_report this week) ──────────────
    mistake_agg: Dict[str, Dict] = {}
    for rep in this_reports:
        fr = rep.get("full_report") or {}
        mistakes = fr.get("mistakes") or []
        for m in mistakes:
            mtype = m.get("mistake_type", "unknown")
            if mtype not in mistake_agg:
                mistake_agg[mtype] = {
                    "total": 0, "sessions": 0,
                    "severity": m.get("severity", "medium"),
                    "tip": m.get("correction_tip") or _default_tip(mtype),
                    "injury_risk": None,
                }
                w = m.get("warning") or {}
                if w.get("injury_risk"):
                    mistake_agg[mtype]["injury_risk"] = w["injury_risk"]
            mistake_agg[mtype]["total"]    += m.get("count", 1)
            mistake_agg[mtype]["sessions"] += 1

    recurring_mistakes = []
    sev_order = {"high": 0, "medium": 1, "low": 2}
    for mtype, data in sorted(
        mistake_agg.items(),
        key=lambda x: (sev_order.get(x[1]["severity"], 9), -x[1]["total"])
    )[:6]:
        recurring_mistakes.append(RecurringMistake(
            mistake_type=mtype,
            display_name=_fmt_mistake_type(mtype),
            total_occurrences=data["total"],
            affected_sessions=data["sessions"],
            severity=data["severity"],
            correction_tip=data["tip"],
            injury_risk=data["injury_risk"],
        ))

    # ── Best session this week ─────────────────────────────────────────────
    best_session = None
    sessions_with_score = [s for s in this_sessions if s.get("form_score") is not None]
    if sessions_with_score:
        best = max(sessions_with_score, key=lambda s: s["form_score"])
        best_session = {
            "exercise_type": best.get("exercise_type"),
            "form_score": best.get("form_score"),
            "performance_rating": best.get("performance_rating"),
            "duration_min": round((best.get("duration_seconds") or 0) / 60, 1),
            "session_name": best.get("session_name"),
        }

    # ── Performance label + headline ───────────────────────────────────────
    n = len(this_sessions)
    target_days = (profile or {}).get("training_days_per_week") or 3
    goal = (profile or {}).get("fitness_goal") or "maintain"

    if n == 0:
        perf_label = "No Activity"
        headline   = "No workouts recorded this week — let's get back on track!"
    elif af_this is not None and af_this >= 80 and n >= target_days:
        perf_label = "Outstanding Week 🏆"
        headline   = f"Excellent — {n} sessions with an average form score of {af_this}/100!"
    elif af_this is not None and af_this >= 70 and n >= max(target_days - 1, 1):
        perf_label = "Great Progress 💪"
        headline   = f"Strong week with {n} sessions and {af_this}/100 avg form score."
    elif n >= 1:
        perf_label = "Keep Going 📈"
        headline   = f"{n} session{'s' if n > 1 else ''} completed — consistency is key, keep pushing!"
    else:
        perf_label = "Needs Attention"
        headline   = "Focus on getting at least one quality session in this week."

    # ── Strengths ──────────────────────────────────────────────────────────
    strengths = []
    if n >= target_days:
        strengths.append(f"Hit your target of {target_days} training days this week ✓")
    if form_trend == "improving" and af_this and af_last:
        strengths.append(f"Form score improved by {round(af_this - af_last, 1)} pts vs last week")
    if mistake_trend == "improving":
        strengths.append("Fewer mistakes per session compared to last week")
    if streak >= 3:
        strengths.append(f"{streak}-week training streak — great consistency!")
    if best_session and best_session["form_score"] and best_session["form_score"] >= 80:
        strengths.append(f"Personal best form in {best_session['exercise_type']}: {best_session['form_score']}/100")
    if not strengths and n > 0:
        strengths.append("Showed up and put in the work this week")

    # ── Focus areas ────────────────────────────────────────────────────────
    focus_areas = []
    if recurring_mistakes:
        top = recurring_mistakes[0]
        focus_areas.append(f"Reduce '{top.display_name}' — occurred {top.total_occurrences}× this week")
    if n < target_days:
        focus_areas.append(f"Increase training frequency (target: {target_days} days/week)")
    if af_this is not None and af_this < 65:
        focus_areas.append("Slow down rep tempo to improve form score above 70")
    if form_trend == "declining":
        focus_areas.append("Form score dropped — consider lighter intensity to rebuild technique")
    if not focus_areas:
        focus_areas.append("Maintain current quality and gradually increase difficulty")

    # ── Recommendations ────────────────────────────────────────────────────
    recs: List[Recommendation] = []

    # Form-based
    if recurring_mistakes:
        top_mistake = recurring_mistakes[0]
        recs.append(Recommendation(
            category="form",
            priority="high",
            title=f"Fix: {top_mistake.display_name}",
            detail=top_mistake.correction_tip,
            icon="🎯",
        ))

    # Frequency
    if n < target_days:
        gap = target_days - n
        recs.append(Recommendation(
            category="frequency",
            priority="high" if gap >= 2 else "medium",
            title=f"Add {gap} more session{'s' if gap > 1 else ''} this week",
            detail=f"Your goal is {target_days} days/week. Try splitting remaining sessions across different muscle groups.",
            icon="📅",
        ))
    elif n >= target_days:
        recs.append(Recommendation(
            category="frequency",
            priority="low",
            title="On track with training frequency",
            detail="You hit your weekly target. Consider adding one optional active recovery session.",
            icon="✅",
        ))

    # Goal-specific
    if goal == "lose_weight":
        recs.append(Recommendation(
            category="variety",
            priority="medium",
            title="Add a cardio session",
            detail="For fat loss, mix strength training with 20–30 min of cardio 2×/week to maximize caloric burn.",
            icon="🏃",
        ))
    elif goal == "build_muscle":
        recs.append(Recommendation(
            category="recovery",
            priority="medium",
            title="Prioritize rest between muscle groups",
            detail="Allow 48h recovery between sessions targeting the same muscle group to maximize hypertrophy.",
            icon="💤",
        ))
    else:
        recs.append(Recommendation(
            category="variety",
            priority="low",
            title="Vary your exercise selection",
            detail="Rotating exercise types prevents adaptation plateaus and reduces overuse injury risk.",
            icon="🔄",
        ))

    # Streak milestone
    if streak in (3, 5, 7, 10, 12):
        recs.append(Recommendation(
            category="milestone",
            priority="low",
            title=f"{streak}-Week Streak! 🎉",
            detail="Consistency is the #1 predictor of long-term fitness results. Keep it going!",
            icon="🔥",
        ))

    # Form recovery
    if af_this is not None and af_this < 60:
        recs.append(Recommendation(
            category="form",
            priority="high",
            title="Focus session: technique only",
            detail="Schedule one session this week at 50% effort dedicated purely to slow, controlled reps with a mirror or recording.",
            icon="🪞",
        ))

    return WeeklySummaryResponse(
        week_start=this_start.strftime("%d %b %Y"),
        week_end=(this_end - timedelta(days=1)).strftime("%d %b %Y"),
        generated_at=now.isoformat(),
        has_data=len(all_sessions) > 0,
        user_name=(profile or {}).get("full_name"),
        fitness_goal=goal,
        target_training_days=target_days,
        comparison=comparison,
        consistency_streak=streak,
        all_time_sessions=len(all_sessions),
        all_time_avg_form=all_time_avg,
        exercise_breakdown=exercise_breakdown,
        recurring_mistakes=recurring_mistakes,
        best_session_this_week=best_session,
        performance_label=perf_label,
        headline_message=headline,
        recommendations=recs[:5],
        strengths=strengths[:4],
        focus_areas=focus_areas[:3],
    )


# ============================================================================
# ENDPOINT
# ============================================================================

@router.get("", response_model=WeeklySummaryResponse)
async def get_weekly_summary(current_user: dict = Depends(get_current_user)):
    """
    Generate a personalized weekly performance summary.

    Analyzes:
      - exercise_sessions table: sessions, form scores, durations, mistakes
      - reports table (full_report JSONB): mistake types, severities, correction tips
      - profiles table: fitness goal, training targets, name

    Returns comparisons vs last week, recurring mistake analysis,
    smart recommendations, and a consistency streak.
    """
    try:
        user_id  = current_user["id"]
        profile  = get_profile(user_id)
        summary  = _build_summary(user_id, profile)
        return summary
    except Exception as e:
        logger.error(f"Weekly summary error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
