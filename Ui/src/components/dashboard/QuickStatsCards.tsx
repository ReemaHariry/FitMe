import { motion } from 'framer-motion'
import { Trophy, Calendar } from 'lucide-react'
import Card from '@/components/ui/Card'

interface QuickStatsCardsProps {
  bestScore: number
  sessionsThisWeek: number
  weeklyGoal: number
}

export default function QuickStatsCards({ bestScore, sessionsThisWeek, weeklyGoal }: QuickStatsCardsProps) {
  const weekProgress = Math.min(100, (sessionsThisWeek / weeklyGoal) * 100)

  return (
    <>
      {/* Best Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {bestScore}<span className="text-lg text-gray-500">/100</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* This Week Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {sessionsThisWeek}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                of {weeklyGoal} goal days
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${weekProgress}%` }}
            ></div>
          </div>
        </Card>
      </motion.div>
    </>
  )
}
