'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCreateWorkoutItem, useUpdateWorkoutItem } from '@/hooks/use-programme-details'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface ExerciseConfigModalProps {
  isOpen: boolean
  onClose: () => void
  exercise: {
    id: string
    name: string
  }
  programmeDayId: string
  existingItem?: {
    itemId: string
    sets: number
    reps: string
    targetWeightKg: number | null
    restSeconds: number
    rpeTarget: number | null
    notes: string | null
  }
  onSave: () => void
}

export function ExerciseConfigModal({
  isOpen,
  onClose,
  exercise,
  programmeDayId,
  existingItem,
  onSave,
}: ExerciseConfigModalProps) {
  const createMutation = useCreateWorkoutItem()
  const updateMutation = useUpdateWorkoutItem()

  const [formData, setFormData] = useState({
    sets: existingItem?.sets || 3,
    reps: existingItem?.reps || '8-12',
    targetWeightKg: existingItem?.targetWeightKg?.toString() || '',
    restSeconds: existingItem?.restSeconds || 90,
    rpeTarget: existingItem?.rpeTarget?.toString() || '',
    notes: existingItem?.notes || '',
  })

  useEffect(() => {
    if (existingItem) {
      setFormData({
        sets: existingItem.sets,
        reps: existingItem.reps,
        targetWeightKg: existingItem.targetWeightKg?.toString() || '',
        restSeconds: existingItem.restSeconds,
        rpeTarget: existingItem.rpeTarget?.toString() || '',
        notes: existingItem.notes || '',
      })
    }
  }, [existingItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.sets < 1 || formData.sets > 10) {
      toast.error('Sets must be between 1 and 10')
      return
    }

    if (!formData.reps.trim()) {
      toast.error('Please enter reps')
      return
    }

    if (formData.restSeconds < 0) {
      toast.error('Rest period cannot be negative')
      return
    }

    if (formData.rpeTarget && (parseFloat(formData.rpeTarget) < 1 || parseFloat(formData.rpeTarget) > 10)) {
      toast.error('RPE must be between 1 and 10')
      return
    }

    try {
      if (existingItem) {
        // Update existing exercise
        await updateMutation.mutateAsync({
          itemId: existingItem.itemId,
          programmeDayId,
          sets: formData.sets,
          reps: formData.reps.trim(),
          targetWeightKg: formData.targetWeightKg ? parseFloat(formData.targetWeightKg) : null,
          restSeconds: formData.restSeconds,
          rpeTarget: formData.rpeTarget ? parseFloat(formData.rpeTarget) : null,
          notes: formData.notes.trim() || null,
        })
        toast.success('Exercise updated')
      } else {
        // Create new exercise
        await createMutation.mutateAsync({
          programmeDayId,
          exerciseId: exercise.id,
          sets: formData.sets,
          reps: formData.reps.trim(),
          targetWeightKg: formData.targetWeightKg ? parseFloat(formData.targetWeightKg) : undefined,
          restSeconds: formData.restSeconds,
          rpeTarget: formData.rpeTarget ? parseFloat(formData.rpeTarget) : undefined,
          notes: formData.notes.trim() || undefined,
        })
        toast.success('Exercise added')
      }

      onSave()
    } catch (error) {
      console.error('Error saving exercise:', error)
      toast.error('Failed to save exercise')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {existingItem ? 'Edit' : 'Configure'}: {exercise.name}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sets */}
          <div>
            <Label htmlFor="sets">
              Sets <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sets"
              type="number"
              min={1}
              max={10}
              value={formData.sets}
              onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 1 })}
              className="mt-1.5"
              required
            />
          </div>

          {/* Reps */}
          <div>
            <Label htmlFor="reps">
              Reps <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reps"
              value={formData.reps}
              onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
              placeholder='e.g., "8-12" or "10" or "AMRAP"'
              className="mt-1.5"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Enter a range (8-12), a number (10), or text (AMRAP)
            </p>
          </div>

          {/* Target Weight */}
          <div>
            <Label htmlFor="weight">Target Weight (Optional)</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                id="weight"
                type="number"
                step="0.5"
                min={0}
                value={formData.targetWeightKg}
                onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                placeholder="e.g., 60"
              />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
          </div>

          {/* Rest Period */}
          <div>
            <Label htmlFor="rest">Rest Period</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                id="rest"
                type="number"
                min={0}
                step={15}
                value={formData.restSeconds}
                onChange={(e) => setFormData({ ...formData, restSeconds: parseInt(e.target.value) || 0 })}
              />
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Typical: 60-90s for hypertrophy, 180-300s for strength
            </p>
          </div>

          {/* RPE Target */}
          <div>
            <Label htmlFor="rpe">RPE Target (Optional)</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                id="rpe"
                type="number"
                step="0.5"
                min={1}
                max={10}
                value={formData.rpeTarget}
                onChange={(e) => setFormData({ ...formData, rpeTarget: e.target.value })}
                placeholder="e.g., 8"
              />
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Rate of Perceived Exertion: 1 (very easy) to 10 (max effort)
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Focus on controlled tempo, pause at bottom"
              rows={2}
              className="mt-1.5"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {existingItem ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                existingItem ? 'Update Exercise' : 'Add Exercise'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
