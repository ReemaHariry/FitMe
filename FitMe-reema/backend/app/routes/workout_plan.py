"""
Personalized Workout Plan

Generates a weekly workout plan based on the user's profile data:
  - fitness_goal  (lose_weight | build_muscle | maintain)
  - training_days_per_week
  - preferred_workout_duration
  - gender / age / weight / height  (to determine experience-appropriate exercises)

No AI API, no extra pip packages — pure Python logic.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
import logging

from app.routes.users import get_current_user
from app.services.supabase_service import get_profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workout-plan", tags=["Workout Plan"])


# ─── Response models ──────────────────────────────────────────────────────────

class Exercise(BaseModel):
    name: str
    sets: int
    reps: str          # e.g. "10-12" or "30 sec"
    rest_sec: int
    muscle_group: str
    equipment: str
    tip: str           # coaching cue


class DayPlan(BaseModel):
    day_name: str      # "Monday"
    label: str         # "Upper Body – Strength"
    is_rest: bool
    duration_min: int
    exercises: List[Exercise]
    warmup: List[str]
    cooldown: List[str]


class WorkoutPlanResponse(BaseModel):
    plan_title: str
    goal: str
    split: str
    level: str
    days_per_week: int
    weeks: int
    days: List[DayPlan]
    key_tips: List[str]
    nutrition_note: str


# ─── Exercise library ─────────────────────────────────────────────────────────
# Each tuple: (name, muscle_group, equipment, tip)

_CHEST = [
    ("Push-Up",              "Chest / Triceps",     "Bodyweight",     "Keep your body in a straight line; lower chest to 2 cm from floor."),
    ("Dumbbell Bench Press", "Chest / Triceps",     "Dumbbells+Bench","Retract shoulder blades; press to full extension without locking elbows."),
    ("Incline DB Press",     "Upper Chest",         "Dumbbells+Bench","Set bench at 30-45°; feel the stretch at the bottom."),
    ("Dumbbell Fly",         "Chest",               "Dumbbells+Bench","Slight elbow bend throughout; squeeze at the top."),
]
_BACK = [
    ("Lat Pulldown",         "Lats / Biceps",       "Cable Machine",  "Pull elbows down to hips; lean back slightly."),
    ("Seated Cable Row",     "Mid-Back",            "Cable Machine",  "Sit tall; squeeze shoulder blades together at end."),
    ("Dumbbell Row",         "Back / Biceps",       "Dumbbell+Bench", "Keep back flat; row elbow to hip."),
    ("Face Pull",            "Rear Delts",          "Cable Machine",  "Elbows high; great for posture and shoulder health."),
]
_SHOULDERS = [
    ("Dumbbell Shoulder Press","Shoulders / Triceps","Dumbbells",     "Brace core; press directly overhead."),
    ("Lateral Raise",        "Side Delts",          "Dumbbells",      "Lead with elbows; keep a slight bend."),
    ("Front Raise",          "Front Delts",         "Dumbbells",      "Controlled motion — no swinging."),
]
_LEGS = [
    ("Bodyweight Squat",     "Quads / Glutes",      "Bodyweight",     "Feet shoulder-width; track knees over toes."),
    ("Dumbbell Squat",       "Quads / Glutes",      "Dumbbells",      "Hold dumbbells at sides; descend until thighs are parallel."),
    ("Romanian Deadlift",    "Hamstrings / Glutes", "Dumbbells",      "Hinge at hips; feel the hamstring stretch before returning."),
    ("Reverse Lunge",        "Quads / Glutes",      "Bodyweight",     "Step back; front knee stays over ankle."),
    ("Glute Bridge",         "Glutes / Hamstrings", "Bodyweight",     "Drive hips high; squeeze glutes for 1 sec at top."),
    ("Calf Raise",           "Calves",              "Bodyweight",     "Full stretch at bottom; pause at top."),
]
_CORE = [
    ("Plank",                "Core",                "Bodyweight",     "Engage glutes; don't let hips sag."),
    ("Dead Bug",             "Deep Core",           "Bodyweight",     "Press lower back into floor throughout."),
    ("Russian Twist",        "Obliques",            "Bodyweight",     "Lean back 45°; rotate from torso, not arms."),
    ("Bicycle Crunch",       "Abs / Obliques",      "Bodyweight",     "Slow and controlled; don't pull your neck."),
    ("Mountain Climber",     "Core / Cardio",       "Bodyweight",     "Keep hips level; drive knees fast for cardio benefit."),
]
_CARDIO = [
    ("Treadmill Walk/Jog",   "Cardiovascular",      "Treadmill",      "Maintain a pace where you can still hold a conversation."),
    ("Jumping Jacks",        "Cardiovascular",      "Bodyweight",     "Land softly; keep a steady rhythm."),
    ("High Knees",           "Cardiovascular",      "Bodyweight",     "Drive knees to hip height; pump arms."),
    ("Jump Rope",            "Cardiovascular",      "Jump Rope",      "Land on balls of feet; keep elbows close to body."),
]

WARMUP  = [
    "5 min light cardio (walking or jumping jacks)",
    "Arm circles — 10 forward, 10 backward",
    "Hip circles — 10 each direction",
    "Leg swings — 10 each leg",
]
COOLDOWN = [
    "5 min easy walk",
    "Quad stretch — 30 sec each side",
    "Hamstring stretch — 30 sec each side",
    "Chest stretch (doorway) — 30 sec",
    "Child's pose — 60 sec",
]

WEEKDAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]


# ─── Goal configuration ───────────────────────────────────────────────────────

_GOAL_CFG: Dict[str, dict] = {
    "lose_weight": {
        "sets_compound": 3, "sets_isolation": 3,
        "reps_compound": "12-15", "reps_isolation": "15-20",
        "rest_compound": 60, "rest_isolation": 45,
        "note": "Stick to your calorie deficit. High-rep, shorter-rest training burns more calories per session.",
    },
    "build_muscle": {
        "sets_compound": 4, "sets_isolation": 3,
        "reps_compound": "6-10", "reps_isolation": "10-12",
        "rest_compound": 120, "rest_isolation": 75,
        "note": "Eat 20-40 g of protein within 1 hour after training. Add weight or reps each week.",
    },
    "maintain": {
        "sets_compound": 3, "sets_isolation": 2,
        "reps_compound": "8-12", "reps_isolation": "12-15",
        "rest_compound": 90, "rest_isolation": 60,
        "note": "Match calories to your TDEE. Keep consistent — maintenance is about habit.",
    },
}


# ─── Plan builder ─────────────────────────────────────────────────────────────

def _make_exercise(ex_tuple: tuple, sets: int, reps: str, rest: int) -> Exercise:
    name, muscle, equip, tip = ex_tuple
    return Exercise(name=name, sets=sets, reps=reps, rest_sec=rest,
                    muscle_group=muscle, equipment=equip, tip=tip)


def _build_day(day_name: str, label: str, muscle_groups: List[str],
               cfg: dict, duration_min: int) -> DayPlan:
    exercises: List[Exercise] = []

    pool = {
        "chest":     _CHEST,
        "back":      _BACK,
        "shoulders": _SHOULDERS,
        "legs":      _LEGS,
        "core":      _CORE,
        "cardio":    _CARDIO,
    }

    for mg in muscle_groups:
        items = pool.get(mg, [])
        # pick 2 for primary groups, 1 for secondary
        n = 2 if mg in ("chest","back","legs") else 1
        for ex in items[:n]:
            is_compound = mg in ("chest","back","legs","shoulders")
            sets = cfg["sets_compound"] if is_compound else cfg["sets_isolation"]
            reps = cfg["reps_compound"] if is_compound else cfg["reps_isolation"]
            rest = cfg["rest_compound"] if is_compound else cfg["rest_isolation"]
            if mg == "cardio":
                sets, reps, rest = 1, "20 min", 0
            elif mg == "core":
                reps = "30 sec" if ex[0] in ("Plank","Dead Bug") else cfg["reps_isolation"]
                sets = 3
            exercises.append(_make_exercise(ex, sets, reps, rest))

    return DayPlan(
        day_name=day_name, label=label, is_rest=False,
        duration_min=duration_min,
        exercises=exercises,
        warmup=WARMUP[:3],
        cooldown=COOLDOWN[:4],
    )


def _rest_day(day_name: str) -> DayPlan:
    return DayPlan(
        day_name=day_name, label="Rest & Recovery", is_rest=True,
        duration_min=0, exercises=[], warmup=[], cooldown=[],
    )


def _generate_plan(goal: str, days: int, duration: int) -> List[DayPlan]:
    cfg = _GOAL_CFG[goal]

    # Training splits keyed by number of training days
    splits: Dict[int, List[tuple]] = {
        1: [("Full Body",       ["chest","back","legs","shoulders","core"])],
        2: [("Upper Body",      ["chest","back","shoulders","core"]),
            ("Lower Body",      ["legs","core","cardio"])],
        3: [("Full Body A",     ["chest","back","legs","core"]),
            ("Full Body B",     ["shoulders","back","legs","core"]),
            ("Full Body C",     ["chest","legs","core","cardio"])],
        4: [("Upper Body A",    ["chest","back","shoulders","core"]),
            ("Lower Body A",    ["legs","core"]),
            ("Upper Body B",    ["chest","back","shoulders","core"]),
            ("Lower Body B",    ["legs","core","cardio"])],
        5: [("Push",            ["chest","shoulders","core"]),
            ("Pull",            ["back","core"]),
            ("Legs",            ["legs","core"]),
            ("Upper Body",      ["chest","back","shoulders","core"]),
            ("Legs + Cardio",   ["legs","cardio","core"])],
        6: [("Push A",          ["chest","shoulders","core"]),
            ("Pull A",          ["back","core"]),
            ("Legs A",          ["legs","core"]),
            ("Push B",          ["chest","shoulders","core"]),
            ("Pull B",          ["back","core"]),
            ("Legs B + Cardio", ["legs","cardio","core"])],
    }
    days = max(1, min(6, days))
    plan_days: List[DayPlan] = []
    workout_slots = splits[days]

    for i, weekday in enumerate(WEEKDAYS):
        slot_index = i % len(workout_slots) if i < days else None
        # Place rest days after all training days
        if i >= days:
            plan_days.append(_rest_day(weekday))
        else:
            label, muscle_groups = workout_slots[i % len(workout_slots)]
            plan_days.append(_build_day(weekday, label, muscle_groups, cfg, duration))

    return plan_days


# ─── Tips per goal ────────────────────────────────────────────────────────────

_TIPS: Dict[str, List[str]] = {
    "lose_weight": [
        "Log every session — consistency beats intensity.",
        "Keep rest periods short (45-60 sec) to elevate heart rate.",
        "Add 20 min of walking on rest days to increase daily calorie burn.",
        "Pair this plan with your calorie target from the Nutrition Planner.",
    ],
    "build_muscle": [
        "Add 2.5 kg or 1 extra rep to main lifts every 1-2 weeks.",
        "Eat enough protein — aim for 1.6-2.2 g per kg of bodyweight.",
        "Sleep 7-9 hours — muscle grows during recovery, not during training.",
        "Track weights used each session so you can beat them next time.",
    ],
    "maintain": [
        "Consistency is the goal — missing one session is fine, missing a week is not.",
        "Rotate exercises every 6-8 weeks to prevent adaptation.",
        "Balance strength training with light cardio for overall health.",
        "Stay hydrated — aim for 35 ml per kg of bodyweight on training days.",
    ],
}

_SPLIT_NAME: Dict[int, str] = {
    1: "Full Body", 2: "Upper / Lower",
    3: "Full Body ×3", 4: "Upper / Lower ×2",
    5: "Push / Pull / Legs", 6: "PPL ×2",
}

_GOAL_LABEL: Dict[str, str] = {
    "lose_weight": "Lose Weight",
    "build_muscle": "Build Muscle",
    "maintain": "Maintain",
}


# ─── Endpoint ─────────────────────────────────────────────────────────────────

@router.get("", response_model=WorkoutPlanResponse)
async def get_workout_plan(
    level: Optional[str] = None,          # "beginner" | "intermediate" | "advanced"
    current_user: dict = Depends(get_current_user),
):
    """
    Returns a personalized weekly workout plan.

    Always reads the LATEST profile from the database on every request —
    so changes to goal / training days / duration are reflected immediately.

    Query param:
      level = beginner | intermediate | advanced   (user chooses; defaults to beginner)
    """
    try:
        user_id = current_user["id"]

        # ── Always fetch fresh from DB ────────────────────────────────────
        profile = get_profile(user_id)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Profile not found. Please complete onboarding."
            )

        # ── Read values from DB profile ───────────────────────────────────
        goal = profile.get("fitness_goal") or "maintain"
        if goal not in _GOAL_CFG:
            goal = "maintain"

        days     = max(1, min(6, int(profile.get("training_days_per_week") or 3)))
        duration = int(profile.get("preferred_workout_duration") or 45)

        # ── Level: user-chosen, else default beginner ─────────────────────
        allowed_levels = ("beginner", "intermediate", "advanced")
        if level and level in allowed_levels:
            chosen_level = level
        else:
            chosen_level = "beginner"

        plan_days = _generate_plan(goal, days, duration)

        return WorkoutPlanResponse(
            plan_title=f"{_GOAL_LABEL[goal]} — {_SPLIT_NAME[days]} Plan",
            goal=_GOAL_LABEL[goal],
            split=_SPLIT_NAME[days],
            level=chosen_level,
            days_per_week=days,
            weeks=8,
            days=plan_days,
            key_tips=_TIPS[goal],
            nutrition_note=_GOAL_CFG[goal]["note"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Workout plan error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))