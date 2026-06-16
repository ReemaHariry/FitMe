/**
 * Dashboard Helper Utilities
 * 
 * Functions for calculating achievements, weight changes, and other dashboard metrics.
 */

import type { DashboardStats } from '@/api/dashboard'
import type { WeightLog } from '@/api/weight'
import type { RecentSession } from '@/api/dashboard'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface Achievement {
  id: string
  emoji: string
  label: string
  description: string
  earned: boolean
}

export interface WeightChange {
  current: number | null
  previous: number | null
  change: number | null
  weeklyChange: number | null
  totalChange: number | null
  trend: 'gaining' | 'losing' | 'maintaining' | null
}

export interface CalendarDay {
  date: string
  hasSession: boolean
  isToday: boolean
  isFuture: boolean
  dayOfWeek: number
}

// ============================================================================
// ACHIEVEMENTS CALCULATION
// ============================================================================

const ACHIEVEMENTS_DATA = [
  { id: 'first_step', emoji: '🏃', label: 'First Step', description: 'Completed your first session', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.total_sessions >= 1 },
  { id: 'on_fire', emoji: '🔥', label: 'On Fire', description: '3 day streak', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.current_streak >= 3 },
  { id: 'getting_strong', emoji: '💪', label: 'Getting Strong', description: '5 sessions completed', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.total_sessions >= 5 },
  { id: 'perfect_form', emoji: '🎯', label: 'Perfect Form', description: 'Scored 90+ on form', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.best_score >= 90 },
  { id: 'week_warrior', emoji: '📅', label: 'Week Warrior', description: '3 sessions this week', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.sessions_this_week >= 3 },
  { id: 'dedicated', emoji: '🏆', label: 'Dedicated', description: '10 sessions completed', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.total_sessions >= 10 },
  { id: 'consistent', emoji: '⚡', label: 'Consistent', description: '7 day streak', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.current_streak >= 7 },
  { id: 'form_master', emoji: '🌟', label: 'Form Master', description: 'Average score 80+', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.average_form_score >= 80 },
  { id: 'unstoppable', emoji: '🚀', label: 'Unstoppable', description: '20 sessions done', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.total_sessions >= 20 },
  { id: 'champion', emoji: '👑', label: 'Champion', description: '14 day streak', check: (stats: DashboardStats, weightLogs: WeightLog[]) => stats.current_streak >= 14 },
  { id: 'weight_tracker', emoji: '⚖️', label: 'Weight Tracker', description: 'Logged weight 3 times', check: (stats: DashboardStats, weightLogs: WeightLog[]) => weightLogs.length >= 3 },
  { id: 'making_progress', emoji: '📉', label: 'Making Progress', description: 'Lost over 1kg', check: (stats: DashboardStats, weightLogs: WeightLog[]) => {
    if (weightLogs.length < 2) return false
    const first = weightLogs[0].weight_kg
    const latest = weightLogs[weightLogs.length - 1].weight_kg
    return (first - latest) > 1
  }}
]

export function calculateAchievements(
  stats: DashboardStats,
  weightLogs: WeightLog[]
): Achievement[] {
  return ACHIEVEMENTS_DATA.map(ach => ({
    id: ach.id,
    emoji: ach.emoji,
    label: ach.label,
    description: ach.description,
    earned: ach.check(stats, weightLogs)
  })).sort((a, b) => {
    // Earned first, then by order
    if (a.earned && !b.earned) return -1
    if (!a.earned && b.earned) return 1
    return 0
  })
}

// ============================================================================
// WEIGHT CHANGE CALCULATION
// ============================================================================

export function getWeightChange(logs: WeightLog[]): WeightChange {
  if (logs.length === 0) {
    return {
      current: null,
      previous: null,
      change: null,
      weeklyChange: null,
      totalChange: null,
      trend: null
    }
  }

  const current = logs[logs.length - 1].weight_kg
  const previous = logs.length > 1 ? logs[logs.length - 2].weight_kg : null
  const change = previous ? current - previous : null

  // Calculate weekly change (find log ~7 days ago)
  let weeklyChange: number | null = null
  if (logs.length > 1) {
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Find closest log to 7 days ago
    let closestLog = logs[0]
    let closestDiff = Math.abs(new Date(closestLog.logged_at).getTime() - sevenDaysAgo.getTime())
    
    for (const log of logs) {
      const diff = Math.abs(new Date(log.logged_at).getTime() - sevenDaysAgo.getTime())
      if (diff < closestDiff) {
        closestDiff = diff
        closestLog = log
      }
    }
    
    if (closestLog !== logs[logs.length - 1]) {
      weeklyChange = current - closestLog.weight_kg
    }
  }

  // Total change (first to latest)
  const totalChange = logs.length > 1 ? current - logs[0].weight_kg : null

  // Determine trend
  let trend: 'gaining' | 'losing' | 'maintaining' | null = null
  if (weeklyChange !== null) {
    if (weeklyChange > 0.1) trend = 'gaining'
    else if (weeklyChange < -0.1) trend = 'losing'
    else trend = 'maintaining'
  }

  return { current, previous, change, weeklyChange, totalChange, trend }
}

// ============================================================================
// WEIGHT GOAL CONTEXT
// ============================================================================

export function getWeightGoalContext(
  change: number | null,
  fitnessGoal?: string
): { color: string; label: string; isPositive: boolean } {
  if (change === null) {
    return { color: 'text-gray-500', label: 'No change', isPositive: true }
  }

  const absChange = Math.abs(change)
  const changeText = change > 0 ? `+${absChange.toFixed(1)}` : `${change.toFixed(1)}`

  // Default: weight loss is good
  let isPositive = change < 0

  // Adjust based on fitness goal
  if (fitnessGoal === 'build_muscle') {
    isPositive = change > 0 // Gaining is good
  } else if (fitnessGoal === 'maintain') {
    isPositive = Math.abs(change) < 0.5 // Stable is good
  }

  const color = isPositive ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
  const label = `${changeText} kg`

  return { color, label, isPositive }
}

// ============================================================================
// SCORE COLOR
// ============================================================================

export function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e' // green
  if (score >= 75) return '#3b82f6' // blue
  if (score >= 50) return '#f59e0b' // amber
  return '#ef4444' // red
}

// ============================================================================
// PERFORMANCE COLOR
// ============================================================================

export function getPerformanceColor(rating: string): string {
  switch (rating) {
    case 'excellent':
      return 'text-green-600 dark:text-green-400'
    case 'good':
      return 'text-blue-600 dark:text-blue-400'
    case 'fair':
      return 'text-amber-600 dark:text-amber-400'
    case 'needs_improvement':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

// ============================================================================
// EXERCISE NAME FORMATTING
// ============================================================================

export function formatExerciseName(type: string): string {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================================================================
// INSIGHT MESSAGE
// ============================================================================

export function getInsightMessage(score: number): string {
  if (score >= 90) return "Outstanding performance! Your form was excellent."
  if (score >= 75) return "Great session! Small improvements will get you to perfect."
  if (score >= 60) return "Good effort. Focus on form consistency next time."
  return "Room to grow! Review the tips and try again."
}

// ============================================================================
// STREAK CALENDAR BUILDER
// ============================================================================

export function buildStreakCalendar(activeDates: string[]): CalendarDay[] {
  const today = new Date()
  const calendar: CalendarDay[] = []
  const activeSet = new Set(activeDates)

  // Build 30 days (including today, going backwards)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    calendar.push({
      date: dateStr,
      hasSession: activeSet.has(dateStr),
      isToday: i === 0,
      isFuture: false,
      dayOfWeek: date.getDay()
    })
  }

  return calendar
}
