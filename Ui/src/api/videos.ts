/**
 * Videos API
 * Handles video upload and analysis endpoints
 */
import apiClient from './client'
import { FullReport } from './reports'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface UploadVideoRequest {
  video: File
  session_name?: string
}

export interface UploadMetrics {
  form_score: number
  performance_rating: 'excellent' | 'good' | 'fair' | 'needs_improvement'
  total_mistakes: number
  duration_seconds: number
  total_frames_processed: number
  exercise_detected: string
}

export interface VideoUploadResponse {
  session_id: string
  report_id: string
  message: string
  report: FullReport
  video_storage_path: string
  metrics: UploadMetrics
}

export interface SessionStatus {
  session_id: string
  status: 'processing' | 'completed' | 'failed'
  message: string
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const videosApi = {
  /**
   * Upload and analyze a workout video
   * 
   * @param data - Upload request data
   * @param onProgress - Optional callback for upload progress (0-100)
   * @returns Complete analysis results
   */
  upload: async (
    data: UploadVideoRequest,
    onProgress?: (percent: number) => void
  ): Promise<VideoUploadResponse> => {
    const formData = new FormData()
    formData.append('video', data.video)
    
    if (data.session_name) {
      formData.append('session_name', data.session_name)
    }

    const response = await apiClient.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes timeout for long videos
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
    })

    return response.data
  },

  /**
   * Get the status of a video analysis session
   * 
   * @param sessionId - UUID of the session
   * @returns Current session status
   */
  getSessionStatus: async (sessionId: string): Promise<SessionStatus> => {
    const response = await apiClient.get(`/videos/session/${sessionId}/status`)
    return response.data
  },
}
