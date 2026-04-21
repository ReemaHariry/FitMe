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
  AlertCircle
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useI18nStore } from '@/app/i18n'
import { useLiveSession } from '@/hooks/useLiveSession'

export default function LiveTraining() {
  const navigate = useNavigate()
  const { t } = useI18nStore()
  
  // Main live session hook - manages everything
  const {
    phase,
    feedback,
    formattedTime,
    isConnected,
    videoRef,
    startSession,
    endSession,
    errorMessage,
    reset
  } = useLiveSession()

  // No exercise selection needed - AI will detect it automatically
  // We'll use "unknown" as placeholder and let AI detect the actual exercise

  // Status text based on phase
  const statusText = {
    'idle': 'Waiting...',
    'starting': 'Starting camera...',
    'active': feedback.status === 'buffering'
      ? `Detecting... (${feedback.bufferProgress}/50)`
      : feedback.status === 'analyzing'
      ? feedback.exercise
        ? `${feedback.exercise.replace('_', ' ')} detected`
        : 'Analyzing...'
      : 'Detecting pose...',
    'ending': 'Generating report...',
    'error': 'Error occurred'
  }[phase]

  // Feedback message color based on form status
  const feedbackColorClass = feedback.formStatus === 'good'
    ? 'text-green-600 dark:text-green-400'
    : feedback.formStatus === 'bad'
    ? 'text-red-600 dark:text-red-400'
    : 'text-primary'

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
            onClick={() => navigate('/upload-video')}
            className="flex items-center"
            disabled={phase === 'active' || phase === 'starting' || phase === 'ending'}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-2">
          <Card className="relative overflow-hidden">
            {/* Video Feed */}
            <div className="aspect-video bg-gray-900 rounded-xl relative overflow-hidden">
              {/* Video element - always present but hidden when not needed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover absolute inset-0 ${
                  phase === 'active' || phase === 'ending' || phase === 'starting' ? 'block' : 'hidden'
                }`}
              />
              
              {/* Active/Ending/Starting State */}
              {(phase === 'active' || phase === 'ending' || phase === 'starting') && (
                <div className="w-full h-full relative">
                  {phase === 'active' && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center z-10">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                      LIVE
                    </div>
                  )}
                  {!isConnected && phase === 'active' && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                      Connecting...
                    </div>
                  )}
                  {phase === 'starting' && (
                    <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10">
                      <div className="text-center text-white">
                        <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                        <p className="text-lg">Starting camera...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Idle/Error State */}
              {(phase === 'idle' || phase === 'error') && (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    {phase === 'error' ? (
                      <>
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <p className="text-lg mb-4 text-red-400">{errorMessage}</p>
                        <Button
                          onClick={reset}
                          variant="secondary"
                          className="mx-auto"
                        >
                          Try Again
                        </Button>
                      </>
                    ) : (
                      <>
                        <CameraOff className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg mb-4">Camera Ready</p>
                        <p className="text-sm mb-4">Click Start Training and the AI will detect your exercise automatically</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center z-20">
                {phase === 'idle' ? (
                  <Button 
                    onClick={() => startSession('unknown')}
                    className="flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Training
                  </Button>
                ) : phase === 'active' ? (
                  <Button
                    onClick={endSession}
                    variant="outline"
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white border-red-500"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Training
                  </Button>
                ) : phase === 'ending' ? (
                  <div className="text-white text-sm">
                    Generating report...
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>

        {/* Stats and Feedback Panel */}
        <div className="space-y-6">
          {/* Status Box */}
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {statusText}
              </h3>
              {feedback.confidence !== null && feedback.confidence > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {Math.round(feedback.confidence * 100)}%
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
                {formattedTime}
              </span>
            </div>
          </Card>

          {/* AI Feedback */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              AI Feedback
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {phase === 'idle' || phase === 'starting' ? (
                <div className="text-center py-8">
                  <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI feedback will appear here
                  </p>
                </div>
              ) : phase === 'active' ? (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-3 bg-primary/10 rounded-xl"
                  >
                    <p className={`text-sm font-medium ${feedbackColorClass}`}>
                      {feedback.message}
                    </p>
                    {feedback.mistakesCount > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Mistakes detected: {feedback.mistakesCount}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : phase === 'ending' ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generating your report...
                  </p>
                </div>
              ) : phase === 'error' ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-500">
                    {errorMessage || 'An error occurred'}
                  </p>
                </div>
              ) : (
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
    </div>
  )
}
