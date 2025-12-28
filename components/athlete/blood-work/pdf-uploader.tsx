'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PDFUploaderProps {
  onUpload: (file: File) => void
  isLoading?: boolean
  error?: string | null
  maxSizeMB?: number
}

export function PDFUploader({
  onUpload,
  isLoading = false,
  error = null,
  maxSizeMB = 10,
}: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    setValidationError(null)

    if (file.type !== 'application/pdf') {
      setValidationError('Only PDF files are accepted')
      return false
    }

    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      setValidationError(`File size must be less than ${maxSizeMB}MB`)
      return false
    }

    return true
  }

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      onUpload(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setValidationError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-8 text-center transition-all',
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-border bg-muted/20 hover:border-muted-foreground/50',
          isLoading && 'pointer-events-none opacity-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-xl transition-colors',
              isDragging ? 'bg-emerald-500/20' : 'bg-muted'
            )}
          >
            <Upload
              className={cn(
                'h-8 w-8 transition-colors',
                isDragging ? 'text-emerald-500' : 'text-muted-foreground'
              )}
            />
          </div>

          <p className="mt-4 text-lg font-semibold">
            {isDragging ? 'Drop your PDF here' : 'Drag & drop your blood test PDF'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-emerald-600 hover:text-emerald-700"
              disabled={isLoading}
            >
              browse files
            </button>
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            PDF files only • Max {maxSizeMB}MB
          </p>
        </div>
      </div>

      {/* Selected file preview */}
      {selectedFile && !validationError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
              <FileText className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="font-medium truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={clearFile}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* Validation error */}
      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4"
        >
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-rose-600">{validationError}</p>
          </div>
          <button
            onClick={clearFile}
            className="rounded-lg p-1 text-rose-500 hover:bg-rose-500/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* External error (from parent) */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4"
        >
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <p className="text-sm font-medium text-rose-600">{error}</p>
        </motion.div>
      )}

      {/* Supported labs info */}
      <div className="rounded-lg bg-blue-500/10 p-4">
        <p className="text-sm text-blue-600">
          <strong>Supported formats:</strong> We can extract markers from most major labs including
          Medichecks, Forth, Thriva, NHS, and more. The system will automatically detect and extract
          biomarkers from your test results.
        </p>
      </div>
    </div>
  )
}
