/**
 * Weight Tracking API Client
 * 
 * Handles weight logging and history retrieval.
 */

import apiClient from './client'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface WeightLog {
  id: string
  weight_kg: number
  logged_at: string
  note: string | null
  created_at: string
}

export interface LogWeightRequest {
  weight_kg: number
  note?: string
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const weightApi = {
  /**
   * Get weight log history
   * 
   * @param limit - Number of entries to return (default 10, max 30)
   * @returns Promise with array of weight logs ordered by date ASC
   */
  getLogs: async (limit = 10): Promise<WeightLog[]> => {
    const response = await apiClient.get(`/weight/logs?limit=${limit}`)
    return response.data
  },

  /**
   * Log a new weight entry
   * 
   * @param data - Weight data to log
   * @returns Promise with the created log entry
   */
  logWeight: async (data: LogWeightRequest): Promise<WeightLog> => {
    const response = await apiClient.post('/weight/logs', data)
    return response.data
  },

  /**
   * Delete a weight log entry
   * 
   * @param logId - UUID of the log to delete
   * @returns Promise with success message
   */
  deleteLog: async (logId: string): Promise<void> => {
    await apiClient.delete(`/weight/logs/${logId}`)
  },
}

// Export individual functions for convenience
export const { getLogs, logWeight, deleteLog } = weightApi
