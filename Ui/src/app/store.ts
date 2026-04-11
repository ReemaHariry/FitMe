import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

export interface User {
  id: string
  name: string
  email: string
  onboardingCompleted: boolean
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
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
  updateProfile: (profile: User['profile']) => void
  completeOnboarding: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      
      login: async (email: string, password: string, rememberMe?: boolean) => {
        try {
          const result = await authAPI.login(email, password, rememberMe);
          if (result.success) {
            localStorage.setItem('auth-token', result.data.token);
            if (result.data.refreshToken) {
              localStorage.setItem('refresh-token', result.data.refreshToken);
            }
            const mockUser: User = {
              id: result.data.userId,
              name: result.data.name,
              email: result.data.email,
              onboardingCompleted: false,
            };
            set({ isAuthenticated: true, user: mockUser });
          } else {
            throw new Error(result.errors?.general || 'Login failed');
          }
        } catch (error: any) {
          console.error('Login error:', error);
          throw new Error(error.response?.data?.errors?.general || 'Login failed');
        }
      },
      
      register: async (name: string, email: string, password: string, confirmPassword: string) => {
        try {
          const result = await authAPI.register(name, email, password, confirmPassword);
          if (result.success) {
            localStorage.setItem('auth-token', result.data.token);
            if (result.data.refreshToken) {
              localStorage.setItem('refresh-token', result.data.refreshToken);
            }
            const mockUser: User = {
              id: result.data.userId,
              name: result.data.name,
              email: result.data.email,
              onboardingCompleted: false,
            };
            set({ isAuthenticated: true, user: mockUser });
          } else {
            const errorMessage = Object.values(result.errors || {}).join(', ');
            throw new Error(errorMessage || 'Registration failed');
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          throw new Error(error.response?.data?.errors?.general || 'Registration failed');
        }
      },
      
      logout: () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        authAPI.logout().catch(console.error);
        set({ isAuthenticated: false, user: null });
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
          set({ user: { ...user, onboardingCompleted: true } })
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