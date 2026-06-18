/**
 * useWebSocket Hook
 * 
 * Manages the WebSocket connection lifecycle.
 * Handles connect, disconnect, message sending, and reconnection.
 * Does NOT contain AI logic — just connection management.
 */

import { useState, useRef, useCallback, useEffect } from 'react'

// WebSocket base URL from environment or default
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export interface WebSocketMessage {
  frame: string
  frame_id: number
  timestamp: number
}

export interface WebSocketFeedback {
  frame_id: number
  status: 'waiting' | 'buffering' | 'analyzing' | 'error' | 'none'
  exercise?: string
  confidence?: number
  form_status?: 'good' | 'bad' | 'none'
  feedback?: string
  mistakes_this_frame?: string[]
  total_mistakes_so_far?: number
  buffer_progress?: number
  type?: string
  error?: string
}

export interface UseWebSocketReturn {
  isConnected: boolean
  lastFeedback: WebSocketFeedback | null
  connect: (sessionId: string) => void
  disconnect: () => void
  sendFrame: (frameData: WebSocketMessage) => void
}

export function useWebSocket(): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const pingIntervalRef = useRef<number | null>(null)
  
  const [isConnected, setIsConnected] = useState(false)
  const [lastFeedback, setLastFeedback] = useState<WebSocketFeedback | null>(null)

  const connect = useCallback((sessionId: string) => {
    // If already connected, do nothing (prevents duplicate connections)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected')
      return
    }

    const wsUrl = `${WS_BASE}/ws/live/${sessionId}`
    console.log('Connecting to WebSocket:', wsUrl)

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully')
      setIsConnected(true)

      // Start ping interval every 30 seconds
      pingIntervalRef.current = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketFeedback

        // Ignore pong and keepalive messages
        if (data.type === 'pong' || data.type === 'keepalive') {
          return
        }

        console.log('📨 WebSocket feedback received:', data)
        setLastFeedback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      console.log('❌ WebSocket disconnected')
      setIsConnected(false)

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = null
      }
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      setIsConnected(false)
    }

    wsRef.current = ws
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }

    setIsConnected(false)
  }, [])

  const sendFrame = useCallback((frameData: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(frameData))
      // Only log every 10th frame to avoid console spam
      if (frameData.frame_id % 10 === 0) {
        console.log(`📤 Sent frame ${frameData.frame_id}`)
      }
    } else {
      console.warn('Cannot send frame: WebSocket not open', {
        readyState: wsRef.current?.readyState,
        frameId: frameData.frame_id
      })
    }
    // If not open: silently skip (do not throw error)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    lastFeedback,
    connect,
    disconnect,
    sendFrame
  }
}

// Export as both default and named export
export default useWebSocket
