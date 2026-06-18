import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Card from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  color: string
  bgColor: string
  delay?: number
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  delay = 0 
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
        {/* Subtle background glow based on the card's color */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 ${bgColor} rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500`} />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}