/**
 * Video Upload Page
 * Complete flow for uploading and analyzing workout videos
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, CheckCircle, XCircle, Upload, BarChart3 } from 'lucide-react'
import { videosApi, VideoUploadResponse } from '@/api/videos'
import VideoUploadZone from '@/components/upload/VideoUploadZone'
import UploadProgress from '@/components/upload/UploadProgress'
import AnalysisStatus from '@/components/upload/AnalysisStatus'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type UploadPhase = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'

export default function VideoUpload() {
  const navigate = useNavigate()

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sessionName, setSessionName] = useState('')
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<VideoUploadResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false) // Prevent multiple uploads

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || isUploading) return

    // Prevent multiple simultaneous uploads
    setIsUploading(true)
    setUploadPhase('uploading')
    setUploadProgress(0)
    setErrorMessage(null)

    try {
      const result = await videosApi.upload(
        {
          video: selectedFile,
          session_name: sessionName || undefined,
        },
        (percent) => {
          setUploadProgress(percent)
          
          // When upload completes, switch to analyzing phase
          if (percent === 100) {
            setUploadPhase('analyzing')
          }
        }
      )

      // Analysis complete - set session ID and result
      setSessionId(result.session_id)
      setAnalysisResult(result)
      setUploadPhase('complete')
    } catch (error: any) {
      console.error('Upload failed:', error)
      setErrorMessage(
        error.response?.data?.detail || error.message || 'Upload failed. Please try again.'
      )
      setUploadPhase('error')
    } finally {
      setIsUploading(false)
    }
  }

  // Reset to initial state
  const handleReset = () => {
    setSelectedFile(null)
    setSessionName('')
    setUploadPhase('idle')
    setUploadProgress(0)
    setAnalysisResult(null)
    setErrorMessage(null)
    setSessionId(null)
    setIsUploading(false)
  }

  // Render based on phase
  if (uploadPhase === 'uploading') {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark py-12 px-4">
        <UploadProgress percent={uploadProgress} filename={selectedFile?.name || ''} />
      </div>
    )
  }

  if (uploadPhase === 'analyzing') {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark py-12 px-4">
        <AnalysisStatus sessionId={sessionId || ''} />
      </div>
    )
  }

  if (uploadPhase === 'complete' && analysisResult) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analysis Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your workout video has been analyzed successfully
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Form Score</p>
                <p className="text-3xl font-bold text-primary">
                  {analysisResult.metrics.form_score}/100
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Form Issues</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analysisResult.metrics.total_mistakes}
                </p>
              </div>
            </div>

            {/* Performance Rating */}
            <div className="mb-8">
              <span
                className={`
                  inline-block px-4 py-2 rounded-full text-sm font-medium
                  ${
                    analysisResult.metrics.performance_rating === 'excellent'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : analysisResult.metrics.performance_rating === 'good'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : analysisResult.metrics.performance_rating === 'fair'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }
                `}
              >
                {analysisResult.metrics.performance_rating.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate(`/reports/${analysisResult.report_id}`)}
                className="flex-1 flex items-center justify-center"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Full Report
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Upload Another Video
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (uploadPhase === 'error') {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analysis Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>

            <Button onClick={handleReset} className="mx-auto">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // PHASE: idle - Show upload form
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upload Workout Video
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Get AI-powered form analysis and personalized feedback
          </p>
        </div>

        <Card className="p-8">
          {/* Section 1: Video File */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Upload your workout video
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Our AI will automatically detect the exercise type (squat, push-up, or sit-up)
            </p>
            <VideoUploadZone
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onClear={() => setSelectedFile(null)}
            />
          </div>

          {/* Section 2: Session Name (Optional) */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session name (optional)
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g. Morning Workout Practice"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full flex items-center justify-center"
            size="lg"
          >
            <Dumbbell className="w-5 h-5 mr-2" />
            {isUploading ? 'Uploading...' : 'Analyze Video'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
