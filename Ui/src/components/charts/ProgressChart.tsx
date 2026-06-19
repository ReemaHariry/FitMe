/**
 * Progress Chart Component
 * 
 * Self-contained line chart showing form score progress over months.
 * Fetches its own data from the API.
 * 
 * Features:
 * - Green line with dots at each data point
 * - Shows average form score per month (last 6 months)
 * - Current score and improvement displayed below
 * - Loading and empty states
 * - Animated improvement indicator
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts'
import { dashboardApi, type MonthlyProgress } from '@/api/dashboard'
import { useI18nStore } from '@/app/i18n'

interface ProgressChartProps {
  className?: string
}

export default function ProgressChart({ className = '' }: ProgressChartProps) {
  const { t } = useI18nStore()
  const [data, setData] = useState<MonthlyProgress[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentScore, setCurrentScore] = useState(0)
  const [improvement, setImprovement] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await dashboardApi.getProgress(6)
        
        // FIXED: Add detailed logging to diagnose the issue
        console.log('ProgressChart API Response:', result)
        console.log('Months array:', result.months)
        console.log('Current score:', result.current_score)
        
        // Translate month names
        const translatedMonths = result.months.map(month => ({
          ...month,
          month: translateMonthName(month.month)
        }))
        
        console.log('Translated months:', translatedMonths)
        
        setData(translatedMonths)
        setCurrentScore(result.current_score)
        setImprovement(result.improvement)
      } catch (err) {
        console.error('Failed to load progress data:', err)
        console.error('Error details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Translate month names
  const translateMonthName = (month: string): string => {
    const monthMap: Record<string, string> = {
      'Jan': t('months.jan'),
      'Feb': t('months.feb'),
      'Mar': t('months.mar'),
      'Apr': t('months.apr'),
      'May': t('months.may'),
      'Jun': t('months.jun'),
      'Jul': t('months.jul'),
      'Aug': t('months.aug'),
      'Sep': t('months.sep'),
      'Oct': t('months.oct'),
      'Nov': t('months.nov'),
      'Dec': t('months.dec'),
    }
    return monthMap[month] || month
  }



  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      if (data.avg_score === null) return null
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.month} {data.year}</p>
          <p className="text-green-500">{data.avg_score}/100</p>
          <p className="text-gray-500 dark:text-gray-400">{data.sessions} session{data.sessions !== 1 ? 's' : ''}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-[200px] ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data || data.every(m => m.avg_score === null)) {
    return (
      <div className={`flex items-center justify-center h-[200px] text-gray-500 ${className}`}>
        {t('dashboard.noProgressYet')}
      </div>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(156,163,175,0.2)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={5}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,197,94,0.05)' }} />
          <Bar
            dataKey="avg_score"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
            minPointSize={8}
          >
            {(data ?? []).map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.avg_score !== null ? '#22c55e' : '#e5e7eb'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary below chart */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {t('dashboard.currentScore')}: <span className="font-semibold text-gray-900 dark:text-white">{currentScore}/100</span>
        </span>
        {improvement !== 0 && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`font-semibold ${
              improvement > 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {improvement > 0 ? '+' : ''}{improvement} {t('common.score')}
          </motion.span>
        )}
        {improvement === 0 && (
          <span className="text-gray-500">{t('dashboard.noChange')}</span>
        )}
      </div>
    </div>
  )
}
