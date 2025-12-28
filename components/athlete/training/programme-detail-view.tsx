'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronLeft,
  Calendar,
  Clock,
  Dumbbell,
  User,
  Printer,
  List,
  LayoutGrid,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Exercise {
  name: string
  sets: number
  reps: string
  rpe?: number
  rest?: string
  notes?: string
}

interface TrainingDay {
  dayName: string
  sessionName: string
  exercises: Exercise[]
  notes?: string
}

interface Week {
  weekNumber: number
  days: TrainingDay[]
  notes?: string
}

interface Programme {
  id: string
  name: string
  description?: string
  type: string
  coachName: string
  startDate: Date
  endDate: Date
  weeks: Week[]
}

interface ProgrammeDetailViewProps {
  programme: Programme
  currentWeek?: number
}

type ViewMode = 'compact' | 'detailed'

function ExerciseRow({
  exercise,
  isDetailed,
}: {
  exercise: Exercise
  isDetailed: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg px-3 py-2',
        'bg-muted/30 hover:bg-muted/50 transition-colors'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500/10">
          <Dumbbell className="h-3.5 w-3.5 text-amber-500" />
        </div>
        <span className="font-medium">{exercise.name}</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {exercise.sets} × {exercise.reps}
        </span>
        {isDetailed && (
          <>
            {exercise.rpe && <span>RPE {exercise.rpe}</span>}
            {exercise.rest && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {exercise.rest}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function DayCard({
  day,
  viewMode,
  isExpanded,
  onToggle,
}: {
  day: TrainingDay
  viewMode: ViewMode
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-muted/30 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {day.dayName}
          </p>
          <p className="mt-1 font-semibold">{day.sessionName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {day.exercises.length} exercises
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border p-4"
        >
          <div className="space-y-2">
            {day.exercises.map((exercise, i) => (
              <ExerciseRow
                key={i}
                exercise={exercise}
                isDetailed={viewMode === 'detailed'}
              />
            ))}
          </div>
          {day.notes && (
            <p className="mt-4 rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
              {day.notes}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}

function WeekSection({
  week,
  viewMode,
  isCurrent,
}: {
  week: Week
  viewMode: ViewMode
  isCurrent: boolean
}) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    isCurrent ? new Set([0]) : new Set()
  )

  const toggleDay = (index: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border bg-card p-6',
        isCurrent ? 'border-amber-500/30 bg-amber-500/5' : 'border-border'
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl font-bold',
              isCurrent
                ? 'bg-amber-500 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {week.weekNumber}
          </div>
          <div>
            <h3 className="font-semibold">Week {week.weekNumber}</h3>
            <p className="text-xs text-muted-foreground">
              {week.days.length} training days
            </p>
          </div>
        </div>
        {isCurrent && (
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
            Current Week
          </span>
        )}
      </div>

      {week.notes && (
        <p className="mb-4 rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
          {week.notes}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {week.days.map((day, dayIndex) => (
          <DayCard
            key={dayIndex}
            day={day}
            viewMode={viewMode}
            isExpanded={expandedDays.has(dayIndex)}
            onToggle={() => toggleDay(dayIndex)}
          />
        ))}
      </div>
    </motion.div>
  )
}

export function ProgrammeDetailView({
  programme,
  currentWeek = 1,
}: ProgrammeDetailViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('compact')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/athlete/training"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Training
          </Link>
          <h1 className="text-2xl font-bold">{programme.name}</h1>
          {programme.description && (
            <p className="mt-2 text-muted-foreground">{programme.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {programme.coachName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {programme.startDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}{' '}
              -{' '}
              {programme.endDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
              {programme.type}
            </span>
          </div>
        </div>

        {/* View controls */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'compact'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
              Compact
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'detailed'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Detailed
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-6">
        {programme.weeks.map((week) => (
          <WeekSection
            key={week.weekNumber}
            week={week}
            viewMode={viewMode}
            isCurrent={week.weekNumber === currentWeek}
          />
        ))}
      </div>
    </div>
  )
}

export type { Programme, Week, TrainingDay, Exercise }
