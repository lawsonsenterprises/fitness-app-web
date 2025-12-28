'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Clock,
  Dumbbell,
  ChevronDown,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Exercise {
  name: string
  sets: number
  reps: string
  weight?: string
}

interface Session {
  id: string
  dayName: string
  sessionName: string
  exerciseCount: number
  exercises?: Exercise[]
  status: 'not-started' | 'in-progress' | 'completed'
  completedData?: {
    duration: number
    totalVolume: number
  }
}

interface WeeklySessionsGridProps {
  sessions: Session[]
  isLoading?: boolean
}

const statusConfig = {
  'not-started': {
    icon: Circle,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    badge: 'Not Started',
    badgeColor: 'bg-muted text-muted-foreground',
  },
  'in-progress': {
    icon: Play,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    badge: 'In Progress',
    badgeColor: 'bg-amber-500/10 text-amber-600',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    badge: 'Completed',
    badgeColor: 'bg-emerald-500/10 text-emerald-600',
  },
}

function SessionCard({ session, index }: { session: Session; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = statusConfig[session.status]
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border',
        session.status === 'completed' && 'border-emerald-500/20',
        session.status === 'in-progress' && 'border-amber-500/20'
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full p-4 text-left transition-colors',
          config.bg,
          'hover:bg-muted/80'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                session.status === 'completed' && 'bg-emerald-500/20',
                session.status === 'in-progress' && 'bg-amber-500/20',
                session.status === 'not-started' && 'bg-muted'
              )}
            >
              <StatusIcon className={cn('h-5 w-5', config.color)} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {session.dayName}
              </p>
              <p className="font-semibold">{session.sessionName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config.badgeColor)}>
              {config.badge}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Dumbbell className="h-3 w-3" />
            {session.exerciseCount} exercises
          </span>
          {session.completedData && (
            <>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {session.completedData.duration} min
              </span>
              <span>{session.completedData.totalVolume.toLocaleString()} kg volume</span>
            </>
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && session.exercises && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 space-y-2">
              {session.exercises.map((exercise, i) => (
                <motion.div
                  key={exercise.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                >
                  <span className="text-sm font-medium">{exercise.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {exercise.sets} × {exercise.reps}
                    {exercise.weight && ` @ ${exercise.weight}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SessionSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="animate-pulse">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-5 w-32 rounded bg-muted" />
          </div>
        </div>
        <div className="mt-3 h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  )
}

export function WeeklySessionsGrid({
  sessions,
  isLoading = false,
}: WeeklySessionsGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SessionSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const completedCount = sessions.filter(s => s.status === 'completed').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          This Week&apos;s Sessions
        </h3>
        <span className="text-sm text-muted-foreground">
          {completedCount} / {sessions.length} completed
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session, index) => (
          <SessionCard key={session.id} session={session} index={index} />
        ))}
      </div>
    </div>
  )
}

export type { Session, Exercise }
