import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Clock, Target, TrendingUp, Video, Info } from 'lucide-react'
import { mockWorkouts } from '@/services/mockData'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  description: string
  videoUrl: string
}

interface WorkoutDetail {
  id: string
  name: string
  duration: number
  difficulty: string
  muscleGroups: string[]
  exercises: Exercise[]
}

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadWorkout(id)
    }
  }, [id])

  const loadWorkout = async (workoutId: string) => {
    try {
      const foundWorkout = mockWorkouts.find(w => w.id === workoutId)
      if (foundWorkout) {
        setWorkout({
          ...foundWorkout,
          exercises: foundWorkout.exercises.map((ex, idx) => ({
            id: String(idx + 1),
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            description: `Standard ${ex.name.toLowerCase()} exercise`,
            videoUrl: ''
          }))
        })
      }
    } catch (error) {
      console.error('Failed to load workout:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Workout not found
        </h3>
        <Button onClick={() => navigate('/workouts')}>
          Back to Workouts
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/workouts')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workouts
        </Button>
      </div>

      {/* Workout Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Workout Info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {workout.name}
              </h1>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{workout.duration} minutes</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Target className="w-5 h-5 mr-2" />
                  <span>{workout.exercises.length} exercises</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span className="capitalize">{workout.difficulty}</span>
                </div>
              </div>

              {/* Muscle Groups */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Target Muscle Groups
                </h3>
                <div className="flex flex-wrap gap-2">
                  {workout.muscleGroups.map((group) => (
                    <span
                      key={group}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-lg capitalize"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Workout Description
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      This comprehensive {workout.difficulty} level workout targets your {workout.muscleGroups.join(', ')} 
                      muscles through a series of {workout.exercises.length} carefully selected exercises. 
                      Perfect for building strength and improving your overall fitness level.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div>
              <Card className="sticky top-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Start?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Begin your workout and track your progress
                  </p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Video className="w-4 h-4 mr-2" />
                    Preview Exercises
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Add to Favorites
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">4.8</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">1.2k</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Exercise List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Exercise Breakdown
          </h2>
          
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                {/* Exercise Number */}
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>

                {/* Video Placeholder */}
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-gray-400" />
                </div>

                {/* Exercise Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {exercise.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {exercise.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-primary">
                    <span>{exercise.sets} sets</span>
                    <span>•</span>
                    <span>{exercise.reps} reps</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}