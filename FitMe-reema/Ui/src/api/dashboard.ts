/**
 * Dashboard API Client
 * 
 * Handles all dashboard-related API calls:
 * - Statistics (total sessions, streaks, etc.)
 * - Weekly activity data for bar chart
 * - Progress over time data for line chart
 * - Recent sessions list
 */

import apiClient from './client'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface DashboardStats {
  total_sessions: number
  completed_sessions: number
  total_minutes: number
  average_form_score: number
  current_streak: number
  best_streak: number
  most_practiced_exercise: string
  sessions_this_week: number
  improvement_this_month: number
}

export interface WeeklyDay {
  day: string
  date: string
  minutes: number
  sessions: number
}

export interface WeeklyActivity {
  week_start: string
  week_end: string
  days: WeeklyDay[]
  total_minutes: number
  average_minutes_per_active_day: number
  active_days: number
}

export interface MonthlyProgress {
  month: string
  year: number
  avg_score: number | null
  sessions: number
}

export interface ProgressData {
  months: MonthlyProgress[]
  current_score: number
  improvement: number
  total_months_active: number
}

export interface RecentSession {
  id: string
  session_name: string
  exercise_type: string
  duration_seconds: number
  duration_minutes: number
  form_score: number | null
  performance_rating: string
  total_mistakes: number
  status: string
  created_at: string
  date_label: string
  report_id: string | null
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const dashboardApi = {
  /**
   * Get aggregate dashboard statistics
   * 
   * Returns total sessions, streaks, average scores, etc.
   * Used for the stat cards on the dashboard.
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats')
    return response.data
  },

  /**
   * Get weekly activity data for bar chart
   * 
   * @param weekOffset - 0 = current week, 1 = last week, etc.
   * @returns Minutes exercised per day (Mon-Sun)
   */
  getWeeklyActivity: async (weekOffset: number = 0): Promise<WeeklyActivity> => {
    const response = await apiClient.get(`/dashboard/weekly-activity?week_offset=${weekOffset}`)
    return response.data
  },

  /**
   * Get progress over time data for line chart
   * 
   * @param months - Number of months to fetch (default 6)
   * @returns Average form score per month
   */
  getProgress: async (months: number = 6): Promise<ProgressData> => {
    const response = await apiClient.get(`/dashboard/progress?months=${months}`)
    return response.data
  },

  /**
   * Get recent completed sessions
   * 
   * @param limit - Number of sessions to fetch (default 3, max 10)
   * @returns List of recent sessions with report links
   */
  getRecentSessions: async (limit: number = 3): Promise<RecentSession[]> => {
    const response = await apiClient.get(`/sessions/recent?limit=${limit}`)
    return response.data
  },
}
