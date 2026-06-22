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
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value}g</span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
  label, value, unit, icon, bg,
}: {
  label: string
  value: string | number
  unit: string
  icon: React.ReactNode
  bg: string
}) {
  return (
    <Card className={`p-4 ${bg}`}>
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
        {icon}
      </div>

      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs text-gray-500">{unit}</p>
    </Card>
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
      <Card className="p-6 flex items-center gap-3">
        <Lock className="w-5 h-5 text-gray-400" />
        <p className="text-sm text-gray-600">
          Log in to see your nutrition plan.
        </p>
      </Card>
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
          <h1 className="text-xl font-bold">Body Calculations</h1>
          <p className="text-sm text-gray-500">
            Personalized calorie & macro targets
          </p>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-500">Calculating your plan...</p>
      )}

      {/* PROFILE CARD */}
      {profile && (
        <Card className="p-4 space-y-3">

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Height: {profile.height} cm
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Weight: {profile.weight} kg
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Goal: {goalLabel}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Activity: {activity}
            </span>
          </div>

          {/* EXPLANATION CARD */}
          <div className="border-t pt-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <Info className="w-3 h-3" />
              What your body stats mean
            </p>

            <p>
              • <b>BMR</b>: Calories your body burns just to stay alive
            </p>
            <p>
              • <b>TDEE</b>: Total daily calories including movement
            </p>
            <p>
              • <b>Calories Target</b>: What you should eat daily for your goal
            </p>
            <p>
              • <b>BMI</b>: General weight-to-height health indicator
            </p>
          </div>

        </Card>
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
              icon={<Flame />}
              bg="bg-orange-50"
            />
            <StatCard
              label="TDEE"
              value={Math.round(result.tdee)}
              unit="cal/day"
              icon={<Flame />}
              bg="bg-red-50"
            />
            <StatCard
              label="Target"
              value={Math.round(result.target_calories)}
              unit="cal/day"
              icon={<TrendingDown />}
              bg="bg-blue-50"
            />
            <StatCard
              label="BMI"
              value={result.bmi}
              unit={result.bmi_category}
              icon={<CheckCircle />}
              bg="bg-green-50"
            />
          </div>

          {/* MACROS */}
          <Card className="p-5 space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <Scale className="w-5 h-5" />
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
          </Card>

        </div>
      )}
    </div>
  )
}
