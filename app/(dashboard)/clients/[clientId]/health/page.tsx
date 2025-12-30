'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Heart,
  Moon,
  Activity,
  Droplets,
  Plus,
  Zap,
  Timer,
  Thermometer,
  Wind,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Flame,
  Footprints,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { useClient } from '@/hooks/use-clients'
import {
  useClientReadiness,
  useClientSleepData,
  useClientRecoveryData,
  useClientStrainRecovery,
  useClientWorkoutStats,
  useClientActivityTrends,
} from '@/hooks/coach'
import { ReadinessGauge } from '@/components/athlete/readiness-gauge'
import {
  SleepDurationChart,
  SleepQualityChart,
  SleepPhasesChart,
  SleepBankChart,
  HRVTrendChart,
  RestingHRChart,
  RecoveryScoreChart,
  StrainRecoveryChart,
  WorkoutTypePieChart,
  ActivitySummaryChart,
} from '@/components/shared/charts'
import { cn } from '@/lib/utils'

// Mock data for blood tests (to be replaced with real data in future)
const mockBloodTests = [
  {
    id: '1',
    date: '2024-12-15',
    lab: 'Medichecks',
    tags: ['Full Blood Count', 'Liver Function', 'Thyroid'],
    markers: [
      { name: 'Testosterone', value: 18.5, unit: 'nmol/L', status: 'normal', refLow: 8.6, refHigh: 29 },
      { name: 'TSH', value: 2.1, unit: 'mIU/L', status: 'normal', refLow: 0.27, refHigh: 4.2 },
      { name: 'Vitamin D', value: 85, unit: 'nmol/L', status: 'normal', refLow: 50, refHigh: 175 },
      { name: 'Ferritin', value: 45, unit: 'ug/L', status: 'low', refLow: 30, refHigh: 400 },
    ],
  },
]

export default function ClientHealthPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)

  // Fetch HealthKit data
  const { data: readinessData, isLoading: readinessLoading } = useClientReadiness(clientId)
  const { data: sleepResult, isLoading: sleepLoading } = useClientSleepData(clientId, 30)
  const { data: recoveryResult, isLoading: recoveryLoading } = useClientRecoveryData(clientId, 30)
  const { data: strainRecoveryResult } = useClientStrainRecovery(clientId, 7)
  const { data: workoutStats } = useClientWorkoutStats(clientId, 30)
  const { data: activityTrends } = useClientActivityTrends(clientId, 30)

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'sleep' | 'recovery' | 'bloodwork'>('overview')

  if (!client) return null

  // Extract data
  const hasHealthKitData = readinessData?.hasData || false
  const sleepData = sleepResult?.data || []
  const sleepStats = sleepResult?.stats
  const recoveryData = recoveryResult?.data || []
  const hrvStats = recoveryResult?.hrvStats
  const recoveryStats = recoveryResult?.recoveryStats
  const strainRecoveryData = strainRecoveryResult?.data || []
  const alerts = strainRecoveryResult?.alerts || []

  // Get latest recovery metrics
  const latestRecovery = recoveryData[recoveryData.length - 1]

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Activity },
    { id: 'sleep' as const, label: 'Sleep', icon: Moon },
    { id: 'recovery' as const, label: 'Recovery', icon: Heart },
    { id: 'bloodwork' as const, label: 'Blood Work', icon: Droplets },
  ]

  const isLoading = readinessLoading || sleepLoading || recoveryLoading

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !hasHealthKitData ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">No HealthKit Data</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  This client hasn&apos;t synced their Apple Health data yet. Once they connect the iOS app, their health metrics will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Today's Readiness */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Today&apos;s Readiness</h3>
                      {readinessData && (
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
                          {readinessData.mode === 'training_day' ? 'Training Day' : 'Rest Day'}
                        </span>
                      )}
                    </div>
                    <ReadinessGauge score={readinessData?.recoveryScore || 0} size="sm" />
                  </div>

                  {/* Quick Stats */}
                  <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Sleep Score */}
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Moon className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm">Sleep Score</span>
                      </div>
                      <p className="text-2xl font-bold">{readinessData?.sleepScore || 0}%</p>
                      {sleepStats && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Avg {sleepStats.averageDuration}h / night
                        </p>
                      )}
                    </div>

                    {/* HRV */}
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">HRV</span>
                      </div>
                      <p className="text-2xl font-bold">{hrvStats?.current || latestRecovery?.resting_hrv || 0} ms</p>
                      {hrvStats && (
                        <p className={cn(
                          'text-xs mt-1 flex items-center gap-1',
                          hrvStats.trend === 'improving' ? 'text-green-500' :
                          hrvStats.trend === 'declining' ? 'text-red-500' : 'text-muted-foreground'
                        )}>
                          {hrvStats.trend === 'improving' ? <TrendingUp className="h-3 w-3" /> :
                           hrvStats.trend === 'declining' ? <TrendingDown className="h-3 w-3" /> :
                           <Minus className="h-3 w-3" />}
                          {hrvStats.percentChange > 0 ? '+' : ''}{hrvStats.percentChange}% vs baseline
                        </p>
                      )}
                    </div>

                    {/* Resting HR */}
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Resting HR</span>
                      </div>
                      <p className="text-2xl font-bold">{recoveryStats?.restingHR || latestRecovery?.resting_hr || 0} bpm</p>
                      {recoveryStats && (
                        <p className={cn(
                          'text-xs mt-1 flex items-center gap-1',
                          recoveryStats.restingHRTrend === 'improving' ? 'text-green-500' :
                          recoveryStats.restingHRTrend === 'declining' ? 'text-red-500' : 'text-muted-foreground'
                        )}>
                          {recoveryStats.restingHRTrend === 'improving' ? <TrendingDown className="h-3 w-3" /> :
                           recoveryStats.restingHRTrend === 'declining' ? <TrendingUp className="h-3 w-3" /> :
                           <Minus className="h-3 w-3" />}
                          {recoveryStats.restingHRTrend === 'improving' ? 'Improving' :
                           recoveryStats.restingHRTrend === 'declining' ? 'Elevated' : 'Stable'}
                        </p>
                      )}
                    </div>

                    {/* Sleep Bank */}
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Timer className="h-4 w-4 text-cyan-500" />
                        <span className="text-sm">Sleep Bank</span>
                      </div>
                      {sleepStats ? (
                        <>
                          <p className={cn(
                            'text-2xl font-bold',
                            sleepStats.sleepBank > 0 ? 'text-green-500' : sleepStats.sleepBank < 0 ? 'text-red-500' : ''
                          )}>
                            {sleepStats.sleepBank > 0 ? '+' : ''}{Math.round(sleepStats.sleepBank / 60)}h
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {sleepStats.sleepBank >= 0 ? 'Surplus' : 'Deficit'}
                          </p>
                        </>
                      ) : (
                        <p className="text-2xl font-bold text-muted-foreground">--</p>
                      )}
                    </div>

                    {/* Strain */}
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">Strain</span>
                      </div>
                      <p className="text-2xl font-bold">{readinessData?.strainPercentage || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {readinessData?.strainScore?.toFixed(1) || 0} / 21
                      </p>
                    </div>

                    {/* Recovery */}
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Heart className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Recovery</span>
                      </div>
                      <p className={cn(
                        'text-2xl font-bold',
                        (recoveryStats?.current || 0) >= 80 ? 'text-green-500' :
                        (recoveryStats?.current || 0) >= 60 ? 'text-amber-500' : 'text-red-500'
                      )}>
                        {recoveryStats?.current || readinessData?.recoveryScore || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {recoveryStats?.status || 'Moderate'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border p-4',
                          alert.type === 'warning'
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-red-500/30 bg-red-500/5'
                        )}
                      >
                        <AlertCircle className={cn(
                          'h-5 w-5 mt-0.5 flex-shrink-0',
                          alert.type === 'warning' ? 'text-amber-500' : 'text-red-500'
                        )} />
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Strain vs Recovery Chart */}
                {strainRecoveryData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Strain vs Recovery (7 Days)</h3>
                    <StrainRecoveryChart data={strainRecoveryData} />
                  </div>
                )}

                {/* Workout Summary & Activity Trends */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Workout Summary */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Workout Summary (30 Days)</h3>
                    {workoutStats && workoutStats.totalWorkouts > 0 ? (
                      <div className="space-y-6">
                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <Dumbbell className="h-5 w-5 mx-auto text-blue-500 mb-2" />
                            <p className="text-2xl font-bold">{workoutStats.totalWorkouts}</p>
                            <p className="text-xs text-muted-foreground">Workouts</p>
                          </div>
                          <div className="text-center">
                            <Timer className="h-5 w-5 mx-auto text-purple-500 mb-2" />
                            <p className="text-2xl font-bold">{workoutStats.avgDuration}m</p>
                            <p className="text-xs text-muted-foreground">Avg Duration</p>
                          </div>
                          <div className="text-center">
                            <Flame className="h-5 w-5 mx-auto text-orange-500 mb-2" />
                            <p className="text-2xl font-bold">{workoutStats.avgCalories}</p>
                            <p className="text-xs text-muted-foreground">Avg Calories</p>
                          </div>
                        </div>
                        {/* Pie chart */}
                        {workoutStats.workoutTypes.length > 0 && (
                          <WorkoutTypePieChart data={workoutStats.workoutTypes} />
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No workout data in the last 30 days</p>
                      </div>
                    )}
                  </div>

                  {/* Activity Trends */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Activity Trends (30 Days)</h3>
                    {activityTrends && activityTrends.summary ? (
                      <div className="space-y-6">
                        {/* Summary stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <Footprints className="h-5 w-5 mx-auto text-green-500 mb-2" />
                            <p className="text-2xl font-bold">
                              {activityTrends.summary.averageSteps >= 1000
                                ? `${(activityTrends.summary.averageSteps / 1000).toFixed(1)}k`
                                : activityTrends.summary.averageSteps}
                            </p>
                            <p className="text-xs text-muted-foreground">Avg Steps</p>
                          </div>
                          <div className="text-center">
                            <Activity className="h-5 w-5 mx-auto text-amber-500 mb-2" />
                            <p className="text-2xl font-bold">{activityTrends.summary.averageExerciseMinutes}m</p>
                            <p className="text-xs text-muted-foreground">Avg Exercise</p>
                          </div>
                          <div className="text-center">
                            <Flame className="h-5 w-5 mx-auto text-red-500 mb-2" />
                            <p className="text-2xl font-bold">
                              {activityTrends.summary.totalActiveEnergy >= 1000
                                ? `${(activityTrends.summary.totalActiveEnergy / 1000).toFixed(1)}k`
                                : activityTrends.summary.totalActiveEnergy}
                            </p>
                            <p className="text-xs text-muted-foreground">Total kcal</p>
                          </div>
                        </div>
                        {/* Exercise minutes chart */}
                        {activityTrends.data.length > 0 && (
                          <ActivitySummaryChart data={activityTrends.data} targetMinutes={30} />
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No activity data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Sleep Tab */}
        {activeTab === 'sleep' && (
          <motion.div
            key="sleep"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {sleepLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sleepData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Moon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">No Sleep Data</h3>
                <p className="text-muted-foreground mt-2">Sleep data will appear once the client syncs Apple Health.</p>
              </div>
            ) : (
              <>
                {/* Sleep Stats */}
                {sleepStats && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Timer className="h-4 w-4" />
                        <span className="text-sm">Avg Duration</span>
                      </div>
                      <p className="text-2xl font-bold">{sleepStats.averageDuration}h</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Moon className="h-4 w-4" />
                        <span className="text-sm">Avg Score</span>
                      </div>
                      <p className="text-2xl font-bold">{sleepStats.averageScore}%</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm">Consistency</span>
                      </div>
                      <p className="text-2xl font-bold">{sleepStats.consistency}%</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm">Sleep Bank</span>
                      </div>
                      <p className={cn(
                        'text-2xl font-bold',
                        sleepStats.sleepBank > 0 ? 'text-green-500' : sleepStats.sleepBank < 0 ? 'text-red-500' : ''
                      )}>
                        {sleepStats.sleepBank > 0 ? '+' : ''}{Math.round(sleepStats.sleepBank / 60)}h
                      </p>
                    </div>
                  </div>
                )}

                {/* Sleep Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Sleep Duration</h3>
                    <SleepDurationChart data={sleepData} targetHours={8} />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Sleep Quality</h3>
                    <SleepQualityChart data={sleepData} />
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Sleep Phases (Last 7 Days)</h3>
                    <SleepPhasesChart data={sleepData} />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Sleep Bank</h3>
                    <SleepBankChart data={sleepData} />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Recovery Tab */}
        {activeTab === 'recovery' && (
          <motion.div
            key="recovery"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {recoveryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recoveryData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">No Recovery Data</h3>
                <p className="text-muted-foreground mt-2">Recovery data will appear once the client syncs Apple Health.</p>
              </div>
            ) : (
              <>
                {/* Recovery Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {hrvStats && (
                    <>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Activity className="h-4 w-4" />
                          <span className="text-sm">Current HRV</span>
                        </div>
                        <p className="text-2xl font-bold">{hrvStats.current} ms</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Activity className="h-4 w-4" />
                          <span className="text-sm">7-Day Avg</span>
                        </div>
                        <p className="text-2xl font-bold">{hrvStats.sevenDayAvg} ms</p>
                      </div>
                    </>
                  )}
                  {recoveryStats && (
                    <>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">Resting HR</span>
                        </div>
                        <p className="text-2xl font-bold">{recoveryStats.restingHR} bpm</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">Recovery Status</span>
                        </div>
                        <p className={cn(
                          'text-2xl font-bold capitalize',
                          recoveryStats.status === 'optimal' ? 'text-green-500' :
                          recoveryStats.status === 'moderate' ? 'text-amber-500' : 'text-red-500'
                        )}>
                          {recoveryStats.status}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Recovery Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">HRV Trend</h3>
                    <HRVTrendChart data={recoveryData} />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Resting Heart Rate</h3>
                    <RestingHRChart data={recoveryData} />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold mb-4">Recovery Score</h3>
                  <RecoveryScoreChart data={recoveryData} />
                </div>

                {/* Additional Metrics */}
                {latestRecovery && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Additional Metrics</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {latestRecovery.respiratory_rate && (
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <Wind className="h-5 w-5 mx-auto text-cyan-500 mb-2" />
                          <p className="text-sm text-muted-foreground">Respiratory Rate</p>
                          <p className="text-xl font-bold">{latestRecovery.respiratory_rate.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">breaths/min</p>
                        </div>
                      )}
                      {latestRecovery.oxygen_saturation && (
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <Droplets className="h-5 w-5 mx-auto text-red-500 mb-2" />
                          <p className="text-sm text-muted-foreground">Blood Oxygen</p>
                          <p className="text-xl font-bold">{latestRecovery.oxygen_saturation}%</p>
                          <p className="text-xs text-muted-foreground">SpO2</p>
                        </div>
                      )}
                      {latestRecovery.wrist_temperature && (
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <Thermometer className="h-5 w-5 mx-auto text-orange-500 mb-2" />
                          <p className="text-sm text-muted-foreground">Temp Deviation</p>
                          <p className="text-xl font-bold">
                            {latestRecovery.wrist_temperature > 0 ? '+' : ''}
                            {latestRecovery.wrist_temperature.toFixed(1)}°C
                          </p>
                          <p className="text-xs text-muted-foreground">from baseline</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Blood Work Tab */}
        {activeTab === 'bloodwork' && (
          <motion.div
            key="bloodwork"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="font-semibold">Blood Work</h3>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Test
                </Button>
              </div>
              <div className="divide-y divide-border">
                {mockBloodTests.map((test) => (
                  <div key={test.id} className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(test.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{test.lab}</p>
                      </div>
                      <div className="flex gap-2">
                        {test.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Markers grid */}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      {test.markers.map((marker) => (
                        <div
                          key={marker.name}
                          className={cn(
                            'rounded-lg border p-3',
                            marker.status === 'normal'
                              ? 'border-emerald-500/20 bg-emerald-500/5'
                              : marker.status === 'low'
                              ? 'border-amber-500/20 bg-amber-500/5'
                              : 'border-red-500/20 bg-red-500/5'
                          )}
                        >
                          <p className="text-xs text-muted-foreground">{marker.name}</p>
                          <p className="mt-1 text-lg font-semibold">
                            {marker.value} {marker.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ref: {marker.refLow} - {marker.refHigh}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
