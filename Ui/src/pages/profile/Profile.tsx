import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  Calendar, 
  Ruler, 
  Weight, 
  Target, 
  TrendingUp,
  Camera,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { useAuthStore } from '@/app/store'
import { useI18nStore } from '@/app/i18n'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(13).max(100),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  fitnessGoal: z.enum(['lose_weight', 'build_muscle', 'maintain']),
  trainingDaysPerWeek: z.number().min(1).max(7),
  preferredWorkoutDuration: z.number().min(15).max(180),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function Profile() {
  const { user, updateProfile } = useAuthStore()
  const { t } = useI18nStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      age: user?.profile?.age || 25,
      height: user?.profile?.height || 170,
      weight: user?.profile?.weight || 70,
      fitnessGoal: user?.profile?.fitnessGoal || 'maintain',
      trainingDaysPerWeek: user?.profile?.trainingDaysPerWeek || 3,
      preferredWorkoutDuration: user?.profile?.preferredWorkoutDuration || 60,
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true)
    try {
      const { name, email, ...profileData } = data
      updateProfile(profileData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const progressPhotos = [
    { id: '1', date: '2024-01-01', type: 'front' },
    { id: '2', date: '2024-01-01', type: 'side' },
    { id: '3', date: '2024-01-01', type: 'back' },
  ]

  const bodyMetrics = [
    { label: 'Weight', value: `${user?.profile?.weight || 70} kg`, icon: Weight, trend: '-2.5 kg' },
    { label: 'Height', value: `${user?.profile?.height || 170} cm`, icon: Ruler, trend: null },
    { label: 'Body Fat', value: '15%', icon: TrendingUp, trend: '-2%' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your personal information and fitness goals
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={loading}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Premium Member
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('name')}
                    label="Full Name"
                    disabled={!isEditing}
                    error={errors.name?.message}
                    className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  />
                  <Input
                    {...register('email')}
                    type="email"
                    label="Email Address"
                    disabled={!isEditing}
                    error={errors.email?.message}
                    className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    {...register('age', { valueAsNumber: true })}
                    type="number"
                    label={t('onboarding.age')}
                    disabled={!isEditing}
                    error={errors.age?.message}
                    className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  />
                  <Input
                    {...register('height', { valueAsNumber: true })}
                    type="number"
                    label={t('onboarding.height')}
                    disabled={!isEditing}
                    error={errors.height?.message}
                    className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  />
                  <Input
                    {...register('weight', { valueAsNumber: true })}
                    type="number"
                    label={t('onboarding.weight')}
                    disabled={!isEditing}
                    error={errors.weight?.message}
                    className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    {...register('fitnessGoal')}
                    label={t('onboarding.fitnessGoal')}
                    disabled={!isEditing}
                    options={[
                      { value: 'lose_weight', label: 'Lose Weight' },
                      { value: 'build_muscle', label: 'Build Muscle' },
                      { value: 'maintain', label: 'Maintain Fitness' },
                    ]}
                    error={errors.fitnessGoal?.message}
                    className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    {...register('trainingDaysPerWeek', { valueAsNumber: true })}
                    label={t('onboarding.trainingDays')}
                    disabled={!isEditing}
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
                    className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  />
                  <Select
                    {...register('preferredWorkoutDuration', { valueAsNumber: true })}
                    label={t('onboarding.workoutDuration')}
                    disabled={!isEditing}
                    options={[
                      { value: '15', label: '15 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '45', label: '45 minutes' },
                      { value: '60', label: '60 minutes' },
                      { value: '90', label: '90 minutes' },
                      { value: '120', label: '120 minutes' },
                    ]}
                    error={errors.preferredWorkoutDuration?.message}
                    className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  />
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Progress Photos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Progress Photos
                </h3>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {progressPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {photo.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(photo.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Body Metrics */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Body Metrics
              </h3>
              
              <div className="space-y-4">
                {bodyMetrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <metric.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {metric.value}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {metric.label}
                        </p>
                      </div>
                    </div>
                    {metric.trend && (
                      <span className={`text-sm font-medium ${
                        metric.trend.startsWith('-') 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {metric.trend}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Account Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Account Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Jan 2024
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Workouts</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    47
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                  <span className="font-medium text-primary">
                    12 days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Best Streak</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    28 days
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}