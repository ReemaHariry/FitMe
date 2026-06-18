/**
 * Upload Progress Component
 * Shows upload progress during file transfer
 */
import { Video } from 'lucide-react'

interface UploadProgressProps {
  percent: number
  filename: string
}

export default function UploadProgress({ percent, filename }: UploadProgressProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">{filename}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading to server...</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Upload Progress</span>
            <span className="font-medium text-primary">{percent}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-500">
          Please wait while your video is being uploaded...
        </p>
      </div>
    </div>
  )
}
