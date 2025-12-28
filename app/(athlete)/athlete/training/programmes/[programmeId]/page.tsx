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
  User,
  Target,
  Printer,
  Download,
  Check,
} from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock programme data
const mockProgramme = {
  id: '1',
  name: '8-Week Hypertrophy Block',
  description: 'Progressive overload focused programme designed to maximise muscle growth through high volume training with moderate intensity.',
  coach: 'Andy Lawson',
  type: 'Hypertrophy',
  startDate: '2024-11-04',
  endDate: '2024-12-29',
  currentWeek: 7,
  totalWeeks: 8,
  trainingDays: 4,
  weeks: [
    {
      weekNumber: 1,
      focus: 'Foundation Week',
      days: [
        {
          dayNumber: 1,
          name: 'Push A',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: '8-10', rpe: 7, rest: '3 min', notes: 'Focus on controlled eccentric' },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rpe: 7, rest: '2 min' },
            { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rpe: 7, rest: '2 min' },
            { name: 'Lateral Raises', sets: 3, reps: '12-15', rpe: 8, rest: '90 sec' },
            { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rpe: 8, rest: '90 sec' },
            { name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', rpe: 8, rest: '90 sec' },
          ],
        },
        {
          dayNumber: 2,
          name: 'Pull A',
          exercises: [
            { name: 'Barbell Rows', sets: 4, reps: '8-10', rpe: 7, rest: '3 min', notes: 'Strict form, no momentum' },
            { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rpe: 7, rest: '2 min' },
            { name: 'Seated Cable Rows', sets: 3, reps: '10-12', rpe: 7, rest: '2 min' },
            { name: 'Face Pulls', sets: 3, reps: '15-20', rpe: 7, rest: '90 sec' },
            { name: 'Barbell Curls', sets: 3, reps: '10-12', rpe: 8, rest: '90 sec' },
            { name: 'Hammer Curls', sets: 3, reps: '12-15', rpe: 8, rest: '90 sec' },
          ],
        },
        {
          dayNumber: 3,
          name: 'Legs A',
          exercises: [
            { name: 'Squats', sets: 4, reps: '6-8', rpe: 7, rest: '4 min', notes: 'Full depth, pause at bottom' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '10-12', rpe: 7, rest: '3 min' },
            { name: 'Leg Press', sets: 3, reps: '12-15', rpe: 8, rest: '2 min' },
            { name: 'Leg Curls', sets: 3, reps: '12-15', rpe: 8, rest: '90 sec' },
            { name: 'Leg Extensions', sets: 3, reps: '12-15', rpe: 8, rest: '90 sec' },
            { name: 'Calf Raises', sets: 4, reps: '15-20', rpe: 8, rest: '60 sec' },
          ],
        },
        {
          dayNumber: 4,
          name: 'Upper B',
          exercises: [
            { name: 'Overhead Press', sets: 4, reps: '6-8', rpe: 7, rest: '3 min' },
            { name: 'Pull-Ups', sets: 3, reps: 'AMRAP', rpe: 8, rest: '3 min', notes: 'Use assistance if needed' },
            { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rpe: 7, rest: '2 min' },
            { name: 'Cable Rows', sets: 3, reps: '10-12', rpe: 7, rest: '2 min' },
            { name: 'Lateral Raises', sets: 3, reps: '15-20', rpe: 8, rest: '60 sec' },
            { name: 'Tricep Dips', sets: 3, reps: '10-12', rpe: 8, rest: '2 min' },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      focus: 'Volume Increase',
      days: [
        {
          dayNumber: 1,
          name: 'Push A',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: '8-10', rpe: 7.5, rest: '3 min' },
            { name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', rpe: 7.5, rest: '2 min' },
            { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rpe: 7.5, rest: '2 min' },
            { name: 'Lateral Raises', sets: 4, reps: '12-15', rpe: 8, rest: '90 sec' },
            { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rpe: 8, rest: '90 sec' },
            { name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', rpe: 8, rest: '90 sec' },
          ],
        },
      ],
    },
  ],
}

export default function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ programmeId: string }>
}) {
  const _resolvedParams = use(params)
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

  const progress = (mockProgramme.currentWeek / mockProgramme.totalWeeks) * 100

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
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{mockProgramme.name}</h1>
            <p className="mt-1 text-muted-foreground max-w-2xl">{mockProgramme.description}</p>
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
            <User className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Coach</span>
          </div>
          <p className="font-semibold">{mockProgramme.coach}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Type</span>
          </div>
          <p className="font-semibold">{mockProgramme.type}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
          </div>
          <p className="font-semibold">{mockProgramme.totalWeeks} Weeks</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Dumbbell className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Training Days</span>
          </div>
          <p className="font-semibold">{mockProgramme.trainingDays} days/week</p>
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
            Week {mockProgramme.currentWeek} of {mockProgramme.totalWeeks}
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
          <span>{new Date(mockProgramme.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span>{new Date(mockProgramme.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>
      </motion.div>

      {/* View Toggle */}
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

      {/* Week-by-Week Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {mockProgramme.weeks.map((week) => (
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
                    week.weekNumber <= mockProgramme.currentWeek
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {week.weekNumber <= mockProgramme.currentWeek ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    week.weekNumber
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold">Week {week.weekNumber}</p>
                  <p className="text-sm text-muted-foreground">{week.focus}</p>
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
                                          {viewMode === 'detailed' && (
                                            <>
                                              <span>@</span>
                                              <span>RPE {exercise.rpe}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {viewMode === 'detailed' && (
                                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Rest: {exercise.rest}
                                          </span>
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
    </div>
  )
}
