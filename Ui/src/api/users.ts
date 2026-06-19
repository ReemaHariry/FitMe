/**
 * User Profile API Functions
 * 
 * Handles user profile management, onboarding data, and progress photos.
 */

import apiClient from './client'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

/**
 * Profile data from onboarding form
 */
export interface ProfileData {
  gender: 'male' | 'female'
  age: number
  height: number
  weight: number
  fitness_goal: 'lose_weight' | 'build_muscle' | 'maintain'
  training_days_per_week: number
  preferred_workout_duration: number
}

// ADDED: Interface for partial profile updates (PUT endpoint)
export interface UpdateProfileRequest {
  full_name?: string
  gender?: 'male' | 'female'
  age?: number
  height?: number
  weight?: number
  fitness_goal?: 'lose_weight' | 'build_muscle' | 'maintain'
  training_days_per_week?: number
  preferred_workout_duration?: number
}

/**
 * Response after saving profile
 */
export interface ProfileResponse {
  message: string
  onboarding_complete: boolean
}

/**
 * Full profile data response
 */
export interface ProfileDataResponse {
  id: string
  user_id: string
  full_name: string | null
  gender: string | null
  age: number | null
  height: number | null
  weight: number | null
  fitness_goal: string | null
  training_days_per_week: number | null
  preferred_workout_duration: number | null
  onboarding_complete: boolean
}

/**
 * Progress photo record
 */
export interface ProgressPhoto {
  id: string
  user_id: string
  photo_url: string
  storage_path: string
  photo_type: 'front' | 'side' | 'back'
  taken_at: string
  created_at: string
}

/**
 * Response after uploading a progress photo
 */
export interface ProgressPhotoUploadResponse {
  message: string
  photo: ProgressPhoto
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Users API object containing all profile-related functions
 */
export const usersApi = {
  /**
   * Save user profile (onboarding data)
   * 
   * @param data - Profile data from onboarding form
   * @returns Promise with success message
   * 
   * @throws Error if save fails (401, 500, etc.)
   * 
   * @example
   * try {
   *   const response = await usersApi.saveProfile({
   *     gender: 'male',
   *     age: 25,
   *     height: 175,
   *     weight: 70,
   *     fitness_goal: 'build_muscle',
   *     training_days_per_week: 4,
   *     preferred_workout_duration: 60
   *   })
   *   console.log(response.message) // "Profile saved successfully"
   *   console.log(response.onboarding_complete) // true
   * } catch (error) {
   *   console.error('Failed to save profile:', error.message)
   * }
   */
  saveProfile: async (data: ProfileData): Promise<ProfileResponse> => {
    const response = await apiClient.post<ProfileResponse>('/users/profile', data)
    return response.data
  },

  /**
   * Get current user's profile data
   * 
   * @returns Promise with full profile data
   * 
   * @throws Error if fetch fails (401, 404, etc.)
   * 
   * @example
   * try {
   *   const profile = await usersApi.getProfile()
   *   console.log('Age:', profile.age)
   *   console.log('Fitness goal:', profile.fitness_goal)
   * } catch (error) {
   *   console.error('Failed to fetch profile:', error.message)
   * }
   */
  getProfile: async (): Promise<ProfileDataResponse> => {
    const response = await apiClient.get<ProfileDataResponse>('/users/profile')
    return response.data
  },

  /**
   * Update user profile with partial data (ADDED - Fix for Problem 1)
   * 
   * @param data - Profile fields to update (all optional)
   * @returns Promise with updated profile data
   * 
   * @throws Error if update fails (400, 401, 500, etc.)
   * 
   * @example
   * try {
   *   const updated = await usersApi.updateProfile({
   *     age: 26,
   *     weight: 72
   *   })
   *   console.log('Profile updated:', updated)
   * } catch (error) {
   *   console.error('Failed to update profile:', error.message)
   * }
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileDataResponse> => {
    const response = await apiClient.put<ProfileDataResponse>('/users/profile', data)
    return response.data
  },

  /**
   * Get all progress photos for the current user
   * 
   * @returns Promise with array of progress photos
   * 
   * @throws Error if fetch fails (401, 500, etc.)
   * 
   * @example
   * try {
   *   const photos = await usersApi.getProgressPhotos()
   *   const frontPhoto = photos.find(p => p.photo_type === 'front')
   *   console.log('Front photo URL:', frontPhoto?.photo_url)
   * } catch (error) {
   *   console.error('Failed to fetch progress photos:', error.message)
   * }
   */
  getProgressPhotos: async (): Promise<ProgressPhoto[]> => {
    const response = await apiClient.get<ProgressPhoto[]>('/users/progress-photos')
    return response.data
  },

  /**
   * Upload a new progress photo
   * 
   * @param file - Image file to upload
   * @param photoType - 'front', 'side', or 'back'
   * @param takenAt - Date when photo was taken (YYYY-MM-DD)
   * @returns Promise with upload response
   * 
   * @throws Error if upload fails (400, 401, 500, etc.)
   * 
   * @example
   * try {
   *   const file = event.target.files[0]
   *   const response = await usersApi.uploadProgressPhoto(
   *     file,
   *     'front',
   *     '2026-05-12'
   *   )
   *   console.log('Photo uploaded:', response.photo.photo_url)
   * } catch (error) {
   *   console.error('Failed to upload photo:', error.message)
   * }
   */
  uploadProgressPhoto: async (
    file: File,
    photoType: 'front' | 'side' | 'back',
    takenAt: string
  ): Promise<ProgressPhotoUploadResponse> => {
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('photo_type', photoType)
    formData.append('taken_at', takenAt)

    const response = await apiClient.post<ProgressPhotoUploadResponse>(
      '/users/progress-photos',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Delete a progress photo
   * 
   * @param photoId - UUID of the photo to delete
   * @returns Promise with success message
   * 
   * @throws Error if delete fails (404, 401, 500, etc.)
   * 
   * @example
   * try {
   *   await usersApi.deleteProgressPhoto('photo-uuid-here')
   *   console.log('Photo deleted successfully')
   * } catch (error) {
   *   console.error('Failed to delete photo:', error.message)
   * }
   */
  deleteProgressPhoto: async (photoId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/users/progress-photos/${photoId}`
    )
    return response.data
  },
}

// Export individual functions for convenience
export const { 
  saveProfile, 
  getProfile,
  updateProfile,  // ADDED
  getProgressPhotos,
  uploadProgressPhoto,
  deleteProgressPhoto
} = usersApi
