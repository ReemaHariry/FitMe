/**
 * Reports API
 * 
 * Handles all API calls related to workout reports and session analytics.
 */

import apiClient from './client'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

/**
 * Summary of a report for list view
 */
export interface ReportSummary {
  id: string
  session_id: string
  exercise_type: string
  form_score: number | null
  performance_rating: 'excellent' | 'good' | 'fair' | 'needs_improvement'
  total_mistakes: number
  duration_seconds: number
  session_name: string
  generated_at: string
  created_at: string
}

/**
 * Mistake detail with correction tips and warnings
 */
export interface MistakeDetail {
  mistake_type: string
  mistake_message: string
  count: number
  first_seen_at: string
  last_seen_at: string
  timestamps: string[]
  severity: 'low' | 'medium' | 'high'
  correction_tip: string
  warning: {
    level: 'critical' | 'warning' | 'info'
    message: string
    injury_risk: string
  } | null
}

/**
 * Complete report structure from ReportGenerator
 */
export interface FullReport {
  session_info: {
    session_id: string
    user_id: string
    session_name: string
    start_time: string
    end_time: string
    duration_seconds: number
    duration_formatted: string
    exercise_detected: string
    total_frames_processed: number
  }
  overall_summary: {
    performance_rating: string
    message: string
    total_mistakes: number
    unique_mistake_types: number
    high_risk_warnings: number
    duration_formatted: string
    exercise_type: string
  }
  mistakes: MistakeDetail[]
  statistics: {
    total_mistakes: number
    unique_mistake_types: number
    most_common_mistake: string | null
    high_frequency_mistakes: string[]
  }
  generated_at: string
}

/**
 * Full report response with metadata
 */
export interface ReportDetailResponse {
  id: string
  session_id: string
  full_report: FullReport
  exercise_type: string
  form_score: number
  performance_rating: string
  total_mistakes: number
  generated_at: string
  session: {
    session_name: string
    duration_seconds: number
    started_at: string
    ended_at: string
  }
}

/**
 * Aggregate user statistics
 */
export interface UserStats {
  total_sessions: number
  total_minutes: number
  average_form_score: number | null
  best_exercise: string | null
}

/**
 * Response from seed test data endpoint
 */
export interface SeedTestDataResponse {
  message: string
  report_id: string
  session_id: string
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Reports API object with all report-related functions
 */
export const reportsApi = {
  /**
   * Get all reports for the current user
   * 
   * @returns Promise<ReportSummary[]> - List of report summaries
   */
  async getAll(): Promise<ReportSummary[]> {
    const response = await apiClient.get<ReportSummary[]>('/reports')
    return response.data
  },

  /**
   * Get a single report by ID with full details
   * 
   * @param id - Report UUID
   * @returns Promise<ReportDetailResponse> - Full report with nested full_report field
   */
  async getOne(id: string): Promise<ReportDetailResponse> {
    const response = await apiClient.get<ReportDetailResponse>(`/reports/${id}`)
    return response.data
  },

  /**
   * Get aggregate statistics for the current user
   * 
   * @returns Promise<UserStats> - User statistics
   */
  async getStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>('/reports/stats')
    return response.data
  },

  /**
   * Create test data for development (TEMPORARY - remove before production)
   * 
   * @returns Promise<SeedTestDataResponse> - Created report and session IDs
   */
  async seedTestData(): Promise<SeedTestDataResponse> {
    const response = await apiClient.post<SeedTestDataResponse>('/reports/seed-test-data')
    return response.data
  }
}

// Export individual functions for convenience
export const {
  getAll: getAllReports,
  getOne: getReport,
  getStats: getReportStats,
  seedTestData: seedReportTestData
} = reportsApi
