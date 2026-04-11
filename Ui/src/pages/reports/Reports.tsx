import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Download, 
  TrendingUp, 
  Award, 
  Target, 
  Clock,
  BarChart3
} from 'lucide-react'
import { useI18nStore } from '@/app/i18n'
import { mockWorkoutHistory, mockPerformanceData } from '@/services/mockData'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import ActivityChart from '@/components/charts/ActivityChart'
import ProgressChart from '@/components/charts/ProgressChart'

interface WorkoutHistory {
  id: string
  date: string
  workoutType: string
  duration: number
  feedback: string[]
  detailedFeedback?: Array<{
    timestamp: string
    issue: string
    description: string
    improvement: string
  }>
}

export default function Reports() {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const { t } = useI18nStore()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      // Load from localStorage first (real workout sessions)
      const localReports = JSON.parse(localStorage.getItem('workout-reports') || '[]')
      
      // Combine real reports with mock data
      const combinedReports = [...localReports, ...mockWorkoutHistory]
      setWorkoutHistory(combinedReports)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ]

  const summaryStats = {
    totalWorkouts: workoutHistory.length,
    totalMinutes: workoutHistory.reduce((sum, w) => sum + w.duration, 0),
    averageScore: 87, // Mock average accuracy percentage
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('reports.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('reports.description')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          />
          <Button className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            {t('reports.exportReport')}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('reports.totalSessions')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryStats.totalWorkouts}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('reports.totalMinutes')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryStats.totalMinutes}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('reports.averageAccuracy')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryStats.averageScore}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Weekly Activity
              </h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ActivityChart />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Progress Over Time
              </h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <ProgressChart />
          </Card>
        </motion.div>
      </div>

      {/* Detailed Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {t('reports.detailedFeedback')}
          </h2>
          
          {workoutHistory.length > 0 ? (
            <div className="space-y-6">
              {workoutHistory.slice(0, 3).map((session) => (
                <div key={session.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('reports.workoutType')}: {t(`exercises.${session.workoutType?.toLowerCase().replace('-', '').replace(' ', '')}`)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.date).toLocaleDateString()} • {session.duration} {t('reports.minutes')}
                      </p>
                    </div>
                    <Link to={`/reports/${session.id}`}>
                      <Button variant="outline" size="sm">
                        {t('reports.viewDetails')}
                      </Button>
                    </Link>
                  </div>
                  
                  {session.detailedFeedback && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {t('reports.timeline')}:
                      </h4>
                      {session.detailedFeedback.map((feedback, feedbackIndex) => (
                        <div key={feedbackIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-primary text-white text-xs font-mono px-2 py-1 rounded">
                              {feedback.timestamp}
                            </div>
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-red-600 dark:text-red-400">
                                    {t('reports.issue')}:
                                  </span>
                                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                                    {feedback.issue}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                    {t('reports.feedbackDescription')}:
                                  </span>
                                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                                    {feedback.description}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {t('reports.improvement')}:
                                  </span>
                                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                                    {feedback.improvement}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('reports.noSessionsYet')}
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Workout History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('reports.recentSessions')}
            </h2>
            <Button variant="ghost" size="sm">
              {t('reports.viewAll')}
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t('reports.date')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t('reports.workoutType')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t('reports.duration')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t('reports.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {workoutHistory.map((workout) => (
                  <tr key={workout.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(workout.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      <Link 
                        to={`/reports/${workout.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {t(`exercises.${workout.workoutType?.toLowerCase().replace('-', '').replace(' ', '')}`)}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {workout.duration} {t('reports.minutes')}
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/reports/${workout.id}`}>
                        <Button variant="ghost" size="sm">
                          {t('reports.viewDetails')}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}