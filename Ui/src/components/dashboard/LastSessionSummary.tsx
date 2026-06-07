import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { getScoreColor, formatExerciseName, getInsightMessage } from '@/utils/dashboardHelpers'
import type { RecentSession } from '@/api/dashboard'

interface LastSessionSummaryProps {
  session: RecentSession | null
}

export default function LastSessionSummary({ session }: LastSessionSummaryProps) {
  const navigate = useNavigate()

  if (!session) return null

  const score = session.form_score ?? 0
  const scoreColor = getScoreColor(score)
  const insight = getInsightMessage(score)
  
  // SVG circle parameters
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Last Session Recap
        </h2>

        <div className="flex gap-6 items-center">
          {/* Score Arc */}
          <div className="flex-shrink-0 relative" style={{ width: '80px', height: '80px' }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Foreground arc */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {score}
              </span>
            </div>
          </div>

          {/* Session Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {formatExerciseName(session.exercise_type)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {session.date_label} • {
                session.duration_minutes > 0
                  ? `${session.duration_minutes} min`
                  : '< 1 min'
              }
            </p>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                session.performance_rating === 'excellent'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : session.performance_rating === 'good'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : session.performance_rating === 'fair'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {session.performance_rating.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
              {insight}
            </p>
          </div>
        </div>

        {/* View Report Link */}
        {session.report_id && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate(`/reports/${session.report_id}`)}
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View Full Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
