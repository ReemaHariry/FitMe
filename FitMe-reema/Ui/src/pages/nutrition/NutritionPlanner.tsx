import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Flame,
  Beef,
  Wheat,
  Droplets,
  ChevronDown,
  ChevronUp,
  Apple,
  AlertCircle,
  CheckCircle,
  Utensils,
  RefreshCw,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react'
import { useAuthStore } from '@/app/store'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalorieResult {
  bmr: number
  tdee: number
  target_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  goal: string
  bmi: number
  bmi_category: string
}

interface MealItem {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  portion: string
}

interface DayMeals {
  day: string
  breakfast: MealItem
  morning_snack: MealItem
  lunch: MealItem
  afternoon_snack: MealItem
  dinner: MealItem
  total_calories: number
}

interface NutritionPlan {
  plan_name: string
  daily_calories: number
  weekly_plan: DayMeals[]
  tips: string[]
  foods_to_eat: string[]
  foods_to_avoid: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary (desk job, no exercise)' },
  { value: 'light', label: 'Light (1-3 days/week exercise)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week exercise)' },
  { value: 'active', label: 'Active (6-7 days/week exercise)' },
  { value: 'very_active', label: 'Very Active (physical job + exercise)' },
]

const GOAL_OPTIONS = [
  { value: 'lose_weight', label: '🔥 Lose Weight' },
  { value: 'build_muscle', label: '💪 Build Muscle' },
  { value: 'maintain', label: '⚖️ Maintain Weight' },
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function fetchWithAuth(url: string, body: object, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-white">{value}g</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function MealCard({ meal, label, emoji }: { meal: MealItem; label: string; emoji: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">{emoji} {label}</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white mt-0.5">{meal.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{meal.portion}</p>
        </div>
        <span className="text-sm font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg shrink-0 ml-2">
          {meal.calories} kcal
        </span>
      </div>
      <div className="flex gap-3 mt-2">
        {[
          { label: 'P', val: meal.protein_g, color: 'text-blue-600' },
          { label: 'C', val: meal.carbs_g, color: 'text-green-600' },
          { label: 'F', val: meal.fat_g, color: 'text-yellow-600' },
        ].map(m => (
          <span key={m.label} className={`text-xs font-medium ${m.color}`}>
            {m.label}: {m.val}g
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NutritionPlanner() {
  const { user } = useAuthStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || undefined : undefined

  // Form state — pre-fill from user profile if available
  const [form, setForm] = useState({
    gender: (user?.profile?.gender as string) || 'male',
    age: user?.profile?.age || 25,
    height: user?.profile?.height || 170,
    weight: user?.profile?.weight || 70,
    activity_level: 'moderate',
    goal: (user?.profile?.fitnessGoal as string) || 'maintain',
  })

  const [calorieResult, setCalorieResult] = useState<CalorieResult | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [planLoading, setPlanLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>('Monday')
  const [activeTab, setActiveTab] = useState<'calculator' | 'plan'>('calculator')

  const setField = (key: string, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = token
        ? `${API_BASE}/nutrition/calculate`
        : `${API_BASE}/nutrition/calculate-public`
      const result = await fetchWithAuth(endpoint, form, token)
      setCalorieResult(result)
      setNutritionPlan(null)
      setActiveTab('calculator')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlan = async () => {
    setPlanLoading(true)
    setError(null)
    try {
      const endpoint = token
        ? `${API_BASE}/nutrition/plan`
        : `${API_BASE}/nutrition/plan-public`
      const plan = await fetchWithAuth(endpoint, form, token)
      setNutritionPlan(plan)
      setActiveTab('plan')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setPlanLoading(false)
    }
  }

  const goalIcon = form.goal === 'lose_weight'
    ? <TrendingDown className="w-4 h-4" />
    : form.goal === 'build_muscle'
    ? <TrendingUp className="w-4 h-4" />
    : <Minus className="w-4 h-4" />

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nutrition Planner</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Personalized calories & a full 7-day meal plan based on your body metrics
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" /> Your Body Metrics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            <Select
              label="Gender"
              value={form.gender}
              onChange={e => setField('gender', e.target.value)}
              options={GENDER_OPTIONS}
            />
            <Input
              label="Age"
              type="number"
              value={form.age}
              onChange={e => setField('age', Number(e.target.value))}
              min={13}
              max={100}
            />
            <Input
              label="Height (cm)"
              type="number"
              value={form.height}
              onChange={e => setField('height', Number(e.target.value))}
              min={100}
              max={250}
            />
            <Input
              label="Weight (kg)"
              type="number"
              value={form.weight}
              onChange={e => setField('weight', Number(e.target.value))}
              min={30}
              max={300}
            />
            <Select
              label="Activity Level"
              value={form.activity_level}
              onChange={e => setField('activity_level', e.target.value)}
              options={ACTIVITY_OPTIONS}
            />
            <Select
              label="Goal"
              value={form.goal}
              onChange={e => setField('goal', e.target.value)}
              options={GOAL_OPTIONS}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleCalculate} loading={loading} className="flex items-center gap-2">
              <Flame className="w-4 h-4" /> Calculate Calories
            </Button>
            <Button
              onClick={handleGeneratePlan}
              loading={planLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Generate 7-Day Plan
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {(calorieResult || nutritionPlan) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Tab switcher */}
            {nutritionPlan && (
              <div className="flex gap-2 mb-4">
                {(['calculator', 'plan'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      activeTab === tab
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab === 'calculator' ? '📊 Calorie Results' : '🥗 7-Day Plan'}
                  </button>
                ))}
              </div>
            )}

            {/* ── Calorie Results ── */}
            {activeTab === 'calculator' && calorieResult && (
              <div className="space-y-5">
                {/* Top stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'BMR', value: Math.round(calorieResult.bmr), unit: 'kcal/day', icon: <Flame className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { label: 'TDEE', value: Math.round(calorieResult.tdee), unit: 'kcal/day', icon: <Flame className="w-5 h-5 text-red-500" />, bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Daily Target', value: Math.round(calorieResult.target_calories), unit: 'kcal/day', icon: goalIcon, bg: 'bg-primary/10' },
                    { label: 'BMI', value: calorieResult.bmi, unit: calorieResult.bmi_category, icon: <CheckCircle className="w-5 h-5 text-green-500" />, bg: 'bg-green-50 dark:bg-green-900/20' },
                  ].map(stat => (
                    <Card key={stat.label} className={`p-4 ${stat.bg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.unit}</p>
                    </Card>
                  ))}
                </div>

                {/* Macros */}
                <Card className="p-6">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Beef className="w-5 h-5 text-primary" /> Daily Macro Targets
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <MacroBar label="Protein" value={Math.round(calorieResult.protein_g)} max={300} color="bg-blue-500" />
                      <MacroBar label="Carbohydrates" value={Math.round(calorieResult.carbs_g)} max={500} color="bg-green-500" />
                      <MacroBar label="Fats" value={Math.round(calorieResult.fat_g)} max={150} color="bg-yellow-500" />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-3 gap-3">
                      {[
                        { label: 'Protein', value: Math.round(calorieResult.protein_g), unit: 'g', kcal: Math.round(calorieResult.protein_g * 4), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: <Beef className="w-4 h-4" /> },
                        { label: 'Carbs', value: Math.round(calorieResult.carbs_g), unit: 'g', kcal: Math.round(calorieResult.carbs_g * 4), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: <Wheat className="w-4 h-4" /> },
                        { label: 'Fats', value: Math.round(calorieResult.fat_g), unit: 'g', kcal: Math.round(calorieResult.fat_g * 9), color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: <Droplets className="w-4 h-4" /> },
                      ].map(m => (
                        <div key={m.label} className={`${m.bg} rounded-xl p-4 flex flex-col items-center text-center`}>
                          <div className={`${m.color} mb-2`}>{m.icon}</div>
                          <p className={`text-2xl font-bold ${m.color}`}>{m.value}g</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{m.kcal} kcal</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* CTA */}
                {!nutritionPlan && (
                  <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-2xl p-5">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Ready for your personalized meal plan?</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        We'll build a full 7-day plan tailored to your {Math.round(calorieResult.target_calories)} kcal target.
                      </p>
                    </div>
                    <Button onClick={handleGeneratePlan} loading={planLoading} className="shrink-0 ml-4">
                      Generate Plan
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── 7-Day Nutrition Plan ── */}
            {activeTab === 'plan' && nutritionPlan && (
              <div className="space-y-5">
                {/* Plan header */}
                <Card className="p-5 bg-gradient-to-r from-primary/10 to-orange-500/10">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{nutritionPlan.plan_name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Target: <strong>{nutritionPlan.daily_calories} kcal/day</strong>
                  </p>
                </Card>

                {/* Foods to eat / avoid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-green-600 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Foods to Eat
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {nutritionPlan.foods_to_eat.map(f => (
                        <span key={f} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full border border-green-100 dark:border-green-800">
                          {f}
                        </span>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Foods to Avoid
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {nutritionPlan.foods_to_avoid.map(f => (
                        <span key={f} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                          {f}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Weekly plan */}
                <div className="space-y-3">
                  {nutritionPlan.weekly_plan.map(day => (
                    <Card key={day.day} className="overflow-hidden">
                      <button
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Apple className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900 dark:text-white">{day.day}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{day.total_calories} kcal total</p>
                          </div>
                        </div>
                        {expandedDay === day.day ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {expandedDay === day.day && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 pt-0">
                              <MealCard meal={day.breakfast} label="Breakfast" emoji="🍳" />
                              <MealCard meal={day.morning_snack} label="Morning Snack" emoji="🍎" />
                              <MealCard meal={day.lunch} label="Lunch" emoji="🥗" />
                              <MealCard meal={day.afternoon_snack} label="Afternoon Snack" emoji="🥜" />
                              <MealCard meal={day.dinner} label="Dinner" emoji="🍽️" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>

                {/* Tips */}
                <Card className="p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" /> Nutrition Tips
                  </h3>
                  <ul className="space-y-2">
                    {nutritionPlan.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}