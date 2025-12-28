'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Droplets,
  Pill,
  Calendar,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { CheckInStatusBadge } from '@/components/check-ins/check-in-status-badge'
import { RatingDisplay } from '@/components/check-ins/rating-selector'
import { CoachFeedbackEditor } from '@/components/check-ins/coach-feedback-editor'
import { StepsBreakdownChart } from '@/components/check-ins/steps-breakdown-chart'
import { useCheckIn, useCheckIns, useReviewCheckIn } from '@/hooks/use-check-ins'
import { cn } from '@/lib/utils'

export default function CheckInDetailPage() {
  const params = useParams()
  const router = useRouter()
  const checkInId = params.checkInId as string

  const { data: checkIn, isLoading } = useCheckIn(checkInId)
  const { data: allCheckIns } = useCheckIns()
  const reviewCheckIn = useReviewCheckIn()

  // Find previous and next check-ins for navigation
  const currentIndex = allCheckIns?.data?.findIndex((c) => c.id === checkInId) ?? -1
  const prevCheckIn = currentIndex > 0 ? allCheckIns?.data?.[currentIndex - 1] : null
  const nextCheckIn =
    currentIndex >= 0 && currentIndex < (allCheckIns?.data?.length || 0) - 1
      ? allCheckIns?.data?.[currentIndex + 1]
      : null

  const handleSubmitReview = async (feedback: string, rating: number) => {
    try {
      await reviewCheckIn.mutateAsync({
        checkInId,
        feedback,
        rating,
      })
      toast.success('Check-in reviewed', {
        description: 'Your feedback has been saved.',
      })
    } catch {
      toast.error('Failed to submit review', {
        description: 'Please try again.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Check-in" />
        <div className="p-4 lg:p-8">
          <div className="space-y-6">
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!checkIn) {
    return (
      <div className="min-h-screen">
        <TopBar title="Check-in" />
        <div className="flex flex-col items-center justify-center p-8 py-24">
          <p className="text-muted-foreground">Check-in not found</p>
          <Link href="/check-ins" className="mt-4 text-amber-600 hover:text-amber-700">
            Back to check-ins
          </Link>
        </div>
      </div>
    )
  }

  const weightTrend = checkIn.weightChange || 0

  return (
    <div className="min-h-screen">
      <TopBar title="Check-in Review" />

      <div className="p-4 lg:p-8">
        {/* Navigation header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/check-ins')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Check-ins
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!prevCheckIn}
              onClick={() => prevCheckIn && router.push(`/check-ins/${prevCheckIn.id}`)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!nextCheckIn}
              onClick={() => nextCheckIn && router.push(`/check-ins/${nextCheckIn.id}`)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Client header card */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-semibold text-lg">
                {checkIn.clientName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{checkIn.clientName}</h2>
                <p className="text-sm text-muted-foreground">{checkIn.clientEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckInStatusBadge status={checkIn.status} />
              <Link href={`/clients/${checkIn.clientId}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  View Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Date info */}
          <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Week of{' '}
                {new Date(checkIn.weekStartDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Submitted{' '}
                {new Date(checkIn.submittedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column - Metrics */}
          <div className="space-y-6">
            {/* Key metrics grid */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Weight */}
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Weight
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {checkIn.weight} {checkIn.weightUnit || 'kg'}
                  </p>
                  <p
                    className={cn(
                      'mt-1 flex items-center gap-1 text-sm',
                      weightTrend < 0
                        ? 'text-emerald-600'
                        : weightTrend > 0
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    )}
                  >
                    {weightTrend < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : weightTrend > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    {weightTrend !== 0
                      ? `${Math.abs(weightTrend)} ${checkIn.weightUnit || 'kg'} from last week`
                      : 'No change'}
                  </p>
                </div>

                {/* Sleep */}
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Moon className="h-3.5 w-3.5" />
                    Sleep
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{checkIn.sleepHours}h avg</p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    Quality: {checkIn.sleepQuality}
                  </p>
                </div>

                {/* Water */}
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Droplets className="h-3.5 w-3.5" />
                    Hydration
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {checkIn.waterIntake} {checkIn.waterUnit || 'L'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Daily average</p>
                </div>

                {/* Supplements */}
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Pill className="h-3.5 w-3.5" />
                    Supplements
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{checkIn.supplementCompliance}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {checkIn.supplementsTaken?.length || 0}/{checkIn.supplementsTotal || 0} taken
                  </p>
                </div>
              </div>
            </div>

            {/* Steps breakdown */}
            {checkIn.dailySteps && checkIn.stepsTarget && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold">Daily Steps</h3>
                <StepsBreakdownChart
                  dailySteps={checkIn.dailySteps}
                  target={checkIn.stepsTarget}
                />
              </div>
            )}

            {/* Supplements taken */}
            {checkIn.supplementsTaken && checkIn.supplementsTaken.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold">Supplements Taken</h3>
                <div className="flex flex-wrap gap-2">
                  {checkIn.supplementsTaken.map((supplement) => (
                    <span
                      key={supplement}
                      className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-600"
                    >
                      {supplement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Notes and feedback */}
          <div className="space-y-6">
            {/* Client notes */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Client Notes</h3>
              {checkIn.notes ? (
                <p className="text-muted-foreground">{checkIn.notes}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">No notes provided</p>
              )}
            </div>

            {/* Coach feedback */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Coach Feedback</h3>
                {checkIn.status === 'reviewed' && checkIn.coachRating && (
                  <RatingDisplay value={checkIn.coachRating} />
                )}
              </div>

              {checkIn.status === 'reviewed' && checkIn.coachFeedback ? (
                <div className="space-y-3">
                  <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
                    {checkIn.coachFeedback}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reviewed{' '}
                    {checkIn.reviewedAt &&
                      new Date(checkIn.reviewedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </p>
                </div>
              ) : (
                <CoachFeedbackEditor
                  initialFeedback={checkIn.coachFeedback}
                  initialRating={checkIn.coachRating}
                  onSubmit={handleSubmitReview}
                  isSubmitting={reviewCheckIn.isPending}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
