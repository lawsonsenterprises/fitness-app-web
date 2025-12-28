'use client'

import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HRVDataPoint {
  date: Date
  hrv: number // milliseconds
  restingHR?: number // bpm
}

interface HRVTrendsProps {
  data: HRVDataPoint[]
  baselineHRV?: number
  timeRange?: '1w' | '2w' | '1m' | '3m'
  onTimeRangeChange?: (range: '1w' | '2w' | '1m' | '3m') => void
}

const timeRanges = [
  { value: '1w' as const, label: '1W' },
  { value: '2w' as const, label: '2W' },
  { value: '1m' as const, label: '1M' },
  { value: '3m' as const, label: '3M' },
]

export function HRVTrends({
  data,
  baselineHRV,
  timeRange = '2w',
  onTimeRangeChange,
}: HRVTrendsProps) {
  const [activeRange, setActiveRange] = useState(timeRange)

  // Filter data by time range
  const filteredData = useMemo(() => {
    const now = new Date()
    let cutoffDate: Date

    switch (activeRange) {
      case '1w':
        cutoffDate = new Date(now.setDate(now.getDate() - 7))
        break
      case '2w':
        cutoffDate = new Date(now.setDate(now.getDate() - 14))
        break
      case '1m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case '3m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      default:
        cutoffDate = new Date(now.setDate(now.getDate() - 14))
    }

    return data.filter(d => d.date >= cutoffDate)
  }, [data, activeRange])

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredData
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(d => ({
        ...d,
        dateStr: d.date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        }),
      }))
  }, [filteredData])

  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return null

    const hrvValues = chartData.map(d => d.hrv)
    const current = hrvValues[hrvValues.length - 1]
    const avg = hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length
    const min = Math.min(...hrvValues)
    const max = Math.max(...hrvValues)
    const baseline = baselineHRV || avg
    const deviationFromBaseline = ((current - baseline) / baseline) * 100

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (hrvValues.length >= 3) {
      const recent = hrvValues.slice(-3)
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
      const earlier = hrvValues.slice(0, 3)
      const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
      if (recentAvg > earlierAvg + 5) trend = 'up'
      else if (recentAvg < earlierAvg - 5) trend = 'down'
    }

    return {
      current,
      avg: Math.round(avg),
      min,
      max,
      baseline,
      deviationFromBaseline,
      trend,
    }
  }, [chartData, baselineHRV])

  // Y axis domain
  const yDomain = useMemo(() => {
    if (!stats) return [0, 100]
    const padding = (stats.max - stats.min) * 0.2 || 10
    return [Math.max(0, stats.min - padding), stats.max + padding]
  }, [stats])

  // Get status based on deviation from baseline
  const getStatus = () => {
    if (!stats) return null
    const dev = stats.deviationFromBaseline
    if (dev >= 5) return { label: 'Above Baseline', color: 'text-emerald-600', message: 'Good recovery - you can push harder today' }
    if (dev <= -10) return { label: 'Below Baseline', color: 'text-rose-600', message: 'Consider a lighter training day' }
    return { label: 'At Baseline', color: 'text-blue-600', message: 'Normal recovery - train as planned' }
  }

  const status = getStatus()

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No HRV data yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Connect your wearable to track HRV trends
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-rose-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-xs text-muted-foreground">Current</span>
            </div>
            <p className="text-xl font-bold">{stats.current}ms</p>
            {status && (
              <p className={cn('text-xs', status.color)}>{status.label}</p>
            )}
          </div>

          <div className="rounded-xl bg-blue-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Average</span>
            </div>
            <p className="text-xl font-bold">{stats.avg}ms</p>
            <p className="text-xs text-muted-foreground">
              Range: {stats.min}-{stats.max}
            </p>
          </div>

          <div className="rounded-xl bg-violet-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              {stats.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
              {stats.trend === 'down' && <TrendingDown className="h-4 w-4 text-rose-500" />}
              {stats.trend === 'stable' && <Minus className="h-4 w-4 text-violet-500" />}
              <span className="text-xs text-muted-foreground">Trend</span>
            </div>
            <p className="text-xl font-bold capitalize">{stats.trend}</p>
            <p className="text-xs text-muted-foreground">
              {stats.deviationFromBaseline > 0 ? '+' : ''}{stats.deviationFromBaseline.toFixed(0)}% from baseline
            </p>
          </div>

          <div className="rounded-xl bg-amber-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs text-muted-foreground">Baseline</span>
            </div>
            <p className="text-xl font-bold">{Math.round(stats.baseline)}ms</p>
            <p className="text-xs text-muted-foreground">Your normal</p>
          </div>
        </div>
      )}

      {/* Status message */}
      {status && (
        <div className={cn(
          'rounded-lg border p-4',
          status.color.replace('text-', 'bg-').replace('600', '500/10'),
          status.color.replace('text-', 'border-').replace('600', '500/30')
        )}>
          <div className="flex items-start gap-3">
            <Info className={cn('h-5 w-5 shrink-0 mt-0.5', status.color)} />
            <p className={cn('text-sm', status.color)}>{status.message}</p>
          </div>
        </div>
      )}

      {/* Time range selector */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-border p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => {
                setActiveRange(range.value)
                onTimeRangeChange?.(range.value)
              }}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                activeRange === range.value
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold mb-4">HRV Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

              {/* Baseline reference area */}
              {stats && (
                <ReferenceArea
                  y1={stats.baseline * 0.9}
                  y2={stats.baseline * 1.1}
                  fill="hsl(var(--muted))"
                  fillOpacity={0.3}
                />
              )}

              <XAxis
                dataKey="dateStr"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => [`${value ?? 0}ms`, 'HRV']}
              />
              <Line
                type="monotone"
                dataKey="hrv"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Shaded area represents ±10% of your baseline
        </p>
      </div>
    </div>
  )
}

export type { HRVDataPoint }
