'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Dumbbell,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateProgramme } from '@/hooks/use-programmes'
import type { ProgrammeType, ProgrammeDifficulty, TrainingDay, ProgrammeExercise } from '@/types'

const programmeTypes: { value: ProgrammeType; label: string }[] = [
  { value: 'strength', label: 'Strength' },
  { value: 'hypertrophy', label: 'Hypertrophy' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'sport_specific', label: 'Sport Specific' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'custom', label: 'Custom' },
]

const difficultyLevels: { value: ProgrammeDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'elite', label: 'Elite' },
]

function createEmptyDay(dayNumber: number): TrainingDay {
  return {
    id: crypto.randomUUID(),
    weekId: '',
    dayNumber,
    name: `Day ${dayNumber}`,
    type: 'training',
    exercises: [],
  }
}

function createEmptyExercise(sortOrder: number): ProgrammeExercise {
  return {
    id: crypto.randomUUID(),
    exerciseId: '',
    exerciseName: '',
    sets: 3,
    reps: '8-12',
    rpeTarget: undefined,
    restSeconds: 90,
    notes: undefined,
    sortOrder,
  }
}

export default function NewProgrammePage() {
  const router = useRouter()
  const createProgramme = useCreateProgramme()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ProgrammeType>('hypertrophy')
  const [difficulty, setDifficulty] = useState<ProgrammeDifficulty>('intermediate')
  const [durationWeeks, setDurationWeeks] = useState(8)
  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [isPublic, setIsPublic] = useState(false)
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([
    createEmptyDay(1),
    createEmptyDay(2),
    createEmptyDay(3),
    createEmptyDay(4),
  ])

  const handleDaysPerWeekChange = (newDays: number) => {
    setDaysPerWeek(newDays)
    if (newDays > trainingDays.length) {
      // Add new days
      const newTrainingDays = [...trainingDays]
      for (let i = trainingDays.length + 1; i <= newDays; i++) {
        newTrainingDays.push(createEmptyDay(i))
      }
      setTrainingDays(newTrainingDays)
    } else if (newDays < trainingDays.length) {
      // Remove excess days
      setTrainingDays(trainingDays.slice(0, newDays))
    }
  }

  const updateDay = (dayId: string, updates: Partial<TrainingDay>) => {
    setTrainingDays(
      trainingDays.map((day) =>
        day.id === dayId ? { ...day, ...updates } : day
      )
    )
  }

  const addExercise = (dayId: string) => {
    setTrainingDays(
      trainingDays.map((day) => {
        if (day.id === dayId) {
          const newExercise = createEmptyExercise(day.exercises.length)
          return { ...day, exercises: [...day.exercises, newExercise] }
        }
        return day
      })
    )
  }

  const updateExercise = (
    dayId: string,
    exerciseId: string,
    updates: Partial<ProgrammeExercise>
  ) => {
    setTrainingDays(
      trainingDays.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex
            ),
          }
        }
        return day
      })
    )
  }

  const removeExercise = (dayId: string, exerciseId: string) => {
    setTrainingDays(
      trainingDays.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
          }
        }
        return day
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter a programme name')
      return
    }

    try {
      const programme = await createProgramme.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        difficulty,
        durationWeeks,
        daysPerWeek,
        isTemplate: true,
        isPublic,
        tags: [],
        content: { trainingDays },
      })

      toast.success('Programme created successfully')
      router.push(`/programmes/${programme.id}`)
    } catch (error) {
      console.error('Failed to create programme:', error)
      toast.error('Failed to create programme')
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="New Programme" />

      <div className="p-4 lg:p-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/programmes')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Programmes
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Programme Details</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Programme Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., 12-Week Strength Builder"
                  className="mt-1.5"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the programme goals, target audience, and methodology..."
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <Label htmlFor="type">Programme Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ProgrammeType)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {programmeTypes.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as ProgrammeDifficulty)
                  }
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {difficultyLevels.map((dl) => (
                    <option key={dl.value} value={dl.value}>
                      {dl.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (Weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="daysPerWeek">Training Days per Week</Label>
                <Input
                  id="daysPerWeek"
                  type="number"
                  min={1}
                  max={7}
                  value={daysPerWeek}
                  onChange={(e) =>
                    handleDaysPerWeekChange(parseInt(e.target.value) || 1)
                  }
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-amber-500 focus:ring-amber-500"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this programme publicly visible
                </Label>
              </div>
            </div>
          </div>

          {/* Training Days */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Training Schedule</h2>
            <p className="text-sm text-muted-foreground">
              Configure the exercises for each training day. These will be repeated each week.
            </p>

            <div className="space-y-4">
              {trainingDays.map((day, dayIndex) => (
                <div
                  key={day.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={day.name}
                        onChange={(e) =>
                          updateDay(day.id, { name: e.target.value })
                        }
                        className="h-8 w-40 font-medium"
                        placeholder={`Day ${dayIndex + 1}`}
                      />
                      <select
                        value={day.type}
                        onChange={(e) =>
                          updateDay(day.id, { type: e.target.value })
                        }
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                      >
                        <option value="training">Training</option>
                        <option value="upper_body">Upper Body</option>
                        <option value="lower_body">Lower Body</option>
                        <option value="push">Push</option>
                        <option value="pull">Pull</option>
                        <option value="legs">Legs</option>
                        <option value="full_body">Full Body</option>
                        <option value="cardio">Cardio</option>
                        <option value="recovery">Recovery</option>
                      </select>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Exercises */}
                  <div className="p-4">
                    {day.exercises.length > 0 ? (
                      <div className="space-y-3">
                        {day.exercises.map((exercise, exIndex) => (
                          <div
                            key={exercise.id}
                            className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {exIndex + 1}
                            </span>
                            <div className="grid flex-1 gap-2 sm:grid-cols-5">
                              <div className="sm:col-span-2">
                                <Input
                                  value={exercise.exerciseName}
                                  onChange={(e) =>
                                    updateExercise(day.id, exercise.id, {
                                      exerciseName: e.target.value,
                                    })
                                  }
                                  placeholder="Exercise name"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  min={1}
                                  value={exercise.sets}
                                  onChange={(e) =>
                                    updateExercise(day.id, exercise.id, {
                                      sets: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  placeholder="Sets"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Input
                                  value={exercise.reps}
                                  onChange={(e) =>
                                    updateExercise(day.id, exercise.id, {
                                      reps: e.target.value,
                                    })
                                  }
                                  placeholder="Reps (e.g., 8-12)"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  min={0}
                                  max={10}
                                  value={exercise.rpeTarget || ''}
                                  onChange={(e) =>
                                    updateExercise(day.id, exercise.id, {
                                      rpeTarget: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                    })
                                  }
                                  placeholder="RPE"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExercise(day.id, exercise.id)}
                              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Dumbbell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No exercises added yet
                        </p>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addExercise(day.id)}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Exercise
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Link href="/programmes">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createProgramme.isPending}
              className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
            >
              {createProgramme.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create Programme
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
