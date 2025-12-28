'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  FileText,
  Check,
  Loader2,
  AlertTriangle,
  Droplets,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PDFUploader } from './pdf-uploader'
import { MarkerExtractionReview } from './marker-extraction-review'
import { TestMetadataForm } from './test-metadata-form'

interface ExtractedMarker {
  name: string
  value: number
  unit: string
  referenceRange?: { min: number; max: number }
  confidence: number
  selected: boolean
}

interface TestMetadata {
  date: Date
  lab: string
  tags: string[]
  notes?: string
}

interface UploadTestModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: {
    markers: ExtractedMarker[]
    metadata: TestMetadata
    file: File
  }) => void
}

type Step = 'upload' | 'review' | 'metadata' | 'complete'

export function UploadTestModal({ isOpen, onClose, onComplete }: UploadTestModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [extractedMarkers, setExtractedMarkers] = useState<ExtractedMarker[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<TestMetadata | null>(null)

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile)
    setIsExtracting(true)
    setExtractionError(null)

    // Simulate PDF parsing and marker extraction
    // In production, this would call an API endpoint
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock extracted markers
      const mockMarkers: ExtractedMarker[] = [
        { name: 'Total Testosterone', value: 650, unit: 'ng/dL', referenceRange: { min: 300, max: 1000 }, confidence: 0.95, selected: true },
        { name: 'Free Testosterone', value: 15.2, unit: 'pg/mL', referenceRange: { min: 8.7, max: 25.1 }, confidence: 0.92, selected: true },
        { name: 'Estradiol', value: 28, unit: 'pg/mL', referenceRange: { min: 10, max: 40 }, confidence: 0.88, selected: true },
        { name: 'SHBG', value: 42, unit: 'nmol/L', referenceRange: { min: 18, max: 54 }, confidence: 0.91, selected: true },
        { name: 'LH', value: 5.2, unit: 'mIU/mL', referenceRange: { min: 1.7, max: 8.6 }, confidence: 0.87, selected: true },
        { name: 'FSH', value: 4.8, unit: 'mIU/mL', referenceRange: { min: 1.5, max: 12.4 }, confidence: 0.89, selected: true },
        { name: 'TSH', value: 2.1, unit: 'mIU/L', referenceRange: { min: 0.4, max: 4.0 }, confidence: 0.94, selected: true },
        { name: 'Free T4', value: 1.2, unit: 'ng/dL', referenceRange: { min: 0.8, max: 1.8 }, confidence: 0.90, selected: true },
        { name: 'Vitamin D', value: 45, unit: 'ng/mL', referenceRange: { min: 30, max: 100 }, confidence: 0.93, selected: true },
        { name: 'Ferritin', value: 125, unit: 'ng/mL', referenceRange: { min: 30, max: 300 }, confidence: 0.86, selected: true },
        { name: 'Haemoglobin', value: 15.2, unit: 'g/dL', referenceRange: { min: 13.5, max: 17.5 }, confidence: 0.97, selected: true },
        { name: 'HbA1c', value: 5.1, unit: '%', referenceRange: { min: 4.0, max: 5.6 }, confidence: 0.95, selected: true },
      ]

      setExtractedMarkers(mockMarkers)
      setStep('review')
    } catch (error) {
      setExtractionError('Failed to extract markers from PDF. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleMarkersConfirm = (markers: ExtractedMarker[]) => {
    setExtractedMarkers(markers)
    setStep('metadata')
  }

  const handleMetadataComplete = (data: TestMetadata) => {
    setMetadata(data)
    if (file) {
      onComplete({
        markers: extractedMarkers.filter(m => m.selected),
        metadata: data,
        file,
      })
    }
    setStep('complete')
  }

  const handleClose = () => {
    setStep('upload')
    setFile(null)
    setExtractedMarkers([])
    setExtractionError(null)
    setMetadata(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Droplets className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-semibold">Upload Blood Test</h2>
                <p className="text-sm text-muted-foreground">
                  {step === 'upload' && 'Upload your PDF test results'}
                  {step === 'review' && 'Review extracted markers'}
                  {step === 'metadata' && 'Add test details'}
                  {step === 'complete' && 'Upload complete'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-2 border-b border-border px-6 py-3 bg-muted/20">
            {(['upload', 'review', 'metadata', 'complete'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    step === s
                      ? 'bg-emerald-500 text-white'
                      : (['upload', 'review', 'metadata', 'complete'] as Step[]).indexOf(step) > i
                      ? 'bg-emerald-500/20 text-emerald-600'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {(['upload', 'review', 'metadata', 'complete'] as Step[]).indexOf(step) > i ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 w-8 rounded-full',
                      (['upload', 'review', 'metadata', 'complete'] as Step[]).indexOf(step) > i
                        ? 'bg-emerald-500'
                        : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {step === 'upload' && (
              <div className="space-y-4">
                <PDFUploader
                  onUpload={handleFileUpload}
                  isLoading={isExtracting}
                  error={extractionError}
                />
                {isExtracting && (
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Extracting markers from PDF...</span>
                  </div>
                )}
              </div>
            )}

            {step === 'review' && (
              <MarkerExtractionReview
                markers={extractedMarkers}
                onConfirm={handleMarkersConfirm}
                onBack={() => {
                  setStep('upload')
                  setFile(null)
                }}
              />
            )}

            {step === 'metadata' && (
              <TestMetadataForm
                onSubmit={handleMetadataComplete}
                onBack={() => setStep('review')}
              />
            )}

            {step === 'complete' && (
              <div className="text-center py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Test Uploaded Successfully</h3>
                <p className="mt-2 text-muted-foreground">
                  Your blood test has been saved with {extractedMarkers.filter(m => m.selected).length} markers.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
