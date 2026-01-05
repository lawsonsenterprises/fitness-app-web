'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createCustomExercise, type CreateExerciseInput } from '@/app/actions/create-custom-exercise'
import { cn } from '@/lib/utils'

const muscleGroups = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'abs', label: 'Abs' },
  { value: 'core', label: 'Core' },
  { value: 'quadriceps', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'full_body', label: 'Full Body' },
]

const equipmentOptions = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'cable', label: 'Cable' },
  { value: 'machine', label: 'Machine' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'resistance_band', label: 'Resistance Band' },
  { value: 'smith_machine', label: 'Smith Machine' },
  { value: 'other', label: 'Other' },
]

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const typeOptions = [
  { value: 'compound', label: 'Compound' },
  { value: 'isolation', label: 'Isolation' },
]

export default function NewExercisePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateExerciseInput>({
    name: '',
    primaryMuscle: 'chest',
    secondaryMuscles: [],
    equipment: 'barbell',
    difficulty: 'intermediate',
    type: 'compound',
    youtubeUrl: '',
    description: '',
    instructions: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setFieldErrors({})
    setSuccessMessage(null)

    const result = await createCustomExercise(formData)

    if (result.error) {
      setError(result.error)
      if (result.details) {
        setFieldErrors(result.details as Record<string, string[]>)
      }
      setIsSubmitting(false)
      return
    }

    setSuccessMessage('Custom exercise created successfully!')
    setIsSubmitting(false)

    // Redirect to exercise library after a short delay
    setTimeout(() => {
      router.push('/dashboard/exercises')
    }, 1500)
  }

  const updateField = <K extends keyof CreateExerciseInput>(
    field: K,
    value: CreateExerciseInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/exercises"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Custom Exercise</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a custom exercise to your library
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          {/* Exercise Name */}
          <div>
            <label htmlFor="name" className="text-sm font-medium block mb-2">
              Exercise Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Barbell Bench Press"
              className={cn(
                'w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors',
                fieldErrors.name ? 'border-rose-500' : 'border-border focus:border-blue-500'
              )}
            />
            {fieldErrors.name && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Primary Muscle Group */}
          <div>
            <label htmlFor="primaryMuscle" className="text-sm font-medium block mb-2">
              Primary Muscle Group <span className="text-rose-500">*</span>
            </label>
            <select
              id="primaryMuscle"
              value={formData.primaryMuscle}
              onChange={(e) =>
                updateField('primaryMuscle', e.target.value as CreateExerciseInput['primaryMuscle'])
              }
              className={cn(
                'w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors',
                fieldErrors.primaryMuscle
                  ? 'border-rose-500'
                  : 'border-border focus:border-blue-500'
              )}
            >
              {muscleGroups.map((muscle) => (
                <option key={muscle.value} value={muscle.value}>
                  {muscle.label}
                </option>
              ))}
            </select>
            {fieldErrors.primaryMuscle && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.primaryMuscle[0]}</p>
            )}
          </div>

          {/* Equipment */}
          <div>
            <label htmlFor="equipment" className="text-sm font-medium block mb-2">
              Equipment <span className="text-rose-500">*</span>
            </label>
            <select
              id="equipment"
              value={formData.equipment}
              onChange={(e) =>
                updateField('equipment', e.target.value as CreateExerciseInput['equipment'])
              }
              className={cn(
                'w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors',
                fieldErrors.equipment ? 'border-rose-500' : 'border-border focus:border-blue-500'
              )}
            >
              {equipmentOptions.map((eq) => (
                <option key={eq.value} value={eq.value}>
                  {eq.label}
                </option>
              ))}
            </select>
            {fieldErrors.equipment && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.equipment[0]}</p>
            )}
          </div>

          {/* Type and Difficulty */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="text-sm font-medium block mb-2">
                Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  updateField('type', e.target.value as CreateExerciseInput['type'])
                }
                className={cn(
                  'w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors',
                  fieldErrors.type ? 'border-rose-500' : 'border-border focus:border-blue-500'
                )}
              >
                {typeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {fieldErrors.type && (
                <p className="text-xs text-rose-500 mt-1">{fieldErrors.type[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="difficulty" className="text-sm font-medium block mb-2">
                Difficulty <span className="text-rose-500">*</span>
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) =>
                  updateField('difficulty', e.target.value as CreateExerciseInput['difficulty'])
                }
                className={cn(
                  'w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors',
                  fieldErrors.difficulty
                    ? 'border-rose-500'
                    : 'border-border focus:border-blue-500'
                )}
              >
                {difficultyOptions.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
              {fieldErrors.difficulty && (
                <p className="text-xs text-rose-500 mt-1">{fieldErrors.difficulty[0]}</p>
              )}
            </div>
          </div>

          {/* YouTube URL */}
          <div>
            <label htmlFor="youtubeUrl" className="text-sm font-medium block mb-2">
              YouTube Video URL <span className="text-muted-foreground">(Optional)</span>
            </label>
            <input
              id="youtubeUrl"
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => updateField('youtubeUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={cn(
                'w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors',
                fieldErrors.youtubeUrl
                  ? 'border-rose-500'
                  : 'border-border focus:border-blue-500'
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add a YouTube link for video demonstration (unlimited plays)
            </p>
            {fieldErrors.youtubeUrl && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.youtubeUrl[0]}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="text-sm font-medium block mb-2">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what this exercise targets and its benefits..."
              rows={3}
              className={cn(
                'w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors resize-none',
                fieldErrors.description
                  ? 'border-rose-500'
                  : 'border-border focus:border-blue-500'
              )}
            />
            {fieldErrors.description && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.description[0]}</p>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label htmlFor="instructions" className="text-sm font-medium block mb-2">
              Instructions <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => updateField('instructions', e.target.value)}
              placeholder="Enter step-by-step instructions (one per line)&#10;1. Set up the bench...&#10;2. Grip the bar...&#10;3. Lower the bar to chest..."
              rows={6}
              className={cn(
                'w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors resize-none font-mono',
                fieldErrors.instructions
                  ? 'border-rose-500'
                  : 'border-border focus:border-blue-500'
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter each step on a new line
            </p>
            {fieldErrors.instructions && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.instructions[0]}</p>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && !Object.keys(fieldErrors).length && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4">
            <p className="text-sm text-rose-600 font-medium">{error}</p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <p className="text-sm text-emerald-600 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/exercises"
            className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Exercise'}
          </button>
        </div>
      </form>
    </div>
  )
}
