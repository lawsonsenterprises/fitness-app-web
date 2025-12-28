'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Camera,
  Scale,
  Dumbbell,
  UtensilsCrossed,
  Heart,
  MessageSquare,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const steps = [
  { id: 'metrics', title: 'Metrics', icon: Scale },
  { id: 'wellness', title: 'Wellness', icon: Heart },
  { id: 'training', title: 'Training', icon: Dumbbell },
  { id: 'nutrition', title: 'Nutrition', icon: UtensilsCrossed },
  { id: 'photos', title: 'Photos', icon: Camera },
  { id: 'notes', title: 'Notes', icon: MessageSquare },
]

export default function NewCheckInPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    weight: '',
    waist: '',
    sleep: 7,
    energy: 7,
    stress: 3,
    mood: 7,
    workoutsCompleted: 4,
    workoutsPlanned: 5,
    trainingNotes: '',
    adherence: 90,
    hungerLevel: 5,
    nutritionNotes: '',
    photos: [] as File[],
    generalNotes: '',
    questionsForCoach: '',
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success('Check-in submitted successfully!')
      router.push('/athlete/check-ins')
    } catch {
      toast.error('Failed to submit check-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/athlete/check-ins"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Check-in</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Week of {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const StepIcon = step.icon
          const isComplete = idx < currentStep
          const isCurrent = idx === currentStep

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                disabled={idx > currentStep}
                className={cn(
                  'flex flex-col items-center gap-1',
                  idx > currentStep && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                  isComplete && 'bg-green-500 text-white',
                  isCurrent && 'bg-amber-500 text-white',
                  !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                )}>
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.title}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div className={cn(
                  'w-8 md:w-12 h-0.5 mx-1',
                  idx < currentStep ? 'bg-green-500' : 'bg-muted'
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Body Metrics</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g., 76.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Waist measurement (cm) <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  placeholder="e.g., 82"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Wellness</h2>

            <div className="space-y-4">
              <SliderField
                label="Average sleep (hours)"
                value={formData.sleep}
                min={4}
                max={10}
                step={0.5}
                onChange={(value) => setFormData({ ...formData, sleep: value })}
                displayValue={`${formData.sleep}h`}
              />

              <SliderField
                label="Energy levels"
                value={formData.energy}
                min={1}
                max={10}
                onChange={(value) => setFormData({ ...formData, energy: value })}
                displayValue={`${formData.energy}/10`}
              />

              <SliderField
                label="Stress levels"
                value={formData.stress}
                min={1}
                max={10}
                onChange={(value) => setFormData({ ...formData, stress: value })}
                displayValue={`${formData.stress}/10`}
                inverted
              />

              <SliderField
                label="Overall mood"
                value={formData.mood}
                min={1}
                max={10}
                onChange={(value) => setFormData({ ...formData, mood: value })}
                displayValue={`${formData.mood}/10`}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Training</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Workouts completed
                </label>
                <Input
                  type="number"
                  value={formData.workoutsCompleted}
                  onChange={(e) => setFormData({ ...formData, workoutsCompleted: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Workouts planned
                </label>
                <Input
                  type="number"
                  value={formData.workoutsPlanned}
                  onChange={(e) => setFormData({ ...formData, workoutsPlanned: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Training notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={formData.trainingNotes}
                onChange={(e) => setFormData({ ...formData, trainingNotes: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                placeholder="Any highlights, challenges, or PRs this week?"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Nutrition</h2>

            <SliderField
              label="Adherence to meal plan"
              value={formData.adherence}
              min={0}
              max={100}
              step={5}
              onChange={(value) => setFormData({ ...formData, adherence: value })}
              displayValue={`${formData.adherence}%`}
            />

            <SliderField
              label="Hunger levels"
              value={formData.hungerLevel}
              min={1}
              max={10}
              onChange={(value) => setFormData({ ...formData, hungerLevel: value })}
              displayValue={`${formData.hungerLevel}/10`}
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                Nutrition notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={formData.nutritionNotes}
                onChange={(e) => setFormData({ ...formData, nutritionNotes: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                placeholder="How did your nutrition feel this week? Any cravings or challenges?"
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Progress Photos</h2>
            <p className="text-sm text-muted-foreground">
              Upload front, side, and back photos for your coach to review progress.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {['Front', 'Side', 'Back'].map((position) => (
                <div
                  key={position}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors cursor-pointer"
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">{position}</span>
                  <span className="text-xs text-muted-foreground">Click to upload</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Photos are optional but help your coach track visual progress.
            </p>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Additional Notes</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                General notes
              </label>
              <textarea
                rows={4}
                value={formData.generalNotes}
                onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                placeholder="Anything else you want to share about your week?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Questions for your coach
              </label>
              <textarea
                rows={3}
                value={formData.questionsForCoach}
                onChange={(e) => setFormData({ ...formData, questionsForCoach: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                placeholder="Any questions or concerns?"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Submit Check-in
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  displayValue: string
  inverted?: boolean
}

function SliderField({ label, value, min, max, step = 1, onChange, displayValue, inverted }: SliderFieldProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm font-bold">{displayValue}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${inverted ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)'} 0%, ${inverted ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)'} ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`,
          }}
        />
      </div>
    </div>
  )
}
