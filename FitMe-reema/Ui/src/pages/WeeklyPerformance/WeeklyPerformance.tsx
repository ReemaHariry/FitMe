import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Minus, Flame, Target,
  Clock, Dumbbell, AlertTriangle, CheckCircle, Star,
  ChevronRight, RefreshCw, Loader2, Calendar, Zap, Award,
} from 'lucide-react'
import apiClient from '@/api/client'
import Card from '@/components/ui/Card'

// ─── Types (mirror the backend response models) ───────────────────────────────

interface WeekComparison {
  sessions_this_week: number; sessions_last_week: number
  avg_form_this_week: number | null; avg_form_last_week: number | null
  total_mistakes_this_week: number; total_mistakes_last_week: number
  total_minutes_this_week: number; total_minutes_last_week: number
  form_trend: string; mistake_trend: string
}
interface ExerciseBreakdown {
  exercise_type: string; sessions: number
  avg_form_score: number | null; total_mistakes: number
  best_form_score: number | null; trend: string
}
interface RecurringMistake {
  mistake_type: string; display_name: string
  total_occurrences: number; affected_sessions: number
  severity: string; correction_tip: string; injury_risk: string | null
}
interface Recommendation {
  category: string; priority: string; title: string; detail: string; icon: string
}
interface WeeklySummary {
  week_start: string; week_end: string; generated_at: string; has_data: boolean
  user_name: string | null; fitness_goal: string | null; target_training_days: number | null
  comparison: WeekComparison; consistency_streak: number
  all_time_sessions: number; all_time_avg_form: number | null
  exercise_breakdown: ExerciseBreakdown[]
  recurring_mistakes: RecurringMistake[]
  best_session_this_week: { exercise_type: string; form_score: number; performance_rating: string; duration_min: number; session_name: string } | null
  performance_label: string; headline_message: string
  recommendations: Recommendation[]
  strengths: string[]; focus_areas: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number | null, fallback = '—') =>
  n !== null && n !== undefined ? String(n) : fallback

const trendIcon = (trend: string, size = 'w-4 h-4') => {
  if (trend === 'improving') return <TrendingUp className={`${size} text-green-500`} />
  if (trend === 'declining') return <TrendingDown className={`${size} text-red-500`} />
  return <Minus className={`${size} text-gray-400`} />
}

const trendColor = (trend: string) =>
  trend === 'improving' ? 'text-green-600 dark:text-green-400'
  : trend === 'declining' ? 'text-red-500 dark:text-red-400'
  : 'text-gray-500 dark:text-gray-400'

const scoreColor = (score: number | null) => {
  if (score === null) return 'text-gray-400'
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 65) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-500 dark:text-red-400'
}

const scoreBg = (score: number | null) => {
  if (score === null) return 'bg-gray-100 dark:bg-gray-800'
  if (score >= 80) return 'bg-green-50 dark:bg-green-900/20'
  if (score >= 65) return 'bg-yellow-50 dark:bg-yellow-900/20'
  return 'bg-red-50 dark:bg-red-900/20'
}

const severityConfig = {
  high:   { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  low:    { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
}

const priorityConfig = {
  high:   'border-l-red-500',
  medium: 'border-l-yellow-500',
  low:    'border-l-green-500',
}

const goalLabel: Record<string, string> = {
  lose_weight: '🔥 Lose Weight', build_muscle: '💪 Build Muscle', maintain: '⚖️ Maintain',
}

function Delta({ now, prev, unit = '', reverse = false }: { now: number | null; prev: number | null; unit?: string; reverse?: boolean }) {
  if (now === null || prev === null || prev === 0) return <span className="text-xs text-gray-400">vs last week</span>
  const diff = now - prev
  const better = reverse ? diff < 0 : diff > 0
  if (Math.abs(diff) < 0.5) return <span className="text-xs text-gray-400">same as last week</span>
  return (
    <span className={`text-xs font-medium ${better ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
      {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit} vs last week
    </span>
  )
}

function CircleScore({ score, size = 80 }: { score: number | null; size?: number }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const pct = score !== null ? score / 100 : 0
  const dash = pct * circ
  const color = score !== null && score >= 80 ? '#22c55e' : score !== null && score >= 65 ? '#eab308' : score !== null ? '#ef4444' : '#9ca3af'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor"
        strokeWidth="6" className="text-gray-100 dark:text-gray-800" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - dash}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ transform: `rotate(-90deg)`, transformOrigin: '50% 50%' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.22} fontWeight="bold" fill={color}>
        {score !== null ? score : '—'}
      </text>
    </svg>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-56" />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
})

export default function WeeklyPerformance() {
  const [data, setData]       = useState<WeeklySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await apiClient.get<WeeklySummary>('/weekly-summary')
      setData(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading ──
  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6 p-1">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Performance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analysing your workouts…</p>
        </div>
      </div>
      <LoadingSkeleton />
    </div>
  )

  // ── Error ──
  if (error) return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-lg font-semibold text-gray-800 dark:text-white">Could not load summary</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  )

  if (!data) return null
  const { comparison: c } = data

  // ── No data ──
  if (!data.has_data) return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <Dumbbell className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        <p className="text-xl font-bold text-gray-700 dark:text-white">No workouts yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete your first exercise session to see your personalised weekly performance summary.
        </p>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* ── Page header ── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Performance</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.week_start} — {data.week_end}
              {data.fitness_goal && <span className="ml-2">{goalLabel[data.fitness_goal] ?? data.fitness_goal}</span>}
            </p>
          </div>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </motion.div>

      {/* ── Headline banner ── */}
      <motion.div {...fadeUp(0.05)}>
        <Card className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {data.performance_label}
              </span>
              <p className="text-base font-semibold text-gray-800 dark:text-white mt-1">
                {data.headline_message}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {data.consistency_streak >= 2 && (
                <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-xl">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-bold">{data.consistency_streak}w streak</span>
                </div>
              )}
              {data.all_time_sessions > 0 && (
                <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium">{data.all_time_sessions} total sessions</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── 4 stat cards ── */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Sessions', icon: <Dumbbell className="w-5 h-5 text-indigo-500" />,
            value: c.sessions_this_week, unit: '',
            sub: <Delta now={c.sessions_this_week} prev={c.sessions_last_week} />,
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
          },
          {
            label: 'Avg Form Score', icon: <Star className="w-5 h-5 text-yellow-500" />,
            value: c.avg_form_this_week !== null ? `${c.avg_form_this_week}` : '—', unit: '/100',
            sub: <Delta now={c.avg_form_this_week} prev={c.avg_form_last_week} unit=" pts" />,
            bg: scoreBg(c.avg_form_this_week),
          },
          {
            label: 'Mistakes', icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
            value: c.total_mistakes_this_week, unit: '',
            sub: <Delta now={c.total_mistakes_this_week} prev={c.total_mistakes_last_week} reverse />,
            bg: 'bg-red-50 dark:bg-red-900/20',
          },
          {
            label: 'Time Trained', icon: <Clock className="w-5 h-5 text-green-500" />,
            value: c.total_minutes_this_week, unit: 'min',
            sub: <Delta now={c.total_minutes_this_week} prev={c.total_minutes_last_week} unit=" min" />,
            bg: 'bg-green-50 dark:bg-green-900/20',
          },
        ].map((stat, i) => (
          <Card key={i} className={`p-4 ${stat.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}<span className="text-base font-medium text-gray-500 dark:text-gray-400 ml-0.5">{stat.unit}</span>
            </p>
            <div className="mt-1">{stat.sub}</div>
          </Card>
        ))}
      </motion.div>

      {/* ── Strengths + Focus areas ── */}
      <motion.div {...fadeUp(0.15)} className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> What You Did Well
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span> {s}
              </li>
            ))}
          </ul>
        </Card>

        {/* Focus areas */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" /> Focus Areas
          </h3>
          <ul className="space-y-2">
            {data.focus_areas.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-orange-500 font-bold shrink-0 mt-0.5">→</span> {f}
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      {/* ── Exercise breakdown ── */}
      {data.exercise_breakdown.length > 0 && (
        <motion.div {...fadeUp(0.2)}>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-indigo-500" /> Exercise Breakdown — This Week
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.exercise_breakdown.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                  <CircleScore score={ex.avg_form_score} size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white capitalize truncate">
                        {ex.exercise_type.replace('_', ' ')}
                      </p>
                      {trendIcon(ex.trend, 'w-3.5 h-3.5')}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {ex.sessions} session{ex.sessions > 1 ? 's' : ''} · {ex.total_mistakes} mistakes
                    </p>
                    {ex.best_form_score !== null && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        Best: {ex.best_form_score}/100
                      </p>
                    )}
                    <span className={`text-xs font-medium ${trendColor(ex.trend)}`}>
                      {ex.trend === 'new' ? 'New exercise' : ex.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Recurring mistakes ── */}
      {data.recurring_mistakes.length > 0 && (
        <motion.div {...fadeUp(0.25)}>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Recurring Mistakes This Week
            </h3>
            <div className="space-y-3">
              {data.recurring_mistakes.map((m, i) => {
                const cfg = severityConfig[m.severity as keyof typeof severityConfig] ?? severityConfig.medium
                return (
                  <div key={i} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{m.display_name}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.badge}`}>
                          {m.severity}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{m.total_occurrences}×</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{m.affected_sessions} session{m.affected_sessions > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      💡 {m.correction_tip}
                    </p>
                    {m.injury_risk && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        {m.injury_risk}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Best session ── */}
      {data.best_session_this_week && (
        <motion.div {...fadeUp(0.3)}>
          <Card className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-bold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" /> Best Session This Week
            </h3>
            <div className="flex items-center gap-5">
              <CircleScore score={data.best_session_this_week.form_score} size={72} />
              <div>
                <p className="font-bold text-gray-900 dark:text-white capitalize">
                  {data.best_session_this_week.exercise_type.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{data.best_session_this_week.session_name}</p>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-lg text-gray-700 dark:text-gray-300 capitalize">
                    {data.best_session_this_week.performance_rating.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {data.best_session_this_week.duration_min} min
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Recommendations ── */}
      {data.recommendations.length > 0 && (
        <motion.div {...fadeUp(0.35)}>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" /> Personalised Recommendations
            </h3>
            <div className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border-l-4 bg-gray-50 dark:bg-gray-800/60 ${priorityConfig[rec.priority as keyof typeof priorityConfig] ?? 'border-l-gray-300'}`}>
                  <span className="text-xl shrink-0 mt-0.5">{rec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{rec.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{rec.detail}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase shrink-0 px-2 py-0.5 rounded-full mt-0.5 ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── All-time footer ── */}
      <motion.div {...fadeUp(0.4)}>
        <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" /> {data.all_time_sessions} total sessions ever
          </span>
          {data.all_time_avg_form !== null && (
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4" /> All-time avg form: {data.all_time_avg_form}/100
            </span>
          )}
          {data.consistency_streak > 0 && (
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" /> {data.consistency_streak}-week streak
            </span>
          )}
        </div>
      </motion.div>
    </div>
  )
}