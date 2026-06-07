import { motion } from 'framer-motion'
import { Lock, Check } from 'lucide-react'
import Card from '@/components/ui/Card'
import { calculateAchievements, type Achievement } from '@/utils/dashboardHelpers'
import type { DashboardStats } from '@/api/dashboard'
import type { WeightLog } from '@/api/weight'

interface AchievementBadgesProps {
  stats: DashboardStats
  weightLogs: WeightLog[]
}

export default function AchievementBadges({ stats, weightLogs }: AchievementBadgesProps) {
  const achievements = calculateAchievements(stats, weightLogs)
  const earnedCount = achievements.filter(a => a.earned).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            🏅 Achievements
          </h2>
          <span className="text-sm text-gray-500">
            {earnedCount} / {achievements.length} earned
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.05 }}
              className={`flex-shrink-0 w-24 h-28 rounded-xl p-3 flex flex-col items-center justify-center text-center relative ${
                achievement.earned
                  ? 'bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
              style={{
                boxShadow: achievement.earned ? '0 0 12px rgba(34, 197, 94, 0.3)' : 'none'
              }}
            >
              {achievement.earned && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              <div className={`text-3xl mb-1 ${achievement.earned ? '' : 'opacity-30'}`}>
                {achievement.emoji}
              </div>
              
              <p className={`text-[10px] font-bold leading-tight ${
                achievement.earned 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500'
              }`}>
                {achievement.earned ? achievement.label : '???'}
              </p>

              {!achievement.earned && (
                <Lock className="absolute bottom-2 right-2 w-3 h-3 text-gray-400" />
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                {achievement.description}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
