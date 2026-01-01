'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Dumbbell,
  Target,
  Printer,
  Download,
  Check,
  FileText,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useProgrammeAssignment } from '@/hooks/athlete'

interface Exercise {
  name: string
  sets: number
  reps: string
  rpe?: number
  rest?: string
  notes?: string
}

interface Day {
  dayNumber: number
  name: string
  exercises: Exercise[]
}

interface Week {
  weekNumber: number
  focus?: string
  days: Day[]
}

interface ProgrammeContent {
  weeks?: Week[]
}

export default function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ programmeId: string }>
}) {
  const resolvedParams = use(params)
  const { data: assignment, isLoading } = useProgrammeAssignment(resolvedParams.programmeId)
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1])
  const [expandedDays, setExpandedDays] = useState<string[]>(['1-1'])
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed')

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekNumber)
        ? prev.filter((w) => w !== weekNumber)
        : [...prev, weekNumber]
    )
  }

  const toggleDay = (weekDay: string) => {
    setExpandedDays((prev) =>
      prev.includes(weekDay)
        ? prev.filter((d) => d !== weekDay)
        : [...prev, weekDay]
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="h-6 w-32 animate-pulse rounded bg-muted mb-4" />
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-24">
          <Dumbbell className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Programme not found</h2>
          <p className="text-muted-foreground mb-6">This programme may have been removed or doesn&apos;t exist.</p>
          <Link
            href="/athlete/training"
            className="text-amber-600 hover:text-amber-700"
          >
            Back to Training
          </Link>
        </div>
      </div>
    )
  }

  // Parse content from the assignment
  const content = assignment.content as ProgrammeContent
  const weeks = content?.weeks || []
  const template = assignment.template
  const currentWeek = assignment.currentWeek || 1
  const totalWeeks = template?.durationWeeks || weeks.length || 1
  const daysPerWeek = template?.daysPerWeek || (weeks[0]?.days?.length || 4)
  const progress = (currentWeek / totalWeeks) * 100

  const hasWeeks = weeks.length > 0

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/athlete/training"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Training
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{assignment.name}</h1>
            {template?.description && (
              <p className="mt-1 text-muted-foreground max-w-2xl">{template.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Programme Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4 mb-8"
      >
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Type</span>
          </div>
          <p className="font-semibold capitalize">{template?.type?.replace('_', ' ') || 'Training'}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
          </div>
          <p className="font-semibold">{totalWeeks} Weeks</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Dumbbell className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Training Days</span>
          </div>
          <p className="font-semibold">{daysPerWeek} days/week</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Difficulty</span>
          </div>
          <p className="font-semibold capitalize">{template?.difficulty || 'Intermediate'}</p>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Programme Progress</span>
          <span className="text-sm text-muted-foreground">
            Week {currentWeek} of {totalWeeks}
          </span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{new Date(assignment.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          {assignment.endDate && (
            <span>{new Date(assignment.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          )}
        </div>
      </motion.div>

      {/* Coach Notes */}
      {assignment.coachNotes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 mb-6"
        >
          <h3 className="font-semibold text-green-600 mb-2">Coach Notes</h3>
          <p className="text-sm text-green-600/80">{assignment.coachNotes}</p>
        </motion.div>
      )}

      {/* View Toggle - only show if we have weeks */}
      {hasWeeks && (
        <div className="flex gap-2 mb-6">
          {(['compact', 'detailed'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                viewMode === mode
                  ? 'bg-foreground text-background'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {mode} View
            </button>
          ))}
        </div>
      )}

      {/* Week-by-Week Breakdown */}
      {hasWeeks ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {weeks.map((week) => (
            <div key={week.weekNumber} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.weekNumber)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl font-bold',
                      week.weekNumber <= currentWeek
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {week.weekNumber < currentWeek ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      week.weekNumber
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Week {week.weekNumber}</p>
                    {week.focus && (
                      <p className="text-sm text-muted-foreground">{week.focus}</p>
                    )}
                  </div>
                </div>
                {expandedWeeks.includes(week.weekNumber) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Week Content */}
              <AnimatePresence>
                {expandedWeeks.includes(week.weekNumber) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-3">
                      {week.days.map((day) => {
                        const dayKey = `${week.weekNumber}-${day.dayNumber}`
                        const isExpanded = expandedDays.includes(dayKey)

                        return (
                          <div
                            key={dayKey}
                            className="rounded-lg border border-border overflow-hidden"
                          >
                            <button
                              onClick={() => toggleDay(dayKey)}
                              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                                  D{day.dayNumber}
                                </div>
                                <div className="text-left">
                                  <p className="font-medium">{day.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {day.exercises.length} exercises
                                  </p>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-border"
                                >
                                  <div className="p-3 space-y-2">
                                    {day.exercises.map((exercise, idx) => (
                                      <div
                                        key={idx}
                                        className={cn(
                                          'rounded-lg p-3',
                                          viewMode === 'detailed' ? 'bg-muted/50' : ''
                                        )}
                                      >
                                        <div className="flex items-center justify-between">
                                          <p className="font-medium">{exercise.name}</p>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{exercise.sets} × {exercise.reps}</span>
                                            {viewMode === 'detailed' && exercise.rpe && (
                                              <>
                                                <span>@</span>
                                                <span>RPE {exercise.rpe}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        {viewMode === 'detailed' && (
                                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                            {exercise.rest && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Rest: {exercise.rest}
                                              </span>
                                            )}
                                            {exercise.notes && (
                                              <span className="text-amber-600">• {exercise.notes}</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      ) : (
        /* No weeks configured */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-dashed border-border p-12 text-center"
        >
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold mb-2">No workouts configured</h3>
          <p className="text-muted-foreground">
            Your coach hasn&apos;t added specific workouts to this programme yet. Use the programme info above as a guide.
          </p>
        </motion.div>
      )}
    </div>
  )
}
