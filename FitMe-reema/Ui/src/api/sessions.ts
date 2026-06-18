/**
 * Sessions API
 * 
 * Handles all API calls related to live training sessions.
 */

import apiClient from './client'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface StartSessionRequest {
  exercise_name: 'squat' | 'push_up' | 'sit_up' | string
  session_name?: string
}

export interface StartSessionResponse {
  session_id: string
  message: string
  websocket_url: string
}

export interface EndSessionRequest {
  exercise_name: string
  session_name?: string
}

export interface EndSessionResponse {
  session_id: string
  report_id: string
  message: string
  report: object
  metrics: {
    form_score: number
    performance_rating: string
    total_mistakes: number
    duration_seconds: number
    total_frames_processed: number
    exercise_detected: string
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Sessions API object with all session-related functions
 */
export const sessionsApi = {
  /**
   * Start a new live training session
   * 
   * @param data - StartSessionRequest with exercise_name and optional session_name
   * @returns Promise<StartSessionResponse> - Session ID and WebSocket URL
   */
  start: async (data: StartSessionRequest): Promise<StartSessionResponse> => {
    const response = await apiClient.post('/sessions/start', data)
    return response.data
  },

  /**
   * End a live training session and generate report
   * 
   * @param sessionId - UUID of the session
   * @param data - EndSessionRequest with exercise_name and session_name
   * @returns Promise<EndSessionResponse> - Complete report and metrics
   */
  end: async (
    sessionId: string,
    data: EndSessionRequest
  ): Promise<EndSessionResponse> => {
    const response = await apiClient.post(`/sessions/${sessionId}/end`, data)
    return response.data
  }
}

// Export individual functions for convenience
export const {
  start: startSession,
  end: endSession
} = sessionsApi
