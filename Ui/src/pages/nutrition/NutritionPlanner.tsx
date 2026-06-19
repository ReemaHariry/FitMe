/**
 * Nutrition Planner Page
 * 
 * Calculates calorie needs and generates personalized meal plans.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Flame,
  Target,
  Activity,
  ChevronDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/app/store'
import {
  nutritionApi,
  type CalorieRequest,
  type CalorieResponse,
  type NutritionPlanResponse,
  type DayMeals,
  type MealItem
} from '@/api/nutrition'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'


// ============================================================================
// Main Component
// ============================================================================

export default function NutritionPlanner() {
  const { user } = useAuthStore()
  const token = localStorage.getItem('auth_token')

  // Form state
  const [form, setForm] = useState<CalorieRequest>({
    gender: 'male',
    age: 25,
    height: 170,
    weight: 70,
    activity_level: 'moderate',
    goal: 'maintain',
  })

  const [calorieResult, setCalorieResult] = useState<CalorieResponse | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [planLoading, setPlanLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'calculator' | 'plan'>('calculator')
  const [showManualForm, setShowManualForm] = useState(false)
  const [profileSynced, setProfileSynced] = useState(false)

  // Check if profile has all required data
  const hasCompleteProfile = (profile: any) => {
    return profile?.gender && 
           profile?.age && 
           profile?.height && 
           profile?.weight && 
           profile?.fitnessGoal
  }

  // Auto-sync from profile on mount
  useEffect(() => {
    const syncProfile = async () => {
      // Only auto-sync if logged in, not already synced, and has complete profile
      if (token && user?.profile && !profileSynced && hasCompleteProfile(user.profile)) {
        setLoading(true)
        setError(null)

        try {
          // Use the from-profile endpoint to auto-calculate
          const result = await nutritionApi.calculateFromProfile('moderate')
          setCalorieResult(result.calories)
          
          // Update form with profile data
          const profile = user.profile
          setForm({
            gender: (profile.gender === 'male' || profile.gender === 'female' ? profile.gender : 'male') as 'male' | 'female',
            age: profile.age || 25,
            height: profile.height || 170,
            weight: profile.weight || 70,
            activity_level: 'moderate',
            goal: (profile.fitnessGoal === 'lose_weight' || profile.fitnessGoal === 'build_muscle' || profile.fitnessGoal === 'maintain' 
              ? profile.fitnessGoal 
              : 'maintain') as 'lose_weight' | 'build_muscle' | 'maintain',
          })
          
          setProfileSynced(true)
          setShowManualForm(false)
        } catch (err: any) {
          // If auto-sync fails, show manual form
          console.error('Auto-sync failed:', err)
          setShowManualForm(true)
        } finally {
          setLoading(false)
        }
      } else if (!token || !user?.profile || !hasCompleteProfile(user?.profile)) {
        // If not logged in or incomplete profile, show manual form
        setShowManualForm(true)
      }
    }

    syncProfile()
  }, [token, user, profileSynced])

  // Calculate calories
  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    setNutritionPlan(null) // Clear plan when recalculating

    try {
      let result: CalorieResponse
      if (token) {
        result = await nutritionApi.calculateCalories(form)
      } else {
        result = await nutritionApi.calculateCaloriesPublic(form)
      }
      setCalorieResult(result)
      setProfileSynced(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  // Re-sync from profile (manual refresh)
  const handleSyncFromProfile = async () => {
    if (!token || !user?.profile || !hasCompleteProfile(user.profile)) {
      setError('Complete your profile first to use auto-sync')
      return
    }

    setLoading(true)
    setError(null)
    setNutritionPlan(null)

    try {
      const result = await nutritionApi.calculateFromProfile(form.activity_level)
      setCalorieResult(result.calories)
      
      // Update form with profile data
      const profile = user.profile
      setForm({
        gender: (profile.gender === 'male' || profile.gender === 'female' ? profile.gender : 'male') as 'male' | 'female',
        age: profile.age || 25,
        height: profile.height || 170,
        weight: profile.weight || 70,
        activity_level: form.activity_level, // Keep current activity level
        goal: (profile.fitnessGoal === 'lose_weight' || profile.fitnessGoal === 'build_muscle' || profile.fitnessGoal === 'maintain' 
          ? profile.fitnessGoal 
          : 'maintain') as 'lose_weight' | 'build_muscle' | 'maintain',
      })
      
      setProfileSynced(true)
      setShowManualForm(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Sync failed')
    } finally {
      setLoading(false)
    }
  }

  // Toggle manual form
  const handleToggleManualForm = () => {
    setShowManualForm(!showManualForm)
  }

  // Generate meal plan
  const handleGeneratePlan = async () => {
    if (!calorieResult) return

    setPlanLoading(true)
    setError(null)

    try {
      let result: NutritionPlanResponse
      if (token) {
        result = await nutritionApi.generateMealPlan(form)
      } else {
        result = await nutritionApi.generateMealPlanPublic(form)
      }
      setNutritionPlan(result)
      setActiveTab('plan')
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Plan generation failed')
    } finally {
      setPlanLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Nutrition Planner
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Calculate your calorie needs and get a personalized meal plan
            </p>
          </div>

          {/* Profile Sync Status Banner */}
          {token && user?.profile && hasCompleteProfile(user.profile) && profileSynced && !showManualForm && (
            <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-bold text-green-900 dark:text-green-200">
                        Profile Synced
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your data was automatically loaded from your profile
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleManualForm}
                    className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  >
                    Edit Manually
                  </Button>
                </div>

                {/* Activity Level Selector */}
                <div>
                  <label className="block text-sm font-medium text-green-900 dark:text-green-200 mb-2">
                    Activity Level (adjust if needed)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={form.activity_level}
                      onChange={(e) => setForm({ ...form, activity_level: e.target.value as CalorieRequest['activity_level'] })}
                      className="flex-1 px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="sedentary">Sedentary (desk job, no exercise)</option>
                      <option value="light">Light (1-3 days/week exercise)</option>
                      <option value="moderate">Moderate (3-5 days/week exercise)</option>
                      <option value="active">Active (6-7 days/week exercise)</option>
                      <option value="very_active">Very Active (physical job + exercise)</option>
                    </select>
                    <Button
                      onClick={handleSyncFromProfile}
                      disabled={loading}
                      size="sm"
                    >
                      Recalculate
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && !calorieResult && (
            <Card className="mb-6">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 animate-pulse">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading your nutrition data...
                </p>
              </div>
            </Card>
          )}

          {/* Calculator Form - Show if manual mode or no profile */}
          {(showManualForm || !profileSynced) && !loading && (
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Your Information
                  </h2>
                  {token && user?.profile && hasCompleteProfile(user.profile) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncFromProfile}
                      disabled={loading}
                    >
                      Sync from Profile
                    </Button>
                  )}
                </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Activity Level */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={form.activity_level}
                    onChange={(e) => setForm({ ...form, activity_level: e.target.value as CalorieRequest['activity_level'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="sedentary">Sedentary (desk job, no exercise)</option>
                    <option value="light">Light (1-3 days/week exercise)</option>
                    <option value="moderate">Moderate (3-5 days/week exercise)</option>
                    <option value="active">Active (6-7 days/week exercise)</option>
                    <option value="very_active">Very Active (physical job + exercise)</option>
                  </select>
                </div>

                {/* Goal */}
                <div className="col-span-2 md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal
                  </label>
                  <select
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value as CalorieRequest['goal'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="lose_weight">🔥 Lose Weight</option>
                    <option value="build_muscle">💪 Build Muscle</option>
                    <option value="maintain">⚖️ Maintain Weight</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full mt-6"
              >
                {loading ? 'Calculating...' : 'Calculate Calories'}
              </Button>
            </div>
          </Card>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {calorieResult && (
            <>
              {/* Tab Switcher (only show if plan exists) */}
              {nutritionPlan && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === 'calculator'
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    📊 Calorie Results
                  </button>
                  <button
                    onClick={() => setActiveTab('plan')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === 'plan'
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    🥗 7-Day Plan
                  </button>
                </div>
              )}

              {/* Calorie Results Tab */}
              {activeTab === 'calculator' && (
                <CalorieResultsView
                  result={calorieResult}
                  onGeneratePlan={handleGeneratePlan}
                  planLoading={planLoading}
                  hasPlan={!!nutritionPlan}
                />
              )}

              {/* Meal Plan Tab */}
              {activeTab === 'plan' && nutritionPlan && (
                <MealPlanView plan={nutritionPlan} />
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}


// ============================================================================
// Calorie Results Component
// ============================================================================

function CalorieResultsView({
  result,
  onGeneratePlan,
  planLoading,
  hasPlan,
}: {
  result: CalorieResponse
  onGeneratePlan: () => void
  planLoading: boolean
  hasPlan: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">BMR</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.bmr.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">kcal/day</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <Activity className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">TDEE</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.tdee.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">kcal/day</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Daily Target</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.target_calories.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">kcal/day</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center text-purple-500 font-bold text-lg">
              BMI
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Body Mass Index</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.bmi.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">{result.bmi_category}</p>
          </div>
        </Card>
      </div>

      {/* Macro Breakdown */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Macronutrient Breakdown
          </h3>

          {/* Protein */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300">Protein</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {result.protein_g.toFixed(0)}g • {(result.protein_g * 4).toFixed(0)} kcal
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(result.protein_g / 250) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300">Carbohydrates</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {result.carbs_g.toFixed(0)}g • {(result.carbs_g * 4).toFixed(0)} kcal
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(result.carbs_g / 350) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-green-500 rounded-full"
              />
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300">Fats</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {result.fat_g.toFixed(0)}g • {(result.fat_g * 9).toFixed(0)} kcal
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(result.fat_g / 120) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full bg-yellow-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Generate Plan CTA */}
      {!hasPlan && (
        <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
          <div className="p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Ready for your meal plan?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get a complete 7-day meal plan customized to your calorie target
            </p>
            <Button onClick={onGeneratePlan} disabled={planLoading}>
              {planLoading ? 'Generating...' : 'Generate 7-Day Plan'}
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  )
}


// ============================================================================
// Meal Plan Component
// ============================================================================

function MealPlanView({ plan }: { plan: NutritionPlanResponse }) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const toggleDay = (day: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) {
        next.delete(day)
      } else {
        next.add(day)
      }
      return next
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Plan Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {plan.plan_name}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {plan.daily_calories} calories per day
          </p>
        </div>
      </Card>

      {/* Foods to Eat/Avoid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Foods to Eat
            </h3>
            <div className="flex flex-wrap gap-2">
              {plan.foods_to_eat.map((food, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                >
                  ✓ {food}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Foods to Avoid
            </h3>
            <div className="flex flex-wrap gap-2">
              {plan.foods_to_avoid.map((food, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm"
                >
                  ✗ {food}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Meal Plan */}
      <div className="space-y-3">
        {plan.weekly_plan.map((dayMeals) => (
          <DayMealCard
            key={dayMeals.day}
            dayMeals={dayMeals}
            isExpanded={expandedDays.has(dayMeals.day)}
            onToggle={() => toggleDay(dayMeals.day)}
          />
        ))}
      </div>

      {/* Nutrition Tips */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            💡 Nutrition Tips
          </h3>
          <ul className="space-y-2">
            {plan.tips.map((tip, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-primary font-bold">{index + 1}.</span>
                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================================
// Day Meal Card Component
// ============================================================================

function DayMealCard({
  dayMeals,
  isExpanded,
  onToggle,
}: {
  dayMeals: DayMeals
  isExpanded: boolean
  onToggle: () => void
}) {
  const meals = [
    { emoji: '🍳', label: 'Breakfast', meal: dayMeals.breakfast },
    { emoji: '🍎', label: 'Morning Snack', meal: dayMeals.morning_snack },
    { emoji: '🥗', label: 'Lunch', meal: dayMeals.lunch },
    { emoji: '🥜', label: 'Afternoon Snack', meal: dayMeals.afternoon_snack },
    { emoji: '🍽️', label: 'Dinner', meal: dayMeals.dinner },
  ]

  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">📅</div>
          <div className="text-left">
            <p className="font-bold text-gray-900 dark:text-white">{dayMeals.day}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dayMeals.total_calories} kcal
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3 border-t border-gray-200 dark:border-gray-700">
              {meals.map((item, index) => (
                <MealItemView key={index} {...item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ============================================================================
// Meal Item Component
// ============================================================================

function MealItemView({
  emoji,
  label,
  meal,
}: {
  emoji: string
  label: string
  meal: MealItem
}) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{emoji}</div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {label}
          </p>
          <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
            {meal.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {meal.portion}
          </p>
          <div className="flex gap-4 text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {meal.calories} kcal
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              P: {meal.protein_g.toFixed(0)}g
            </span>
            <span className="text-green-600 dark:text-green-400">
              C: {meal.carbs_g.toFixed(0)}g
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">
              F: {meal.fat_g.toFixed(0)}g
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
