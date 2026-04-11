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
  Award
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ReportDetail {
  id: string
  date: string
  workoutName: string
  duration: number
  aiScore: number
  exercisesCompleted: number
  detailedFeedback: Array<{
    timestamp: string
    issue: string
    description: string
    improvement: string
  }>
  commonMistakes: Array<{
    exercise: string
    mistake: string
    severity: 'low' | 'medium' | 'high'
    frequency: number
  }>
  areasOfImprovement: Array<{
    area: string
    currentLevel: number
    targetLevel: number
    howToFix: string
    priority: 'low' | 'medium' | 'high'
  }>
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadReportDetail(id)
    }
  }, [id])

  const loadReportDetail = async (reportId: string) => {
    try {
      // Mock detailed report data
      const mockReport: ReportDetail = {
        id: reportId,
        date: '2024-01-15',
        workoutName: 'Push-ups Training',
        duration: 45,
        aiScore: 85,
        exercisesCompleted: 8,
        detailedFeedback: [
          {
            timestamp: '00:12',
            issue: 'Dropping hips too low',
            description: 'Your hips are sagging during the push-up movement, reducing core engagement',
            improvement: 'Keep your body in a straight line from head to heels. Engage your core muscles throughout the movement'
          },
          {
            timestamp: '00:27',
            issue: 'Incomplete range of motion',
            description: 'Not lowering chest close enough to the ground',
            improvement: 'Lower your chest until it nearly touches the ground, then push back up to full arm extension'
          },
          {
            timestamp: '01:15',
            issue: 'Hand placement too wide',
            description: 'Hands positioned wider than shoulder-width apart',
            improvement: 'Position hands directly under your shoulders for optimal muscle activation and joint safety'
          },
          {
            timestamp: '01:42',
            issue: 'Breathing pattern incorrect',
            description: 'Holding breath during the movement',
            improvement: 'Inhale as you lower down, exhale as you push up. Maintain steady breathing throughout'
          }
        ],
        commonMistakes: [
          {
            exercise: 'Push-ups',
            mistake: 'Dropping hips too low during the movement',
            severity: 'medium',
            frequency: 12
          },
          {
            exercise: 'Shoulder Press',
            mistake: 'Not engaging core properly',
            severity: 'high',
            frequency: 8
          },
          {
            exercise: 'Tricep Dips',
            mistake: 'Going too deep, straining shoulders',
            severity: 'low',
            frequency: 5
          },
          {
            exercise: 'Plank',
            mistake: 'Holding breath instead of breathing normally',
            severity: 'medium',
            frequency: 15
          }
        ],
        areasOfImprovement: [
          {
            area: 'Core Stability',
            currentLevel: 6,
            targetLevel: 9,
            howToFix: 'Focus on engaging your core throughout all exercises. Practice dead bugs and bird dogs to improve core activation.',
            priority: 'high'
          },
          {
            area: 'Shoulder Mobility',
            currentLevel: 7,
            targetLevel: 9,
            howToFix: 'Incorporate shoulder circles and wall slides into your warm-up. Stretch chest muscles regularly.',
            priority: 'medium'
          },
          {
            area: 'Breathing Technique',
            currentLevel: 5,
            targetLevel: 8,
            howToFix: 'Practice diaphragmatic breathing. Exhale during exertion phase, inhale during relaxation phase.',
            priority: 'high'
          },
          {
            area: 'Form Consistency',
            currentLevel: 8,
            targetLevel: 10,
            howToFix: 'Slow down movements and focus on quality over quantity. Use mirrors for visual feedback.',
            priority: 'medium'
          }
        ]
      }
      setReport(mockReport)
    } catch (error) {
      console.error('Failed to load report detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    }
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/10'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/10'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Report not found
        </h3>
        <Button onClick={() => navigate('/reports')}>
          Back to Reports
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
                {report.workoutName} Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {new Date(report.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-1">
                {report.aiScore}/100
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Score</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {report.duration}min
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {report.exercisesCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {report.aiScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Detailed Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Timeline Feedback
            </h2>
          </div>

          <div className="space-y-4">
            {report.detailedFeedback.map((feedback, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-white text-xs font-mono px-2 py-1 rounded">
                    {feedback.timestamp}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          Issue:
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {feedback.issue}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">
                          Description:
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {feedback.description}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          How to Improve:
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {feedback.improvement}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Common Mistakes Section */}
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
              Common Mistakes
            </h2>
          </div>

          <div className="space-y-4">
            {report.commonMistakes.map((mistake, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {mistake.exercise}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {mistake.mistake}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getSeverityColor(mistake.severity)}`}>
                      {mistake.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {mistake.frequency}x
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      mistake.severity === 'high' ? 'bg-red-500' :
                      mistake.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((mistake.frequency / 20) * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Areas of Improvement Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Areas of Improvement
            </h2>
          </div>

          <div className="space-y-6">
            {report.areasOfImprovement.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-6 border-l-4 rounded-xl ${getPriorityColor(area.priority)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {area.area}
                    </h3>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Current: <span className="font-medium text-gray-900 dark:text-white">{area.currentLevel}/10</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Target: <span className="font-medium text-primary">{area.targetLevel}/10</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    area.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    area.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {area.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{area.currentLevel}/{area.targetLevel}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(area.currentLevel / area.targetLevel) * 100}%` }}
                    />
                  </div>
                </div>

                {/* How to Fix */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    How to Fix
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {area.howToFix}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}