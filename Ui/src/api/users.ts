/**
 * User Profile API Functions
 * 
 * Handles user profile management and onboarding data.
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
}

// Export individual functions for convenience
export const { saveProfile, getProfile } = usersApi
