import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/app/store'
import { useI18nStore } from '@/app/i18n'
import { usersApi } from '@/api/users'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'

const onboardingSchema = z.object({
  gender: z.enum(['male', 'female']),
  age: z.number().min(13).max(100),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  fitnessGoal: z.enum(['lose_weight', 'build_muscle', 'maintain']),
  trainingDaysPerWeek: z.number().min(1).max(7),
  preferredWorkoutDuration: z.number().min(15).max(180),
})

type OnboardingForm = z.infer<typeof onboardingSchema>

const steps = [
  { title: 'Personal Info', fields: ['gender', 'age'] },
  { title: 'Body Metrics', fields: ['height', 'weight'] },
  { title: 'Fitness Goals', fields: ['fitnessGoal'] },
  { title: 'Training Preferences', fields: ['trainingDaysPerWeek', 'preferredWorkoutDuration'] },
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { updateProfile, completeOnboarding } = useAuthStore()
  const { t } = useI18nStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      gender: 'male',
      age: 25,
      height: 170,
      weight: 70,
      fitnessGoal: 'maintain',
      trainingDaysPerWeek: 3,
      preferredWorkoutDuration: 60,
    },
  })

  const nextStep = async () => {
    const fieldsToValidate = steps[currentStep].fields as (keyof OnboardingForm)[]
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: OnboardingForm) => {
    setLoading(true)
    setError(null)
    try {
      // Convert form data to API format
      const profileData = {
        gender: data.gender,
        age: data.age,
        height: data.height,
        weight: data.weight,
        fitness_goal: data.fitnessGoal,
        training_days_per_week: data.trainingDaysPerWeek,
        preferred_workout_duration: data.preferredWorkoutDuration,
      }
      
      // Save to backend
      await usersApi.saveProfile(profileData)
      
      // Update local state
      updateProfile({
        gender: data.gender,
        age: data.age,
        height: data.height,
        weight: data.weight,
        fitnessGoal: data.fitnessGoal,
        experienceLevel: 'beginner', // Default value
        trainingDaysPerWeek: data.trainingDaysPerWeek,
        preferredWorkoutDuration: data.preferredWorkoutDuration,
      })
      
      // Mark onboarding as complete
      completeOnboarding()
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Onboarding failed:', error)
      setError(error.response?.data?.detail || error.message || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Select
              {...register('gender')}
              label={t('onboarding.gender')}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              error={errors.gender?.message}
            />
            <Input
              {...register('age', { valueAsNumber: true })}
              type="number"
              label={t('onboarding.age')}
              placeholder="25"
              error={errors.age?.message}
            />
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <Input
              {...register('height', { valueAsNumber: true })}
              type="number"
              label={t('onboarding.height')}
              placeholder="170"
              error={errors.height?.message}
            />
            <Input
              {...register('weight', { valueAsNumber: true })}
              type="number"
              label={t('onboarding.weight')}
              placeholder="70"
              error={errors.weight?.message}
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <Select
              {...register('fitnessGoal')}
              label={t('onboarding.fitnessGoal')}
              options={[
                { value: 'lose_weight', label: t('onboarding.loseWeight') },
                { value: 'build_muscle', label: t('onboarding.buildMuscle') },
                { value: 'maintain', label: t('onboarding.maintainFitness') },
              ]}
              error={errors.fitnessGoal?.message}
            />
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <Select
              {...register('trainingDaysPerWeek', { valueAsNumber: true })}
              label={t('onboarding.trainingDays')}
              options={[
                { value: '1', label: '1 day' },
                { value: '2', label: '2 days' },
                { value: '3', label: '3 days' },
                { value: '4', label: '4 days' },
                { value: '5', label: '5 days' },
                { value: '6', label: '6 days' },
                { value: '7', label: '7 days' },
              ]}
              error={errors.trainingDaysPerWeek?.message}
            />
            <Select
              {...register('preferredWorkoutDuration', { valueAsNumber: true })}
              label={t('onboarding.workoutDuration')}
              options={[
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '45', label: '45 minutes' },
                { value: '60', label: '60 minutes' },
                { value: '90', label: '90 minutes' },
                { value: '120', label: '120 minutes' },
              ]}
              error={errors.preferredWorkoutDuration?.message}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('onboarding.welcome')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('onboarding.previous')}
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  loading={loading}
                  className="flex items-center"
                >
                  {t('onboarding.complete')}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center"
                >
                  {t('onboarding.next')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}