/**
 * Workout Plan Page
 * 
 * Generates personalized workout plans based on user profile and experience level.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Target,
  Calendar,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  Info,
  Clock,
  CheckCircle
} from 'lucide-react'
import { workoutPlanApi, type WorkoutPlanResponse, type DayPlan, type Exercise } from '@/api/workout-plan'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

// ============================================================================
// Main Component
// ============================================================================

export default function WorkoutPlan() {
  const [step, setStep] = useState<'level' | 'plan'>('level')
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [plan, setPlan] = useState<WorkoutPlanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState(0)

  // Find today's workout
  useEffect(() => {
    if (plan) {
      const today = new Date().getDay() // 0=Sunday, 1=Monday, etc
      const dayIndex = today === 0 ? 6 : today - 1 // Convert to 0=Monday
      setActiveDay(dayIndex)
    }
  }, [plan])

  // Generate plan
  const generatePlan = async (chosenLevel: 'beginner' | 'intermediate' | 'advanced') => {
    setLoading(true)
    setError(null)
    
    try {
      const planData = await workoutPlanApi.getWorkoutPlan(chosenLevel)
      setPlan(planData)
      setStep('plan')
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  // Handle level selection
  const handleLevelSelect = (selectedLevel: 'beginner' | 'intermediate' | 'advanced') => {
    setLevel(selectedLevel)
    generatePlan(selectedLevel)
  }

  // Sync profile
  const syncProfile = () => {
    if (level) {
      generatePlan(level)
    }
  }

  // Change level
  const changeLevel = () => {
    setStep('level')
    setPlan(null)
  }

  // ============================================================================
  // Level Selection Screen
  // ============================================================================

  if (step === 'level') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Workout Plan Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Choose your experience level to get started
              </p>
            </div>

            {/* Level Options */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {/* Beginner */}
              <Card
                className="cursor-pointer hover:border-primary transition-all"
                onClick={() => !loading && handleLevelSelect('beginner')}
              >
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">🌱</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Beginner
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    New to training / &lt;6 months
                  </p>
                </div>
              </Card>

              {/* Intermediate */}
              <Card
                className="cursor-pointer hover:border-primary transition-all"
                onClick={() => !loading && handleLevelSelect('intermediate')}
              >
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">💪</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Intermediate
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    6 months – 2 years experience
                  </p>
                </div>
              </Card>

              {/* Advanced */}
              <Card
                className="cursor-pointer hover:border-primary transition-all"
                onClick={() => !loading && handleLevelSelect('advanced')}
              >
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">🔥</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Advanced
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    2+ years consistent training
                  </p>
                </div>
              </Card>
            </div>

            {/* Loading/Error */}
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Reading your profile from database…
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // Plan Display Screen
  // ============================================================================

  if (!plan) return null

  const currentDay = plan.days[activeDay]
  const todayIndex = (() => {
    const today = new Date().getDay()
    return today === 0 ? 6 : today - 1
  })()
  const isTodayWorkout = todayIndex === activeDay

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.plan_title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {plan.weeks} week program • Generated from your profile
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="p-4 text-center">
                <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Goal</p>
                <p className="font-bold text-gray-900 dark:text-white">{plan.goal}</p>
              </div>
            </Card>

            <Card>
              <div className="p-4 text-center">
                <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Days/Week</p>
                <p className="font-bold text-gray-900 dark:text-white">{plan.days_per_week}</p>
              </div>
            </Card>

            <Card>
              <div className="p-4 text-center">
                <Dumbbell className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Split</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{plan.split}</p>
              </div>
            </Card>

            <Card>
              <div className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Level</p>
                <p className="font-bold text-gray-900 dark:text-white">{plan.level}</p>
              </div>
            </Card>
          </div>

          {/* Today's Workout Highlight */}
          {isTodayWorkout && !currentDay.is_rest && (
            <Card className="bg-primary/5 border-primary mb-6">
              <div className="p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Today's Workout</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentDay.label} • {currentDay.duration_min} minutes
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              onClick={syncProfile}
              disabled={loading}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync Profile
            </Button>
            <Button
              variant="outline"
              onClick={changeLevel}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Change Level
            </Button>
          </div>

          {/* Day Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {plan.days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDay(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeDay === index
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {day.day_name}
                  {index === todayIndex && (
                    <span className="ml-2 text-xs">•</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Day Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentDay.is_rest ? (
                <RestDayView />
              ) : (
                <TrainingDayView day={currentDay} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Tips Section */}
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Key Training Tips
              </h3>
              <ul className="space-y-2">
                {plan.key_tips.map((tip, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-primary font-bold">{index + 1}.</span>
                    <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Nutrition Note */}
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-6">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
                💡 Nutrition Note
              </h3>
              <p className="text-blue-800 dark:text-blue-300">{plan.nutrition_note}</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================================
// Rest Day Component
// ============================================================================

function RestDayView() {
  return (
    <Card>
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">😴</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Rest & Recovery
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your muscles grow during rest, not during training.
        </p>
        <div className="max-w-md mx-auto text-left">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Optional light activities:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 20-30 min walk</li>
            <li>• Light stretching or yoga</li>
            <li>• Foam rolling</li>
            <li>• Swimming (easy pace)</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}


// ============================================================================
// Training Day Component
// ============================================================================

function TrainingDayView({ day }: { day: DayPlan }) {
  return (
    <div className="space-y-6">
      {/* Day Header */}
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {day.label}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {day.duration_min} minutes
            </div>
            <div className="flex items-center gap-1">
              <Dumbbell className="w-4 h-4" />
              {day.exercises.length} exercises
            </div>
          </div>
        </div>
      </Card>

      {/* Warmup */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            🔥 Warmup
          </h3>
          <ul className="space-y-2">
            {day.warmup.map((item, index) => (
              <li key={index} className="flex gap-3 text-gray-700 dark:text-gray-300">
                <span className="text-orange-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Exercises */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            💪 Main Exercises
          </h3>
          <div className="space-y-3">
            {day.exercises.map((exercise, index) => (
              <ExerciseRow key={index} exercise={exercise} />
            ))}
          </div>
        </div>
      </Card>

      {/* Cooldown */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            🧘 Cooldown
          </h3>
          <ul className="space-y-2">
            {day.cooldown.map((item, index) => (
              <li key={index} className="flex gap-3 text-gray-700 dark:text-gray-300">
                <span className="text-blue-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
}

// ============================================================================
// Exercise Row Component
// ============================================================================

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      initial={false}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
      >
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">{exercise.sets}</span>
          <span className="text-[9px] text-primary">sets</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {exercise.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {exercise.muscle_group}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-center hidden sm:block">
            <p className="font-semibold text-gray-900 dark:text-white">{exercise.reps}</p>
            <p className="text-xs text-gray-500">reps</p>
          </div>

          <div className="text-center hidden md:block">
            <p className="font-semibold text-gray-900 dark:text-white">{exercise.rest_sec}s</p>
            <p className="text-xs text-gray-500">rest</p>
          </div>

          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4 space-y-3">
                {/* Mobile stats */}
                <div className="flex gap-4 sm:hidden">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reps</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{exercise.reps}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rest</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{exercise.rest_sec}s</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Equipment</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{exercise.equipment}</p>
                  </div>
                </div>

                {/* Desktop equipment */}
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 mb-1">Equipment</p>
                  <p className="text-sm text-gray-900 dark:text-white">{exercise.equipment}</p>
                </div>

                {/* Tip */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
                        Form Tip
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {exercise.tip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
