'use client'

import { useState } from 'react'
import {
  Heart,
  Moon,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  ThermometerSun,
  Brain,
  Loader2,
  AlertCircle,
  Wind,
  Thermometer,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { TopBar } from '@/components/dashboard/top-bar'
import { ReadinessGauge } from '@/components/athlete/readiness-gauge'
import {
  useTodaysReadiness,
  useSleepData,
  useRecoveryData,
  useStrainRecovery,
} from '@/hooks/athlete'
import {
  SleepDurationChart,
  SleepQualityChart,
  SleepPhasesChart,
  SleepBankChart,
  HRVTrendChart,
  RestingHRChart,
  RecoveryScoreChart,
  StrainRecoveryChart,
} from '@/components/shared/charts'

// Recovery tips based on status
const getRecoveryTips = (status: 'optimal' | 'moderate' | 'low') => {
  const baseTips = [
    { icon: Moon, text: 'Aim for 7-9 hours of quality sleep tonight' },
    { icon: Droplets, text: 'Stay hydrated - drink at least 3L of water' },
  ]

  if (status === 'low') {
    return [
      { icon: Brain, text: 'Consider a rest day or light activity only' },
      { icon: Moon, text: 'Prioritise sleep - aim for 8+ hours tonight' },
      { icon: Droplets, text: 'Stay hydrated - drink at least 3L of water' },
      { icon: ThermometerSun, text: 'Try a cold shower or contrast therapy' },
    ]
  }

  if (status === 'moderate') {
    return [
      { icon: Brain, text: 'Reduce training intensity if needed' },
      ...baseTips,
      { icon: ThermometerSun, text: 'Consider active recovery like walking' },
    ]
  }

  // Optimal
  return [
    { icon: Zap, text: 'Great recovery! You\'re ready for a challenging session' },
    ...baseTips,
    { icon: Brain, text: 'Maintain your recovery habits' },
  ]
}

export default function RecoveryPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [sleepDays] = useState(30)

  // Fetch all recovery data
  const { data: readinessData, isLoading: readinessLoading } = useTodaysReadiness(user?.id)
  const { data: sleepResult, isLoading: sleepLoading } = useSleepData(user?.id, sleepDays)
  const { data: recoveryResult, isLoading: recoveryLoading } = useRecoveryData(user?.id, 30)
  const { data: strainResult, isLoading: strainLoading } = useStrainRecovery(user?.id, 7)

  const isLoading = authLoading || readinessLoading || sleepLoading || recoveryLoading || strainLoading
  const hasData = readinessData?.hasData || sleepResult?.data?.length || recoveryResult?.data?.length

  if (isLoading) {
    return (
      <>
        <TopBar title="Recovery" />
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  const recoveryStatus = recoveryResult?.recoveryStats?.status || 'moderate'
  const tips = getRecoveryTips(recoveryStatus)

  return (
    <>
      <TopBar title="Recovery" />
      <div className="p-6 lg:p-8">
        <p className="mb-6 text-muted-foreground">
          Monitor your recovery metrics and optimise performance
        </p>

        {/* Readiness Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-3 mb-6"
        >
          {/* Readiness Gauge */}
          <div className="rounded-xl border border-border bg-card p-6 lg:row-span-2">
            <h2 className="text-lg font-semibold mb-4">Today&apos;s Readiness</h2>
            <ReadinessGauge score={readinessData?.recoveryScore || 0} />

            {/* Mode Badge */}
            {readinessData?.hasData && readinessData.mode && (
              <div className="mt-4 flex justify-center">
                <span className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  readinessData.mode === 'training_day'
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-blue-500/10 text-blue-600'
                )}>
                  {readinessData.mode === 'training_day' ? 'Training Day' : 'Rest Day'}
                </span>
              </div>
            )}

            {/* Readiness Breakdown */}
            <div className="mt-6 space-y-3">
              <ReadinessBar
                label="Sleep Score"
                value={readinessData?.sleepScore || 0}
                icon={Moon}
                colour="indigo"
              />
              <ReadinessBar
                label="Strain"
                value={readinessData?.strainPercentage || 0}
                icon={Zap}
                colour="amber"
              />
              <ReadinessBar
                label="Recovery"
                value={readinessData?.recoveryScore || 0}
                icon={Heart}
                colour="green"
              />
            </div>
          </div>

          {/* Recovery Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <RecoveryCard
              icon={Activity}
              label="Current HRV"
              value={recoveryResult?.hrvStats?.current || 0}
              unit="ms"
              status={getHRVStatus(recoveryResult?.hrvStats?.current || 0, recoveryResult?.hrvStats?.baseline || 50)}
              trend={recoveryResult?.hrvStats?.trend || 'stable'}
              subtext={`7-day avg: ${recoveryResult?.hrvStats?.sevenDayAvg || 0}ms`}
            />
            <RecoveryCard
              icon={Heart}
              label="Resting HR"
              value={recoveryResult?.recoveryStats?.restingHR || 0}
              unit="bpm"
              status={getRHRStatus(recoveryResult?.recoveryStats?.restingHR || 0)}
              trend={recoveryResult?.recoveryStats?.restingHRTrend || 'stable'}
              subtext={recoveryResult?.recoveryStats?.restingHRTrend === 'improving' ? 'Trending lower' : undefined}
            />
            <RecoveryCard
              icon={Moon}
              label="Avg Sleep"
              value={sleepResult?.stats?.averageDuration || 0}
              unit="h"
              status={getSleepStatus(sleepResult?.stats?.averageDuration || 0)}
              trend={sleepResult?.stats?.trend || 'stable'}
              subtext={`Score: ${sleepResult?.stats?.averageScore || 0}%`}
            />
            <RecoveryCard
              icon={Wind}
              label="Sleep Bank"
              value={formatSleepBank(sleepResult?.stats?.sleepBank || 0)}
              status={sleepResult?.stats?.sleepBank && sleepResult.stats.sleepBank >= 0 ? 'good' : 'poor'}
              subtext={sleepResult?.stats?.sleepBank && sleepResult.stats.sleepBank >= 0 ? 'Surplus' : 'Debt'}
            />
          </div>

          {/* Additional Metrics */}
          {recoveryResult?.data && recoveryResult.data.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
              {recoveryResult.data[recoveryResult.data.length - 1]?.respiratory_rate && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Wind className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Respiratory Rate</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {recoveryResult.data[recoveryResult.data.length - 1].respiratory_rate}
                    <span className="text-sm text-muted-foreground font-normal"> br/min</span>
                  </p>
                </div>
              )}
              {recoveryResult.data[recoveryResult.data.length - 1]?.oxygen_saturation && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">SpO2</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {recoveryResult.data[recoveryResult.data.length - 1].oxygen_saturation}
                    <span className="text-sm text-muted-foreground font-normal">%</span>
                  </p>
                </div>
              )}
              {recoveryResult.data[recoveryResult.data.length - 1]?.wrist_temperature !== null && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Wrist Temp</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {recoveryResult.data[recoveryResult.data.length - 1].wrist_temperature! > 0 ? '+' : ''}
                    {recoveryResult.data[recoveryResult.data.length - 1].wrist_temperature?.toFixed(1)}
                    <span className="text-sm text-muted-foreground font-normal">°C</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Strain vs Recovery Alert */}
        {strainResult?.alerts && strainResult.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            {strainResult.alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-xl border p-4 flex items-start gap-3',
                  alert.type === 'warning'
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-blue-500/50 bg-blue-500/10'
                )}
              >
                <AlertCircle className={cn(
                  'h-5 w-5 mt-0.5 shrink-0',
                  alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                )} />
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Charts Grid */}
        {hasData ? (
          <>
            {/* Strain vs Recovery Chart */}
            {strainResult?.data && strainResult.data.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-border bg-card p-6 mb-6"
              >
                <h2 className="text-lg font-semibold mb-4">Strain vs Recovery (7 Days)</h2>
                <StrainRecoveryChart data={strainResult.data} />
              </motion.div>
            )}

            {/* Sleep Charts */}
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              {sleepResult?.data && sleepResult.data.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">Sleep Duration (30 Days)</h2>
                    <SleepDurationChart data={sleepResult.data} targetHours={8} />
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Average</span>
                      <span className="font-bold">{sleepResult.stats?.averageDuration || 0}h</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">Sleep Quality (30 Days)</h2>
                    <SleepQualityChart data={sleepResult.data} />
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="font-bold">{sleepResult.stats?.averageScore || 0}%</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">Sleep Phases (7 Days)</h2>
                    <SleepPhasesChart data={sleepResult.data} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">Sleep Bank (30 Days)</h2>
                    <SleepBankChart data={sleepResult.data} />
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Status</span>
                      <span className={cn(
                        'font-bold',
                        (sleepResult.stats?.sleepBank || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      )}>
                        {formatSleepBank(sleepResult.stats?.sleepBank || 0)}
                      </span>
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            {/* HRV & Recovery Charts */}
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              {recoveryResult?.data && recoveryResult.data.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">HRV Trend (30 Days)</h2>
                    <HRVTrendChart data={recoveryResult.data} />
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Current</span>
                        <span className="font-bold">{recoveryResult.hrvStats?.current || 0}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">7-day Avg</span>
                        <span className="font-bold">{recoveryResult.hrvStats?.sevenDayAvg || 0}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Baseline</span>
                        <span className="font-bold">{recoveryResult.hrvStats?.baseline || 0}ms</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h2 className="text-lg font-semibold mb-4">Resting Heart Rate (30 Days)</h2>
                    <RestingHRChart data={recoveryResult.data} />
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current RHR</span>
                      <span className="font-bold">{recoveryResult.recoveryStats?.restingHR || 0} bpm</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
                  >
                    <h2 className="text-lg font-semibold mb-4">Recovery Score (30 Days)</h2>
                    <RecoveryScoreChart data={recoveryResult.data} />
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">7-day Average</span>
                      <span className="font-bold">{recoveryResult.recoveryStats?.sevenDayAvg || 0}%</span>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-12 text-center mb-6"
          >
            <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recovery Data Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect your Apple Watch and sync data from the iOS app to see your recovery metrics here.
            </p>
          </motion.div>
        )}

        {/* Recovery Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Recovery Recommendations</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <tip.icon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">{tip.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}

// Helper functions
function getHRVStatus(current: number, baseline: number): 'good' | 'moderate' | 'poor' | 'normal' {
  const diff = ((current - baseline) / baseline) * 100
  if (diff >= 5) return 'good'
  if (diff >= -10) return 'normal'
  if (diff >= -20) return 'moderate'
  return 'poor'
}

function getRHRStatus(rhr: number): 'good' | 'moderate' | 'poor' | 'normal' {
  if (rhr <= 60) return 'good'
  if (rhr <= 70) return 'normal'
  if (rhr <= 80) return 'moderate'
  return 'poor'
}

function getSleepStatus(hours: number): 'good' | 'moderate' | 'poor' | 'normal' {
  if (hours >= 7 && hours <= 9) return 'good'
  if (hours >= 6 && hours < 7) return 'moderate'
  if (hours > 9) return 'normal'
  return 'poor'
}

function formatSleepBank(minutes: number): string {
  const hours = Math.floor(Math.abs(minutes) / 60)
  const mins = Math.abs(minutes) % 60
  const sign = minutes >= 0 ? '+' : '-'
  return hours > 0 ? `${sign}${hours}h ${mins}m` : `${sign}${mins}m`
}

interface RecoveryCardProps {
  icon: React.ElementType
  label: string
  value: number | string
  unit?: string
  status: 'good' | 'moderate' | 'poor' | 'normal'
  trend?: 'improving' | 'declining' | 'stable'
  subtext?: string
}

function RecoveryCard({ icon: Icon, label, value, unit, status, trend, subtext }: RecoveryCardProps) {
  const statusColors = {
    good: 'text-green-500 bg-green-500/10',
    moderate: 'text-amber-500 bg-amber-500/10',
    poor: 'text-red-500 bg-red-500/10',
    normal: 'text-blue-500 bg-blue-500/10',
  }

  const trendMap = {
    improving: { icon: TrendingUp, colour: 'text-green-500' },
    declining: { icon: TrendingDown, colour: 'text-red-500' },
    stable: { icon: Minus, colour: 'text-muted-foreground' },
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-2 rounded-lg', statusColors[status])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={cn('p-1 rounded', trendMap[trend].colour)}>
            {trend === 'improving' && <TrendingUp className="h-4 w-4" />}
            {trend === 'declining' && <TrendingDown className="h-4 w-4" />}
            {trend === 'stable' && <Minus className="h-4 w-4" />}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">
        {value}{unit}
      </p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  )
}

interface ReadinessBarProps {
  label: string
  value: number
  icon: React.ElementType
  colour: 'indigo' | 'amber' | 'green' | 'blue' | 'red'
}

function ReadinessBar({ label, value, icon: Icon, colour }: ReadinessBarProps) {
  const colourClasses = {
    indigo: 'text-indigo-500 bg-indigo-500',
    amber: 'text-amber-500 bg-amber-500',
    green: 'text-green-500 bg-green-500',
    blue: 'text-blue-500 bg-blue-500',
    red: 'text-red-500 bg-red-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon className={cn('h-4 w-4', colourClasses[colour].split(' ')[0])} />
          {label}
        </span>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colourClasses[colour].split(' ')[1])}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
