/**
 * Workout Plan API Client
 * 
 * Handles all workout plan-related API calls:
 * - Generate personalized workout plans based on user profile
 */

import apiClient from './client'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface Exercise {
  name: string
  sets: number
  reps: string
  rest_sec: number
  muscle_group: string
  equipment: string
  tip: string
}

export interface DayPlan {
  day_name: string
  label: string
  is_rest: boolean
  duration_min: number
  exercises: Exercise[]
  warmup: string[]
  cooldown: string[]
}

export interface WorkoutPlanResponse {
  plan_title: string
  goal: string
  split: string
  level: string
  days_per_week: number
  weeks: number
  days: DayPlan[]
  key_tips: string[]
  nutrition_note: string
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const workoutPlanApi = {
  /**
   * Get personalized workout plan based on user profile
   * 
   * @param level - User experience level (beginner, intermediate, advanced)
   * @returns WorkoutPlanResponse with 7-day plan, tips, and nutrition note
   * 
   * Requires authentication.
   */
  getWorkoutPlan: async (level: 'beginner' | 'intermediate' | 'advanced'): Promise<WorkoutPlanResponse> => {
    const response = await apiClient.get(`/workout-plan?level=${level}`)
    return response.data
  },
}
