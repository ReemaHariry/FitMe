import { motion } from 'framer-motion'

const data = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 0 },
  { day: 'Wed', minutes: 60 },
  { day: 'Thu', minutes: 30 },
  { day: 'Fri', minutes: 45 },
  { day: 'Sat', minutes: 90 },
  { day: 'Sun', minutes: 0 },
]

export default function ActivityChart() {
  const maxMinutes = Math.max(...data.map(d => d.minutes))

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => (
          <div key={item.day} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.minutes / maxMinutes) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full bg-primary rounded-t-lg min-h-[4px] flex items-end justify-center pb-2"
            >
              {item.minutes > 0 && (
                <span className="text-xs text-white font-medium">
                  {item.minutes}m
                </span>
              )}
            </motion.div>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {item.day}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Total: {data.reduce((sum, item) => sum + item.minutes, 0)} minutes</span>
        <span>Avg: {Math.round(data.reduce((sum, item) => sum + item.minutes, 0) / 7)} min/day</span>
      </div>
    </div>
  )
}