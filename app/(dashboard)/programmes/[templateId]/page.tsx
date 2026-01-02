'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Layers,
  Pencil,
  Copy,
  Trash2,
  Play,
  Globe,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { ProgrammeTypeBadge, DifficultyBadge } from '@/components/programmes/programme-type-badge'
import { useProgramme, useDuplicateProgramme, useDeleteProgramme, useUpdateProgrammeTemplate } from '@/hooks/use-programmes'
import type { TrainingDay, ProgrammeExercise } from '@/types'

// Parse training days from content JSON
function getTrainingDays(content: Record<string, unknown>): TrainingDay[] {
  if (!content || typeof content !== 'object') return []
  const trainingDays = content.trainingDays as TrainingDay[] | undefined
  return trainingDays ?? []
}

export default function ProgrammeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.templateId as string

  const { data: programme, isLoading } = useProgramme(templateId)
  const duplicateProgramme = useDuplicateProgramme()
  const deleteProgramme = useDeleteProgramme()
  const updateProgramme = useUpdateProgrammeTemplate()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDuplicate = async () => {
    try {
      const newProgramme = await duplicateProgramme.mutateAsync(templateId)
      toast.success('Programme duplicated')
      router.push(`/programmes/${newProgramme.id}`)
    } catch {
      toast.error('Failed to duplicate programme')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProgramme.mutateAsync(templateId)
      toast.success('Programme deleted')
      router.push('/programmes')
    } catch {
      toast.error('Failed to delete programme')
    }
  }

  const handleTogglePublic = async () => {
    try {
      await updateProgramme.mutateAsync({
        templateId,
        isPublic: !programme?.isPublic,
      })
      toast.success(programme?.isPublic ? 'Programme made private' : 'Programme made public')
    } catch {
      toast.error('Failed to update programme')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Programme" />
        <div className="p-4 lg:p-8">
          <div className="space-y-6">
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!programme) {
    return (
      <div className="min-h-screen">
        <TopBar title="Programme" />
        <div className="flex flex-col items-center justify-center p-8 py-24">
          <p className="text-muted-foreground">Programme not found</p>
          <Link href="/programmes" className="mt-4 text-amber-600 hover:text-amber-700">
            Back to programmes
          </Link>
        </div>
      </div>
    )
  }

  const trainingDays = getTrainingDays(programme.content)

  return (
    <div className="min-h-screen">
      <TopBar title={programme.name} />

      <div className="p-4 lg:p-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/programmes')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Programmes
        </Button>

        {/* Header card */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <ProgrammeTypeBadge type={programme.type} />
                <DifficultyBadge difficulty={programme.difficulty} />
                {programme.isPublic ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600">
                    <Globe className="h-3 w-3" />
                    Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Private
                  </span>
                )}
              </div>

              <h1 className="mb-2 text-2xl font-bold">{programme.name}</h1>

              {programme.description && (
                <p className="mb-4 text-muted-foreground">{programme.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{programme.durationWeeks} weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>{programme.daysPerWeek} days/week</span>
                </div>
                <div>
                  <span>Last updated </span>
                  {new Date(programme.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link href={`/programmes/assign?template=${programme.id}`}>
                <Button className="gap-2 bg-amber-500 text-white hover:bg-amber-600">
                  <Play className="h-4 w-4" />
                  Assign to Client
                </Button>
              </Link>
              <Link href={`/programmes/${programme.id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDuplicate} className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                onClick={handleTogglePublic}
                disabled={updateProgramme.isPending}
              >
                {programme.isPublic ? 'Make Private' : 'Make Public'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-red-600 hover:bg-red-500/10 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Programme"
          description={`Are you sure you want to delete "${programme.name}"? This will permanently remove the template. Any active client assignments will not be affected.`}
          confirmLabel="Delete"
          variant="destructive"
        />

        {/* Training days */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Training Schedule</h2>

          {trainingDays.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trainingDays.map((day: TrainingDay) => (
                <div
                  key={day.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">{day.name}</h3>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                      {day.type?.replace('_', ' ') || 'Training'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {day.exercises?.map((exercise: ProgrammeExercise, index: number) => (
                      <div
                        key={exercise.id || index}
                        className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{exercise.exerciseName}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">
                No training days configured yet.
              </p>
              <Link href={`/programmes/${programme.id}/edit`}>
                <Button variant="outline" className="mt-4">
                  Add Training Days
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
