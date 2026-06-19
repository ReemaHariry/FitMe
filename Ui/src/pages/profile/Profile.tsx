import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Camera,
  Edit3,
  Save,
  X,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/app/store'
import { useI18nStore } from '@/app/i18n'
import { usersApi, type ProgressPhoto, type ProfileDataResponse } from '@/api/users'
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
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ADDED: Profile data state (fetched from API)
  const [profile, setProfile] = useState<ProfileDataResponse | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Progress photos state
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<ProgressPhoto | null>(null)
  const [showPhotoTypeSelector, setShowPhotoTypeSelector] = useState(false)
  
  // ADDED: Photo navigation state (current index per type)
  const [frontPhotoIndex, setFrontPhotoIndex] = useState(0)
  const [sidePhotoIndex, setSidePhotoIndex] = useState(0)
  const [backPhotoIndex, setBackPhotoIndex] = useState(0)
  
  // File input refs for each photo type
  const frontFileInputRef = useRef<HTMLInputElement>(null)
  const sideFileInputRef = useRef<HTMLInputElement>(null)
  const backFileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      age: 25,
      height: 170,
      weight: 70,
      fitnessGoal: 'maintain',
      trainingDaysPerWeek: 3,
      preferredWorkoutDuration: 60,
    },
  })

  // ADDED: Load profile data from API on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true)
        const data = await usersApi.getProfile()
        setProfile(data)
        
        // Update form with fetched data
        setValue('name', user?.name || '')
        setValue('email', user?.email || '')
        setValue('age', data.age || 25)
        setValue('height', data.height || 170)
        setValue('weight', data.weight || 70)
        setValue('fitnessGoal', (data.fitness_goal as any) || 'maintain')
        setValue('trainingDaysPerWeek', data.training_days_per_week || 3)
        setValue('preferredWorkoutDuration', data.preferred_workout_duration || 60)
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user, setValue])

  // ADDED: Fetch progress photos on mount
  useEffect(() => {
    loadProgressPhotos()
  }, [])

  const loadProgressPhotos = async () => {
    try {
      setPhotosLoading(true)
      const photos = await usersApi.getProgressPhotos()
      setProgressPhotos(photos)
      // Reset navigation indices
      setFrontPhotoIndex(0)
      setSidePhotoIndex(0)
      setBackPhotoIndex(0)
    } catch (err) {
      console.error('Failed to load progress photos:', err)
    } finally {
      setPhotosLoading(false)
    }
  }

  // FIXED: Save profile to backend API
  const onSubmit = async (data: ProfileForm) => {
    setLoading(true)
    setSaveSuccess(false)
    setSaveError(null)
    
    try {
      // Call backend API to update profile
      const updated = await usersApi.updateProfile({
        age: data.age,
        height: data.height,
        weight: data.weight,
        fitness_goal: data.fitnessGoal,
        training_days_per_week: data.trainingDaysPerWeek,
        preferred_workout_duration: data.preferredWorkoutDuration,
      })
      
      // Update local profile state
      setProfile(updated)
      
      // Show success message
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      
      // Exit edit mode
      setIsEditing(false)
      
      // Reset form dirty state
      reset(data)
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      setSaveError(error.response?.data?.detail || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setSaveError(null)
  }

  // ADDED: Handle photo upload
  const handlePhotoUpload = async (file: File, photoType: 'front' | 'side' | 'back') => {
    try {
      setUploadingType(photoType)
      
      // Use today's date as taken_at
      const takenAt = new Date().toISOString().split('T')[0]
      
      await usersApi.uploadProgressPhoto(file, photoType, takenAt)
      
      // Refresh photos list
      await loadProgressPhotos()
      
      setShowPhotoTypeSelector(false)
    } catch (err) {
      console.error('Failed to upload photo:', err)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingType(null)
    }
  }

  // ADDED: Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    photoType: 'front' | 'side' | 'back'
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      handlePhotoUpload(file, photoType)
    }
    
    // Reset input
    event.target.value = ''
  }

  // ADDED: Handle photo delete
  const handlePhotoDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return
    }
    
    try {
      await usersApi.deleteProgressPhoto(photoId)
      await loadProgressPhotos()
      setSelectedPhotoForView(null)
    } catch (err) {
      console.error('Failed to delete photo:', err)
      alert('Failed to delete photo. Please try again.')
    }
  }

  // ADDED: Get most recent photo for each type + group all photos by type
  const frontPhotos = progressPhotos.filter(p => p.photo_type === 'front')
  const sidePhotos = progressPhotos.filter(p => p.photo_type === 'side')
  const backPhotos = progressPhotos.filter(p => p.photo_type === 'back')

  const currentFrontPhoto = frontPhotos[frontPhotoIndex]
  const currentSidePhoto = sidePhotos[sidePhotoIndex]
  const currentBackPhoto = backPhotos[backPhotoIndex]

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
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={loading}
              disabled={!isDirty || loading}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
            ✓
          </div>
          <p className="text-green-800 dark:text-green-200 font-medium">
            Profile updated successfully!
          </p>
        </motion.div>
      )}
      
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
            ✕
          </div>
          <p className="text-red-800 dark:text-red-200 font-medium">
            {saveError}
          </p>
        </motion.div>
      )}

      {/* Profile Info and Progress Photos */}
      <div className="space-y-6">
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
                    {user?.email}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full me-2"></div>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => setShowPhotoTypeSelector(!showPhotoTypeSelector)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
              </div>

              {/* Photo Type Selector */}
              {showPhotoTypeSelector && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Which photo do you want to upload?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => frontFileInputRef.current?.click()}
                      disabled={uploadingType === 'front'}
                    >
                      {uploadingType === 'front' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Front'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sideFileInputRef.current?.click()}
                      disabled={uploadingType === 'side'}
                    >
                      {uploadingType === 'side' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Side'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => backFileInputRef.current?.click()}
                      disabled={uploadingType === 'back'}
                    >
                      {uploadingType === 'back' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Back'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={frontFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileInputChange(e, 'front')}
              />
              <input
                ref={sideFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileInputChange(e, 'side')}
              />
              <input
                ref={backFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileInputChange(e, 'back')}
              />
              
              {/* Photo Grid with Navigation (FIXED - Problem 3) */}
              <div className="grid grid-cols-3 gap-4">
                {/* Front Photo */}
                <div className="relative">
                  <div
                    className={`aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden ${
                      currentFrontPhoto ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                    }`}
                    onClick={() => currentFrontPhoto && setSelectedPhotoForView(currentFrontPhoto)}
                  >
                    {photosLoading ? (
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    ) : currentFrontPhoto ? (
                      <img
                        src={currentFrontPhoto.photo_url}
                        alt="Front"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Front</p>
                        <p className="text-xs text-gray-400">No photo</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation for Front Photos */}
                  {frontPhotos.length > 1 && (
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() => setFrontPhotoIndex(Math.max(0, frontPhotoIndex - 1))}
                        disabled={frontPhotoIndex === 0}
                        className="p-1 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500">
                        {frontPhotoIndex + 1} / {frontPhotos.length}
                      </span>
                      <button
                        onClick={() => setFrontPhotoIndex(Math.min(frontPhotos.length - 1, frontPhotoIndex + 1))}
                        disabled={frontPhotoIndex === frontPhotos.length - 1}
                        className="p-1 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {currentFrontPhoto && (
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {new Date(currentFrontPhoto.taken_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Side Photo */}
                <div className="relative">
                  <div
                    className={`aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden ${
                      currentSidePhoto ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                    }`}
                    onClick={() => currentSidePhoto && setSelectedPhotoForView(currentSidePhoto)}
                  >
                    {photosLoading ? (
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    ) : currentSidePhoto ? (
                      <img
                        src={currentSidePhoto.photo_url}
                        alt="Side"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Side</p>
                        <p className="text-xs text-gray-400">No photo</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation for Side Photos */}
                  {sidePhotos.length > 1 && (
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() => setSidePhotoIndex(Math.max(0, sidePhotoIndex - 1))}
                        disabled={sidePhotoIndex === 0}
                        className="p-1 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500">
                        {sidePhotoIndex + 1} / {sidePhotos.length}
                      </span>
                      <button
                        onClick={() => setSidePhotoIndex(Math.min(sidePhotos.length - 1, sidePhotoIndex + 1))}
                        disabled={sidePhotoIndex === sidePhotos.length - 1}
                        className="p-1 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {currentSidePhoto && (
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {new Date(currentSidePhoto.taken_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Back Photo */}
                <div className="relative">
                  <div
                    className={`aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden ${
                      currentBackPhoto ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                    }`}
                    onClick={() => currentBackPhoto && setSelectedPhotoForView(currentBackPhoto)}
                  >
                    {photosLoading ? (
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    ) : currentBackPhoto ? (
                      <img
                        src={currentBackPhoto.photo_url}
                        alt="Back"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Back</p>
                        <p className="text-xs text-gray-400">No photo</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation for Back Photos */}
                  {backPhotos.length > 1 && (
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() => setBackPhotoIndex(Math.max(0, backPhotoIndex - 1))}
                        disabled={backPhotoIndex === 0}
                        className="p-1 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500">
                        {backPhotoIndex + 1} / {backPhotos.length}
                      </span>
                      <button
                        onClick={() => setBackPhotoIndex(Math.min(backPhotos.length - 1, backPhotoIndex + 1))}
                        disabled={backPhotoIndex === backPhotos.length - 1}
                        className="p-1 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {currentBackPhoto && (
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {new Date(currentBackPhoto.taken_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
      </div>

      {/* Photo View Modal */}
      {selectedPhotoForView && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoForView(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                {selectedPhotoForView.photo_type} Photo
              </h3>
              <button
                onClick={() => setSelectedPhotoForView(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <img
              src={selectedPhotoForView.photo_url}
              alt={selectedPhotoForView.photo_type}
              className="w-full rounded-xl mb-4"
            />
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Taken on {new Date(selectedPhotoForView.taken_at).toLocaleDateString()}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-red-600 hover:text-red-700"
                onClick={() => handlePhotoDelete(selectedPhotoForView.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
