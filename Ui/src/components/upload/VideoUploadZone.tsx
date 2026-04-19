/**
 * Video Upload Zone Component
 * Drag-and-drop + click-to-upload video file selector
 */
import { useState, useRef } from 'react'
import { Upload, Video, X, CheckCircle } from 'lucide-react'
import Button from '../ui/Button'

interface VideoUploadZoneProps {
  onFileSelect: (file: File) => void
  onClear: () => void
  selectedFile: File | null
  disabled?: boolean
  accept?: string
  maxSizeMB?: number
}

export default function VideoUploadZone({
  onFileSelect,
  onClear,
  selectedFile,
  disabled = false,
  accept = 'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska',
  maxSizeMB = 500,
}: VideoUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validTypes = ['video/mp4', 'video/quicktime', 'video/avi', 'video/x-matroska', 'video/x-msvideo']
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const validateFile = (file: File): boolean => {
    setError(null)

    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB`)
      return false
    }

    // Check file type
    if (!validTypes.includes(file.type)) {
      setError('File type not supported. Use MP4, MOV, AVI, or MKV')
      return false
    }

    return true
  }

  const handleFileChange = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileChange(files[0])
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileChange(files[0])
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (selectedFile) {
    // Show selected file
    return (
      <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={disabled}
            className="text-gray-600 hover:text-red-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    )
  }

  // Show upload zone
  return (
    <div>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragOver ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
          `}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Drag and drop your workout video here
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              or click to browse files
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            Supported: MP4, MOV, AVI, MKV • Max size: {maxSizeMB}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}
