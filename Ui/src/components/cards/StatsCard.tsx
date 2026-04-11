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
      <Card hover>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}