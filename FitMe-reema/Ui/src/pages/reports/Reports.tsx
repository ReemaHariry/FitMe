import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Download, 
  TrendingUp, 
  Award, 
  Target, 
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { useI18nStore } from '@/app/i18n'
import { reportsApi, ReportSummary, UserStats } from '@/api/reports'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import ActivityChart from '@/components/charts/ActivityChart'
import ProgressChart from '@/components/charts/ProgressChart'

export default function Reports() {
  // ============================================================================
  // STATE - Changed from WorkoutHistory to ReportSummary
  // ============================================================================
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const { t } = useI18nStore()

  // ============================================================================
  // DATA FETCHING - Changed from localStorage to real API
  // ============================================================================
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch reports and stats in parallel
      const [reportsData, statsData] = await Promise.all([
        reportsApi.getAll(),
        reportsApi.getStats()
      ])
      
      setReports(reportsData)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load reports:', err)
      setError('Failed to load reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ]

  const formatExerciseType = (type: string): string => {
    // Convert "squat" → "Squat", "push_up" → "Push Up"
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getFormScoreBadgeColor = (score: number | null): string => {
    if (score === null) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button onClick={loadReports}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
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

      {/* Summary Stats - Changed to use real stats from API */}
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
                  {stats?.total_sessions || 0}
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
                  {stats?.total_minutes || 0}
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
                  {stats?.average_form_score ? `${stats.average_form_score}%` : 'N/A'}
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

      {/* Detailed Feedback Section - Changed to show top 3 reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {t('reports.detailedFeedback')}
          </h2>
          
          {reports.length > 0 ? (
            <div className="space-y-6">
              {reports.slice(0, 3).map((report) => (
                <div key={report.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {formatExerciseType(report.exercise_type)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(report.generated_at).toLocaleDateString()} • {Math.round(report.duration_seconds / 60)} {t('reports.minutes')}
                      </p>
                    </div>
                    <Link to={`/reports/${report.id}`}>
                      <Button variant="outline" size="sm">
                        {t('reports.viewDetails')}
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Show performance rating and form score */}
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getFormScoreBadgeColor(report.form_score)}`}>
                      {report.form_score !== null ? `${report.form_score}/100` : 'N/A'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {report.total_mistakes} mistakes detected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('reports.noSessionsYet')}
              </p>
              <Button onClick={async () => {
                try {
                  await reportsApi.seedTestData()
                  await loadReports()
                } catch (err) {
                  console.error('Failed to seed test data:', err)
                }
              }}>
                Create Test Data
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Workout History Table - Changed to use real reports */}
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
            <Button variant="ghost" size="sm" onClick={loadReports}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {reports.length > 0 ? (
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
                      Form Score
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {t('reports.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(report.generated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        <Link 
                          to={`/reports/${report.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {formatExerciseType(report.exercise_type)}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {(report.duration_seconds / 60).toFixed(1)} {t('reports.minutes')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getFormScoreBadgeColor(report.form_score)}`}>
                          {report.form_score !== null ? report.form_score : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link to={`/reports/${report.id}`}>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No reports yet. Complete a workout to see your reports here.
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
