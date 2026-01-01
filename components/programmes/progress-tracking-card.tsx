'use client'

import { useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Activity,
  Info,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ProgrammeAssignment } from '@/types'

interface ProgressTrackingCardProps {
  assignment: ProgrammeAssignment
  className?: string
}

export function ProgressTrackingCard({ assignment, className }: ProgressTrackingCardProps) {
  const progress = assignment.progressPercentage || 0
  const currentWeek = assignment.currentWeek || 1
  const totalWeeks = assignment.template?.durationWeeks || 8

  // Calculate days in programme
  const startDate = new Date(assignment.startDate)
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const expectedProgress = Math.min(100, Math.round((daysSinceStart / (totalWeeks * 7)) * 100))

  // Determine if ahead, on track, or behind
  const progressStatus = useMemo(() => {
    const diff = progress - expectedProgress
    if (diff > 10) return 'ahead'
    if (diff < -10) return 'behind'
    return 'on-track'
  }, [progress, expectedProgress])

  const statusConfig = {
    ahead: { icon: TrendingUp, color: 'text-emerald-500', label: 'Ahead of schedule' },
    'on-track': { icon: Minus, color: 'text-amber-500', label: 'On track' },
    behind: { icon: TrendingDown, color: 'text-red-500', label: 'Falling behind' },
  }

  const StatusIcon = statusConfig[progressStatus].icon

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Progress Tracking</h3>
          </div>
          <div className={cn('flex items-center gap-1.5 text-sm', statusConfig[progressStatus].color)}>
            <StatusIcon className="h-4 w-4" />
            <span>{statusConfig[progressStatus].label}</span>
          </div>
        </div>
      </div>

      {/* Main progress */}
      <div className="p-4 space-y-6">
        {/* Overall progress bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Programme Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>Week {currentWeek} of {totalWeeks}</span>
            <span>{Math.max(0, totalWeeks - currentWeek)} weeks remaining</span>
          </div>
        </div>

        {/* Weekly tracking coming soon notice */}
        <div className="rounded-lg bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Weekly Session Tracking Coming Soon</p>
              <p className="text-xs text-muted-foreground mt-1">
                Detailed workout completion tracking will be available as you log your sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid - only showing real data */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Days Active</span>
            </div>
            <p className="text-lg font-semibold">{Math.max(0, daysSinceStart)}</p>
          </div>

          <div className="rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">Last Session</span>
            </div>
            <p className="text-lg font-semibold">
              {assignment.lastWorkoutAt
                ? new Date(assignment.lastWorkoutAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
