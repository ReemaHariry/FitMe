/**
 * Nutrition API Client
 * 
 * Handles all nutrition-related API calls:
 * - Calculate BMR, TDEE, and macros
 * - Generate personalized meal plans
 * - Auto-calculate from user profile
 */

import apiClient from './client'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface CalorieRequest {
  gender: 'male' | 'female'
  age: number
  height: number // cm
  weight: number // kg
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'lose_weight' | 'build_muscle' | 'maintain'
}

export interface CalorieResponse {
  bmr: number
  tdee: number
  target_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  goal: string
  bmi: number
  bmi_category: string
}

export interface MealItem {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  portion: string
}

export interface DayMeals {
  day: string
  breakfast: MealItem
  morning_snack: MealItem
  lunch: MealItem
  afternoon_snack: MealItem
  dinner: MealItem
  total_calories: number
}

export interface NutritionPlanResponse {
  plan_name: string
  daily_calories: number
  weekly_plan: DayMeals[]
  tips: string[]
  foods_to_eat: string[]
  foods_to_avoid: string[]
}

export interface ProfileData {
  gender: string
  age: number
  height: number
  weight: number
  fitness_goal: string
  full_name?: string
  training_days_per_week?: number
  preferred_workout_duration?: number
}

export interface AutoCalorieResponse {
  profile: ProfileData
  calories: CalorieResponse
}

export interface AutoPlanResponse {
  profile: ProfileData
  calories: CalorieResponse
  plan: NutritionPlanResponse
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const nutritionApi = {
  /**
   * Calculate BMR, TDEE, target calories, and macros (authenticated)
   * 
   * @param data - CalorieRequest with user data
   * @returns CalorieResponse with calculated nutrition data
   * 
   * Requires authentication.
   */
  calculateCalories: async (data: CalorieRequest): Promise<CalorieResponse> => {
    const response = await apiClient.post('/nutrition/calculate', data)
    return response.data
  },

  /**
   * Calculate BMR, TDEE, target calories, and macros (public)
   * 
   * @param data - CalorieRequest with user data
   * @returns CalorieResponse with calculated nutrition data
   * 
   * No authentication required.
   */
  calculateCaloriesPublic: async (data: CalorieRequest): Promise<CalorieResponse> => {
    const response = await apiClient.post('/nutrition/calculate-public', data)
    return response.data
  },

  /**
   * Generate 7-day meal plan (authenticated)
   * 
   * @param data - CalorieRequest with user data
   * @returns NutritionPlanResponse with weekly meal plan
   * 
   * Requires authentication.
   */
  generateMealPlan: async (data: CalorieRequest): Promise<NutritionPlanResponse> => {
    const response = await apiClient.post('/nutrition/plan', data)
    return response.data
  },

  /**
   * Generate 7-day meal plan (public)
   * 
   * @param data - CalorieRequest with user data
   * @returns NutritionPlanResponse with weekly meal plan
   * 
   * No authentication required.
   */
  generateMealPlanPublic: async (data: CalorieRequest): Promise<NutritionPlanResponse> => {
    const response = await apiClient.post('/nutrition/plan-public', data)
    return response.data
  },

  /**
   * Calculate calories automatically from user profile
   * 
   * @param activityLevel - Activity level (default: moderate)
   * @returns AutoCalorieResponse with profile and calculated nutrition data
   * 
   * Requires authentication. Fetches profile data and calculates nutrition needs.
   */
  calculateFromProfile: async (
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate'
  ): Promise<AutoCalorieResponse> => {
    const response = await apiClient.get(`/nutrition/from-profile?activity_level=${activityLevel}`)
    return response.data
  },

  /**
   * Generate complete meal plan from user profile
   * 
   * @param activityLevel - Activity level (default: moderate)
   * @returns AutoPlanResponse with profile, calories, and meal plan
   * 
   * Requires authentication. Fetches profile, calculates calories, and generates meal plan.
   */
  generatePlanFromProfile: async (
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate'
  ): Promise<AutoPlanResponse> => {
    const response = await apiClient.get(`/nutrition/plan-from-profile?activity_level=${activityLevel}`)
    return response.data
  },
}
