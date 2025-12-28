'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Footprints,
  Pill,
  ChevronRight,
} from 'lucide-react'

import { CheckInStatusBadge } from './check-in-status-badge'
import { RatingDisplay } from './rating-selector'
import { cn } from '@/lib/utils'
import type { CheckIn } from '@/types'

interface CheckInCardProps {
  checkIn: CheckIn
  showClient?: boolean
}

export function CheckInCard({ checkIn, showClient = true }: CheckInCardProps) {
  const weightTrend = checkIn.weightChange || 0
  const stepsPercentage = checkIn.stepsTarget
    ? Math.round(((checkIn.averageSteps || 0) / checkIn.stepsTarget) * 100)
    : null

  return (
    <Link
      href={`/check-ins/${checkIn.id}`}
      className={cn(
        'block rounded-xl border border-border bg-card p-4 transition-all',
        'hover:border-amber-500/30 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            {showClient && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-medium text-sm">
                {checkIn.clientName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {showClient && (
                <p className="font-medium truncate">{checkIn.clientName}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Week of{' '}
                {new Date(checkIn.weekStartDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
            <CheckInStatusBadge status={checkIn.status} size="sm" />
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Weight */}
            <div className="rounded-lg bg-muted/30 p-2.5">
              <p className="text-xs text-muted-foreground mb-1">Weight</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium">
                  {checkIn.weight} {checkIn.weightUnit || 'kg'}
                </span>
                {weightTrend !== 0 && (
                  <span
                    className={cn(
                      'flex items-center text-xs',
                      weightTrend < 0 ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {weightTrend < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {Math.abs(weightTrend)}
                  </span>
                )}
                {weightTrend === 0 && (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Minus className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="rounded-lg bg-muted/30 p-2.5">
              <p className="text-xs text-muted-foreground mb-1">
                <Footprints className="inline h-3 w-3 mr-1" />
                Avg Steps
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium">
                  {(checkIn.averageSteps || 0).toLocaleString()}
                </span>
                {stepsPercentage !== null && (
                  <span
                    className={cn(
                      'text-xs',
                      stepsPercentage >= 100 ? 'text-emerald-600' : 'text-muted-foreground'
                    )}
                  >
                    ({stepsPercentage}%)
                  </span>
                )}
              </div>
            </div>

            {/* Sleep */}
            <div className="rounded-lg bg-muted/30 p-2.5">
              <p className="text-xs text-muted-foreground mb-1">
                <Moon className="inline h-3 w-3 mr-1" />
                Sleep
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium">{checkIn.sleepHours}h</span>
                <span className="text-xs capitalize text-muted-foreground">
                  {checkIn.sleepQuality}
                </span>
              </div>
            </div>

            {/* Supplements */}
            <div className="rounded-lg bg-muted/30 p-2.5">
              <p className="text-xs text-muted-foreground mb-1">
                <Pill className="inline h-3 w-3 mr-1" />
                Supps
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium">{checkIn.supplementCompliance}%</span>
              </div>
            </div>
          </div>

          {/* Notes preview */}
          {checkIn.notes && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              &ldquo;{checkIn.notes}&rdquo;
            </p>
          )}

          {/* Rating if reviewed */}
          {checkIn.status === 'reviewed' && checkIn.coachRating && (
            <div className="mt-3 flex items-center gap-2">
              <RatingDisplay value={checkIn.coachRating} size="sm" />
              <span className="text-xs text-muted-foreground">
                Reviewed{' '}
                {checkIn.reviewedAt &&
                  new Date(checkIn.reviewedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
              </span>
            </div>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
      </div>
    </Link>
  )
}
