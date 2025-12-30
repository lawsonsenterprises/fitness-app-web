'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Dumbbell,
  Calendar,
  ChevronRight,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle2,
  Timer,
  Loader2,
  Watch,
  Flame,
  Heart,
  Activity,
  Footprints,
  Filter,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useCurrentProgramme, useWeeklySchedule, usePersonalRecords, useHealthKitWorkouts, useWeeklyActivity } from '@/hooks/athlete'
import { TopBar } from '@/components/dashboard/top-bar'

// Time range options for filtering workouts
const DATE_RANGES = [
  { id: '7d', label: '7 days', days: 7 },
  { id: '14d', label: '14 days', days: 14 },
  { id: '30d', label: '30 days', days: 30 },
  { id: 'all', label: 'All', days: 365 },
] as const

export default function TrainingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'week' | 'prs' | 'healthkit'>('week')
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d' | 'all'>('30d')

  const { data: programme, isLoading: programmeLoading } = useCurrentProgramme(user?.id)
  const { data: weeklySchedule, isLoading: scheduleLoading } = useWeeklySchedule(user?.id)
  const { data: personalRecords, isLoading: prsLoading } = usePersonalRecords(user?.id)

  // HealthKit data - fetch more to allow client-side filtering
  const { data: healthKitWorkouts } = useHealthKitWorkouts(user?.id, 100)
  const { data: weeklyActivity } = useWeeklyActivity(user?.id)

  // Get unique workout types for filter dropdown
  const workoutTypes = useMemo(() => {
    if (!healthKitWorkouts) return []
    const types = new Set(healthKitWorkouts.map(w => w.workout_type))
    return Array.from(types).sort()
  }, [healthKitWorkouts])

  // Filter workouts by type and date range
  const filteredWorkouts = useMemo(() => {
    if (!healthKitWorkouts) return []

    const rangeDays = DATE_RANGES.find(r => r.id === dateRange)?.days || 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - rangeDays)

    return healthKitWorkouts.filter(workout => {
      // Date filter
      const workoutDate = workout.start_time
        ? new Date(workout.start_time)
        : new Date(workout.date)
      if (workoutDate < cutoffDate) return false

      // Type filter
      if (workoutTypeFilter && workout.workout_type !== workoutTypeFilter) return false

      return true
    })
  }, [healthKitWorkouts, workoutTypeFilter, dateRange])

  // Show loading while auth is loading OR (user exists AND queries are loading)
  const isLoading = authLoading || (user && (programmeLoading || scheduleLoading || prsLoading))

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Check if there are any HealthKit workouts (before filtering)
  const hasAnyHealthKitWorkouts = healthKitWorkouts && healthKitWorkouts.length > 0
  // Check if filtered workouts exist
  const hasFilteredWorkouts = filteredWorkouts.length > 0

  return (
    <>
      <TopBar title="Training" />
      <div className="p-6 lg:p-8">
        <p className="mb-6 text-muted-foreground">
          Your workouts and progress
        </p>

        {/* Programme Overview */}
        {programme ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6 mb-6"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  <Target className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {programme.programme_templates?.name || 'Active Programme'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {programme.programme_templates?.description || 'Your current training programme'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Week</p>
                  <p className="text-2xl font-bold">
                    {programme.current_week || 1}
                    <span className="text-muted-foreground text-base font-normal">
                      /{programme.programme_templates?.duration_weeks || '?'}
                    </span>
                  </p>
                </div>
                <div className="h-12 w-12 relative">
                  <svg className="w-12 h-12 -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted/30"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={
                        2 * Math.PI * 20 * (1 - (programme.current_week || 1) / (programme.programme_templates?.duration_weeks || 1))
                      }
                      strokeLinecap="round"
                      className="text-amber-500"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-8 mb-6 text-center"
          >
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Active Programme</h2>
            <p className="text-sm text-muted-foreground">
              Your coach will assign a training programme to you soon.
            </p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'week', label: 'This Week', icon: Calendar },
            { id: 'healthkit', label: 'HealthKit Workouts', icon: Watch },
            { id: 'prs', label: 'Personal Records', icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-foreground text-background'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'week' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {weeklySchedule && weeklySchedule.length > 0 ? (
              <div className="divide-y divide-border">
                {weeklySchedule.map((day, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-4 flex items-center gap-4',
                      day.status === 'current' && 'bg-amber-500/5 border-l-4 border-l-amber-500',
                      day.status === 'rest' && 'bg-muted/30'
                    )}
                  >
                    <div className="w-24 shrink-0">
                      <p className={cn(
                        'font-medium',
                        day.status === 'completed' && 'text-muted-foreground',
                        day.status === 'current' && 'text-amber-600'
                      )}>
                        {day.day}
                      </p>
                    </div>

                    <div className="flex-1">
                      <p className={cn(
                        'font-medium',
                        day.status === 'rest' && 'text-muted-foreground'
                      )}>
                        {day.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {day.duration !== '-' && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          {day.duration}
                        </span>
                      )}

                      {day.status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {day.status === 'current' && (
                        <span className="text-xs font-medium text-amber-600 px-2 py-1 bg-amber-500/10 rounded">
                          Today
                        </span>
                      )}
                      {day.status === 'upcoming' && (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No scheduled sessions this week.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'healthkit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Weekly Activity Summary */}
            {weeklyActivity && (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Dumbbell className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Workouts</span>
                  </div>
                  <p className="text-2xl font-bold">{weeklyActivity.workoutsCompleted}</p>
                  <p className="text-xs text-muted-foreground">this week</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Timer className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Exercise</span>
                  </div>
                  <p className="text-2xl font-bold">{weeklyActivity.totalExerciseMinutes} <span className="text-sm text-muted-foreground font-normal">min</span></p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Active Cal</span>
                  </div>
                  <p className="text-2xl font-bold">{weeklyActivity.totalActiveEnergy.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Footprints className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Avg Steps</span>
                  </div>
                  <p className="text-2xl font-bold">{weeklyActivity.averageSteps.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
              </div>
            )}

            {/* Filters */}
            {hasAnyHealthKitWorkouts && (
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Range Selector */}
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setDateRange(range.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        dateRange === range.id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Workout Type Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={workoutTypeFilter || ''}
                    onChange={(e) => setWorkoutTypeFilter(e.target.value || null)}
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">All types</option>
                    {workoutTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {workoutTypeFilter && (
                    <button
                      onClick={() => setWorkoutTypeFilter(null)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Results count */}
                <span className="text-sm text-muted-foreground ml-auto">
                  {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Workout List */}
            {hasAnyHealthKitWorkouts ? (
              hasFilteredWorkouts ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Recent Workouts from Apple Health</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Synced from your Apple Watch and iPhone
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {filteredWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-4 flex items-center gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        {getWorkoutIcon(workout.workout_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {workout.name || workout.workout_type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {workout.start_time
                            ? format(parseISO(workout.start_time), 'EEEE, MMM d, yyyy • h:mm a')
                            : workout.date}
                        </p>
                        {workout.source_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            via {workout.source_name}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm shrink-0">
                        {workout.duration_seconds && (
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">Duration</p>
                            <p className="font-medium">{formatDuration(workout.duration_seconds)}</p>
                          </div>
                        )}
                        {workout.active_energy_kcal && (
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">Calories</p>
                            <p className="font-medium">{Math.round(workout.active_energy_kcal)} kcal</p>
                          </div>
                        )}
                        {workout.avg_heart_rate && (
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">Avg HR</p>
                            <p className="font-medium">{Math.round(workout.avg_heart_rate)} bpm</p>
                          </div>
                        )}
                        {workout.distance_meters && (
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">Distance</p>
                            <p className="font-medium">{formatDistance(workout.distance_meters)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <Filter className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <h3 className="font-semibold mb-2">No Workouts Match Filters</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting the date range or workout type filter.
                  </p>
                  <button
                    onClick={() => {
                      setWorkoutTypeFilter(null)
                      setDateRange('30d')
                    }}
                    className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-500"
                  >
                    Clear filters
                  </button>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Watch className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No HealthKit Workouts Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your workouts from Apple Watch will appear here once you sync your data from the iOS app.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'prs' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {personalRecords && personalRecords.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {personalRecords.map((pr) => (
                    <div
                      key={pr.id}
                      className="rounded-xl border border-border bg-card p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{pr.exercise_name}</p>
                          <p className="text-3xl font-bold mt-1">{pr.weight_kg}kg</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pr.achieved_at ? formatDistanceToNow(new Date(pr.achieved_at), { addSuffix: true }) : 'Unknown date'}
                          </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold mb-4">PR History</h3>
                  <p className="text-sm text-muted-foreground">
                    View your complete personal record history and track your strength gains over time.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/athlete/training/exercises">
                      View All Records
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No Personal Records Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal records will appear here as you log your workouts in the iOS app.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Log Workouts CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center"
        >
          <Dumbbell className="h-8 w-8 mx-auto text-amber-600 mb-3" />
          <h3 className="font-semibold mb-2">Log Your Workouts</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Use the Synced Momentum iOS app to log your workouts and track your progress in real-time.
          </p>
        </motion.div>
      </div>
    </>
  )
}

// Helper functions
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function formatDistance(metres: number): string {
  if (metres >= 1000) {
    return `${(metres / 1000).toFixed(1)}km`
  }
  return `${Math.round(metres)}m`
}

function getWorkoutIcon(type: string) {
  const iconMap: Record<string, React.ReactNode> = {
    'Traditional Strength Training': <Dumbbell className="h-5 w-5 text-amber-600" />,
    'Functional Strength Training': <Dumbbell className="h-5 w-5 text-amber-600" />,
    'Running': <Activity className="h-5 w-5 text-green-600" />,
    'Cycling': <Activity className="h-5 w-5 text-blue-600" />,
    'Swimming': <Activity className="h-5 w-5 text-cyan-600" />,
    'Walking': <Footprints className="h-5 w-5 text-blue-500" />,
    'HIIT': <Flame className="h-5 w-5 text-orange-600" />,
    'Yoga': <Heart className="h-5 w-5 text-purple-600" />,
    'Core Training': <Dumbbell className="h-5 w-5 text-pink-600" />,
  }
  return iconMap[type] || <Dumbbell className="h-5 w-5 text-amber-600" />
}
