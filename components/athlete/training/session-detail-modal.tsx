'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseSet {
  setNumber: number
  reps: number
  weight: number
  rpe?: number
  completed: boolean
}

interface ExerciseDetail {
  name: string
  targetSets: number
  targetReps: string
  targetWeight?: string
  sets: ExerciseSet[]
  notes?: string
}

interface SessionDetail {
  id: string
  date: Date
  sessionName: string
  type: string
  duration: number
  totalVolume: number
  exercises: ExerciseDetail[]
  notes?: string
  previousSession?: {
    date: Date
    totalVolume: number
  }
}

interface SessionDetailModalProps {
  session: SessionDetail | null
  isOpen: boolean
  onClose: () => void
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
}: SessionDetailModalProps) {
  if (!session) return null

  const volumeChange = session.previousSession
    ? ((session.totalVolume - session.previousSession.totalVolume) /
        session.previousSession.totalVolume) *
      100
    : null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:inset-x-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                      {session.type}
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold">{session.sessionName}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {session.date.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {session.duration} min
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Exercises</p>
                  <p className="mt-1 text-lg font-bold">{session.exercises.length}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Volume</p>
                  <p className="mt-1 text-lg font-bold">
                    {Math.round(session.totalVolume).toLocaleString()} kg
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">vs Previous</p>
                  <p
                    className={cn(
                      'mt-1 flex items-center justify-center gap-1 text-lg font-bold',
                      volumeChange && volumeChange > 0 && 'text-emerald-500',
                      volumeChange && volumeChange < 0 && 'text-rose-500'
                    )}
                  >
                    {volumeChange !== null ? (
                      <>
                        <TrendingUp className="h-4 w-4" />
                        {volumeChange > 0 ? '+' : ''}
                        {volumeChange.toFixed(1)}%
                      </>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[50vh] overflow-y-auto p-6">
              <div className="space-y-6">
                {session.exercises.map((exercise, exerciseIndex) => (
                  <motion.div
                    key={exercise.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: exerciseIndex * 0.05 }}
                    className="rounded-xl border border-border bg-muted/20 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                          <Dumbbell className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{exercise.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Target: {exercise.targetSets} × {exercise.targetReps}
                            {exercise.targetWeight && ` @ ${exercise.targetWeight}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sets table */}
                    <div className="overflow-hidden rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Set
                            </th>
                            <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                              Reps
                            </th>
                            <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                              Weight
                            </th>
                            <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                              RPE
                            </th>
                            <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                              Done
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {exercise.sets.map((set) => (
                            <tr key={set.setNumber} className="hover:bg-muted/20">
                              <td className="px-3 py-2 font-medium">{set.setNumber}</td>
                              <td className="px-3 py-2 text-center">{set.reps}</td>
                              <td className="px-3 py-2 text-center">{set.weight.toFixed(1)} kg</td>
                              <td className="px-3 py-2 text-center text-muted-foreground">
                                {set.rpe || '—'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {set.completed ? (
                                  <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                                ) : (
                                  <div className="mx-auto h-4 w-4 rounded-full border border-muted-foreground/30" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Exercise notes */}
                    {exercise.notes && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/30 p-2">
                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{exercise.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Session notes */}
              {session.notes && (
                <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Session Notes
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{session.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export type { SessionDetail, ExerciseDetail, ExerciseSet }
