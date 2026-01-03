'use client'

import Link from 'next/link'
import {
  Dumbbell,
  UtensilsCrossed,
  ClipboardCheck,
  TrendingUp,
  ChevronRight,
  Flame,
  Moon,
  Target,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Loader2,
  Footprints,
  Zap,
  Heart,
  Activity,
  Timer,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { ReadinessGauge } from '@/components/athlete/readiness-gauge'
import { WeatherWidget } from '@/components/athlete/weather-widget'
import { useAthleteDashboard, useCurrentProgramme, useTodaysReadiness, useWeeklyActivity, useHealthKitWorkouts, useUserDietaryProfile } from '@/hooks/athlete'
import { TopBar } from '@/components/dashboard/top-bar'

export default function AthleteDashboardPage() {
  const { user, isLoading: authLoading, displayName } = useAuth()
  const { data, isLoading, error } = useAthleteDashboard(user?.id)
  const { data: currentProgramme, isLoading: programmeLoading } = useCurrentProgramme(user?.id)

  // HealthKit data hooks
  const { data: readinessData } = useTodaysReadiness(user?.id)
  const { data: weeklyActivity } = useWeeklyActivity(user?.id)
  const { data: recentWorkouts } = useHealthKitWorkouts(user?.id, 5)

  // User profile for nutrition targets
  const { data: dietaryProfile } = useUserDietaryProfile(user?.id)

  // Extract first name from display_name (split on space) or fall back to metadata
  const firstName = displayName?.split(' ')[0] || user?.user_metadata?.first_name || 'Athlete'
  const greeting = getGreeting()

  // Show loading while:
  // 1. Auth is loading, OR
  // 2. User exists AND queries are loading (queries are disabled when no user)
  if (authLoading || (user && (isLoading || programmeLoading))) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">Failed to load dashboard</p>
        <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
      </div>
    )
  }

  // Targets from user dietary profile, with sensible defaults
  const targets = {
    calories: dietaryProfile?.targetCalories || 2400,
    protein: dietaryProfile?.targetProtein || 180,
    water: 3, // Water target not in profile yet
    steps: 10000, // Steps target not in profile yet
  }

  // Use HealthKit readiness data if available, fall back to dashboard data
  const recoveryScore = readinessData?.hasData ? readinessData.recoveryScore : (data?.readinessScore || 0)
  const hasHealthKitData = readinessData?.hasData || false

  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" />
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {greeting}, {firstName}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s how you&apos;re doing today
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left column - Main content */}
          <div className="space-y-6 lg:col-span-8">
            {/* Readiness + Today's Activity */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Readiness Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Readiness Score</h2>
                  {hasHealthKitData && readinessData?.mode && (
                    <span className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      readinessData.mode === 'training_day'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-blue-500/10 text-blue-600'
                    )}>
                      {readinessData.mode === 'training_day' ? 'Training Day' : 'Rest Day'}
                    </span>
                  )}
                </div>
                <ReadinessGauge score={recoveryScore} />

                {/* Readiness Breakdown */}
                {hasHealthKitData && readinessData && (
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <Zap className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Strain</p>
                      <p className="text-lg font-bold">{readinessData.strainPercentage}%</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <Heart className="h-4 w-4 mx-auto text-green-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Recovery</p>
                      <p className="text-lg font-bold">{readinessData.recoveryScore}%</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <Moon className="h-4 w-4 mx-auto text-indigo-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Sleep</p>
                      <p className="text-lg font-bold">{readinessData.sleepScore}%</p>
                    </div>
                  </div>
                )}

                {!hasHealthKitData && (
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    Connect Apple Watch to see detailed metrics
                  </p>
                )}
              </motion.div>

              {/* Today's Activity (HealthKit) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Today&apos;s Activity</h2>

                {hasHealthKitData ? (
                  <div className="space-y-4">
                    {/* Steps */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Footprints className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Steps</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {readinessData?.steps?.toLocaleString() || 0} / {targets.steps.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${readinessData?.stepsPercentage || 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Active Energy */}
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Active Energy</span>
                      </div>
                      <span className="text-lg font-bold">{Math.round(readinessData?.activeEnergy || 0)} kcal</span>
                    </div>

                    {/* Exercise Minutes */}
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Exercise</span>
                      </div>
                      <span className="text-lg font-bold">{readinessData?.exerciseMinutes || 0} mins</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No activity data today</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data syncs from Apple Health
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Weekly Progress Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">This Week</h2>
                <Link href="/athlete/recovery" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                  View Recovery
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Dumbbell className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Workouts</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {weeklyActivity?.workoutsCompleted || data?.weeklyStats?.workoutsCompleted || 0}
                    {data?.weeklyStats?.workoutsPlanned ? (
                      <span className="text-muted-foreground text-base font-normal">
                        /{data.weeklyStats.workoutsPlanned}
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Footprints className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Avg Steps</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {(weeklyActivity?.averageSteps || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Exercise</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {weeklyActivity?.totalExerciseMinutes || 0}
                    <span className="text-muted-foreground text-base font-normal"> min</span>
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Active Cal</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {(weeklyActivity?.totalActiveEnergy || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recent HealthKit Workouts */}
            {recentWorkouts && recentWorkouts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Workouts</h2>
                  <Link href="/athlete/training" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentWorkouts.slice(0, 3).map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                          <Dumbbell className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {workout.name || workout.workout_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {workout.start_time
                              ? format(parseISO(workout.start_time), 'EEE, MMM d')
                              : workout.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {workout.duration_seconds
                            ? `${Math.round(workout.duration_seconds / 60)} min`
                            : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {workout.active_energy_kcal
                            ? `${Math.round(workout.active_energy_kcal)} kcal`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Today's Nutrition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Today&apos;s Nutrition</h2>
                <Link href="/athlete/nutrition" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                  Log Meal
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {data?.hasData?.nutrition ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricProgress
                    icon={Flame}
                    label="Calories"
                    current={data?.todayMacros?.calories || 0}
                    target={targets.calories}
                    unit="kcal"
                    color="orange"
                  />
                  <MetricProgress
                    icon={Target}
                    label="Protein"
                    current={data?.todayMacros?.protein || 0}
                    target={targets.protein}
                    unit="g"
                    color="purple"
                  />
                  <MetricProgress
                    icon={Droplets}
                    label="Water"
                    current={0}
                    target={targets.water}
                    unit="L"
                    color="cyan"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <UtensilsCrossed className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No meals logged today</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/athlete/nutrition/log">Log Your First Meal</Link>
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Progress Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Progress</h2>
                <Link href="/athlete/progress" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                  See All Progress
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {data?.hasData?.weight || (data?.progressHighlights?.personalBests?.length || 0) > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {data?.progressHighlights?.latestWeight && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">Current Weight</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{data.progressHighlights.latestWeight} kg</span>
                        {data.progressHighlights.weightChange !== null && (
                          <span className={cn(
                            'flex items-center gap-0.5 text-sm font-medium',
                            data.progressHighlights.weightChange > 0 ? 'text-green-500' : 'text-amber-500'
                          )}>
                            {data.progressHighlights.weightChange > 0 ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            {Math.abs(data.progressHighlights.weightChange).toFixed(1)} kg
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">last 30 days</p>
                    </div>
                  )}

                  {data?.progressHighlights?.personalBests?.slice(0, 2).map((pr: { id: string; exerciseName: string; weight: number | null; achievedAt: string | null }, index: number) => (
                    <div key={pr.id || index} className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">{pr.exerciseName} PR</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{pr.weight ?? 0} kg</span>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {pr.achievedAt ? formatDistanceToNow(new Date(pr.achievedAt), { addSuffix: true }) : 'Unknown date'}
                      </p>
                    </div>
                  ))}

                  {!data?.progressHighlights?.latestWeight && (data?.progressHighlights?.personalBests?.length || 0) === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-4 text-center">
                      <p className="text-sm text-muted-foreground">No progress data yet</p>
                      <Button asChild variant="outline" size="sm" className="mt-2">
                        <Link href="/athlete/progress">Log Weight</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TrendingUp className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Start logging to track progress</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/athlete/progress">Log Your Weight</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column - Sidebar content */}
          <div className="space-y-6 lg:col-span-4">
            {/* Weather */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <WeatherWidget />
            </motion.div>

            {/* Current Programme */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Current Programme</h2>

              {currentProgramme ? (
                <>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                      <Dumbbell className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {currentProgramme.programme_templates?.name || 'Active Programme'}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          Week {currentProgramme.current_week || 1} of{' '}
                          {currentProgramme.programme_templates?.duration_weeks || '?'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/athlete/training">
                      View Training
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Dumbbell className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No active programme</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your coach will assign one soon
                  </p>
                </div>
              )}
            </motion.div>

            {/* Recent Check-in */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Last Check-in</h2>
                {data?.lastCheckIn && (
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    data.lastCheckIn.status === 'reviewed' && 'bg-green-500/10 text-green-600',
                    data.lastCheckIn.status === 'submitted' && 'bg-amber-500/10 text-amber-600',
                    data.lastCheckIn.status === 'pending' && 'bg-muted text-muted-foreground'
                  )}>
                    {data.lastCheckIn.status === 'reviewed' ? 'Reviewed' :
                     data.lastCheckIn.status === 'submitted' ? 'Awaiting Review' : 'Pending'}
                  </span>
                )}
              </div>

              {data?.lastCheckIn ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(data.lastCheckIn.date), { addSuffix: true })}
                  </p>

                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/athlete/check-ins">View All Check-ins</Link>
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <ClipboardCheck className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No check-ins yet</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/athlete/check-ins/new">Submit Check-in</Link>
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/athlete/check-ins/new"
                  className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                >
                  <ClipboardCheck className="h-6 w-6 text-amber-600" />
                  <span className="text-xs font-medium">Check-in</span>
                </Link>
                <Link
                  href="/athlete/nutrition/log"
                  className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                >
                  <UtensilsCrossed className="h-6 w-6 text-green-600" />
                  <span className="text-xs font-medium">Log Meal</span>
                </Link>
                <Link
                  href="/athlete/recovery"
                  className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                >
                  <Heart className="h-6 w-6 text-red-600" />
                  <span className="text-xs font-medium">Recovery</span>
                </Link>
                <Link
                  href="/athlete/blood-work"
                  className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                >
                  <Droplets className="h-6 w-6 text-purple-600" />
                  <span className="text-xs font-medium">Blood Work</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

interface MetricProgressProps {
  icon: React.ElementType
  label: string
  current: number
  target: number
  unit: string
  color: 'orange' | 'purple' | 'blue' | 'cyan'
}

function MetricProgress({ icon: Icon, label, current, target, unit, color }: MetricProgressProps) {
  const percentage = Math.min((current / target) * 100, 100)

  const colorClasses = {
    orange: 'text-orange-500 bg-orange-500',
    purple: 'text-purple-500 bg-purple-500',
    blue: 'text-blue-500 bg-blue-500',
    cyan: 'text-cyan-500 bg-cyan-500',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', colorClasses[color].split(' ')[0])} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{current.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">/ {target.toLocaleString()}{unit}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color].split(' ')[1])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
