'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Target,
  Camera,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/dashboard/top-bar'
import { useAuth } from '@/contexts/auth-context'
import { useHealthKitWeightTrends } from '@/hooks/athlete'
import { WeightTrendChart } from '@/components/shared/charts'

// Mock data for measurements and photos (to be replaced with real data in future)
const mockMeasurements = [
  { name: 'Chest', current: 104, previous: 103, unit: 'cm' },
  { name: 'Waist', current: 82, previous: 84, unit: 'cm' },
  { name: 'Hips', current: 98, previous: 99, unit: 'cm' },
  { name: 'Arms', current: 38, previous: 37.5, unit: 'cm' },
  { name: 'Thighs', current: 62, previous: 61, unit: 'cm' },
]

const mockPhotos = [
  { date: '2024-12-20', hasPhotos: true },
  { date: '2024-12-13', hasPhotos: true },
  { date: '2024-12-06', hasPhotos: true },
  { date: '2024-11-29', hasPhotos: false },
  { date: '2024-11-22', hasPhotos: true },
]

// Time range to days mapping
const timeRangeDays: Record<'1m' | '3m' | '6m' | '1y', number> = {
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m')
  const [photoIndex, setPhotoIndex] = useState(0)

  // Fetch real HealthKit weight data
  const { data: weightTrends, isLoading: weightLoading, error: weightError } = useHealthKitWeightTrends(
    user?.id,
    timeRangeDays[timeRange]
  )

  // Calculate weight stats from real data
  const weightData = weightTrends?.data || []
  const weightStats = weightTrends?.stats

  const hasWeightData = weightData.length > 0
  const currentWeight = weightStats?.current || 0
  const weightChange = weightStats?.change || 0
  const weeklyChange = weightStats?.weeklyAvgChange || 0

  // Goal weight (would come from user profile in production)
  const goalWeight = 74.0
  const toGo = currentWeight > 0 ? currentWeight - goalWeight : 0

  return (
    <>
      <TopBar title="Progress" />
      <div className="p-6 lg:p-8">
        <p className="mb-6 text-muted-foreground">
          Track your body composition and visual progress
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
            <p className="text-2xl font-bold">{goalWeight}kg</p>
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
            ) : hasWeightData ? (
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
                  goalWeight={goalWeight}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Measurements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Measurements</h2>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>

            <div className="space-y-4">
              {mockMeasurements.map((measurement) => {
                const change = measurement.current - measurement.previous
                return (
                  <div key={measurement.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{measurement.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{measurement.current}{measurement.unit}</span>
                      <span className={cn(
                        'text-sm',
                        change > 0 ? 'text-green-500' : change < 0 ? 'text-amber-500' : 'text-muted-foreground'
                      )}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Progress Photos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Progress Photos</h2>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Add Photos
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
                disabled={photoIndex === 0}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex-1 grid grid-cols-3 gap-2">
                {['Front', 'Side', 'Back'].map((view) => (
                  <div
                    key={view}
                    className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                      <span className="text-xs text-muted-foreground mt-1 block">{view}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setPhotoIndex(Math.min(mockPhotos.length - 1, photoIndex + 1))}
                disabled={photoIndex === mockPhotos.length - 1}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {new Date(mockPhotos[photoIndex].date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
