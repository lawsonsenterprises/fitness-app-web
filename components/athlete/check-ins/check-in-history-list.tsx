'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Scale,
  Footprints,
  Moon,
  MessageSquare,
  ChevronRight,
  Check,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckInSummary {
  id: string
  date: Date
  weight?: number
  weightUnit?: string
  averageSteps?: number
  averageSleep?: number
  hasCoachFeedback: boolean
  status: 'complete' | 'pending-review' | 'reviewed'
  summary?: string
}

interface CheckInHistoryListProps {
  checkIns: CheckInSummary[]
  onCheckInClick?: (id: string) => void
}

const statusConfig = {
  complete: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    icon: Check,
    label: 'Submitted',
  },
  'pending-review': {
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    icon: Clock,
    label: 'Pending Review',
  },
  reviewed: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    icon: MessageSquare,
    label: 'Coach Reviewed',
  },
}

function CheckInCard({
  checkIn,
  index,
  onClick,
}: {
  checkIn: CheckInSummary
  index: number
  onClick?: () => void
}) {
  const config = statusConfig[checkIn.status]
  const StatusIcon = config.icon

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-muted-foreground/30 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Date and status */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {checkIn.date.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
            <span className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              config.bgColor,
              config.color
            )}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {checkIn.weight !== undefined && (
              <span className="flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{checkIn.weight}</span>
                <span className="text-muted-foreground">{checkIn.weightUnit || 'kg'}</span>
              </span>
            )}
            {checkIn.averageSteps !== undefined && (
              <span className="flex items-center gap-1.5">
                <Footprints className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{checkIn.averageSteps.toLocaleString()}</span>
                <span className="text-muted-foreground">avg steps</span>
              </span>
            )}
            {checkIn.averageSleep !== undefined && (
              <span className="flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-violet-500" />
                <span className="font-medium">{checkIn.averageSleep}</span>
                <span className="text-muted-foreground">hrs avg</span>
              </span>
            )}
          </div>

          {/* Summary if available */}
          {checkIn.summary && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {checkIn.summary}
            </p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
      </div>

      {/* Coach feedback indicator */}
      {checkIn.hasCoachFeedback && checkIn.status === 'reviewed' && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="flex items-center gap-1.5 text-xs text-blue-600">
            <MessageSquare className="h-3.5 w-3.5" />
            Coach left feedback
          </span>
        </div>
      )}
    </motion.button>
  )
}

export function CheckInHistoryList({
  checkIns,
  onCheckInClick,
}: CheckInHistoryListProps) {
  if (checkIns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No check-ins yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Your check-in history will appear here
        </p>
      </div>
    )
  }

  // Group by month
  const groupedByMonth = checkIns.reduce((acc, checkIn) => {
    const monthKey = checkIn.date.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    })
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(checkIn)
    return acc
  }, {} as Record<string, CheckInSummary[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedByMonth).map(([month, monthCheckIns]) => (
        <div key={month}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            {month}
          </h3>
          <div className="space-y-3">
            {monthCheckIns.map((checkIn, i) => (
              <CheckInCard
                key={checkIn.id}
                checkIn={checkIn}
                index={i}
                onClick={() => onCheckInClick?.(checkIn.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export type { CheckInSummary }
