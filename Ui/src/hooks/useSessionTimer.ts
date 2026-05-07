/**
 * useSessionTimer Hook
 * 
 * Manages the session timer that counts up from 00:00:00.
 * Completely isolated from the rest of the session logic.
 * Can be started and stopped independently.
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseSessionTimerReturn {
  elapsedSeconds: number
  formattedTime: string
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSessionTimer(): UseSessionTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // Format seconds as HH:MM:SS
  const formattedTime = useCallback(() => {
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [elapsedSeconds])

  // Start the timer
  const start = useCallback(() => {
    // Guard against double-start
    if (isRunning) return

    setIsRunning(true)
    intervalRef.current = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
  }, [isRunning])

  // Stop the timer
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  // Reset the timer
  const reset = useCallback(() => {
    stop()
    setElapsedSeconds(0)
  }, [stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    elapsedSeconds,
    formattedTime: formattedTime(),
    isRunning,
    start,
    stop,
    reset
  }
}

// Export as both default and named export
export default useSessionTimer
