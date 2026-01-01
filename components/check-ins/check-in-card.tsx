'use client'

import Link from 'next/link'
import {
  Moon,
  Footprints,
  Dumbbell,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

import { CheckInStatusBadge } from './check-in-status-badge'
import { RatingDisplay } from './rating-selector'
import { cn } from '@/lib/utils'
import type { CheckIn } from '@/types'

interface CheckInCardProps {
  checkIn: CheckIn
  showClient?: boolean
}

// Helper to get client display name and initials
function getClientDisplayName(checkIn: CheckIn): string {
  return checkIn.client?.displayName || checkIn.client?.contactEmail || 'Unknown Client'
}

function getClientInitials(checkIn: CheckIn): string {
  const name = getClientDisplayName(checkIn)
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || '??'
}

export function CheckInCard({ checkIn, showClient = true }: CheckInCardProps) {
  const clientName = getClientDisplayName(checkIn)
  const clientInitials = getClientInitials(checkIn)

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
                {clientInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {showClient && (
                <p className="font-medium truncate">{clientName}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {new Date(checkIn.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {checkIn.requiresFollowUp && !checkIn.followUpCompletedAt && (
                <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Follow-up
                </span>
              )}
              <CheckInStatusBadge status={checkIn.reviewStatus} size="sm" />
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Weight */}
            {checkIn.weight != null && (
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-xs text-muted-foreground mb-1">Weight</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium">
                    {checkIn.weight} kg
                  </span>
                </div>
              </div>
            )}

            {/* Steps */}
            {checkIn.stepsAverage != null && (
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-xs text-muted-foreground mb-1">
                  <Footprints className="inline h-3 w-3 mr-1" />
                  Avg Steps
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium">
                    {checkIn.stepsAverage.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Sleep */}
            {checkIn.sleepHours != null && (
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-xs text-muted-foreground mb-1">
                  <Moon className="inline h-3 w-3 mr-1" />
                  Sleep
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium">{checkIn.sleepHours}h</span>
                  {checkIn.sleepQuality && (
                    <span className="text-xs capitalize text-muted-foreground">
                      {checkIn.sleepQuality}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Session Quality */}
            {checkIn.sessionQuality && (
              <div className="rounded-lg bg-muted/30 p-2.5">
                <p className="text-xs text-muted-foreground mb-1">
                  <Dumbbell className="inline h-3 w-3 mr-1" />
                  Session
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium capitalize">{checkIn.sessionQuality}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes preview */}
          {checkIn.notes && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              &ldquo;{checkIn.notes}&rdquo;
            </p>
          )}

          {/* Rating if reviewed */}
          {checkIn.reviewStatus === 'reviewed' && checkIn.coachRating && (
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
