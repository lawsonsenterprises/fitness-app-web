'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Flag,
  ClipboardCheck,
  Moon,
  Footprints,
  Dumbbell,
  Scale,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CheckInStatusBadge } from '@/components/check-ins/check-in-status-badge'
import { useClient } from '@/hooks/use-clients'
import { useClientCheckIns } from '@/hooks/use-check-ins'
import { cn } from '@/lib/utils'

export default function ClientCheckInsPage() {
  const params = useParams()
  useRouter() // Navigation hook available for future use
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)
  const { data: checkInsData, isLoading } = useClientCheckIns(clientId)

  const checkIns = checkInsData?.data || []
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (!checkIns.length) return { total: 0, avgRating: 0, weightChange: 0, streak: 0 }

    const reviewedWithRating = checkIns.filter((c) => c.coachRating != null)
    const avgRating = reviewedWithRating.length
      ? reviewedWithRating.reduce((sum, c) => sum + (c.coachRating || 0), 0) / reviewedWithRating.length
      : 0

    // Calculate weight change from first to last check-in with weight
    const withWeight = checkIns.filter((c) => c.weight != null).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const weightChange = withWeight.length >= 2
      ? (withWeight[withWeight.length - 1].weight! - withWeight[0].weight!)
      : 0

    return { total: checkIns.length, avgRating, weightChange, streak: checkIns.length }
  }, [checkIns])

  // Set first check-in as expanded once data loads
  if (checkIns.length > 0 && expandedId === null) {
    setExpandedId(checkIns[0].id)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Check-Ins</p>
          <p className="mt-1 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Check-In Streak</p>
          <p className="mt-1 text-2xl font-bold">{stats.streak} weeks</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Rating</p>
          <div className="mt-1 flex items-center gap-1">
            <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Weight Change</p>
          <p className={cn(
            'mt-1 text-2xl font-bold',
            stats.weightChange < 0 ? 'text-emerald-600' : stats.weightChange > 0 ? 'text-red-600' : 'text-foreground'
          )}>
            {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg
          </p>
        </div>
      </div>

      {/* Check-in timeline */}
      {checkIns.length > 0 ? (
        <div className="space-y-4">
          {checkIns.map((checkIn) => {
            const isExpanded = expandedId === checkIn.id

            return (
              <div
                key={checkIn.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* Header - always visible */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : checkIn.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        checkIn.reviewStatus === 'reviewed'
                          ? 'bg-emerald-500/10'
                          : checkIn.reviewStatus === 'flagged'
                          ? 'bg-red-500/10'
                          : 'bg-amber-500/10'
                      )}
                    >
                      {checkIn.reviewStatus === 'reviewed' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : checkIn.reviewStatus === 'flagged' ? (
                        <Flag className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(checkIn.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted{' '}
                        {new Date(checkIn.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Quick stats */}
                    <div className="hidden items-center gap-6 md:flex">
                      {checkIn.weight != null && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{checkIn.weight.toFixed(1)} kg</p>
                          <p className="text-xs text-muted-foreground">weight</p>
                        </div>
                      )}
                      {checkIn.stepsAverage != null && (
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {checkIn.stepsAverage.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">avg steps</p>
                        </div>
                      )}
                      {checkIn.coachRating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-4 w-4',
                                star <= checkIn.coachRating!
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-muted'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <CheckInStatusBadge status={checkIn.reviewStatus} />

                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border px-6 py-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Left column */}
                      <div className="space-y-6">
                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {checkIn.weight != null && (
                            <div className="rounded-lg bg-muted/30 p-4">
                              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <Scale className="h-3.5 w-3.5" />
                                Weight
                              </p>
                              <p className="mt-1 text-xl font-semibold">{checkIn.weight.toFixed(1)} kg</p>
                            </div>
                          )}
                          {checkIn.sleepHours != null && (
                            <div className="rounded-lg bg-muted/30 p-4">
                              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <Moon className="h-3.5 w-3.5" />
                                Sleep
                              </p>
                              <p className="mt-1 text-xl font-semibold">{checkIn.sleepHours.toFixed(1)}h avg</p>
                              {checkIn.sleepQuality && (
                                <p className="mt-1 text-sm capitalize text-muted-foreground">
                                  Quality: {checkIn.sleepQuality}
                                </p>
                              )}
                            </div>
                          )}
                          {checkIn.stepsAverage != null && (
                            <div className="rounded-lg bg-muted/30 p-4">
                              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <Footprints className="h-3.5 w-3.5" />
                                Avg Steps
                              </p>
                              <p className="mt-1 text-xl font-semibold">
                                {checkIn.stepsAverage.toLocaleString()}
                              </p>
                              {checkIn.stepsTotal != null && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Total: {checkIn.stepsTotal.toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                          {checkIn.sessionQuality && (
                            <div className="rounded-lg bg-muted/30 p-4">
                              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <Dumbbell className="h-3.5 w-3.5" />
                                Session Quality
                              </p>
                              <p className="mt-1 text-xl font-semibold capitalize">{checkIn.sessionQuality}</p>
                              {checkIn.muscleGroupTrained && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {checkIn.muscleGroupTrained}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Check-in type */}
                        <div className="rounded-lg bg-muted/30 p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                            Check-in Type
                          </p>
                          <span className="rounded-full bg-muted px-3 py-1 text-sm capitalize">
                            {checkIn.checkInType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Right column */}
                      <div className="space-y-6">
                        {/* Client notes */}
                        <div>
                          <h4 className="mb-2 text-sm font-medium">Client Notes</h4>
                          {checkIn.notes ? (
                            <p className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                              {checkIn.notes}
                            </p>
                          ) : (
                            <p className="rounded-lg bg-muted/30 p-4 text-sm italic text-muted-foreground">
                              No notes provided
                            </p>
                          )}
                        </div>

                        {/* Coach feedback */}
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-sm font-medium">Coach Feedback</h4>
                            {checkIn.coachRating && (
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      'h-4 w-4',
                                      star <= checkIn.coachRating!
                                        ? 'fill-amber-500 text-amber-500'
                                        : 'text-muted'
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {checkIn.coachFeedback ? (
                            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
                              {checkIn.coachFeedback}
                            </p>
                          ) : (
                            <div className="rounded-lg border border-dashed border-border p-4">
                              <p className="text-sm text-muted-foreground">
                                No feedback added yet
                              </p>
                              <Link href={`/check-ins/${checkIn.id}`}>
                                <Button variant="outline" size="sm" className="mt-2">
                                  Review Check-in
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* View full details link */}
                        <div className="pt-2">
                          <Link href={`/check-ins/${checkIn.id}`}>
                            <Button variant="outline" className="w-full">
                              View Full Check-in Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No check-ins yet</h3>
          <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
            This client hasn&apos;t submitted any check-ins yet. Check-ins will appear here once they start submitting them.
          </p>
        </div>
      )}
    </div>
  )
}
