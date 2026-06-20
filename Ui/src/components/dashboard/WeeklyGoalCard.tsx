import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { useI18nStore } from '@/app/i18n'

interface WeeklyGoalCardProps {
  sessionsThisWeek: number
  weeklyGoal: number
}

export default function WeeklyGoalCard({ sessionsThisWeek, weeklyGoal }: WeeklyGoalCardProps) {
  const { t } = useI18nStore()
  const remaining = Math.max(0, weeklyGoal - sessionsThisWeek)
  const progress = Math.min(100, (sessionsThisWeek / weeklyGoal) * 100)
  const isGoalComplete = sessionsThisWeek >= weeklyGoal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-semibold text-gray-900 dark:text-white">
            {t('dashboard.weeklyGoal')}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {sessionsThisWeek}/{weeklyGoal} sessions
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-3">
        <div
          className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Goal Message */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {isGoalComplete ? null : (
          remaining === 1 
            ? t('dashboard.workoutsLeft').replace('{count}', String(remaining))
            : t('dashboard.workoutsLeftPlural').replace('{count}', String(remaining))
        )}
      </p>
    </motion.div>
  )
}
