'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  Moon,
  Footprints,
  Dumbbell,
  Calendar,
  Clock,
  Flag,
  Archive,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { CheckInStatusBadge } from '@/components/check-ins/check-in-status-badge'
import { RatingDisplay } from '@/components/check-ins/rating-selector'
import { CoachFeedbackEditor } from '@/components/check-ins/coach-feedback-editor'
import { useCheckIn, useCheckIns, useReviewCheckIn, useFlagCheckIn, useArchiveCheckIn, useCompleteFollowUp } from '@/hooks/use-check-ins'
import type { CheckIn } from '@/types'

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

export default function CheckInDetailPage() {
  const params = useParams()
  const router = useRouter()
  const checkInId = params.checkInId as string

  const { data: checkIn, isLoading } = useCheckIn(checkInId)
  const { data: allCheckIns } = useCheckIns()
  const reviewCheckIn = useReviewCheckIn()
  const flagCheckIn = useFlagCheckIn()
  const archiveCheckIn = useArchiveCheckIn()
  const completeFollowUp = useCompleteFollowUp()

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

  const handleFlag = async () => {
    const reason = prompt('Enter reason for flagging this check-in:')
    if (!reason) return

    try {
      await flagCheckIn.mutateAsync({ checkInId, reason })
      toast.success('Check-in flagged')
    } catch {
      toast.error('Failed to flag check-in')
    }
  }

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this check-in?')) return

    try {
      await archiveCheckIn.mutateAsync(checkInId)
      toast.success('Check-in archived')
      router.push('/check-ins')
    } catch {
      toast.error('Failed to archive check-in')
    }
  }

  const handleCompleteFollowUp = async () => {
    try {
      await completeFollowUp.mutateAsync(checkInId)
      toast.success('Follow-up marked as complete')
    } catch {
      toast.error('Failed to update follow-up status')
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

  const clientName = getClientDisplayName(checkIn)
  const clientInitials = getClientInitials(checkIn)

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
                {clientInitials}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{clientName}</h2>
                {checkIn.client?.contactEmail && (
                  <p className="text-sm text-muted-foreground">{checkIn.client.contactEmail}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckInStatusBadge status={checkIn.reviewStatus} />
              <Link href={`/clients/${checkIn.userId}`}>
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
                {new Date(checkIn.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
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
                {new Date(checkIn.createdAt).toLocaleDateString('en-GB', {
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
                {checkIn.weight != null && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Weight
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{checkIn.weight?.toFixed(1)} kg</p>
                  </div>
                )}

                {/* Sleep */}
                {checkIn.sleepHours != null && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <Moon className="h-3.5 w-3.5" />
                      Sleep
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{checkIn.sleepHours}h</p>
                    {checkIn.sleepQuality && (
                      <p className="mt-1 text-sm capitalize text-muted-foreground">
                        Quality: {checkIn.sleepQuality}
                      </p>
                    )}
                  </div>
                )}

                {/* Steps */}
                {checkIn.stepsAverage != null && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <Footprints className="h-3.5 w-3.5" />
                      Avg Steps
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      {checkIn.stepsAverage.toLocaleString()}
                    </p>
                    {checkIn.stepsTotal != null && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Total: {checkIn.stepsTotal.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Session Quality */}
                {checkIn.sessionQuality && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <Dumbbell className="h-3.5 w-3.5" />
                      Session Quality
                    </p>
                    <p className="mt-1 text-2xl font-semibold capitalize">{checkIn.sessionQuality}</p>
                    {checkIn.muscleGroupTrained && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {checkIn.muscleGroupTrained}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Check-in type */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Check-in Type</h3>
              <span className="rounded-full bg-muted px-3 py-1 text-sm capitalize">
                {checkIn.checkInType.replace('_', ' ')}
              </span>
            </div>

            {/* Follow-up status */}
            {checkIn.requiresFollowUp && (
              <div className={`rounded-xl border p-6 ${
                checkIn.followUpCompletedAt
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-amber-500/20 bg-amber-500/5'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {checkIn.followUpCompletedAt ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {checkIn.followUpCompletedAt ? 'Follow-up Complete' : 'Follow-up Required'}
                      </h3>
                      {checkIn.followUpCompletedAt ? (
                        <p className="text-sm text-muted-foreground">
                          Completed on{' '}
                          {new Date(checkIn.followUpCompletedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          This check-in needs your attention
                        </p>
                      )}
                    </div>
                  </div>
                  {!checkIn.followUpCompletedAt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCompleteFollowUp}
                      disabled={completeFollowUp.isPending}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {checkIn.reviewStatus === 'pending' && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold">Actions</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleFlag}
                    className="gap-2 text-red-600 hover:bg-red-500/10"
                    disabled={flagCheckIn.isPending}
                  >
                    <Flag className="h-4 w-4" />
                    Flag
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleArchive}
                    className="gap-2"
                    disabled={archiveCheckIn.isPending}
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
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
                {checkIn.reviewStatus === 'reviewed' && checkIn.coachRating && (
                  <RatingDisplay value={checkIn.coachRating} />
                )}
              </div>

              {checkIn.reviewStatus === 'reviewed' && checkIn.coachFeedback ? (
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
              ) : checkIn.reviewStatus === 'flagged' ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm font-medium text-red-600">This check-in has been flagged</p>
                  {checkIn.flagReason && (
                    <p className="mt-2 text-sm text-muted-foreground">{checkIn.flagReason}</p>
                  )}
                </div>
              ) : checkIn.reviewStatus === 'archived' ? (
                <p className="text-sm italic text-muted-foreground">This check-in has been archived</p>
              ) : (
                <CoachFeedbackEditor
                  initialFeedback={checkIn.coachFeedback ?? undefined}
                  initialRating={checkIn.coachRating ?? undefined}
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
