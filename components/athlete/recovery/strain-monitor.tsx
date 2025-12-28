'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Zap,
  AlertTriangle,
  Check,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DayStrain {
  date: Date
  strain: number // 0-21 scale
  recovery: number // 0-100%
  activities?: string[]
}

interface StrainMonitorProps {
  data: DayStrain[]
  currentStrain: number
  currentRecovery: number
  weeklyTarget?: number
}

const strainColors = {
  low: { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Low' },
  moderate: { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Moderate' },
  high: { color: 'text-amber-600', bg: 'bg-amber-500', label: 'High' },
  overreaching: { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Overreaching' },
}

function getStrainLevel(strain: number): keyof typeof strainColors {
  if (strain <= 7) return 'low'
  if (strain <= 13) return 'moderate'
  if (strain <= 18) return 'high'
  return 'overreaching'
}

function getRecoveryColor(recovery: number): string {
  if (recovery >= 67) return 'text-emerald-600'
  if (recovery >= 34) return 'text-amber-600'
  return 'text-rose-600'
}

function StrainGauge({ strain, recovery }: { strain: number; recovery: number }) {
  const level = getStrainLevel(strain)
  const config = strainColors[level]
  const strainPercent = (strain / 21) * 100
  const recoveryColor = getRecoveryColor(recovery)

  return (
    <div className="flex items-center gap-8">
      {/* Strain gauge */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className={cn('h-5 w-5', config.color)} />
            <span className="font-medium">Strain</span>
          </div>
          <span className={cn('font-bold text-xl', config.color)}>
            {strain.toFixed(1)}
          </span>
        </div>
        <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strainPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn('h-full rounded-full', config.bg)}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0</span>
          <span className={config.color}>{config.label}</span>
          <span>21</span>
        </div>
      </div>

      {/* Recovery gauge */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className={cn('h-5 w-5', recoveryColor)} />
            <span className="font-medium">Recovery</span>
          </div>
          <span className={cn('font-bold text-xl', recoveryColor)}>
            {recovery}%
          </span>
        </div>
        <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${recovery}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              recovery >= 67 ? 'bg-emerald-500' : recovery >= 34 ? 'bg-amber-500' : 'bg-rose-500'
            )}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0%</span>
          <span className={recoveryColor}>
            {recovery >= 67 ? 'High' : recovery >= 34 ? 'Moderate' : 'Low'}
          </span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

function DayBar({ day, maxStrain }: { day: DayStrain; maxStrain: number }) {
  const level = getStrainLevel(day.strain)
  const config = strainColors[level]
  const heightPercent = (day.strain / maxStrain) * 100

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="relative h-32 w-full flex items-end justify-center">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${heightPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('w-full max-w-8 rounded-t', config.bg, 'opacity-80 hover:opacity-100 cursor-pointer transition-opacity')}
          title={`Strain: ${day.strain.toFixed(1)}, Recovery: ${day.recovery}%`}
        />
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-medium">
          {day.date.toLocaleDateString('en-GB', { weekday: 'short' })}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {day.strain.toFixed(1)}
        </p>
      </div>
    </div>
  )
}

export function StrainMonitor({
  data,
  currentStrain,
  currentRecovery,
  weeklyTarget = 100,
}: StrainMonitorProps) {
  // Get last 7 days
  const weekData = useMemo(() => {
    return [...data]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-7)
  }, [data])

  // Calculate weekly total
  const weeklyTotal = weekData.reduce((sum, d) => sum + d.strain, 0)
  const weeklyProgress = (weeklyTotal / weeklyTarget) * 100

  // Max strain for scaling
  const maxStrain = Math.max(...weekData.map(d => d.strain), 21)

  // Get recommendation
  const getRecommendation = () => {
    const level = getStrainLevel(currentStrain)
    if (currentRecovery < 34) {
      return {
        icon: AlertTriangle,
        color: 'text-rose-600',
        bg: 'bg-rose-500/10',
        message: 'Recovery is low. Consider a rest day or light activity.',
      }
    }
    if (level === 'overreaching') {
      return {
        icon: AlertTriangle,
        color: 'text-amber-600',
        bg: 'bg-amber-500/10',
        message: 'High strain accumulated. Monitor for signs of overtraining.',
      }
    }
    if (currentRecovery >= 67 && currentStrain < 10) {
      return {
        icon: TrendingUp,
        color: 'text-emerald-600',
        bg: 'bg-emerald-500/10',
        message: 'Great recovery! You can push harder today.',
      }
    }
    return {
      icon: Check,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
      message: 'Balanced strain and recovery. Continue as planned.',
    }
  }

  const recommendation = getRecommendation()
  const RecIcon = recommendation.icon

  return (
    <div className="space-y-6">
      {/* Current status */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Current Status</h3>
        <StrainGauge strain={currentStrain} recovery={currentRecovery} />

        {/* Recommendation */}
        <div className={cn('mt-6 rounded-lg p-4', recommendation.bg)}>
          <div className="flex items-start gap-3">
            <RecIcon className={cn('h-5 w-5 shrink-0 mt-0.5', recommendation.color)} />
            <p className={cn('text-sm', recommendation.color)}>{recommendation.message}</p>
          </div>
        </div>
      </div>

      {/* Weekly progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Weekly Strain</h3>
          <div className="text-right">
            <p className="text-lg font-bold">{weeklyTotal.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">of {weeklyTarget} target</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 w-full rounded-full bg-muted mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(weeklyProgress, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              weeklyProgress >= 100 ? 'bg-emerald-500' : weeklyProgress >= 70 ? 'bg-amber-500' : 'bg-blue-500'
            )}
          />
        </div>

        {/* Daily bars */}
        <div className="flex gap-1">
          {weekData.map((day) => (
            <DayBar key={day.date.toISOString()} day={day} maxStrain={maxStrain} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {Object.entries(strainColors).map(([key, config]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn('h-3 w-3 rounded-full', config.bg)} />
            <span className="text-muted-foreground">{config.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export type { DayStrain }
