'use client'

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
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

import { cn } from '@/lib/utils'
import { TopBar } from '@/components/dashboard/top-bar'

// Mock data
const mockRecoveryData = {
  readinessScore: 78,
  hrvStatus: 'normal',
  restingHR: 52,
  sleepScore: 82,
  muscleReadiness: 85,
  mentalReadiness: 72,
}

const mockSleepData = [
  { date: 'Mon', hours: 7.5, quality: 85 },
  { date: 'Tue', hours: 6.5, quality: 70 },
  { date: 'Wed', hours: 8, quality: 90 },
  { date: 'Thu', hours: 7, quality: 75 },
  { date: 'Fri', hours: 7.5, quality: 80 },
  { date: 'Sat', hours: 8.5, quality: 92 },
  { date: 'Sun', hours: 7, quality: 78 },
]

const mockHRVData = [
  { date: 'Mon', hrv: 55, rhr: 54 },
  { date: 'Tue', hrv: 48, rhr: 56 },
  { date: 'Wed', hrv: 62, rhr: 52 },
  { date: 'Thu', hrv: 58, rhr: 53 },
  { date: 'Fri', hrv: 52, rhr: 55 },
  { date: 'Sat', hrv: 65, rhr: 51 },
  { date: 'Sun', hrv: 60, rhr: 52 },
]

const recoveryTips = [
  { icon: Moon, text: 'Aim for 7-9 hours of quality sleep tonight' },
  { icon: Droplets, text: 'Stay hydrated - drink at least 3L of water' },
  { icon: ThermometerSun, text: 'Consider a cold shower for recovery' },
  { icon: Brain, text: 'Try 10 minutes of meditation to reduce stress' },
]

export default function RecoveryPage() {
  return (
    <>
      <TopBar title="Recovery" />
      <div className="p-6 lg:p-8">
        <p className="mb-6 text-muted-foreground">
          Monitor your recovery metrics and optimize performance
        </p>

        {/* Recovery Score Cards */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"
      >
        <RecoveryCard
          icon={Heart}
          label="Readiness"
          value={mockRecoveryData.readinessScore}
          unit="%"
          status={mockRecoveryData.readinessScore >= 70 ? 'good' : 'moderate'}
          trend="up"
        />
        <RecoveryCard
          icon={Activity}
          label="HRV Status"
          value={mockRecoveryData.hrvStatus}
          status="normal"
          showAsText
        />
        <RecoveryCard
          icon={Moon}
          label="Sleep Score"
          value={mockRecoveryData.sleepScore}
          unit="%"
          status={mockRecoveryData.sleepScore >= 80 ? 'good' : 'moderate'}
          trend="stable"
        />
        <RecoveryCard
          icon={Zap}
          label="Resting HR"
          value={mockRecoveryData.restingHR}
          unit="bpm"
          status="good"
          trend="down"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sleep Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Sleep This Week</h2>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSleepData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  domain={[0, 10]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly average</span>
            <span className="font-bold">
              {(mockSleepData.reduce((acc, d) => acc + d.hours, 0) / mockSleepData.length).toFixed(1)}h
            </span>
          </div>
        </motion.div>

        {/* HRV Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">HRV & Resting HR</h2>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockHRVData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hrv"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  name="HRV"
                />
                <Line
                  type="monotone"
                  dataKey="rhr"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  name="RHR"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              HRV (ms)
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Resting HR (bpm)
            </span>
          </div>
        </motion.div>
      </div>

      {/* Recovery Readiness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 grid gap-6 lg:grid-cols-2"
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Readiness Breakdown</h2>

          <div className="space-y-4">
            <ReadinessBar label="Muscle Readiness" value={mockRecoveryData.muscleReadiness} />
            <ReadinessBar label="Mental Readiness" value={mockRecoveryData.mentalReadiness} />
            <ReadinessBar label="Sleep Quality" value={mockRecoveryData.sleepScore} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Recovery Tips</h2>

          <div className="space-y-3">
            {recoveryTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <tip.icon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      </div>
    </>
  )
}

interface RecoveryCardProps {
  icon: React.ElementType
  label: string
  value: number | string
  unit?: string
  status: 'good' | 'moderate' | 'poor' | 'normal'
  trend?: 'up' | 'down' | 'stable'
  showAsText?: boolean
}

function RecoveryCard({ icon: Icon, label, value, unit, status, trend, showAsText }: RecoveryCardProps) {
  const statusColors = {
    good: 'text-green-500 bg-green-500/10',
    moderate: 'text-amber-500 bg-amber-500/10',
    poor: 'text-red-500 bg-red-500/10',
    normal: 'text-blue-500 bg-blue-500/10',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-2 rounded-lg', statusColors[status])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={cn(
            'p-1 rounded',
            trend === 'up' && 'text-green-500',
            trend === 'down' && 'text-red-500',
            trend === 'stable' && 'text-muted-foreground'
          )}>
            {trend === 'up' && <TrendingUp className="h-4 w-4" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4" />}
            {trend === 'stable' && <Minus className="h-4 w-4" />}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', showAsText && 'capitalize')}>
        {value}{unit}
      </p>
    </div>
  )
}

interface ReadinessBarProps {
  label: string
  value: number
}

function ReadinessBar({ label, value }: ReadinessBarProps) {
  const getColor = (v: number) => {
    if (v >= 80) return 'bg-green-500'
    if (v >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', getColor(value))}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
