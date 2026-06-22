import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Flame, Scale, Wheat, Droplets, AlertCircle,
  CheckCircle, Lightbulb,
  TrendingDown, TrendingUp, Info, Lock,
} from 'lucide-react'

import Card from '@/components/ui/Card'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileSnapshot {
  height: number
  weight: number
  fitness_goal: string
  activity_level: string
}

interface CalorieResult {
  bmr: number
  tdee: number
  target_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  bmi: number
  bmi_category: string
}

interface AutoCalorieResponse {
  profile: ProfileSnapshot
  calories: CalorieResult
}

// ─── API ──────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function fetchNutritionFromProfile(
  token: string
): Promise<AutoCalorieResponse> {
  const res = await fetch(
    `${API_BASE}/nutrition/calculate-from-profile`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Request failed')
  }

  return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  light: 'Light',
  moderate: 'Moderate',
  active: 'Active',
  very_active: 'Very Active',
}

function formatActivityLabel(level?: string): string {
  if (!level) return '—'
  return ACTIVITY_LABELS[level] || level
}

// ─── Macro Bar ────────────────────────────────────────────────────────────────

function MacroBar({
  label, value, max, color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = Math.min((value / max) * 100, 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{value}g</span>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, unit, icon, iconColor, iconBgColor,
}: {
  label: string
  value: string | number
  unit: string
  icon: React.ReactNode
  iconColor: string
  iconBgColor: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgColor}`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>

      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{unit}</p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BodyCalculations() {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token') || undefined
      : undefined

  const [profile, setProfile] = useState<ProfileSnapshot | null>(null)
  const [result, setResult] = useState<CalorieResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const data = await fetchNutritionFromProfile(token)
      setProfile(data.profile)
      setResult(data.calories)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (!token) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Log in to see your nutrition plan.
        </p>
      </div>
    )
  }

  const goalLabel =
    profile?.fitness_goal === 'lose_weight'
      ? 'Lose Weight'
      : profile?.fitness_goal === 'build_muscle'
      ? 'Build Muscle'
      : 'Maintain'

  // Backend now actually sends the derived activity_level (see backend fix)
  const activity = formatActivityLabel(profile?.activity_level)

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Scale className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Body Calculations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Personalized calorie & macro targets
          </p>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Calculating your plan...</p>
      )}

      {/* PROFILE CARD */}
      {profile && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-3">

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
              Height: {profile.height} cm
            </span>
            <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
              Weight: {profile.weight} kg
            </span>
            <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
              Goal: {goalLabel}
            </span>
            <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
              Activity: {activity}
            </span>
          </div>

          {/* EXPLANATION CARD */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p className="font-semibold flex items-center gap-1 text-gray-900 dark:text-gray-200">
              <Info className="w-3 h-3" />
              What your body stats mean
            </p>

            <p>
              • <span className="font-semibold text-gray-900 dark:text-gray-200">BMR</span>: Calories your body burns just to stay alive
            </p>
            <p>
              • <span className="font-semibold text-gray-900 dark:text-gray-200">TDEE</span>: Total daily calories including movement
            </p>
            <p>
              • <span className="font-semibold text-gray-900 dark:text-gray-200">Calories Target</span>: What you should eat daily for your goal
            </p>
            <p>
              • <span className="font-semibold text-gray-900 dark:text-gray-200">BMI</span>: General weight-to-height health indicator
            </p>
          </div>

        </div>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      {/* RESULTS */}
      {result && profile && (
        <div className="space-y-6">

          {/* STATS */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="BMR"
              value={Math.round(result.bmr)}
              unit="cal/day"
              icon={<Flame className="w-5 h-5" />}
              iconColor="text-orange-500"
              iconBgColor="bg-orange-500/10"
            />
            <StatCard
              label="TDEE"
              value={Math.round(result.tdee)}
              unit="cal/day"
              icon={<Flame className="w-5 h-5" />}
              iconColor="text-orange-500"
              iconBgColor="bg-orange-500/10"
            />
            <StatCard
              label="Target"
              value={Math.round(result.target_calories)}
              unit="cal/day"
              icon={<TrendingDown className="w-5 h-5" />}
              iconColor="text-blue-400"
              iconBgColor="bg-blue-400/10"
            />
            <StatCard
              label="BMI"
              value={result.bmi}
              unit={result.bmi_category}
              icon={<CheckCircle className="w-5 h-5" />}
              iconColor="text-green-500"
              iconBgColor="bg-green-500/10"
            />
          </div>

          {/* MACROS */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Scale className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Macros Breakdown
            </h2>

            <MacroBar
              label="Protein"
              value={Math.round(result.protein_g)}
              max={250}
              color="bg-blue-500"
            />
            <MacroBar
              label="Carbs"
              value={Math.round(result.carbs_g)}
              max={500}
              color="bg-green-500"
            />
            <MacroBar
              label="Fat"
              value={Math.round(result.fat_g)}
              max={120}
              color="bg-yellow-500"
            />
          </div>

        </div>
      )}
    </div>
  )
}
