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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Dot
} from 'recharts'
import { dashboardApi, type MonthlyProgress } from '@/api/dashboard'

interface ProgressChartProps {
  className?: string
}

export default function ProgressChart({ className = '' }: ProgressChartProps) {
  const [data, setData] = useState<MonthlyProgress[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentScore, setCurrentScore] = useState(0)
  const [improvement, setImprovement] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await dashboardApi.getProgress(6)
        setData(result.months)
        setCurrentScore(result.current_score)
        setImprovement(result.improvement)
      } catch (err) {
        console.error('Failed to load progress data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Custom dot component
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload.avg_score === null) return null
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#22c55e"
        stroke="#ffffff"
        strokeWidth={2}
      />
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      if (data.avg_score === null) return null
      
      return (
        <div
          style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#f9fafb',
            fontSize: '12px'
          }}
        >
          <p className="font-medium">{data.month} {data.year}</p>
          <p className="text-green-400">{data.avg_score}/100</p>
          <p className="text-gray-400">{data.sessions} session{data.sessions !== 1 ? 's' : ''}</p>
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
        Complete sessions to see progress
      </div>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="avg_score"
            stroke="#22c55e"
            strokeWidth={2}
            dot={<CustomDot />}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary below chart */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Current Score: <span className="font-semibold text-gray-900 dark:text-white">{currentScore}/100</span>
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
            {improvement > 0 ? '+' : ''}{improvement} points
          </motion.span>
        )}
        {improvement === 0 && (
          <span className="text-gray-500">No change</span>
        )}
      </div>
    </div>
  )
}
