import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X, 
  Dumbbell, 
  Target, 
  Clock, 
  Play,
  Search,
  ChevronRight
} from 'lucide-react'
import { mockWorkouts } from '@/services/mockData'
import { useI18nStore } from '@/app/i18n'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const workoutSchema = z.object({
  workoutName: z.string().min(3, 'Workout name must be at least 3 characters'),
  workoutType: z.enum(['preset', 'custom']),
  selectedWorkout: z.string().optional(),
  selectedExercises: z.array(z.string()).optional(),
})

type WorkoutForm = z.infer<typeof workoutSchema>

interface StartWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onStartWorkout: (workoutData: {
    name: string
    type: 'preset' | 'custom'
    workoutId?: string
    exercises?: string[]
    startTime: Date
  }) => void
}

interface PresetWorkout {
  id: string
  name: string
  duration: number
  difficulty: string
  muscleGroups: string[]
  exercises: Array<{
    name: string
    sets: number
    reps: number
  }>
}

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  difficulty: string
  equipment: string
}

export default function StartWorkoutModal({ isOpen, onClose, onStartWorkout }: StartWorkoutModalProps) {
  const { t } = useI18nStore()
  const [step, setStep] = useState<'name' | 'type' | 'selection'>('name')
  const [workoutType, setWorkoutType] = useState<'preset' | 'custom'>('preset')
  const [presetWorkouts, setPresetWorkouts] = useState<PresetWorkout[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<string>('')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<WorkoutForm>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      workoutName: '',
      workoutType: 'preset',
    },
  })

  const workoutName = watch('workoutName')

  useEffect(() => {
    if (isOpen) {
      loadWorkoutsAndExercises()
    } else {
      // Reset form when modal closes
      reset()
      setStep('name')
      setWorkoutType('preset')
      setSelectedWorkout('')
      setSelectedExercises([])
      setSearchTerm('')
    }
  }, [isOpen, reset])

  const loadWorkoutsAndExercises = async () => {
    try {
      // Load preset workouts (mock data)
      setPresetWorkouts(mockWorkouts)

      // Mock exercises data
      const mockExercises: Exercise[] = [
        { id: '1', name: 'Push-ups', muscleGroup: 'Chest', difficulty: 'Beginner', equipment: 'None' },
        { id: '2', name: 'Squats', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'None' },
        { id: '3', name: 'Plank', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'None' },
        { id: '4', name: 'Lunges', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'None' },
        { id: '5', name: 'Burpees', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'None' },
        { id: '6', name: 'Mountain Climbers', muscleGroup: 'Core', difficulty: 'Intermediate', equipment: 'None' },
        { id: '7', name: 'Jumping Jacks', muscleGroup: 'Cardio', difficulty: 'Beginner', equipment: 'None' },
        { id: '8', name: 'Tricep Dips', muscleGroup: 'Arms', difficulty: 'Intermediate', equipment: 'Chair' },
        { id: '9', name: 'Shoulder Press', muscleGroup: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells' },
        { id: '10', name: 'Deadlifts', muscleGroup: 'Back', difficulty: 'Advanced', equipment: 'Barbell' },
      ]
      setExercises(mockExercises)
    } catch (error) {
      console.error('Failed to load workouts and exercises:', error)
    }
  }

  const handleNext = () => {
    if (step === 'name' && workoutName.trim()) {
      setStep('type')
    } else if (step === 'type') {
      setStep('selection')
    }
  }

  const handleBack = () => {
    if (step === 'selection') {
      setStep('type')
    } else if (step === 'type') {
      setStep('name')
    }
  }

  const handleWorkoutTypeChange = (type: 'preset' | 'custom') => {
    setWorkoutType(type)
    setValue('workoutType', type)
    setSelectedWorkout('')
    setSelectedExercises([])
  }

  const handlePresetWorkoutSelect = (workoutId: string) => {
    setSelectedWorkout(workoutId)
    setValue('selectedWorkout', workoutId)
  }

  const handleExerciseToggle = (exerciseId: string) => {
    const newSelection = selectedExercises.includes(exerciseId)
      ? selectedExercises.filter(id => id !== exerciseId)
      : [...selectedExercises, exerciseId]
    
    setSelectedExercises(newSelection)
    setValue('selectedExercises', newSelection)
  }

  const onSubmit = async (data: WorkoutForm) => {
    setLoading(true)
    try {
      const workoutData = {
        name: data.workoutName,
        type: data.workoutType,
        workoutId: data.workoutType === 'preset' ? data.selectedWorkout : undefined,
        exercises: data.workoutType === 'custom' ? data.selectedExercises : undefined,
        startTime: new Date(),
      }
      
      onStartWorkout(workoutData)
      onClose()
    } catch (error) {
      console.error('Failed to start workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const canProceed = () => {
    if (step === 'name') return workoutName.trim().length >= 3
    if (step === 'type') return true
    if (step === 'selection') {
      return workoutType === 'preset' ? selectedWorkout : selectedExercises.length > 0
    }
    return false
  }

  const renderStepContent = () => {
    switch (step) {
      case 'name':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Start New Workout
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Give your workout session a name
              </p>
            </div>

            <Input
              {...register('workoutName')}
              label="Workout Name"
              placeholder="e.g., Morning Strength Training"
              error={errors.workoutName?.message}
              autoFocus
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Choose a descriptive name that helps you identify this workout session later in your reports.
              </p>
            </div>
          </div>
        )

      case 'type':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Workout Type
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select a complete workout or build your own
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleWorkoutTypeChange('preset')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  workoutType === 'preset'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                    workoutType === 'preset' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Preset Workout
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose from our curated workout routines
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleWorkoutTypeChange('custom')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  workoutType === 'custom'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                    workoutType === 'custom' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Custom Workout
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pick individual exercises to create your own routine
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )

      case 'selection':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {workoutType === 'preset' ? 'Select Workout' : 'Choose Exercises'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {workoutType === 'preset' 
                  ? 'Pick a complete workout routine'
                  : 'Select the exercises you want to perform'
                }
              </p>
            </div>

            {workoutType === 'preset' ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {presetWorkouts.map((workout) => (
                  <motion.div
                    key={workout.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handlePresetWorkoutSelect(workout.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedWorkout === workout.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {workout.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {workout.duration}min
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {workout.exercises.length} exercises
                          </div>
                          <span className="capitalize">{workout.difficulty}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {workout.muscleGroups.map((group) => (
                            <span
                              key={group}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-lg capitalize"
                            >
                              {group}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-colors ${
                        selectedWorkout === workout.id ? 'text-primary' : 'text-gray-400'
                      }`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {filteredExercises.map((exercise) => (
                    <motion.div
                      key={exercise.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleExerciseToggle(exercise.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedExercises.includes(exercise.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {exercise.name}
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {exercise.muscleGroup} • {exercise.difficulty}
                          </div>
                          {exercise.equipment !== 'None' && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Equipment: {exercise.equipment}
                            </div>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedExercises.includes(exercise.id)
                            ? 'border-primary bg-primary'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedExercises.includes(exercise.id) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                {['name', 'type', 'selection'].map((stepName, index) => (
                  <div
                    key={stepName}
                    className={`w-3 h-3 rounded-full ${
                      ['name', 'type', 'selection'].indexOf(step) >= index
                        ? 'bg-primary'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Step {['name', 'type', 'selection'].indexOf(step) + 1} of 3
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 'name'}
              >
                Back
              </Button>

              <div className="flex items-center space-x-3">
                {step !== 'selection' ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!canProceed()}
                    loading={loading}
                    className="flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}