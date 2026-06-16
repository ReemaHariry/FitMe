import { motion } from 'framer-motion'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import { buildStreakCalendar } from '@/utils/dashboardHelpers'

interface StreakCalendarProps {
  activeDates: string[]
}

export default function StreakCalendar({ activeDates }: StreakCalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  
  const calendar = buildStreakCalendar(activeDates)
  const activeDaysCount = activeDates.filter(date => {
    const d = new Date(date)
    return d.getMonth() === new Date().getMonth()
  }).length

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📆 30-Day Activity
          </h2>
          <span className="text-sm text-gray-500">
            {activeDaysCount} active days this month
          </span>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayLabels.map((label, i) => (
            <div key={i} className="text-center text-xs text-gray-500 font-medium">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendar.map((day, index) => {
            const dayOfWeek = new Date(day.date).getDay()
            const gridColumn = dayOfWeek === 0 ? 7 : dayOfWeek // Sunday is 0, move to column 7
            
            return (
              <div
                key={index}
                className="relative"
                style={{
                  gridColumnStart: index === 0 ? gridColumn : undefined
                }}
                onMouseEnter={() => setHoveredDate(day.date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    day.isFuture
                      ? 'invisible'
                      : day.hasSession
                      ? day.isToday
                        ? 'bg-primary ring-2 ring-primary ring-offset-2 animate-pulse'
                        : 'bg-primary'
                      : day.isToday
                      ? 'bg-transparent border-2 border-primary'
                      : 'bg-gray-100 dark:bg-gray-700 opacity-30'
                  }`}
                >
                  {day.hasSession && !day.isToday && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>

                {/* Tooltip */}
                {hoveredDate === day.date && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                    {day.hasSession && ' • Active'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Green circles = days with sessions • Today is highlighted
        </p>
      </Card>
    </motion.div>
  )
}
