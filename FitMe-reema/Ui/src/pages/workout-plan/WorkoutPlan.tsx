import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Clock, ChevronDown, ChevronUp,
  RefreshCw, Loader2, AlertTriangle, Star,
  Flame, Target, Zap, Info, Calendar, Award,
} from 'lucide-react'
import apiClient from '@/api/client'
import Card from '@/components/ui/Card'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  name: string; sets: number; reps: string; rest_sec: number
  muscle_group: string; equipment: string; tip: string
}
interface DayPlan {
  day_name: string; label: string; is_rest: boolean
  duration_min: number; exercises: Exercise[]
  warmup: string[]; cooldown: string[]
}
interface WorkoutPlan {
  plan_title: string; goal: string; split: string
  level: string; days_per_week: number; weeks: number
  days: DayPlan[]; key_tips: string[]; nutrition_note: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'New to training / <6 months',    color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' },
  { value: 'intermediate', label: 'Intermediate',  desc: '6 months – 2 years experience',  color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' },
  { value: 'advanced',     label: 'Advanced',      desc: '2+ years consistent training',   color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' },
]

const GOAL_STYLE: Record<string, { bg: string }> = {
  'Lose Weight':  { bg: 'bg-orange-50 dark:bg-orange-900/20' },
  'Build Muscle': { bg: 'bg-blue-50 dark:bg-blue-900/20' },
  'Maintain':     { bg: 'bg-green-50 dark:bg-green-900/20' },
}

const TODAY = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
  )
}

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({ ex, i }: { ex: Exercise; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.04 }}
      className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800/60"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors text-left"
      >
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
          <span className="text-sm font-bold text-primary leading-none">{ex.sets}</span>
          <span className="text-[9px] text-primary/70 leading-none">sets</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{ex.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ex.muscle_group}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <span className="font-semibold text-gray-800 dark:text-gray-200">{ex.reps}</span>
          {ex.rest_sec > 0 && <span>{ex.rest_sec}s rest</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Sets',      val: ex.sets },
                  { label: 'Reps',      val: ex.reps },
                  { label: 'Rest',      val: ex.rest_sec > 0 ? `${ex.rest_sec}s` : '—' },
                  { label: 'Equipment', val: ex.equipment },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-xs">
                    <p className="text-gray-400 uppercase tracking-wide" style={{ fontSize: '9px' }}>{s.label}</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{s.val}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-sm text-blue-800 dark:text-blue-200">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{ex.tip}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Day panel ────────────────────────────────────────────────────────────────

function DayPanel({ day }: { day: DayPlan }) {
  if (day.is_rest) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
        <Star className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        <div>
          <p className="font-bold text-gray-700 dark:text-gray-300">Rest & Recovery</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Light walking or stretching is fine.<br />Your muscles grow while you rest.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🔥 Warm-Up</p>
        <ul className="space-y-1">
          {day.warmup.map((w, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
              <span className="text-primary shrink-0">•</span>{w}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          🏋️ Exercises — {day.exercises.length} movements
        </p>
        <div className="space-y-2">
          {day.exercises.map((ex, i) => <ExerciseRow key={ex.name} ex={ex} i={i} />)}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">❄️ Cool-Down</p>
        <ul className="space-y-1">
          {day.cooldown.map((c, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
              <span className="text-blue-400 shrink-0">•</span>{c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WorkoutPlanPage() {
  const [plan, setPlan]         = useState<WorkoutPlan | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState(0)
  // Level is chosen by the user — NOT inferred from DB
  const [level, setLevel]       = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [levelChosen, setLevelChosen] = useState(false)   // show picker until confirmed

  // Fetch fresh from DB every time level is confirmed
  async function load(chosenLevel: string) {
    setLoading(true); setError(null)
    try {
      // No caching — always hits the backend which always reads DB
      const res = await apiClient.get<WorkoutPlan>(`/workout-plan?level=${chosenLevel}&t=${Date.now()}`)
      setPlan(res.data)
      const todayIdx = res.data.days.findIndex(d => d.day_name === TODAY)
      setActiveDay(todayIdx >= 0 ? todayIdx : 0)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  // When user clicks "Generate Plan" on the level picker
  function handleGenerate() {
    setLevelChosen(true)
    load(level)
  }

  // Regenerate with current level (re-reads DB profile)
  function handleRegenerate() {
    load(level)
  }

  // ── Level picker screen ───────────────────────────────────────────────────
  if (!levelChosen) {
    return (
      <div className="max-w-lg mx-auto pt-10 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-700 rounded-2xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plan</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Personalised from your profile</p>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Choose your experience level
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              This adjusts exercise difficulty. Your goal and training days are read automatically from your profile.
            </p>

            <div className="space-y-3 mb-6">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value as typeof level)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all text-left ${
                    level === l.value
                      ? `${l.bg} border-current`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div>
                    <p className={`font-bold ${level === l.value ? l.color : 'text-gray-900 dark:text-white'}`}>
                      {l.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{l.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    level === l.value ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {level === l.value && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-5 h-5" /> Generate My Plan
            </button>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-4xl mx-auto p-1 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-700 rounded-2xl flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading your profile from database…
          </p>
        </div>
      </div>
      <Skeleton />
    </div>
  )

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 gap-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <p className="text-lg font-semibold text-gray-800 dark:text-white">Could not generate your plan</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{error}</p>
      <div className="flex gap-3">
        <button onClick={handleRegenerate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <button onClick={() => { setLevelChosen(false); setError(null) }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          Change Level
        </button>
      </div>
    </div>
  )

  if (!plan) return null

  const goalStyle  = GOAL_STYLE[plan.goal] ?? GOAL_STYLE['Maintain']
  const activeDay_ = plan.days[activeDay]
  const todayDay   = plan.days.find(d => d.day_name === TODAY)
  const levelMeta  = LEVELS.find(l => l.value === level) ?? LEVELS[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-700 rounded-2xl flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.plan_title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{plan.weeks}-week program · {plan.split}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { setLevelChosen(false); setPlan(null) }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Award className="w-3.5 h-3.5" /> Change Level
          </button>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync Profile
          </button>
        </div>
      </motion.div>

      {/* Stat chips */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Goal',        val: plan.goal,          icon: <Target className="w-5 h-5 text-orange-500" />,  bg: goalStyle.bg },
          { label: 'Days / Week', val: `${plan.days_per_week}`, icon: <Calendar className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Split',       val: plan.split,         icon: <Zap className="w-5 h-5 text-purple-500" />,    bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Your Level',  val: levelMeta.label,    icon: <Award className="w-5 h-5 text-yellow-500" />,  bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map((s, i) => (
          <Card key={i} className={`p-4 ${s.bg}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              {s.icon}
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-white capitalize">{s.val}</p>
          </Card>
        ))}
      </motion.div>

      {/* Profile sync notice */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.07 }}>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5 text-sm text-green-700 dark:text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          Plan generated from your current profile — goal: <strong>{plan.goal}</strong>, {plan.days_per_week} days/week.
          If you updated your profile, click <strong>Sync Profile</strong> to regenerate.
        </div>
      </motion.div>

      {/* Today highlight */}
      {todayDay && !todayDay.is_rest && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-green-600/10 border border-primary/20">
            <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5" /> Today — {TODAY}
            </p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{todayDay.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {todayDay.exercises.length} exercises · ~{todayDay.duration_min} min
                </p>
              </div>
              <button
                onClick={() => setActiveDay(plan.days.indexOf(todayDay))}
                className="shrink-0 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Flame className="w-4 h-4" /> View
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Day tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plan.days.map((day, i) => (
            <button key={i} onClick={() => setActiveDay(i)}
              className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                activeDay === i
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : day.is_rest
                    ? 'bg-gray-50 dark:bg-gray-800/40 text-gray-400 border border-dashed border-gray-200 dark:border-gray-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
              <span>{day.day_name.slice(0, 3)}</span>
              <span className={`text-[10px] mt-0.5 ${activeDay === i ? 'text-green-200' : 'text-gray-400'}`}>
                {day.is_rest ? 'Rest' : day.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active day */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {activeDay_.day_name} — {activeDay_.label}
                </h2>
                {!activeDay_.is_rest && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> ~{activeDay_.duration_min} min
                  </p>
                )}
              </div>
              {!activeDay_.is_rest && (
                <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {activeDay_.exercises.length} exercises
                </span>
              )}
            </div>
            <DayPanel day={activeDay_} />
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Tips + Nutrition */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" /> Key Training Tips
          </h3>
          <ul className="space-y-2.5">
            {plan.key_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800">
          <h3 className="text-sm font-bold text-green-700 dark:text-green-400 mb-3">🥗 Nutrition Note</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{plan.nutrition_note}</p>
          <a href="/nutrition" className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 mt-3 hover:underline">
            Open Nutrition Planner →
          </a>
        </Card>
      </motion.div>
    </div>
  )
}