'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Scale,
  Footprints,
  Moon,
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  ImageIcon,
  Calendar,
  Dumbbell,
  ClipboardCheck,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { useCheckIn } from '@/hooks/athlete'
import { CheckInStatusBadge } from '@/components/check-ins/check-in-status-badge'
import type { CheckInReviewStatus } from '@/types'

export default function CheckInDetailPage({
  params,
}: {
  params: Promise<{ checkInId: string }>
}) {
  const resolvedParams = use(params)
  const { data: checkIn, isLoading } = useCheckIn(resolvedParams.checkInId)

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="h-6 w-32 animate-pulse rounded bg-muted mb-4" />
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="lg:col-span-4 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!checkIn) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-24">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Check-in not found</h2>
          <p className="text-muted-foreground mb-6">This check-in may have been deleted or doesn&apos;t exist.</p>
          <Link
            href="/athlete/check-ins"
            className="text-amber-600 hover:text-amber-700"
          >
            Back to Check-Ins
          </Link>
        </div>
      </div>
    )
  }

  // Map database fields to display
  const reviewStatus = (checkIn.review_status || 'pending') as CheckInReviewStatus
  const coachRating = checkIn.coach_rating
  const coachFeedback = checkIn.coach_feedback
  const athleteNotes = checkIn.notes
  const weight = checkIn.weight
  const sleepHours = checkIn.sleep_hours
  const sleepQuality = checkIn.sleep_quality
  const stepsAverage = checkIn.steps_average
  const stepsTotal = checkIn.steps_total
  const sessionQuality = checkIn.session_quality
  const muscleGroup = checkIn.muscle_group_trained
  const checkInType = checkIn.check_in_type

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/athlete/check-ins"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Check-Ins
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                {new Date(checkIn.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h1>
              <CheckInStatusBadge status={reviewStatus} />
            </div>
            <p className="mt-1 text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Submitted {new Date(checkIn.created_at).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {coachRating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < coachRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Weight Card */}
          {weight != null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Scale className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold">Weight</h2>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 inline-block">
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-3xl font-bold">{weight} kg</p>
              </div>
            </motion.div>
          )}

          {/* Steps Card */}
          {(stepsAverage != null || stepsTotal != null) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                    <Footprints className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Steps</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {stepsAverage != null && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Average Daily Steps</p>
                    <p className="text-3xl font-bold">{stepsAverage.toLocaleString()}</p>
                  </div>
                )}
                {stepsTotal != null && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Total Steps</p>
                    <p className="text-3xl font-bold">{stepsTotal.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Sleep Card */}
          {sleepHours != null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Moon className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold">Sleep</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Average Sleep</p>
                  <p className="text-3xl font-bold">{sleepHours}h</p>
                </div>
                {sleepQuality && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Sleep Quality</p>
                    <p className="text-3xl font-bold capitalize">{sleepQuality}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Training Card */}
          {(sessionQuality || muscleGroup) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                  <Dumbbell className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold">Training</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sessionQuality && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Session Quality</p>
                    <p className="text-3xl font-bold capitalize">{sessionQuality}</p>
                  </div>
                )}
                {muscleGroup && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Muscle Group</p>
                    <p className="text-xl font-bold">{muscleGroup}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Check-in Type */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-3">Check-in Type</h3>
            <span className="rounded-full bg-muted px-3 py-1 text-sm capitalize">
              {checkInType?.replace('_', ' ') || 'General'}
            </span>
          </motion.div>

          {/* Coach Feedback */}
          {coachFeedback && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-green-500/30 bg-green-500/5 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-600">Coach Feedback</h3>
              </div>
              <p className="text-sm text-green-600/90 leading-relaxed">{coachFeedback}</p>
            </motion.div>
          )}

          {/* Athlete Notes */}
          {athleteNotes && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-semibold mb-4">Your Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{athleteNotes}</p>
            </motion.div>
          )}

          {/* Progress Photos Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5" />
              <h3 className="font-semibold">Progress Photos</h3>
            </div>
            {checkIn.photo_data ? (
              <p className="text-sm text-muted-foreground">Photos attached to this check-in.</p>
            ) : (
              <p className="text-sm text-muted-foreground">No photos attached to this check-in.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
