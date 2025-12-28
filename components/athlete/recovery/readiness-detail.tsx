'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  Heart,
  Moon,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReadinessMetric {
  name: string
  score: number
  maxScore: number
  status: 'optimal' | 'good' | 'moderate' | 'low'
  trend?: 'improving' | 'declining' | 'stable'
  description?: string
}

interface ReadinessDetailProps {
  overallScore: number
  metrics: ReadinessMetric[]
  recommendation?: string
  lastUpdated?: Date
}

const statusConfig = {
  optimal: { color: 'text-emerald-600', bgColor: 'bg-emerald-500', label: 'Optimal' },
  good: { color: 'text-blue-600', bgColor: 'bg-blue-500', label: 'Good' },
  moderate: { color: 'text-amber-600', bgColor: 'bg-amber-500', label: 'Moderate' },
  low: { color: 'text-rose-600', bgColor: 'bg-rose-500', label: 'Low' },
}

const metricIcons: Record<string, typeof Heart> = {
  'HRV': Heart,
  'Sleep': Moon,
  'Recovery': Activity,
  'Stress': Brain,
  'Energy': Zap,
}

function MetricBar({
  metric,
  index,
}: {
  metric: ReadinessMetric
  index: number
}) {
  const config = statusConfig[metric.status]
  const Icon = metricIcons[metric.name] || Activity
  const percentage = (metric.score / metric.maxScore) * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.color)} />
          <span className="font-medium">{metric.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('font-semibold', config.color)}>
            {metric.score}/{metric.maxScore}
          </span>
          {metric.trend && (
            <>
              {metric.trend === 'improving' && (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              )}
              {metric.trend === 'declining' && (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
              {metric.trend === 'stable' && (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.05 }}
          className={cn('h-full rounded-full', config.bgColor)}
        />
      </div>

      {metric.description && (
        <p className="text-xs text-muted-foreground">{metric.description}</p>
      )}
    </motion.div>
  )
}

function RadialGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  const getScoreColor = () => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#3b82f6'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'Ready to Train'
    if (score >= 60) return 'Moderate'
    if (score >= 40) return 'Take it Easy'
    return 'Rest Day'
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-40 h-40 -rotate-90">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <motion.circle
          cx="80"
          cy="80"
          r="45"
          fill="none"
          stroke={getScoreColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-sm text-muted-foreground">{getScoreLabel()}</span>
      </div>
    </div>
  )
}

export function ReadinessDetail({
  overallScore,
  metrics,
  recommendation,
  lastUpdated,
}: ReadinessDetailProps) {
  const getRecommendationStyle = () => {
    if (overallScore >= 80) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
    if (overallScore >= 60) return 'bg-blue-500/10 border-blue-500/30 text-blue-600'
    if (overallScore >= 40) return 'bg-amber-500/10 border-amber-500/30 text-amber-600'
    return 'bg-rose-500/10 border-rose-500/30 text-rose-600'
  }

  return (
    <div className="space-y-6">
      {/* Header with gauge */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <RadialGauge score={overallScore} />

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">Readiness Score</h2>
            <p className="text-muted-foreground mt-1">
              Based on your HRV, sleep quality, and recovery metrics
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {lastUpdated.toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div className={cn(
            'mt-6 rounded-lg border p-4',
            getRecommendationStyle()
          )}>
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Today's Recommendation</p>
                <p className="text-sm mt-1 opacity-90">{recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics breakdown */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="font-semibold">Breakdown</h3>
        {metrics.map((metric, i) => (
          <MetricBar key={metric.name} metric={metric} index={i} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {Object.entries(statusConfig).map(([key, config]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn('h-3 w-3 rounded-full', config.bgColor)} />
            <span className="text-muted-foreground">{config.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export type { ReadinessMetric }
