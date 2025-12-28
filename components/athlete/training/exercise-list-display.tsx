'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  Play,
  Check,
  Clock,
  Info,
  ExternalLink,
  Dumbbell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseSet {
  setNumber: number
  targetReps: string
  targetWeight?: string
  actualReps?: number
  actualWeight?: string
  rpe?: number
  completed: boolean
}

interface ExerciseItem {
  id: string
  name: string
  muscleGroup: string
  sets: ExerciseSet[]
  restSeconds: number
  notes?: string
  videoUrl?: string
  supersetWith?: string
  completed: boolean
}

interface ExerciseListDisplayProps {
  exercises: ExerciseItem[]
  onSetComplete?: (exerciseId: string, setNumber: number, data: Partial<ExerciseSet>) => void
  onExerciseComplete?: (exerciseId: string) => void
  readOnly?: boolean
}

const muscleGroupColors: Record<string, string> = {
  chest: 'bg-rose-500/10 text-rose-600',
  back: 'bg-blue-500/10 text-blue-600',
  shoulders: 'bg-purple-500/10 text-purple-600',
  biceps: 'bg-orange-500/10 text-orange-600',
  triceps: 'bg-amber-500/10 text-amber-600',
  legs: 'bg-emerald-500/10 text-emerald-600',
  quads: 'bg-emerald-500/10 text-emerald-600',
  hamstrings: 'bg-teal-500/10 text-teal-600',
  glutes: 'bg-pink-500/10 text-pink-600',
  core: 'bg-indigo-500/10 text-indigo-600',
  abs: 'bg-indigo-500/10 text-indigo-600',
  calves: 'bg-cyan-500/10 text-cyan-600',
}

function SetRow({
  set,
  exerciseId,
  onComplete,
  readOnly,
}: {
  set: ExerciseSet
  exerciseId: string
  onComplete?: (data: Partial<ExerciseSet>) => void
  readOnly?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [reps, setReps] = useState(set.actualReps?.toString() || '')
  const [weight, setWeight] = useState(set.actualWeight || '')

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        actualReps: reps ? parseInt(reps) : undefined,
        actualWeight: weight || undefined,
        completed: true,
      })
    }
    setEditing(false)
  }

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-2 items-center rounded-lg px-3 py-2 transition-colors',
        set.completed ? 'bg-emerald-500/5' : 'bg-muted/30'
      )}
    >
      {/* Set number */}
      <div className="col-span-1">
        <span className={cn(
          'text-sm font-medium',
          set.completed ? 'text-emerald-600' : 'text-muted-foreground'
        )}>
          {set.setNumber}
        </span>
      </div>

      {/* Target */}
      <div className="col-span-3">
        <p className="text-sm">
          <span className="font-medium">{set.targetReps}</span>
          {set.targetWeight && (
            <span className="text-muted-foreground"> @ {set.targetWeight}</span>
          )}
        </p>
      </div>

      {/* Actual / Input */}
      <div className="col-span-5">
        {readOnly ? (
          set.completed && (
            <p className="text-sm">
              <span className="font-medium">{set.actualReps || '—'}</span>
              {set.actualWeight && (
                <span className="text-muted-foreground"> @ {set.actualWeight}</span>
              )}
              {set.rpe && (
                <span className="text-amber-600 ml-2">RPE {set.rpe}</span>
              )}
            </p>
          )
        ) : editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="Reps"
              className="w-16 rounded border border-border bg-background px-2 py-1 text-sm"
            />
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight"
              className="w-20 rounded border border-border bg-background px-2 py-1 text-sm"
            />
          </div>
        ) : set.completed ? (
          <p className="text-sm">
            <span className="font-medium">{set.actualReps || '—'}</span>
            {set.actualWeight && (
              <span className="text-muted-foreground"> @ {set.actualWeight}</span>
            )}
          </p>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Log set...
          </button>
        )}
      </div>

      {/* Status / Action */}
      <div className="col-span-3 flex justify-end">
        {readOnly ? (
          set.completed && <Check className="h-4 w-4 text-emerald-500" />
        ) : editing ? (
          <button
            onClick={handleComplete}
            className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            Done
          </button>
        ) : set.completed ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80 transition-colors"
          >
            <Play className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}

function ExerciseCard({
  exercise,
  index,
  onSetComplete,
  onExerciseComplete,
  readOnly,
}: {
  exercise: ExerciseItem
  index: number
  onSetComplete?: (exerciseId: string, setNumber: number, data: Partial<ExerciseSet>) => void
  onExerciseComplete?: (exerciseId: string) => void
  readOnly?: boolean
}) {
  const [expanded, setExpanded] = useState(!exercise.completed)
  const completedSets = exercise.sets.filter(s => s.completed).length
  const totalSets = exercise.sets.length
  const muscleColor = muscleGroupColors[exercise.muscleGroup.toLowerCase()] || 'bg-muted text-muted-foreground'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-xl border overflow-hidden',
        exercise.completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card'
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            exercise.completed ? 'bg-emerald-500/20' : 'bg-muted/50'
          )}>
            {exercise.completed ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{exercise.name}</p>
              {exercise.supersetWith && (
                <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-xs font-medium text-violet-600">
                  Superset
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium capitalize', muscleColor)}>
                {exercise.muscleGroup}
              </span>
              <span className="text-xs text-muted-foreground">
                {completedSets}/{totalSets} sets
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {exercise.restSeconds}s rest
          </div>
          {exercise.videoUrl && (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Notes */}
              {exercise.notes && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 p-3">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-600">{exercise.notes}</p>
                </div>
              )}

              {/* Sets header */}
              <div className="grid grid-cols-12 gap-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">Set</div>
                <div className="col-span-3">Target</div>
                <div className="col-span-5">Actual</div>
                <div className="col-span-3 text-right">Status</div>
              </div>

              {/* Sets */}
              <div className="space-y-2">
                {exercise.sets.map((set) => (
                  <SetRow
                    key={set.setNumber}
                    set={set}
                    exerciseId={exercise.id}
                    onComplete={
                      onSetComplete
                        ? (data) => onSetComplete(exercise.id, set.setNumber, data)
                        : undefined
                    }
                    readOnly={readOnly}
                  />
                ))}
              </div>

              {/* Mark complete button */}
              {!readOnly && !exercise.completed && completedSets === totalSets && (
                <button
                  onClick={() => onExerciseComplete?.(exercise.id)}
                  className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                >
                  Complete Exercise
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ExerciseListDisplay({
  exercises,
  onSetComplete,
  onExerciseComplete,
  readOnly = false,
}: ExerciseListDisplayProps) {
  const completedExercises = exercises.filter(e => e.completed).length
  const totalExercises = exercises.length

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
        <span className="text-sm font-medium">
          {completedExercises} of {totalExercises} exercises complete
        </span>
        <div className="w-32">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(completedExercises / totalExercises) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {exercises.map((exercise, i) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={i}
            onSetComplete={onSetComplete}
            onExerciseComplete={onExerciseComplete}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  )
}

export type { ExerciseItem, ExerciseSet }
