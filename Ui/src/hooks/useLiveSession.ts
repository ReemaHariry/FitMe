/**
 * useLiveSession Hook
 * 
 * Orchestrates the entire live session.
 * This is the main hook used by LiveTraining.tsx.
 * Combines webcam, WebSocket, timer, frame capture, and API calls.
 * 
 * This hook is the brain of the live training feature.
 * Everything else is managed through this single hook.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionsApi } from '@/api/sessions'
import { useWebSocket } from './useWebSocket'
import { useSessionTimer } from './useSessionTimer'

const FRAME_INTERVAL_MS = 150
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480

export interface SessionFeedback {
  exercise: string | null
  confidence: number | null
  formStatus: 'good' | 'bad' | 'none'
  message: string
  mistakesCount: number
  bufferProgress: number
  status: 'waiting' | 'buffering' | 'analyzing' | 'error'
}

export type SessionPhase =
  | 'idle'          // not started
  | 'starting'      // waiting for camera + API
  | 'active'        // session running
  | 'ending'        // waiting for end session API
  | 'error'         // something went wrong

export interface UseLiveSessionReturn {
  phase: SessionPhase
  feedback: SessionFeedback
  formattedTime: string
  isConnected: boolean
  sessionId: string | null
  videoRef: React.RefObject<HTMLVideoElement>
  startSession: (exerciseName: string, sessionName?: string) => Promise<void>
  endSession: () => Promise<void>
  errorMessage: string | null
  reset: () => void
}

export function useLiveSession(): UseLiveSessionReturn {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameIntervalRef = useRef<number | null>(null)
  const frameIdRef = useRef(0)
  const sessionStartTimeRef = useRef<number>(0)
  const exerciseNameRef = useRef<string>('')
  const sessionNameRef = useRef<string>('')

  const [phase, setPhase] = useState<SessionPhase>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<SessionFeedback>({
    exercise: null,
    confidence: null,
    formStatus: 'none',
    message: 'Start training to get feedback',
    mistakesCount: 0,
    bufferProgress: 0,
    status: 'waiting'
  })

  const { isConnected, lastFeedback, connect, disconnect, sendFrame } = useWebSocket()
  const { formattedTime, start: startTimer, stop: stopTimer, reset: resetTimer } = useSessionTimer()

  // Update feedback whenever WebSocket receives a message
  useEffect(() => {
    if (!lastFeedback) return
    if (lastFeedback.type === 'pong' || lastFeedback.type === 'keepalive') return

    setFeedback({
      exercise: lastFeedback.exercise || null,
      confidence: lastFeedback.confidence || null,
      formStatus: (lastFeedback.form_status as any) || 'none',
      message: lastFeedback.feedback || 'Analyzing...',
      mistakesCount: lastFeedback.total_mistakes_so_far || 0,
      bufferProgress: lastFeedback.buffer_progress || 0,
      status: (lastFeedback.status as any) || 'waiting'
    })
  }, [lastFeedback])

  const captureAndSendFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || video.readyState < 2) {
      console.log('Frame capture skipped: video not ready', {
        hasVideo: !!video,
        hasCanvas: !!canvas,
        readyState: video?.readyState
      })
      return
    }
    
    if (!isConnected) {
      console.log('Frame capture skipped: WebSocket not connected')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('Frame capture skipped: no canvas context')
      return
    }

    ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    const base64Frame = canvas.toDataURL('image/jpeg', 0.6)

    const timestamp = (Date.now() - sessionStartTimeRef.current) / 1000
    frameIdRef.current += 1

    console.log(`Sending frame ${frameIdRef.current} at ${timestamp.toFixed(2)}s`)

    sendFrame({
      frame: base64Frame,
      frame_id: frameIdRef.current,
      timestamp: parseFloat(timestamp.toFixed(2))
    })
  }, [isConnected, sendFrame])

  // Start frame capture when WebSocket connects during active session
  useEffect(() => {
    if (phase === 'active' && isConnected && !frameIntervalRef.current) {
      console.log('WebSocket connected! Starting frame capture...')
      frameIntervalRef.current = window.setInterval(
        captureAndSendFrame,
        FRAME_INTERVAL_MS
      )
    }
  }, [phase, isConnected, captureAndSendFrame])

  const startSession = useCallback(async (
    exerciseName: string,
    sessionName?: string
  ) => {
    if (phase !== 'idle') {
      console.warn('Session already active')
      return
    }

    setPhase('starting')
    setErrorMessage(null)

    try {
      // Step 1: Request camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: CANVAS_WIDTH },
          height: { ideal: CANVAS_HEIGHT },
          frameRate: { ideal: 30 }
        },
        audio: false
      })

      // Step 2: Attach stream to video element
      if (!videoRef.current) throw new Error('Video element not ready')
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      // Step 3: Create off-screen canvas for frame capture
      const canvas = document.createElement('canvas')
      canvas.width = CANVAS_WIDTH
      canvas.height = CANVAS_HEIGHT
      canvasRef.current = canvas

      // Step 4: Call API to start session
      const generatedName = sessionName ||
        `${exerciseName.replace('_', ' ')} Live Session`
      
      exerciseNameRef.current = exerciseName
      sessionNameRef.current = generatedName

      const response = await sessionsApi.start({
        exercise_name: exerciseName,
        session_name: generatedName
      })

      const newSessionId = response.session_id
      setSessionId(newSessionId)

      // Step 5: Connect WebSocket
      connect(newSessionId)

      // Step 6: Start timer
      sessionStartTimeRef.current = Date.now()
      frameIdRef.current = 0
      resetTimer()
      startTimer()

      // Step 7: Frame capture will start automatically when WebSocket connects
      // (see useEffect below that watches isConnected)

      setPhase('active')
      console.log('Session started, waiting for WebSocket connection...')
    } catch (err: any) {
      const message = err.response?.data?.detail ||
        err.message ||
        'Failed to start session'
      
      setErrorMessage(message)
      setPhase('error')

      // Cleanup on error
      stopTimer()
      disconnect()

      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
        frameIntervalRef.current = null
      }

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [phase, connect, disconnect, startTimer, stopTimer, resetTimer, captureAndSendFrame])

  const endSession = useCallback(async () => {
    if (phase !== 'active' || !sessionId) return

    setPhase('ending')

    // Step 1: Stop frame capture immediately
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
    }

    // Step 2: Stop timer
    stopTimer()

    // Step 3: Close WebSocket
    disconnect()

    // Step 4: Stop camera
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }

    // Step 5: Call end session API
    try {
      const response = await sessionsApi.end(sessionId, {
        exercise_name: exerciseNameRef.current,
        session_name: sessionNameRef.current
      })

      // Step 6: Navigate to report
      navigate(`/reports/${response.report_id}`)
    } catch (err: any) {
      const message = err.response?.data?.detail ||
        err.message ||
        'Failed to generate report'
      
      setErrorMessage(message)
      setPhase('error')
    }
  }, [phase, sessionId, stopTimer, disconnect, navigate])

  const reset = useCallback(() => {
    setPhase('idle')
    setSessionId(null)
    setErrorMessage(null)
    setFeedback({
      exercise: null,
      confidence: null,
      formStatus: 'none',
      message: 'Start training to get feedback',
      mistakesCount: 0,
      bufferProgress: 0,
      status: 'waiting'
    })
    resetTimer()
  }, [resetTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
      disconnect()
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(t => t.stop())
      }
    }
  }, [disconnect])

  return {
    phase,
    feedback,
    formattedTime,
    isConnected,
    sessionId,
    videoRef,
    startSession,
    endSession,
    errorMessage,
    reset
  }
}

// Export as both default and named export
export default useLiveSession
