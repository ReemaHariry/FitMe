/**
 * Session Reminders Utility
 * 
 * Checks if the user should be reminded to train based on:
 * - Reminders are enabled in settings
 * - User hasn't trained in 2+ days
 * - Reminder hasn't been shown today
 * 
 * Call this on app startup (in App.tsx or main layout)
 */

import { dashboardApi } from '@/api/dashboard'

export async function checkSessionReminder(): Promise<void> {
  try {
    // Check if reminders are enabled
    const remindersEnabled = localStorage.getItem('reminders-enabled')
    if (remindersEnabled !== 'true') {
      return
    }

    // Check if we've already shown a reminder today
    const lastCheck = localStorage.getItem('last-reminder-check')
    const today = new Date().toDateString()
    
    if (lastCheck) {
      const lastCheckDate = new Date(lastCheck).toDateString()
      if (lastCheckDate === today) {
        // Already checked today, don't show again
        return
      }
    }

    // Fetch user's recent activity
    const stats = await dashboardApi.getStats()
    
    // Check if user has any sessions
    if (stats.total_sessions === 0) {
      // New user, don't remind yet
      return
    }

    // Check current streak
    if (stats.current_streak === 0) {
      // User hasn't trained today or yesterday
      // Show reminder
      showReminderAlert()
      
      // Update last check date
      localStorage.setItem('last-reminder-check', new Date().toISOString())
    }
  } catch (error) {
    console.error('Failed to check session reminder:', error)
    // Fail silently - don't interrupt user experience
  }
}

function showReminderAlert(): void {
  // Simple browser alert (can be replaced with a nicer toast notification)
  const message = "💪 Remember to train today! Keep your streak going!"
  
  // Use setTimeout to show after a short delay (better UX)
  setTimeout(() => {
    alert(message)
  }, 2000)
}

/**
 * Alternative: Show a nicer toast notification instead of alert
 * 
 * If you have a toast/notification system, use this instead:
 */
export function showReminderToast(): void {
  // Example with a custom toast component:
  // toast.info("💪 Remember to train today! Keep your streak going!", {
  //   duration: 5000,
  //   position: 'top-right'
  // })
  
  // For now, using alert as fallback
  showReminderAlert()
}
