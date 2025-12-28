'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Scale,
  Footprints,
  Moon,
  Pill,
  MessageSquare,
  Camera,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WeightInput } from './weight-input'
import { StepsBreakdown } from './steps-breakdown'
import { SleepBreakdown } from './sleep-breakdown'
import { SupplementComplianceForm } from './supplement-compliance-form'

interface CheckInFormData {
  weight: number
  weightUnit: 'kg' | 'lbs'
  steps: number[]
  sleep: number[]
  supplements: Array<{ name: string; taken: boolean }>
  notes: string
  photos?: File[]
}

interface SubmitFormProps {
  onSubmit: (data: CheckInFormData) => Promise<void>
  supplements?: string[]
  previousWeight?: number
  weightUnit?: 'kg' | 'lbs'
}

type Step = 'weight' | 'steps' | 'sleep' | 'supplements' | 'notes' | 'review'

const steps: Step[] = ['weight', 'steps', 'sleep', 'supplements', 'notes', 'review']

const stepConfig = {
  weight: { icon: Scale, label: 'Weight', color: 'bg-emerald-500' },
  steps: { icon: Footprints, label: 'Steps', color: 'bg-blue-500' },
  sleep: { icon: Moon, label: 'Sleep', color: 'bg-violet-500' },
  supplements: { icon: Pill, label: 'Supplements', color: 'bg-amber-500' },
  notes: { icon: MessageSquare, label: 'Notes', color: 'bg-rose-500' },
  review: { icon: Check, label: 'Review', color: 'bg-foreground' },
}

export function SubmitForm({
  onSubmit,
  supplements = [],
  previousWeight,
  weightUnit = 'kg',
}: SubmitFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('weight')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CheckInFormData>({
    weight: previousWeight || 0,
    weightUnit,
    steps: Array(7).fill(0),
    sleep: Array(7).fill(0),
    supplements: supplements.map(s => ({ name: s, taken: false })),
    notes: '',
    photos: [],
  })

  const currentStepIndex = steps.indexOf(currentStep)

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1])
    }
  }

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'weight':
        return formData.weight > 0
      case 'steps':
        return formData.steps.some(s => s > 0)
      case 'sleep':
        return formData.sleep.some(s => s > 0)
      default:
        return true
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{stepConfig[currentStep].label}</span>
          <span className="text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((step, i) => {
            const config = stepConfig[step]
            const isComplete = i < currentStepIndex
            const isCurrent = i === currentStepIndex
            return (
              <div
                key={step}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all',
                  isComplete ? config.color : isCurrent ? 'bg-muted-foreground/50' : 'bg-muted'
                )}
              />
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 'weight' && (
            <WeightInput
              value={formData.weight}
              unit={formData.weightUnit}
              previousWeight={previousWeight}
              onChange={(weight) => setFormData({ ...formData, weight })}
              onUnitChange={(unit) => setFormData({ ...formData, weightUnit: unit })}
            />
          )}

          {currentStep === 'steps' && (
            <StepsBreakdown
              values={formData.steps}
              onChange={(steps) => setFormData({ ...formData, steps })}
            />
          )}

          {currentStep === 'sleep' && (
            <SleepBreakdown
              values={formData.sleep}
              onChange={(sleep) => setFormData({ ...formData, sleep })}
            />
          )}

          {currentStep === 'supplements' && (
            <SupplementComplianceForm
              supplements={formData.supplements}
              onChange={(supplements) => setFormData({ ...formData, supplements })}
            />
          )}

          {currentStep === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes for your coach (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How are you feeling? Any challenges this week? Questions for your coach?"
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Progress photos (optional)
                </label>
                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                  <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Review your check-in</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Weight</span>
                  </div>
                  <p className="text-xl font-bold">
                    {formData.weight} {formData.weightUnit}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-500/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Footprints className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Avg Steps</span>
                  </div>
                  <p className="text-xl font-bold">
                    {Math.round(formData.steps.reduce((a, b) => a + b, 0) / formData.steps.filter(s => s > 0).length || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-violet-500/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="h-4 w-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Avg Sleep</span>
                  </div>
                  <p className="text-xl font-bold">
                    {(formData.sleep.reduce((a, b) => a + b, 0) / formData.sleep.filter(s => s > 0).length || 0).toFixed(1)} hrs
                  </p>
                </div>

                <div className="rounded-lg bg-amber-500/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Supplements</span>
                  </div>
                  <p className="text-xl font-bold">
                    {Math.round((formData.supplements.filter(s => s.taken).length / formData.supplements.length) * 100 || 0)}%
                  </p>
                </div>
              </div>

              {formData.notes && (
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{formData.notes}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            currentStepIndex === 0
              ? 'text-muted-foreground/50 cursor-not-allowed'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {currentStep === 'review' ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Submit Check-In
              </>
            )}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
              canProceed()
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export type { CheckInFormData }
