'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Scale,
  Dumbbell,
  Footprints,
  Moon,
  Droplets,
  Flame,
  Save,
  Loader2,
  Check,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GoalsData {
  targetWeight?: number
  weeklyWorkouts?: number
  dailySteps?: number
  sleepHours?: number
  waterIntake?: number // litres
  dailyCalories?: number
  proteinTarget?: number // grams
  primaryGoal?: 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_fitness' | 'competition_prep'
}

interface GoalsFormProps {
  initialData: GoalsData
  onSave: (data: GoalsData) => Promise<void>
  currentWeight?: number
}

const primaryGoals = [
  { value: 'lose_weight' as const, label: 'Lose Weight', icon: Scale, color: 'text-blue-500' },
  { value: 'build_muscle' as const, label: 'Build Muscle', icon: Dumbbell, color: 'text-orange-500' },
  { value: 'maintain' as const, label: 'Maintain', icon: Target, color: 'text-emerald-500' },
  { value: 'improve_fitness' as const, label: 'Improve Fitness', icon: Flame, color: 'text-rose-500' },
  { value: 'competition_prep' as const, label: 'Competition Prep', icon: Target, color: 'text-violet-500' },
]

interface NumberInputProps {
  label: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  icon: typeof Target
  unit: string
  min?: number
  max?: number
  step?: number
  suggestion?: string
}

function NumberInput({
  label,
  value,
  onChange,
  icon: Icon,
  unit,
  min = 0,
  max = 10000,
  step = 1,
  suggestion,
}: NumberInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : undefined)
          }
          min={min}
          max={max}
          step={step}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-16 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
      {suggestion && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {suggestion}
        </p>
      )}
    </div>
  )
}

export function GoalsForm({
  initialData,
  onSave,
  currentWeight,
}: GoalsFormProps) {
  const [formData, setFormData] = useState<GoalsData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const updateField = <K extends keyof GoalsData>(
    field: K,
    value: GoalsData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      await onSave(formData)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save goals:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate weight difference if target set
  const weightDiff = currentWeight && formData.targetWeight
    ? formData.targetWeight - currentWeight
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Primary Goal */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Primary Goal</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {primaryGoals.map((goal) => {
            const Icon = goal.icon
            const isSelected = formData.primaryGoal === goal.value
            return (
              <motion.button
                key={goal.value}
                type="button"
                onClick={() => updateField('primaryGoal', goal.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <Icon className={cn('h-6 w-6', isSelected ? 'text-blue-500' : goal.color)} />
                <span className={cn(
                  'text-xs font-medium text-center',
                  isSelected ? 'text-blue-500' : ''
                )}>
                  {goal.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Weight Goal */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Weight Goal</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <NumberInput
              label="Target Weight"
              value={formData.targetWeight}
              onChange={(v) => updateField('targetWeight', v)}
              icon={Scale}
              unit="kg"
              min={30}
              max={200}
              step={0.1}
            />
            {weightDiff !== null && (
              <div className={cn(
                'mt-3 rounded-lg p-3 text-sm',
                weightDiff > 0 ? 'bg-orange-500/10 text-orange-600' :
                weightDiff < 0 ? 'bg-emerald-500/10 text-emerald-600' :
                'bg-blue-500/10 text-blue-600'
              )}>
                {weightDiff > 0 ? (
                  <span>Gain {weightDiff.toFixed(1)} kg from current weight</span>
                ) : weightDiff < 0 ? (
                  <span>Lose {Math.abs(weightDiff).toFixed(1)} kg from current weight</span>
                ) : (
                  <span>Maintain current weight</span>
                )}
              </div>
            )}
          </div>
          {currentWeight && (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
                <p className="text-3xl font-bold">{currentWeight} kg</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Goals */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Activity Goals</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <NumberInput
            label="Weekly Workouts"
            value={formData.weeklyWorkouts}
            onChange={(v) => updateField('weeklyWorkouts', v)}
            icon={Dumbbell}
            unit="sessions"
            min={1}
            max={14}
            suggestion="Recommended: 3-5 sessions per week"
          />
          <NumberInput
            label="Daily Steps"
            value={formData.dailySteps}
            onChange={(v) => updateField('dailySteps', v)}
            icon={Footprints}
            unit="steps"
            min={1000}
            max={30000}
            step={1000}
            suggestion="Recommended: 8,000-10,000 steps"
          />
        </div>
      </div>

      {/* Lifestyle Goals */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Lifestyle Goals</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <NumberInput
            label="Sleep Hours"
            value={formData.sleepHours}
            onChange={(v) => updateField('sleepHours', v)}
            icon={Moon}
            unit="hours"
            min={4}
            max={12}
            step={0.5}
            suggestion="Recommended: 7-9 hours"
          />
          <NumberInput
            label="Water Intake"
            value={formData.waterIntake}
            onChange={(v) => updateField('waterIntake', v)}
            icon={Droplets}
            unit="litres"
            min={1}
            max={6}
            step={0.5}
            suggestion="Recommended: 2-3 litres"
          />
        </div>
      </div>

      {/* Nutrition Goals */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Nutrition Goals</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <NumberInput
            label="Daily Calories"
            value={formData.dailyCalories}
            onChange={(v) => updateField('dailyCalories', v)}
            icon={Flame}
            unit="kcal"
            min={1000}
            max={6000}
            step={50}
          />
          <NumberInput
            label="Protein Target"
            value={formData.proteinTarget}
            onChange={(v) => updateField('proteinTarget', v)}
            icon={Target}
            unit="g"
            min={50}
            max={400}
            step={5}
            suggestion="Recommended: 1.6-2.2g per kg bodyweight"
          />
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors',
          isSaved
            ? 'bg-emerald-500 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : isSaved ? (
          <>
            <Check className="h-4 w-4" />
            Saved!
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Goals
          </>
        )}
      </motion.button>
    </form>
  )
}

export type { GoalsData, GoalsFormProps }
