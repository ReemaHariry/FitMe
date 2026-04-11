import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Square,
  Camera,
  CameraOff,
  Target,
  Timer,
  Zap,
  Upload,
  Video
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useI18nStore } from '@/app/i18n'
import * as trainingApi from '../../services/trainingApi'

interface LiveTrainingState {
  isActive: boolean
  currentExercise: string
  confidence: number
  timeElapsed: number
  feedback: string[]
  cameraEnabled: boolean
  cameraStream: MediaStream | null
  sessionId: string | null
  sessionName: string
  mode: 'camera' | 'upload'
  uploadedVideo: File | null
  isProcessing: boolean
}

export default function LiveTraining() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const frameIntervalRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const { t } = useI18nStore()

  const [trainingState, setTrainingState] = useState<LiveTrainingState>({
    isActive: false,
    currentExercise: 'Waiting...',
    confidence: 0,
    timeElapsed: 0,
    feedback: [],
    cameraEnabled: false,
    cameraStream: null,
    sessionId: null,
    sessionName: '',
    mode: 'camera',
    uploadedVideo: null,
    isProcessing: false,
  })

  const [countdown, setCountdown] = useState<number | null>(null)
  const [showNameModal, setShowNameModal] = useState(false)
  const [tempSessionName, setTempSessionName] = useState('')

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setTrainingState(prev => ({
        ...prev,
        cameraStream: stream,
        cameraEnabled: true
      }))
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Failed to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (trainingState.cameraStream) {
      trainingState.cameraStream.getTracks().forEach(track => track.stop())
      setTrainingState(prev => ({
        ...prev,
        cameraStream: null,
        cameraEnabled: false
      }))
    }
  }

  // Auto-start camera on mount (only if no video uploaded)
  useEffect(() => {
    if (!trainingState.uploadedVideo) {
      startCamera()
    }
  }, [])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (trainingState.cameraStream) {
        trainingState.cameraStream.getTracks().forEach(track => track.stop())
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [trainingState.cameraStream])

  // Timer
  useEffect(() => {
    if (trainingState.isActive) {
      timerIntervalRef.current = window.setInterval(() => {
        setTrainingState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }))
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [trainingState.isActive])

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current

    if (video.readyState !== video.HAVE_ENOUGH_DATA) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.7)
  }

  const sendFrameToAI = async (sid: string) => {
    const frame = captureFrame()
    if (!frame) return

    try {
      const response = await trainingApi.sendFrame(frame, sid)
      
      setTrainingState(prev => ({
        ...prev,
        currentExercise: response.exercise,
        confidence: response.confidence || 0,
        feedback: response.feedback
      }))
    } catch (error) {
      console.error('Frame processing error:', error)
    }
  }

  const startTraining = async () => {
    if (!trainingState.cameraEnabled && trainingState.mode === 'camera') {
      await startCamera()
      return
    }

    // For video upload mode, skip name modal and process directly
    if (trainingState.mode === 'upload' && trainingState.uploadedVideo) {
      try {
        // Start session
        const sessionResponse = await trainingApi.startSession({
          user_id: 'mock-user-id',
          mode: 'upload'
        })

        setTrainingState(prev => ({
          ...prev,
          sessionId: sessionResponse.session_id
        }))

        await processUploadedVideo(sessionResponse.session_id, 'AI-Detected Exercise')
      } catch (error) {
        console.error('Failed to start video analysis:', error)
        alert('Failed to analyze video')
      }
      return
    }

    // For camera mode, show name modal
    setShowNameModal(true)
  }

  const confirmStartTraining = async () => {
    setShowNameModal(false)
    
    // Use AI-detected exercise name if user didn't provide one
    const sessionName = tempSessionName.trim() || 'AI-Detected Exercise'
    
    setTrainingState(prev => ({
      ...prev,
      sessionName: sessionName
    }))

    try {
      // Start session
      const sessionResponse = await trainingApi.startSession({
        user_id: 'mock-user-id',
        mode: trainingState.mode
      })

      // Capture session_id directly from response
      const sid = sessionResponse.session_id

      setTrainingState(prev => ({
        ...prev,
        sessionId: sid
      }))

      // If upload mode, process video immediately
      if (trainingState.mode === 'upload' && trainingState.uploadedVideo) {
        await processUploadedVideo(sid, sessionName)
        return
      }

      // Camera mode: Start countdown
      setCountdown(3)
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countdownInterval)
            
            // Start training
            setTrainingState(prev => ({ ...prev, isActive: true }))
            
            // Start frame capture every 2 seconds - pass sid directly
            frameIntervalRef.current = window.setInterval(() => {
              sendFrameToAI(sid)
            }, 2000)
            
            return null
          }
          return prev ? prev - 1 : null
        })
      }, 1000)
    } catch (error) {
      console.error('Failed to start training:', error)
      alert('Failed to start training session')
    }
  }

  const processUploadedVideo = async (sessionId: string, sessionName: string) => {
    if (!trainingState.uploadedVideo) return

    setTrainingState(prev => ({ 
      ...prev, 
      isProcessing: true,
      currentExercise: 'Analyzing...',
      feedback: ['Processing video...']
    }))

    try {
      const response = await trainingApi.uploadVideo(trainingState.uploadedVideo, sessionId)
      
      // Use AI-detected exercise name
      const finalExerciseName = response.exercise

      // Update state with results
      setTrainingState(prev => ({
        ...prev,
        currentExercise: response.exercise,
        confidence: response.confidence || 0,
        feedback: response.feedback,
        timeElapsed: Math.floor(response.duration_seconds),
        isProcessing: false,
        isActive: false,
        sessionName: finalExerciseName
      }))

      // End session and save report
      await trainingApi.endSession(sessionId, {
        duration_seconds: Math.floor(response.duration_seconds),
        exercise: response.exercise,
        feedback: response.feedback,
        confidence: response.confidence
      })

      // Save to localStorage for reports
      const report = {
        id: `report_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        workoutType: finalExerciseName,
        duration: Math.max(Math.floor(response.duration_seconds / 60), 1),
        feedback: response.feedback,
        detailedFeedback: response.feedback.map((fb, idx) => {
          // Calculate timestamp based on video duration and feedback count
          const timePerFeedback = response.duration_seconds / response.feedback.length
          const timestamp = Math.floor(idx * timePerFeedback)
          const mins = Math.floor(timestamp / 60)
          const secs = timestamp % 60
          
          return {
            timestamp: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
            issue: fb.includes('⚠️') ? 'Form correction needed' : fb.includes('✅') ? 'Good form' : 'Observation',
            description: fb.replace('⚠️', '').replace('✅', '').trim(),
            improvement: fb.includes('⚠️') 
              ? 'Focus on maintaining proper form throughout the movement' 
              : fb.includes('✅')
              ? 'Excellent! Keep maintaining this form'
              : 'Continue with controlled movements'
          }
        })
      }

      const existingReports = JSON.parse(localStorage.getItem('workout-reports') || '[]')
      existingReports.unshift(report)
      localStorage.setItem('workout-reports', JSON.stringify(existingReports))

      // Show success message and navigate after a delay
      setTimeout(() => {
        alert('Video analysis completed! Check Reports page for details.')
        navigate('/reports')
      }, 2000)
    } catch (error) {
      console.error('Video processing error:', error)
      alert('Failed to process video')
      setTrainingState(prev => ({ 
        ...prev, 
        isProcessing: false,
        currentExercise: 'Waiting...',
        feedback: []
      }))
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      // Stop camera if running
      if (trainingState.cameraStream) {
        trainingState.cameraStream.getTracks().forEach(track => track.stop())
      }

      setTrainingState(prev => ({
        ...prev,
        uploadedVideo: file,
        mode: 'upload',
        cameraEnabled: false,
        cameraStream: null
      }))

      // Load video preview
      if (videoRef.current) {
        // Clear any existing srcObject (camera stream)
        videoRef.current.srcObject = null
        
        const videoUrl = URL.createObjectURL(file)
        videoRef.current.src = videoUrl
        videoRef.current.load()
        
        // Play video once loaded
        videoRef.current.onloadeddata = () => {
          videoRef.current?.play()
        }
      }
    }
  }

  const switchToCamera = () => {
    // Clear uploaded video
    if (videoRef.current) {
      videoRef.current.src = ''
      videoRef.current.load()
    }

    setTrainingState(prev => ({
      ...prev,
      mode: 'camera',
      uploadedVideo: null
    }))
    
    startCamera()
  }

  const stopTraining = async () => {
    // Stop frame capture
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
    }

    // Stop camera
    stopCamera()

    // End session
    if (trainingState.sessionId) {
      try {
        await trainingApi.endSession(trainingState.sessionId, {
          duration_seconds: trainingState.timeElapsed,
          exercise: trainingState.currentExercise,
          feedback: trainingState.feedback,
          confidence: trainingState.confidence
        })

        // Save to localStorage for reports
        const report = {
          id: `report_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          workoutType: trainingState.sessionName || trainingState.currentExercise,
          duration: Math.max(Math.floor(trainingState.timeElapsed / 60), 1),
          feedback: trainingState.feedback,
          detailedFeedback: trainingState.feedback.map((fb, idx) => {
            // Calculate timestamp based on elapsed time and feedback count
            const timePerFeedback = trainingState.timeElapsed / trainingState.feedback.length
            const timestamp = Math.floor(idx * timePerFeedback)
            const mins = Math.floor(timestamp / 60)
            const secs = timestamp % 60
            
            return {
              timestamp: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
              issue: fb.includes('⚠️') ? 'Form correction needed' : fb.includes('✅') ? 'Good form' : 'Observation',
              description: fb.replace('⚠️', '').replace('✅', '').trim(),
              improvement: fb.includes('⚠️') 
                ? 'Focus on maintaining proper form throughout the movement' 
                : fb.includes('✅')
                ? 'Excellent! Keep maintaining this form'
                : 'Continue with controlled movements'
            }
          })
        }

        const existingReports = JSON.parse(localStorage.getItem('workout-reports') || '[]')
        existingReports.unshift(report)
        localStorage.setItem('workout-reports', JSON.stringify(existingReports))

        alert('Training session completed! Check Reports page for details.')
        navigate('/reports')
      } catch (error) {
        console.error('Failed to end session:', error)
      }
    }

    setTrainingState(prev => ({
      ...prev,
      isActive: false,
      timeElapsed: 0,
      sessionId: null
    }))
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('liveTraining.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time AI coaching and form feedback
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center"
            disabled={trainingState.isActive}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
          {trainingState.mode === 'upload' && (
            <Button
              variant="outline"
              onClick={switchToCamera}
              className="flex items-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-2">
          <Card className="relative overflow-hidden">
            {/* Video Feed */}
            <div className="aspect-video bg-gray-900 rounded-xl relative overflow-hidden">
              {trainingState.mode === 'upload' && trainingState.uploadedVideo ? (
                <div className="w-full h-full relative">
                  <video
                    ref={videoRef}
                    controls
                    loop
                    className="w-full h-full object-contain bg-black"
                  />
                  {trainingState.isProcessing && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-lg">Analyzing Video...</p>
                        <p className="text-sm opacity-75">AI is processing your workout</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Video className="w-4 h-4 mr-2" />
                    {trainingState.uploadedVideo.name}
                  </div>
                </div>
              ) : trainingState.cameraEnabled && trainingState.cameraStream ? (
                <div className="w-full h-full relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {trainingState.isActive && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                      LIVE
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <CameraOff className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg mb-4">Camera Disabled</p>
                    <div className="space-y-2">
                      <Button
                        onClick={startCamera}
                        variant="secondary"
                        className="flex items-center mx-auto"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Enable Camera
                      </Button>
                      <p className="text-sm">or</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="secondary"
                        className="flex items-center mx-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Countdown Overlay */}
              <AnimatePresence>
                {countdown && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <div className="text-8xl font-bold text-white">
                      {countdown}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
                {!trainingState.isActive && !trainingState.isProcessing ? (
                  <Button 
                    onClick={startTraining} 
                    className="flex items-center"
                    disabled={!trainingState.cameraEnabled && !trainingState.uploadedVideo}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {trainingState.mode === 'upload' ? 'Analyze Video' : 'Start Training'}
                  </Button>
                ) : trainingState.isActive ? (
                  <Button
                    onClick={stopTraining}
                    variant="outline"
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white border-red-500"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Training
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
          
          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Stats and Feedback Panel */}
        <div className="space-y-6">
          {/* Current Exercise */}
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {trainingState.currentExercise}
              </h3>
              {trainingState.confidence > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {Math.round(trainingState.confidence * 100)}%
                </p>
              )}
            </div>
          </Card>

          {/* Timer */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Duration
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Timer className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Time</span>
              </div>
              <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                {formatTime(trainingState.timeElapsed)}
              </span>
            </div>
          </Card>

          {/* AI Feedback */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              AI Feedback
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {trainingState.feedback.map((feedback, index) => (
                  <motion.div
                    key={`${feedback}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-3 bg-primary/10 rounded-xl"
                  >
                    <p className="text-sm text-primary font-medium">
                      {feedback}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {trainingState.feedback.length === 0 && (
                <div className="text-center py-8">
                  <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI feedback will appear here
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Session Name Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNameModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Name Your Workout
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Give this training session a name (optional - AI will detect exercise type)
              </p>
              
              <input
                type="text"
                value={tempSessionName}
                onChange={(e) => setTempSessionName(e.target.value)}
                placeholder="e.g., Morning Workout, Leg Day (leave empty for AI detection)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary mb-6"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    confirmStartTraining()
                  }
                }}
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowNameModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmStartTraining}
                  variant="primary"
                  className="flex-1"
                >
                  {trainingState.mode === 'upload' ? 'Analyze Video' : 'Start Training'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
