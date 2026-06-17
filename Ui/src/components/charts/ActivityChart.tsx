/**
 * Activity Chart Component
 *
 * Clean bar chart showing minutes exercised per day.
 * - Today's bar is highlighted in bright green
 * - Inactive days shown as subtle gray bars (not invisible)
 * - Y-axis visible so you can actually read the values
 * - Grid lines for readability
 * - Week selector: This Week / Last Week / 2 Weeks Ago
 * - Summary row: total minutes, active days, avg per active day
 */

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts'
import { dashboardApi, type WeeklyDay } from '@/api/dashboard'
import { useI18nStore } from '@/app/i18n'

interface ActivityChartProps {
  className?: string
}

// Which day index (0=Mon ... 6=Sun) is today?
function getTodayIndex(): number {
  const jsDay = new Date().getDay() // 0=Sun, 1=Mon...
  return jsDay === 0 ? 6 : jsDay - 1
}

export default function ActivityChart({ className = '' }: ActivityChartProps) {
  const { t } = useI18nStore()
  const [data, setData] = useState<(WeeklyDay & { isToday: boolean })[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [activeDays, setActiveDays] = useState(0)
  const [avgMinutes, setAvgMinutes] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await dashboardApi.getWeeklyActivity(weekOffset)
        const todayIdx = weekOffset === 0 ? getTodayIndex() : -1

        const enriched = result.days.map((day, i) => ({
          ...day,
          day: translateDayName(day.day),
          isToday: i === todayIdx,
        }))

        setData(enriched)
        setTotalMinutes(result.total_minutes)
        setActiveDays(result.active_days)
        setAvgMinutes(result.average_minutes_per_active_day)
      } catch (err) {
        console.error('Failed to load weekly activity:', err)
        setError(t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [weekOffset])

  const translateDayName = (day: string): string => {
    const dayMap: Record<string, string> = {
      Mon: t('days.mon'),
      Tue: t('days.tue'),
      Wed: t('days.wed'),
      Thu: t('days.thu'),
      Fri: t('days.fri'),
      Sat: t('days.sat'),
      Sun: t('days.sun'),
    }
    return dayMap[day] || day
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-sm">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {d.day} {d.isToday && <span className="text-green-500 text-xs">(Today)</span>}
          </p>
          <p className="text-green-500 font-medium">{d.minutes} {t('common.minutes')}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {d.sessions} session{d.sessions !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  const maxMinutes = data ? Math.max(...data.map(d => d.minutes), 10) : 60
  const yMax = Math.ceil(maxMinutes / 10) * 10 + 10

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-[240px] ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-[240px] text-gray-500 ${className}`}>
        {error}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Week Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>
            <span className="inline-block w-3 h-3 rounded-sm bg-green-500 mr-1 align-middle" />
            Active
          </span>
          <span>
            <span className="inline-block w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700 mr-1 align-middle" />
            Rest
          </span>
        </div>
        <select
          value={weekOffset}
          onChange={(e) => setWeekOffset(Number(e.target.value))}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value={0}>{t('dashboard.thisWeek')}</option>
          <option value={1}>{t('dashboard.lastWeek')}</option>
          <option value={2}>{t('dashboard.twoWeeksAgo')}</option>
        </select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data ?? []} margin={{ top: 10, right: 10, left: 10, bottom: 5 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={5}
          />
          <YAxis
            domain={[0, yMax]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickFormatter={(v) => `${v}m`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
          {/* Reference line at average */}
          {avgMinutes > 0 && (
            <ReferenceLine
              y={avgMinutes}
              stroke="#6366f1"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'avg', position: 'insideTopRight', fill: '#6366f1', fontSize: 10 }}
            />
          )}
          <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={48} minPointSize={8}>
            {(data ?? []).map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.isToday
                    ? '#16a34a'          // dark green = today
                    : entry.minutes > 0
                    ? '#22c55e'          // green = active
                    : '#e5e7eb'         // light gray = rest day
                }
                fillOpacity={entry.minutes === 0 && !entry.isToday ? 0.5 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center text-sm">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalMinutes}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{t('common.total')} min</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{activeDays}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Active days</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{activeDays > 0 ? avgMinutes : '--'}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{t('dashboard.avgPerDay')}</p>
        </div>
      </div>
    </div>
  )
}
