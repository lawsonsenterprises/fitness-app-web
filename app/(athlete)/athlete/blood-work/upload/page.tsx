'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Tag,
  Plus,
  Trash2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock extracted markers from PDF
const mockExtractedMarkers = [
  { name: 'Testosterone', value: 22.5, unit: 'nmol/L', reference: { low: 8.64, high: 29 }, status: 'normal' },
  { name: 'Free Testosterone', value: 0.42, unit: 'nmol/L', reference: { low: 0.2, high: 0.62 }, status: 'normal' },
  { name: 'SHBG', value: 35, unit: 'nmol/L', reference: { low: 18.3, high: 54.1 }, status: 'normal' },
  { name: 'Oestradiol', value: 98, unit: 'pmol/L', reference: { low: 41, high: 159 }, status: 'normal' },
  { name: 'TSH', value: 1.8, unit: 'mU/L', reference: { low: 0.27, high: 4.2 }, status: 'normal' },
  { name: 'Free T4', value: 16.2, unit: 'pmol/L', reference: { low: 12, high: 22 }, status: 'normal' },
  { name: 'Free T3', value: 4.8, unit: 'pmol/L', reference: { low: 3.1, high: 6.8 }, status: 'normal' },
  { name: 'Vitamin D', value: 65, unit: 'nmol/L', reference: { low: 50, high: 175 }, status: 'low' },
  { name: 'Ferritin', value: 95, unit: 'ug/L', reference: { low: 30, high: 400 }, status: 'normal' },
  { name: 'HbA1c', value: 32, unit: 'mmol/mol', reference: { low: 20, high: 42 }, status: 'normal' },
  { name: 'Total Cholesterol', value: 4.8, unit: 'mmol/L', reference: { low: 0, high: 5 }, status: 'normal' },
  { name: 'LDL Cholesterol', value: 2.9, unit: 'mmol/L', reference: { low: 0, high: 3 }, status: 'normal' },
]

const labProviders = [
  { id: 'medichecks', name: 'Medichecks' },
  { id: 'forthEdge', name: 'Forth Edge' },
  { id: 'atlasLabs', name: 'Atlas Labs' },
  { id: 'randoxHealth', name: 'Randox Health' },
  { id: 'other', name: 'Other/Manual Entry' },
]

const suggestedTags = [
  'Baseline',
  'Pre-Cycle',
  'Mid-Cycle',
  'Post-Cycle',
  'Annual Check',
  'Follow-up',
  'Thyroid Panel',
  'Hormones',
  'Full Panel',
]

export default function BloodWorkUploadPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [extractedMarkers, setExtractedMarkers] = useState<typeof mockExtractedMarkers>([])
  const [testDate, setTestDate] = useState('')
  const [labProvider, setLabProvider] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file)
      processFile(file)
    } else {
      toast.error('Please upload a PDF file')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      processFile(file)
    }
  }

  const processFile = async (_file: File) => {
    setIsProcessing(true)
    // Simulate PDF processing
    await new Promise(resolve => setTimeout(resolve, 2500))
    setExtractedMarkers(mockExtractedMarkers)
    setIsProcessing(false)
    setStep(2)
    toast.success(`Extracted ${mockExtractedMarkers.length} markers from PDF`)
  }

  const updateMarkerValue = (index: number, value: string) => {
    const updated = [...extractedMarkers]
    updated[index] = { ...updated[index], value: parseFloat(value) || 0 }
    setExtractedMarkers(updated)
  }

  const removeMarker = (index: number) => {
    setExtractedMarkers(markers => markers.filter((_, i) => i !== index))
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Blood test saved successfully')
    router.push('/athlete/blood-work')
  }

  const getMarkerStatus = (marker: typeof mockExtractedMarkers[0]) => {
    if (marker.value < marker.reference.low) return 'low'
    if (marker.value > marker.reference.high) return 'high'
    return 'normal'
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/athlete/blood-work"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Blood Work
        </Link>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Upload Blood Test</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your blood test PDF or enter markers manually
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
                step >= s
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  'h-0.5 flex-1 rounded transition-colors',
                  step > s ? 'bg-foreground' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Upload PDF */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Blood Test PDF</h2>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer',
                  isDragOver
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-border hover:border-muted-foreground/50',
                  isProcessing && 'pointer-events-none opacity-50'
                )}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isProcessing}
                />

                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                    <div>
                      <p className="font-medium">Processing PDF...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Extracting biomarkers from your blood test
                      </p>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-500/10">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadedFile(null)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your PDF here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports Medichecks, Forth Edge, Atlas Labs, and Randox Health formats
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">or</p>
                <Button
                  variant="link"
                  className="text-amber-600"
                  onClick={() => {
                    setExtractedMarkers([])
                    setStep(2)
                  }}
                >
                  Enter markers manually
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Review Extracted Markers */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold">Review Extracted Markers</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {extractedMarkers.length} markers found. Edit values if needed.
                </p>
              </div>

              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {extractedMarkers.map((marker, index) => {
                  const status = getMarkerStatus(marker)
                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center gap-4 p-4',
                        status === 'low' && 'bg-amber-500/5',
                        status === 'high' && 'bg-red-500/5'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{marker.name}</p>
                          {status !== 'normal' && (
                            <AlertTriangle
                              className={cn(
                                'h-4 w-4',
                                status === 'low' ? 'text-amber-500' : 'text-red-500'
                              )}
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reference: {marker.reference.low} - {marker.reference.high} {marker.unit}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={marker.value}
                          onChange={(e) => updateMarkerValue(index, e.target.value)}
                          className="w-24 text-right"
                        />
                        <span className="text-sm text-muted-foreground w-16">{marker.unit}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMarker(index)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {extractedMarkers.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No markers extracted. Add markers manually below.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Test Metadata */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <h2 className="text-lg font-semibold">Test Details</h2>

              {/* Test Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Test Date
                </label>
                <Input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              {/* Lab Provider */}
              <div>
                <label className="block text-sm font-medium mb-2">Lab Provider</label>
                <div className="flex flex-wrap gap-2">
                  {labProviders.map((lab) => (
                    <button
                      key={lab.id}
                      onClick={() => setLabProvider(lab.id)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        labProvider === lab.id
                          ? 'bg-foreground text-background'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {lab.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-amber-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestedTags
                    .filter((t) => !tags.includes(t))
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        {tag}
                      </button>
                    ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag(newTag)}
                    className="max-w-xs"
                  />
                  <Button variant="outline" onClick={() => addTag(newTag)}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this test..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90"
              >
                Review & Save
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review & Save */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Review Your Blood Test</h2>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Test Date</p>
                  <p className="font-medium">
                    {testDate
                      ? new Date(testDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Not specified'}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Lab Provider</p>
                  <p className="font-medium">
                    {labProviders.find((l) => l.id === labProvider)?.name || 'Not specified'}
                  </p>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {notes && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{notes}</p>
                </div>
              )}

              {/* Markers Summary */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Markers ({extractedMarkers.length})
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {extractedMarkers.filter((m) => getMarkerStatus(m) === 'normal').length} Normal
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    {extractedMarkers.filter((m) => getMarkerStatus(m) === 'low').length} Low
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    {extractedMarkers.filter((m) => getMarkerStatus(m) === 'high').length} High
                  </span>
                </div>
              </div>
            </div>

            {/* Flagged Markers Warning */}
            {extractedMarkers.some((m) => getMarkerStatus(m) !== 'normal') && (
              <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-600">Some markers are out of range</p>
                    <p className="text-sm text-amber-600/80 mt-1">
                      Consider discussing these results with your healthcare provider.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Blood Test
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
