import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { reportsApi, ReportDetailResponse } from '@/api/reports'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<ReportDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // DATA FETCHING - Changed from mock data to real API
  // ============================================================================
  useEffect(() => {
    if (id) {
      loadReportDetail(id)
    }
  }, [id])

  const loadReportDetail = async (reportId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await reportsApi.getOne(reportId)
      setReport(data)
    } catch (err: any) {
      console.error('Failed to load report detail:', err)
      if (err.response?.status === 404) {
        setError('Report not found')
      } else {
        setError('Failed to load report. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  const formatExerciseType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    }
  }

  const getPerformanceRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'needs_improvement': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getWarningLevelColor = (level: 'critical' | 'warning' | 'info') => {
    switch (level) {
      case 'critical': return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800'
    }
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
  if (error || !report) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {error || 'Report not found'}
        </h3>
        <Button onClick={() => navigate('/reports')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    )
  }

  const { full_report, session } = report

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/reports')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </div>

      {/* Report Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatExerciseType(report.exercise_type)} Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {session.session_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {new Date(report.generated_at).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-1">
                {report.form_score}/100
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Form Score</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-sm font-medium ${getPerformanceRatingColor(report.performance_rating)}`}>
                {report.performance_rating.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {full_report.session_info.duration_formatted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {full_report.session_info.total_frames_processed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Frames Analyzed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {report.form_score}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Overall Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Overall Summary
            </h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
            {full_report.overall_summary.message}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Mistakes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {full_report.overall_summary.total_mistakes}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Unique Types</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {full_report.overall_summary.unique_mistake_types}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">High Risk Warnings</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {full_report.overall_summary.high_risk_warnings}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Mistakes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detected Mistakes
            </h2>
          </div>

          <div className="space-y-6">
            {full_report.mistakes.map((mistake, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                {/* Mistake Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {mistake.mistake_message}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>Occurred {mistake.count} times</span>
                      <span>•</span>
                      <span>First seen: {mistake.first_seen_at}</span>
                      <span>•</span>
                      <span>Last seen: {mistake.last_seen_at}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getSeverityColor(mistake.severity)}`}>
                    {mistake.severity.toUpperCase()}
                  </span>
                </div>

                {/* Correction Tip */}
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-green-900 dark:text-green-400 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    How to Fix
                  </h4>
                  <p className="text-green-800 dark:text-green-300">
                    {mistake.correction_tip}
                  </p>
                </div>

                {/* Warning Box (if exists) */}
                {mistake.warning && (
                  <div className={`border rounded-lg p-4 ${getWarningLevelColor(mistake.warning.level)}`}>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        mistake.warning.level === 'critical' ? 'text-red-600' :
                        mistake.warning.level === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            mistake.warning.level === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            mistake.warning.level === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {mistake.warning.level.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium mb-1">
                          {mistake.warning.message}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {mistake.warning.injury_risk}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Occurred at:</p>
                  <div className="flex flex-wrap gap-2">
                    {mistake.timestamps.map((timestamp, i) => (
                      <span key={i} className="bg-primary text-white text-xs font-mono px-2 py-1 rounded">
                        {timestamp}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Statistics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Session Statistics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Most Common Mistake
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {full_report.statistics.most_common_mistake 
                  ? formatExerciseType(full_report.statistics.most_common_mistake)
                  : 'None'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                High Frequency Mistakes
              </h3>
              {full_report.statistics.high_frequency_mistakes.length > 0 ? (
                <ul className="space-y-2">
                  {full_report.statistics.high_frequency_mistakes.map((mistake, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {formatExerciseType(mistake)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">None</p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
