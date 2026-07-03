/**
 * Authentication API Functions
 * 
 * This file contains all API calls related to user authentication:
 * - Login
 * - Register
 * - Logout
 * - Get current user
 * - Forgot / Reset password
 */

import apiClient from './client'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  name: string
  email: string
  password: string
}

/**
 * User object returned from API
 */
export interface AuthUser {
  id: string
  name: string
  email: string
  onboarding_complete: boolean
  created_at?: string  // ADDED: For "Member Since" display
}

/**
 * Authentication response (login/register)
 */
export interface AuthResponse {
  token: string
  user: AuthUser
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Authentication API object containing all auth-related functions
 */
export const authApi = {
  /**
   * Login user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with token and user data
   * 
   * @throws Error if login fails (401, 400, etc.)
   * 
   * @example
   * try {
   *   const response = await authApi.login('user@example.com', 'password123')
   *   localStorage.setItem('auth_token', response.token)
   *   console.log('Logged in as:', response.user.name)
   * } catch (error) {
   *   console.error('Login failed:', error.message)
   * }
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  /**
   * Register a new user
   * 
   * @param name - User's full name
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with token and user data
   * 
   * @throws Error if registration fails (409 for duplicate email, 400 for weak password, etc.)
   * 
   * @example
   * try {
   *   const response = await authApi.register('John Doe', 'john@example.com', 'password123')
   *   localStorage.setItem('auth_token', response.token)
   *   // Redirect to onboarding
   * } catch (error) {
   *   if (error.response?.status === 409) {
   *     console.error('Email already exists')
   *   }
   * }
   */
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    })
    return response.data
  },

  /**
   * Logout current user
   * 
   * Calls the backend logout endpoint to invalidate the session,
   * then removes the auth token from localStorage.
   * 
   * @example
   * await authApi.logout()
   * navigate('/login')
   */
  logout: async (): Promise<void> => {
    try {
      // Call backend to invalidate session
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Even if backend call fails, we still want to clear local storage
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token')
    }
  },

  /**
   * Get current authenticated user's data
   * 
   * Verifies the token is still valid and returns updated user information.
   * Used to restore user session on page reload.
   * 
   * @returns Promise with current user data
   * 
   * @throws Error if token is invalid or expired (401)
   * 
   * @example
   * try {
   *   const user = await authApi.getCurrentUser()
   *   console.log('Current user:', user.name)
   *   console.log('Onboarding complete:', user.onboarding_complete)
   * } catch (error) {
   *   // Token expired or invalid - redirect to login
   *   navigate('/login')
   * }
   */
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/auth/me')
    return response.data
  },

  /**
   * Request a password reset email.
   *
   * Always resolves successfully regardless of whether the email exists
   * (the backend intentionally doesn't reveal this, for security).
   *
   * @param email - User's email address
   * @returns Promise with a generic confirmation message
   *
   * @example
   * await authApi.forgotPassword('user@example.com')
   * // Show "check your inbox" message
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  },

  /**
   * Set a new password using the access token from the reset email link.
   *
   * @param accessToken - Recovery access_token parsed from the URL hash
   * @param newPassword - The user's new password (min 8 characters)
   * @returns Promise with a confirmation message
   *
   * @throws Error if the token is invalid or expired (401/400)
   *
   * @example
   * await authApi.resetPassword(token, 'newSecurePassword123')
   * navigate('/login')
   */
  resetPassword: async (
    accessToken: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', {
      access_token: accessToken,
      new_password: newPassword,
    })
    return response.data
  },
}

// Export individual functions for convenience
export const { login, register, logout, getCurrentUser, forgotPassword, resetPassword } = authApi