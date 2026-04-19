/**
 * Analysis Status Component
 * Shows AI analysis progress with animated steps
 */
import { useState, useEffect } from 'react'
import { Brain, Eye, Activity, FileText, Loader2 } from 'lucide-react'

interface AnalysisStatusProps {
  sessionId: string
}

const analysisSteps = [
  { id: 1, label: 'Processing video frames', icon: Eye },
  { id: 2, label: 'Detecting pose and movement', icon: Activity },
  { id: 3, label: 'Analyzing exercise form', icon: Brain },
  { id: 4, label: 'Generating your report', icon: FileText },
]

export default function AnalysisStatus({ sessionId }: AnalysisStatusProps) {
  const [activeStep, setActiveStep] = useState(0)

  // Animate through steps every 8 seconds (purely cosmetic)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % analysisSteps.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analyzing your workout video...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This may take 1-3 minutes depending on video length
          </p>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-4 mb-8">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === activeStep
            const isCompleted = index < activeStep

            return (
              <div
                key={step.id}
                className={`
                  flex items-center space-x-4 p-4 rounded-lg transition-all duration-500
                  ${isActive ? 'bg-primary/10 border-2 border-primary' : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'}
                `}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                    ${isActive ? 'bg-primary text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}
                  `}
                >
                  {isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`
                      font-medium transition-colors duration-500
                      ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Session ID (for debugging) */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
            Session ID: {sessionId.slice(0, 8)}...
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ Please do not close this page
          </p>
        </div>
      </div>
    </div>
  )
}
