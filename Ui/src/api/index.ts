/**
 * API Barrel Export
 * 
 * This file re-exports everything from the API modules.
 * This allows you to import from '@/api' instead of '@/api/auth' or '@/api/client'.
 * 
 * Usage examples:
 * - import apiClient from '@/api'
 * - import { authApi, login, register } from '@/api'
 * - import { usersApi, saveProfile } from '@/api'
 * - import { reportsApi, getAllReports } from '@/api'
 * - import type { AuthUser, AuthResponse, ProfileData, ReportSummary } from '@/api'
 */

// Export the axios client instance as default
export { default } from './client'
export { default as apiClient } from './client'

// Export all auth-related functions and types
export * from './auth'

// Export all user-related functions and types
export * from './users'

// Export all reports-related functions and types
export * from './reports'

// Export all videos-related functions and types
export * from './videos'

// Export all sessions-related functions and types
export * from './sessions'
