/**
 * Activity Chart Component
 * 
 * Self-contained bar chart showing minutes exercised per day of the week.
 * Fetches its own data from the API.
 * 
 * Features:
 * - Green bars for days with activity
 * - Week selector dropdown (This Week, Last Week, 2 Weeks Ago)
 * - Total minutes and average displayed below chart
 * - Loading and empty states
 */

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts'
import { dashboardApi, type WeeklyDay } from '@/api/dashboard'

interface ActivityChartProps {
  className?: string
}

export default function ActivityChart({ className = '' }: ActivityChartProps) {
  const [data, setData] = useState<WeeklyDay[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [avgMinutes, setAvgMinutes] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await dashboardApi.getWeeklyActivity(weekOffset)
        setData(result.days)
        setTotalMinutes(result.total_minutes)
        setAvgMinutes(result.average_minutes_per_active_day)
      } catch (err) {
        console.error('Failed to load weekly activity:', err)
        setError('Could not load activity data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [weekOffset])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
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
          <p className="font-medium">{data.day}</p>
          <p className="text-green-400">{data.minutes} minutes</p>
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

  if (error) {
    return (
      <div className={`flex items-center justify-center h-[200px] text-gray-500 ${className}`}>
        {error}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[200px] text-gray-500 ${className}`}>
        No activity this week
      </div>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar
            dataKey="minutes"
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.minutes > 0 ? '#22c55e' : '#374151'}
                opacity={entry.minutes > 0 ? 1 : 0.3}
              />
            ))}
            <LabelList
              dataKey="minutes"
              position="top"
              formatter={(val: number) => val > 0 ? `${val}m` : ''}
              style={{ fill: '#22c55e', fontSize: '11px', fontWeight: '500' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary below chart */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Total: <span className="font-semibold text-gray-900 dark:text-white">{totalMinutes} minutes</span>
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          Avg: <span className="font-semibold text-gray-900 dark:text-white">{avgMinutes} min/day</span>
        </span>
      </div>
    </div>
  )
}
