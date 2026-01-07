'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useCreateUserProgramme, type ProgrammeRotationType } from '@/hooks/athlete'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface CreateProgrammeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateProgrammeModal({ isOpen, onClose }: CreateProgrammeModalProps) {
  const router = useRouter()
  const createMutation = useCreateUserProgramme()
  const [formData, setFormData] = useState<{
    name: string
    description: string
    durationWeeks: number
    rotationType: ProgrammeRotationType
  }>({
    name: '',
    description: '',
    durationWeeks: 4,
    rotationType: 'weeklyMapped',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter a programme name')
      return
    }

    if (formData.durationWeeks < 1 || formData.durationWeeks > 52) {
      toast.error('Duration must be between 1 and 52 weeks')
      return
    }

    try {
      const result = await createMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        durationWeeks: formData.durationWeeks,
        rotationType: formData.rotationType,
      })

      toast.success('Programme created successfully')

      // Reset form
      setFormData({ name: '', description: '', durationWeeks: 4, rotationType: 'weeklyMapped' })

      // Close modal
      onClose()

      // Navigate to the builder to add exercises
      router.push(`/athlete/training/programmes/${result.id}/edit`)
    } catch (error) {
      console.error('Error creating programme:', error)
      toast.error('Failed to create programme')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Create New Programme</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Programme Name */}
          <div>
            <Label htmlFor="name">
              Programme Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Strength Building Phase 1"
              className="mt-1.5"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What are the goals of this programme?"
              rows={3}
              className="mt-1.5"
            />
          </div>

          {/* Rotation Type */}
          <div>
            <Label className="mb-3 block">
              Programme Type <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-3">
              {/* Weekly Schedule Option */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  formData.rotationType === 'weeklyMapped'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="rotationType"
                  value="weeklyMapped"
                  checked={formData.rotationType === 'weeklyMapped'}
                  onChange={(e) => setFormData({ ...formData, rotationType: e.target.value as ProgrammeRotationType })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium">Weekly Schedule</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Days assigned to specific weekdays (Mon, Tue, Wed, etc.). Shows today&apos;s scheduled workout.
                  </p>
                </div>
              </label>

              {/* Sequential Rotation Option */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  formData.rotationType === 'sequential'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="rotationType"
                  value="sequential"
                  checked={formData.rotationType === 'sequential'}
                  onChange={(e) => setFormData({ ...formData, rotationType: e.target.value as ProgrammeRotationType })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium">Sequential Rotation</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Goes through days in order (Day 1 → Day 2 → Day 3 → repeat). Next workout is based on last completed session.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration">
              Duration (Weeks) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={52}
              value={formData.durationWeeks}
              onChange={(e) => setFormData({ ...formData, durationWeeks: parseInt(e.target.value) || 1 })}
              className="mt-1.5"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              How many weeks will this programme run? (1-52 weeks)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Creating...
                </>
              ) : (
                'Create Programme'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
