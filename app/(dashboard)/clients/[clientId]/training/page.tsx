'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, Trophy, Clock, Calendar, Plus, Target, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ProgressTrackingCard } from '@/components/programmes/progress-tracking-card'
import { useClient } from '@/hooks/use-clients'
import { useClientProgrammeAssignments } from '@/hooks/use-programmes'
import { cn } from '@/lib/utils'

export default function ClientTrainingPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)
  const { data: assignmentsData, isLoading } = useClientProgrammeAssignments(clientId)

  const assignments = assignmentsData?.data || []
  const activeAssignment = assignments.find((a) => a.status === 'active')
  const scheduledAssignments = assignments.filter((a) => a.status === 'scheduled')
  const completedAssignments = assignments.filter((a) => a.status === 'completed')

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="space-y-8">
      {/* Current Programme Overview */}
      {activeAssignment ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{activeAssignment.name}</h2>
              <p className="text-sm text-muted-foreground">
                {activeAssignment.template?.type || 'Training Programme'}
                {activeAssignment.template?.difficulty && ` • ${activeAssignment.template.difficulty}`}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Modify Programme
            </Button>
          </div>

          {/* Week overview */}
          {activeAssignment.template?.daysPerWeek && (
            <div className="mb-6 grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const isTrainingDay = i < (activeAssignment.template?.daysPerWeek || 0)
                const today = new Date().getDay()
                const isToday = (today === 0 ? 6 : today - 1) === i
                return (
                  <div
                    key={day}
                    className={cn(
                      'rounded-lg border p-3 text-center',
                      isToday ? 'border-amber-500 bg-amber-500/10' : 'border-border'
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{day}</p>
                    <div className="mt-2">
                      {isTrainingDay ? (
                        <Dumbbell className={cn('mx-auto h-5 w-5', isToday ? 'text-amber-500' : 'text-foreground')} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Rest</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Programme Progress</span>
              <span className="font-medium">
                Week {activeAssignment.currentWeek || 1} of {activeAssignment.template?.durationWeeks || 8}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                style={{ width: `${activeAssignment.progressPercentage || 0}%` }}
              />
            </div>
          </div>

          {/* Start/end dates */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                Started {new Date(activeAssignment.startDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
            {activeAssignment.endDate && (
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                <span>
                  Ends {new Date(activeAssignment.endDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No active programme */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No Active Programme</h3>
          <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
            This client doesn&apos;t have an active training programme. Assign one to get started.
          </p>
          <Link href="/programmes">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Assign Programme
            </Button>
          </Link>
        </div>
      )}

      {/* Scheduled Programmes */}
      {scheduledAssignments.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold">Upcoming Programmes</h3>
          </div>
          <div className="divide-y divide-border">
            {scheduledAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{assignment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Starts {new Date(assignment.startDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  View <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Programmes */}
      {completedAssignments.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold">Completed Programmes</h3>
          </div>
          <div className="divide-y divide-border">
            {completedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Trophy className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">{assignment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed {assignment.endDate && new Date(assignment.endDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  View <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Tracking Card */}
      {activeAssignment && (
        <ProgressTrackingCard assignment={activeAssignment} />
      )}

      {/* Session Tracking Placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Session History</h3>
        </div>
        <div className="rounded-lg bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Session tracking syncs from the athlete&apos;s app. View their logged workouts and training data here once they start logging sessions.
          </p>
        </div>
      </div>

      {/* Personal Records Placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Personal Records</h3>
        </div>
        <div className="rounded-lg bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Personal records are tracked automatically when athletes log their workouts. PRs will appear here as they&apos;re achieved.
          </p>
        </div>
      </div>
    </div>
  )
}
