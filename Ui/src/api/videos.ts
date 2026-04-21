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

// Track ongoing uploads to prevent duplicates
const ongoingUploads = new Map<string, Promise<VideoUploadResponse>>()

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
    // Create a unique key for this upload to prevent duplicates
    const uploadKey = `${data.video.name}-${data.video.size}-${data.video.lastModified}`
    
    // Check if this exact file is already being uploaded
    if (ongoingUploads.has(uploadKey)) {
      console.warn('⚠️ Duplicate upload detected, reusing existing request')
      return ongoingUploads.get(uploadKey)!
    }

    const formData = new FormData()
    formData.append('video', data.video)
    
    if (data.session_name) {
      formData.append('session_name', data.session_name)
    }

    // Create the upload promise
    const uploadPromise = apiClient.post('/videos/upload', formData, {
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
    }).then(response => {
      // Remove from ongoing uploads when complete
      ongoingUploads.delete(uploadKey)
      return response.data
    }).catch(error => {
      // Remove from ongoing uploads on error
      ongoingUploads.delete(uploadKey)
      throw error
    })

    // Store the promise to prevent duplicate uploads
    ongoingUploads.set(uploadKey, uploadPromise)

    return uploadPromise
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
