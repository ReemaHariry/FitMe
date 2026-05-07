/**
 * Reusable Video Upload Hook
 * Shared logic for uploading and analyzing workout videos
 */
import { useState } from 'react'
import { videosApi, VideoUploadResponse } from '@/api/videos'

interface UseVideoUploadOptions {
  onSuccess?: (response: VideoUploadResponse) => void
  onError?: (error: Error) => void
}

export function useVideoUpload(options?: UseVideoUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadVideo = async (file: File, sessionName?: string) => {
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const response = await videosApi.upload(
        {
          video: file,
          session_name: sessionName,
        },
        (percent) => {
          setUploadProgress(percent)
        }
      )

      setIsUploading(false)
      setUploadProgress(100)
      
      if (options?.onSuccess) {
        options.onSuccess(response)
      }

      return response
    } catch (err) {
      const error = err as Error
      setIsUploading(false)
      setError(error.message || 'Failed to upload video')
      
      if (options?.onError) {
        options.onError(error)
      }
      
      throw error
    }
  }

  const reset = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setError(null)
  }

  return {
    uploadVideo,
    isUploading,
    uploadProgress,
    error,
    reset,
  }
}
