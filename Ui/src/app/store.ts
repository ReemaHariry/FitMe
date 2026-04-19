import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/auth'

export interface User {
  id: string
  name: string
  email: string
  onboarding_complete: boolean  // FIXED: Match backend field name
  profile?: {
    gender: 'male' | 'female'
    age: number
    height: number
    weight: number
    fitnessGoal: 'lose_weight' | 'build_muscle' | 'maintain'
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
    trainingDaysPerWeek: number
    preferredWorkoutDuration: number
  }
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateProfile: (profile: User['profile']) => void
  completeOnboarding: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      
      /**
       * Login user with email and password
       * 
       * Process:
       * 1. Call backend API
       * 2. Store token in localStorage
       * 3. Store user in state
       * 4. If rememberMe, also persist user to localStorage
       * 
       * @throws Error if login fails - calling component should catch and display
       */
      login: async (email: string, password: string, rememberMe?: boolean) => {
        try {
          // Call real API
          const response = await authApi.login(email, password)
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token)
          
          // Convert API response to our User interface
          const user: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            onboarding_complete: response.user.onboarding_complete,  // FIXED: Use correct field name
          }
          
          // Update state
          set({ isAuthenticated: true, user })
          
          // If remember me, persist user data
          if (rememberMe) {
            localStorage.setItem('auth_user', JSON.stringify(user))
          }
        } catch (error: any) {
          console.error('Login error:', error)
          // Extract error message from API response
          const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
          throw new Error(errorMessage)
        }
      },
      
      /**
       * Register a new user
       * 
       * Process:
       * 1. Call backend API
       * 2. Store token in localStorage
       * 3. Store user in state
       * 4. User always needs onboarding after registration
       * 
       * @throws Error if registration fails - calling component should catch and display
       */
      register: async (name: string, email: string, password: string) => {
        try {
          // Call real API
          const response = await authApi.register(name, email, password)
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token)
          
          // Convert API response to our User interface
          const user: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            onboarding_complete: response.user.onboarding_complete,  // FIXED: Use correct field name
          }
          
          // Update state
          set({ isAuthenticated: true, user })
        } catch (error: any) {
          console.error('Registration error:', error)
          // Extract error message from API response
          const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
          throw new Error(errorMessage)
        }
      },
      
      /**
       * Logout current user
       * 
       * Process:
       * 1. Call backend API to invalidate session
       * 2. Clear all localStorage keys
       * 3. Reset state to null
       */
      logout: async () => {
        try {
          // Call backend logout
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
          // Continue with local cleanup even if API call fails
        } finally {
          // Clear all auth-related localStorage
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth-storage') // Zustand persist key
          
          // Reset state
          set({ isAuthenticated: false, user: null })
        }
      },
      
      /**
       * Check if user is authenticated and restore session
       * 
       * This should be called on app startup to:
       * 1. Check if token exists in localStorage
       * 2. Verify token is still valid by calling /auth/me
       * 3. Restore user to state if valid
       * 4. Clear localStorage if invalid
       * 
       * Used in App.tsx useEffect on mount
       */
      checkAuth: async () => {
        try {
          // Check if token exists
          const token = localStorage.getItem('auth_token')
          if (!token) {
            set({ isAuthenticated: false, user: null })
            return
          }
          
          // Verify token is still valid
          const userData = await authApi.getCurrentUser()
          
          // Convert API response to our User interface
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            onboarding_complete: userData.onboarding_complete,  // FIXED: Use correct field name
          }
          
          // Restore user to state
          set({ isAuthenticated: true, user })
        } catch (error) {
          console.error('Auth check failed:', error)
          // Token is invalid or expired - clear everything
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          set({ isAuthenticated: false, user: null })
        }
      },
      
      updateProfile: (profile: User['profile']) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, profile } })
        }
      },
      
      completeOnboarding: () => {
        const user = get().user
        if (user) {
          set({ user: { ...user, onboarding_complete: true } })  // FIXED: Use correct field name
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface WorkoutState {
  currentWorkout: any | null
  workoutHistory: any[]
  setCurrentWorkout: (workout: any) => void
  addWorkoutToHistory: (workout: any) => void
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  currentWorkout: null,
  workoutHistory: [],
  
  setCurrentWorkout: (workout) => set({ currentWorkout: workout }),
  addWorkoutToHistory: (workout) => set((state) => ({ 
    workoutHistory: [...state.workoutHistory, workout] 
  })),
}))
