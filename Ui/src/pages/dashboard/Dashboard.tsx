import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Zap, Calendar, TrendingUp, Award, Target, Upload } from 'lucide-react'
import { useI18nStore } from '@/app/i18n'
import { useAuthStore } from '@/app/store'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import StatsCard from '@/components/cards/StatsCard'
import WorkoutCard from '@/components/cards/WorkoutCard'
import ActivityChart from '@/components/charts/ActivityChart'
import ProgressChart from '@/components/charts/ProgressChart'
import StartWorkoutModal from '@/components/modals/StartWorkoutModal'
// TEMPORARY - REMOVE AFTER VERIFICATION
import apiClient from '@/api/client'

export default function Dashboard() {
  const { t } = useI18nStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [showStartModal, setShowStartModal] = useState(false)

  // TEMPORARY - REMOVE AFTER VERIFICATION
  // Test API connection to backend
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log('🔍 Testing API connection to backend...')
        const response = await apiClient.get('/health')
        console.log('✅ API Connection Successful!')
        console.log('📦 Response data:', response.data)
      } catch (error) {
        console.error('❌ API Connection Failed!')
        console.error('Error details:', error)
      }
    }

    testApiConnection()
  }, [])

  const handleStartWorkout = (workoutData: {
    name: string
    type: 'preset' | 'custom'
    workoutId?: string
    exercises?: string[]
    startTime: Date
  }) => {
    // Navigate to live training with the workout data
    navigate('/live-training', { state: { workoutData } })
  }

  const stats = [
    {
      title: t('dashboard.totalSessions'),
      value: '24',
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t('dashboard.workoutStreak'),
      value: '12 days',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ]

  const todaysWorkout = {
    id: '1',
    name: 'Upper Body Strength',
    duration: 45,
    exercises: 8,
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  }

  const recentWorkouts = [
    {
      id: '1',
      name: 'Push-ups Session',
      date: '2024-01-15',
      duration: 30,
    },
    {
      id: '2',
      name: 'Squats Session',
      date: '2024-01-13',
      duration: 25,
    },
    {
      id: '3',
      name: 'Sit-ups Session',
      date: '2024-01-11',
      duration: 20,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => navigate('/live-training')}
              className="flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {t('dashboard.startTraining')}
            </Button>
            <Button
              onClick={() => navigate('/upload-video')}
              variant="outline"
              className="flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Session History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.recentSessions')}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                {t('dashboard.viewAll')}
              </Button>
            </div>
            <div className="space-y-4">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {workout.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {workout.date} • {workout.duration}min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary">{t('dashboard.completed')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.weeklyActivity')}
              </h2>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700">
                <option>{t('dashboard.thisWeek')}</option>
                <option>{t('dashboard.lastWeek')}</option>
                <option>{t('dashboard.thisMonth')}</option>
              </select>
            </div>
            <ActivityChart />
          </Card>
        </motion.div>

        {/* Progress Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.progressOverTime')}
              </h2>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700">
                <option>{t('dashboard.sessions')}</option>
                <option>{t('dashboard.duration')}</option>
              </select>
            </div>
            <ProgressChart />
          </Card>
        </motion.div>
      </div>

      {/* Recent Workouts */}

      {/* Start Workout Modal */}
    </div>
  )
}