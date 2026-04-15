/**
 * Axios API Client Configuration
 * 
 * This file creates a configured axios instance that:
 * - Points to the backend API
 * - Automatically adds auth tokens to requests
 * - Handles 401 errors by redirecting to login
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Read API URL from environment variable, fallback to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

/**
 * REQUEST INTERCEPTOR
 * 
 * Runs before every request is sent.
 * Adds the JWT token from localStorage to the Authorization header.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    // Handle request errors
    return Promise.reject(error)
  }
)

/**
 * RESPONSE INTERCEPTOR
 * 
 * Runs after every response is received.
 * Handles 401 errors by clearing auth and redirecting to login.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Pass successful responses through unchanged
    return response
  },
  (error: AxiosError) => {
    // Check if error is a 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear the invalid token from localStorage
      localStorage.removeItem('auth_token')
      
      // Redirect to login page
      // Only redirect if not already on login page to avoid infinite loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // Pass all errors through so calling code can handle them
    return Promise.reject(error)
  }
)

// Export the configured axios instance as default
export default apiClient
