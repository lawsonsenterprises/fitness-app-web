'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Clock,
  Flame,
  Check,
  Circle,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Exercise {
  name: string
  sets: number
  reps: string
  weight?: string
  notes?: string
}

interface TrainingDay {
  name: string
  dayNumber: number
  focus: string
  exercises: Exercise[]
  estimatedDuration: number
  status: 'completed' | 'in-progress' | 'upcoming'
  completedDate?: Date
}

interface Week {
  weekNumber: number
  name: string
  days: TrainingDay[]
  isCurrentWeek?: boolean
}

interface WeekBreakdownProps {
  weeks: Week[]
  currentWeekNumber?: number
}

const statusConfig = {
  completed: {
    icon: Check,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'Complete',
  },
  'in-progress': {
    icon: Play,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'In Progress',
  },
  upcoming: {
    icon: Circle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    label: 'Upcoming',
  },
}

function DayCard({ day, index }: { day: TrainingDay; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[day.status]
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', config.bgColor)}>
            <StatusIcon className={cn('h-4 w-4', config.color)} />
          </div>
          <div>
            <p className="font-medium">Day {day.dayNumber}: {day.name}</p>
            <p className="text-sm text-muted-foreground">{day.focus}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              {day.exercises.length}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {day.estimatedDuration}m
            </span>
          </div>
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
            <div className="p-4 space-y-2">
              {day.exercises.map((exercise, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    {exercise.notes && (
                      <p className="text-xs text-muted-foreground">{exercise.notes}</p>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{exercise.sets}</span>
                    <span className="text-muted-foreground"> × </span>
                    <span className="font-medium">{exercise.reps}</span>
                    {exercise.weight && (
                      <span className="text-muted-foreground ml-2">@ {exercise.weight}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function WeekSection({ week, defaultExpanded }: { week: Week; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const completedDays = week.days.filter(d => d.status === 'completed').length
  const totalDays = week.days.length
  const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-colors',
          week.isCurrentWeek ? 'bg-amber-500/5' : 'hover:bg-muted/30'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg font-bold',
            week.isCurrentWeek ? 'bg-amber-500/20 text-amber-600' : 'bg-muted text-muted-foreground'
          )}>
            W{week.weekNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{week.name}</p>
              {week.isCurrentWeek && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600">
                  Current Week
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {completedDays} of {totalDays} sessions complete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="hidden sm:block w-32">
            <div className="h-2 w-full rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-amber-500"
              />
            </div>
          </div>
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
              {week.days.map((day, i) => (
                <DayCard key={i} day={day} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function WeekBreakdown({ weeks, currentWeekNumber }: WeekBreakdownProps) {
  // Mark current week
  const weeksWithCurrent = weeks.map(week => ({
    ...week,
    isCurrentWeek: week.weekNumber === currentWeekNumber,
  }))

  // Calculate overall stats
  const totalSessions = weeks.reduce((acc, w) => acc + w.days.length, 0)
  const completedSessions = weeks.reduce(
    (acc, w) => acc + w.days.filter(d => d.status === 'completed').length,
    0
  )
  const overallProgress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Overall progress header */}
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">Programme Progress</p>
            <p className="text-sm text-muted-foreground">
              {completedSessions} of {totalSessions} sessions complete
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
          />
        </div>
      </div>

      {/* Week sections */}
      <div className="space-y-4">
        {weeksWithCurrent.map((week) => (
          <WeekSection
            key={week.weekNumber}
            week={week}
            defaultExpanded={week.isCurrentWeek || false}
          />
        ))}
      </div>
    </div>
  )
}

export type { Week, TrainingDay, Exercise }
