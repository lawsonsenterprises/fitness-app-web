'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Target,
  Camera,
  Calendar,
  Activity,
  Loader2,
  AlertCircle,
  Trophy,
  Dumbbell,
  Flame,
  Zap,
  Crown,
  Medal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/dashboard/top-bar'
import { useAuth } from '@/contexts/auth-context'
import { useHealthKitWeightTrends, useUserDietaryProfile, usePersonalRecords } from '@/hooks/athlete'
import { WeightTrendChart } from '@/components/shared/charts'

// Time range to days mapping
const timeRangeDays: Record<'1m' | '3m' | '6m' | '1y', number> = {
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
}

// Format PR type to human-readable with icon
const getPRTypeDisplay = (type: string): { label: string; icon: typeof Trophy; gradient: string } => {
  switch (type.toLowerCase()) {
    case 'weight':
      return { label: 'Weight PR', icon: Dumbbell, gradient: 'from-amber-500 to-orange-600' }
    case 'estimated1rm':
    case 'est. 1rm':
      return { label: 'Estimated 1RM', icon: Crown, gradient: 'from-purple-500 to-indigo-600' }
    case 'volume':
      return { label: 'Volume PR', icon: Flame, gradient: 'from-red-500 to-rose-600' }
    case 'reps':
      return { label: 'Rep PR', icon: Zap, gradient: 'from-emerald-500 to-teal-600' }
    default:
      return { label: type, icon: Trophy, gradient: 'from-amber-500 to-yellow-500' }
  }
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m')

  // Fetch real HealthKit weight data
  const { data: weightTrends, isLoading: weightLoading, error: weightError } = useHealthKitWeightTrends(
    user?.id,
    timeRangeDays[timeRange]
  )

  // Fetch user dietary profile for goal weight
  const { data: dietaryProfile } = useUserDietaryProfile(user?.id)

  // Fetch personal records
  const { data: personalRecords = [], isLoading: prsLoading } = usePersonalRecords(user?.id)

  // Calculate weight stats from real data
  const weightData = weightTrends?.data || []
  const weightStats = weightTrends?.stats

  const hasWeightData = weightData.length > 0
  const currentWeight = weightStats?.current || 0
  const weightChange = weightStats?.change || 0
  const weeklyChange = weightStats?.weeklyAvgChange || 0

  // Goal weight from user dietary profile
  const goalWeight = dietaryProfile?.targetWeightKg || null
  const toGo = currentWeight > 0 && goalWeight ? currentWeight - goalWeight : null

  // Group PRs by type for stats
  const prStats = {
    total: personalRecords.length,
    thisMonth: personalRecords.filter(pr => {
      if (!pr.achieved_at) return false
      const date = new Date(pr.achieved_at)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length,
  }

  return (
    <>
      <TopBar title="Progress" />
      <div className="p-6 lg:p-8">
        <p className="mb-6 text-muted-foreground">
          Track your body composition, strength gains, and visual progress
        </p>

        {/* Weight Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-4 mb-6"
        >
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Scale className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Current</span>
            </div>
            {weightLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : hasWeightData ? (
              <p className="text-2xl font-bold">{currentWeight}kg</p>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">--</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Target</span>
            </div>
            <p className="text-2xl font-bold">
              {goalWeight ? `${goalWeight}kg` : <span className="text-muted-foreground">Not set</span>}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              {weightChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : weightChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-amber-500" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              <span className="text-xs font-medium uppercase tracking-wider">Change</span>
            </div>
            {weightLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : hasWeightData ? (
              <p className={cn(
                'text-2xl font-bold',
                weightChange < 0 ? 'text-green-500' : weightChange > 0 ? 'text-amber-500' : ''
              )}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
              </p>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">--</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">To Go</span>
            </div>
            {weightLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : hasWeightData && toGo !== null ? (
              <p className={cn(
                'text-2xl font-bold',
                toGo <= 0 ? 'text-green-500' : ''
              )}>
                {toGo <= 0 ? 'Goal reached!' : `${toGo.toFixed(1)}kg`}
              </p>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">--</p>
            )}
          </div>
        </motion.div>

        {/* Weight Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 mb-6"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div>
              <h2 className="text-lg font-semibold">Weight Trend</h2>
              {hasWeightData && weeklyChange !== 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Avg weekly change:{' '}
                  <span className={cn(
                    'font-medium',
                    weeklyChange < 0 ? 'text-green-500' : weeklyChange > 0 ? 'text-amber-500' : ''
                  )}>
                    {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(2)}kg/week
                  </span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {(['1m', '3m', '6m', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                    timeRange === range
                      ? 'bg-foreground text-background'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {weightLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[300px] flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading weight data...</p>
                </div>
              </motion.div>
            ) : weightError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[300px] flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <p className="text-sm text-muted-foreground">Failed to load weight data</p>
                </div>
              </motion.div>
            ) : !hasWeightData ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[300px] flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <Scale className="h-12 w-12 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium">No weight data available</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Weight measurements from Apple Health will appear here
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WeightTrendChart
                  data={weightData}
                  goalWeight={goalWeight || undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Personal Records Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Personal Records</h2>
                <p className="text-sm text-muted-foreground">
                  {prStats.total} lifetime PRs{prStats.thisMonth > 0 && ` • ${prStats.thisMonth} this month`}
                </p>
              </div>
            </div>
          </div>

          {prsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : personalRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-2xl rounded-full" />
                <Trophy className="relative h-16 w-16 text-muted-foreground/30" />
              </div>
              <p className="font-medium text-lg">No personal records yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Log your workouts in the iOS app and your PRs will automatically appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {personalRecords.slice(0, 9).map((pr, index) => {
                const display = getPRTypeDisplay(pr.exercise_name)
                const PRIcon = display.icon

                return (
                  <motion.div
                    key={pr.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-4 transition-all hover:shadow-lg hover:border-amber-500/30"
                  >
                    {/* Gradient accent */}
                    <div className={cn(
                      'absolute top-0 left-0 w-1 h-full bg-gradient-to-b',
                      display.gradient
                    )} />

                    {/* Trophy badge for recent PRs */}
                    {index < 3 && (
                      <div className="absolute top-3 right-3">
                        {index === 0 && <Medal className="h-5 w-5 text-amber-500" />}
                        {index === 1 && <Medal className="h-5 w-5 text-slate-400" />}
                        {index === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                      </div>
                    )}

                    <div className="pl-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br',
                          display.gradient
                        )}>
                          <PRIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {display.label}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight">
                          {pr.weight_kg ?? 0}
                        </span>
                        <span className="text-sm text-muted-foreground">kg</span>
                        {pr.reps && pr.reps > 1 && (
                          <>
                            <span className="text-muted-foreground">×</span>
                            <span className="text-lg font-semibold">{pr.reps}</span>
                            <span className="text-sm text-muted-foreground">reps</span>
                          </>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {pr.achieved_at
                          ? formatDistanceToNow(new Date(pr.achieved_at), { addSuffix: true })
                          : 'Date unknown'}
                      </p>
                    </div>

                    {/* Hover glow effect */}
                    <div className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br',
                      display.gradient
                    )} />
                  </motion.div>
                )
              })}
            </div>
          )}

          {personalRecords.length > 9 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All {personalRecords.length} Records
              </Button>
            </div>
          )}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Measurements - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Measurements</h2>
              <Button variant="outline" size="sm" disabled>
                Update
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Ruler className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="font-medium">Measurements coming soon</p>
              <p className="text-sm text-muted-foreground mt-1">
                Body measurements tracking will be available here
              </p>
            </div>
          </motion.div>

          {/* Progress Photos - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Progress Photos</h2>
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <Camera className="h-4 w-4" />
                Add Photos
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Camera className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="font-medium">Progress photos coming soon</p>
              <p className="text-sm text-muted-foreground mt-1">
                Track your visual progress over time
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
