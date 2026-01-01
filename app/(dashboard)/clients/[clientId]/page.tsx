'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  MessageSquare,
  ClipboardList,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Award,
  Download,
  Activity,
  Moon,
  Zap,
  Heart,
  Footprints,
  Flame,
  Timer,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ClientStatusBadge } from '@/components/clients/client-status-badge'
import { ExportModal } from '@/components/exports/export-modal'
import { useClient } from '@/hooks/use-clients'
import { useClientReadiness, useClientWorkoutStats } from '@/hooks/coach'
import { useClientCheckIns } from '@/hooks/use-check-ins'
import { useClientProgrammeAssignments } from '@/hooks/use-programmes'
import { useClientMealPlanAssignments } from '@/hooks/use-meal-plans'
import { ReadinessGauge } from '@/components/athlete/readiness-gauge'
import { cn } from '@/lib/utils'
import { getClientDisplayName } from '@/types'

export default function ClientOverviewPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client, isLoading } = useClient(clientId)
  const { data: readinessData } = useClientReadiness(clientId)
  const { data: checkInsData } = useClientCheckIns(clientId, { pageSize: 3 })
  const { data: programmeAssignmentsData } = useClientProgrammeAssignments(clientId)
  const { data: mealPlanAssignmentsData } = useClientMealPlanAssignments(clientId)
  const { data: workoutStats } = useClientWorkoutStats(clientId, 30) // Last 30 days
  const [showExportModal, setShowExportModal] = useState(false)

  // Get recent check-ins
  const recentCheckIns = checkInsData?.data || []

  // Get active programme assignment
  const programmeAssignments = programmeAssignmentsData?.data || []
  const activeProgramme = programmeAssignments.find((a) => a.status === 'active')

  // Get active meal plan assignment
  const mealPlanAssignments = mealPlanAssignmentsData?.data || []
  const activeMealPlan = mealPlanAssignments.find((a) => a.status === 'active')

  // Calculate stats from check-ins
  const stats = useMemo(() => {
    if (!recentCheckIns.length) return { avgRating: 0, streak: 0 }
    const withRating = recentCheckIns.filter((c) => c.coachRating != null)
    const avgRating = withRating.length
      ? withRating.reduce((sum, c) => sum + (c.coachRating || 0), 0) / withRating.length
      : 0
    return { avgRating, streak: recentCheckIns.length }
  }, [recentCheckIns])

  // HealthKit readiness data
  const hasHealthKitData = readinessData?.hasData || false
  const recoveryScore = readinessData?.recoveryScore || 0
  const dayMode = readinessData?.mode === 'training_day' ? 'Training Day' : 'Rest Day'

  if (isLoading) {
    return <ClientOverviewSkeleton />
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Client not found</p>
        <Link href="/clients" className="mt-4 text-amber-600 hover:text-amber-700">
          Back to clients
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Send Message
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Add Note
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Dumbbell className="h-4 w-4" />
          Assign Programme
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowExportModal(true)}
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        defaultType="client_progress"
        entityId={clientId}
        entityTitle={`${getClientDisplayName(client).replace(/\s+/g, '-')}-progress`}
      />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          {/* Current Programme Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Current Programme</h3>
              <Link
                href={`/clients/${clientId}/training`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                View Details
              </Link>
            </div>
            {activeProgramme ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{activeProgramme.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activeProgramme.startDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      {activeProgramme.endDate && (
                        <>
                          {' - '}
                          {new Date(activeProgramme.endDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  {activeProgramme.template?.type && (
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 capitalize">
                      {activeProgramme.template.type}
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{activeProgramme.progressPercentage || 0}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
                      style={{ width: `${activeProgramme.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No active programme</p>
                <Link href="/programmes">
                  <Button variant="outline" size="sm" className="mt-3">
                    Assign Programme
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Current Meal Plan Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Current Meal Plan</h3>
              <Link
                href={`/clients/${clientId}/nutrition`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                View Details
              </Link>
            </div>
            {activeMealPlan ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{activeMealPlan.name}</p>
                    {activeMealPlan.template?.goal && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {activeMealPlan.template.goal.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
                {/* Macro breakdown */}
                {activeMealPlan.template && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Daily Targets
                      </p>
                      {activeMealPlan.template.targetCalories && (
                        <p className="text-lg font-semibold">{activeMealPlan.template.targetCalories} kcal</p>
                      )}
                      <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                        {activeMealPlan.template.targetProtein && (
                          <span>P: {activeMealPlan.template.targetProtein}g</span>
                        )}
                        {activeMealPlan.template.targetCarbs && (
                          <span>C: {activeMealPlan.template.targetCarbs}g</span>
                        )}
                        {activeMealPlan.template.targetFat && (
                          <span>F: {activeMealPlan.template.targetFat}g</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Duration
                      </p>
                      <p className="text-lg font-semibold">
                        {activeMealPlan.template.durationWeeks
                          ? `${activeMealPlan.template.durationWeeks} weeks`
                          : 'Ongoing'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Started{' '}
                        {new Date(activeMealPlan.startDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Target className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No active meal plan</p>
                <Link href="/meal-plans">
                  <Button variant="outline" size="sm" className="mt-3">
                    Assign Meal Plan
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Adherence Chart Placeholder */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Weekly Adherence</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Training</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Nutrition</span>
                </div>
              </div>
            </div>
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                Adherence data syncs from the athlete&apos;s app once they start logging workouts and meals.
              </p>
            </div>
          </div>

          {/* Weight Trend Placeholder */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Weight Trend</h3>
              <span className="text-sm text-muted-foreground">Last 4 weeks</span>
            </div>
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                Weight data will appear here as the athlete submits check-ins with weight measurements.
              </p>
            </div>
          </div>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Today's Readiness Card - HealthKit Data */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Today&apos;s Readiness</h3>
              <Link
                href={`/clients/${clientId}/health`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                View Health
              </Link>
            </div>

            {hasHealthKitData && readinessData ? (
              <div className="space-y-4">
                {/* Mode Badge */}
                <div className="flex items-center justify-center">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                    readinessData.mode === 'training_day'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-green-500/10 text-green-600'
                  )}>
                    {readinessData.mode === 'training_day' ? (
                      <Dumbbell className="h-3 w-3" />
                    ) : (
                      <Moon className="h-3 w-3" />
                    )}
                    {dayMode}
                  </span>
                </div>

                {/* Readiness Gauge */}
                <ReadinessGauge score={recoveryScore} size="sm" />

                {/* Score Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <Moon className="h-3.5 w-3.5 mx-auto text-indigo-500 mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Sleep</p>
                    <p className="text-sm font-bold">{readinessData.sleepScore}%</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <Zap className="h-3.5 w-3.5 mx-auto text-amber-500 mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Strain</p>
                    <p className="text-sm font-bold">{readinessData.strainPercentage}%</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <Heart className="h-3.5 w-3.5 mx-auto text-green-500 mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Recovery</p>
                    <p className="text-sm font-bold">{readinessData.recoveryScore}%</p>
                  </div>
                </div>

                {/* Today's Activity Summary */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Footprints className="h-3.5 w-3.5" />
                      Steps
                    </span>
                    <span className="font-medium">{readinessData.steps.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Flame className="h-3.5 w-3.5" />
                      Active Energy
                    </span>
                    <span className="font-medium">{readinessData.activeEnergy} kcal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" />
                      Exercise
                    </span>
                    <span className="font-medium">{readinessData.exerciseMinutes} mins</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Activity className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No HealthKit data</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Client hasn&apos;t synced Apple Health
                </p>
              </div>
            )}
          </div>

          {/* Client Info Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Client Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1 text-sm">{client.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1">
                  <ClientStatusBadge status={client.status} />
                </dd>
              </div>
              {client.checkInFrequency && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Check-in Frequency
                  </dt>
                  <dd className="mt-1 text-sm">Every {client.checkInFrequency} days</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member Since
                </dt>
                <dd className="mt-1 text-sm">
                  {new Date(client.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              {client.nextCheckInDue && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Next Check-in Due
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(client.nextCheckInDue).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Stats Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Performance Stats</h3>
            <p className="text-xs text-muted-foreground mb-3">Last 30 days</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Dumbbell className="h-4 w-4 text-amber-500" />
                  <span className={cn(
                    "text-2xl font-bold",
                    workoutStats?.totalWorkouts ? "" : "text-muted-foreground"
                  )}>
                    {workoutStats?.totalWorkouts || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Timer className="h-4 w-4 text-emerald-500" />
                  <span className={cn(
                    "text-2xl font-bold",
                    workoutStats?.avgDuration ? "" : "text-muted-foreground"
                  )}>
                    {workoutStats?.avgDuration || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Avg Mins</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">{stats.streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Check-Ins</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className={cn(
                    "text-2xl font-bold",
                    workoutStats?.avgCalories ? "" : "text-muted-foreground"
                  )}>
                    {workoutStats?.avgCalories || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Avg Kcal</p>
              </div>
            </div>
          </div>

          {/* Recent Check-Ins */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Recent Check-Ins</h3>
              <Link
                href={`/clients/${clientId}/check-ins`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                View All
              </Link>
            </div>
            {recentCheckIns.length > 0 ? (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn) => (
                  <Link
                    key={checkIn.id}
                    href={`/check-ins/${checkIn.id}`}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(checkIn.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {checkIn.stepsAverage
                          ? `${checkIn.stepsAverage.toLocaleString()} steps`
                          : 'No step data'}
                        {checkIn.sleepHours && ` · ${checkIn.sleepHours}h sleep`}
                      </p>
                    </div>
                    {checkIn.weight && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{checkIn.weight} kg</p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No check-ins yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Quick Actions skeleton */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
