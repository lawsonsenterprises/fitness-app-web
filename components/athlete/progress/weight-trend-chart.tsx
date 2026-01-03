'use client'

import { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeightDataPoint {
  date: Date
  weight: number
}

interface WeightTrendChartProps {
  data: WeightDataPoint[]
  unit?: 'kg' | 'lbs'
  targetWeight?: number
  startingWeight?: number
  timeRange?: '1m' | '3m' | '6m' | '1y' | 'all'
  onTimeRangeChange?: (range: '1m' | '3m' | '6m' | '1y' | 'all') => void
}

const timeRanges = [
  { value: '1m' as const, label: '1M' },
  { value: '3m' as const, label: '3M' },
  { value: '6m' as const, label: '6M' },
  { value: '1y' as const, label: '1Y' },
  { value: 'all' as const, label: 'All' },
]

export function WeightTrendChart({
  data,
  unit = 'kg',
  targetWeight,
  startingWeight,
  timeRange = '3m',
  onTimeRangeChange,
}: WeightTrendChartProps) {
  const [activeRange, setActiveRange] = useState(timeRange)

  // Filter data by time range
  const filteredData = useMemo(() => {
    const now = new Date()
    let cutoffDate: Date

    switch (activeRange) {
      case '1m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case '3m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case '6m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      case '1y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        return data
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

    const weights = chartData.map(d => d.weight)
    const current = weights[weights.length - 1]
    const start = startingWeight || weights[0]
    const change = current - start
    const min = Math.min(...weights)
    const max = Math.max(...weights)

    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (change > 0.5) trend = 'up'
    else if (change < -0.5) trend = 'down'

    return { current, start, change, min, max, trend }
  }, [chartData, startingWeight])

  // Y axis domain
  const yDomain = useMemo(() => {
    if (!stats) return [0, 100]
    const padding = (stats.max - stats.min) * 0.2 || 5
    let min = stats.min - padding
    let max = stats.max + padding
    if (targetWeight) {
      min = Math.min(min, targetWeight - padding)
      max = Math.max(max, targetWeight + padding)
    }
    return [Math.max(0, min), max]
  }, [stats, targetWeight])

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <Scale className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No weight data yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Submit check-ins to track your weight over time
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Scale className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Current</span>
            </div>
            <p className="text-xl font-bold">{stats.current.toFixed(1)} {unit}</p>
          </div>

          <div className="rounded-xl bg-blue-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              {stats.trend === 'up' && <TrendingUp className="h-4 w-4 text-rose-500" />}
              {stats.trend === 'down' && <TrendingDown className="h-4 w-4 text-emerald-500" />}
              {stats.trend === 'stable' && <Minus className="h-4 w-4 text-blue-500" />}
              <span className="text-xs text-muted-foreground">Change</span>
            </div>
            <p className={cn(
              'text-xl font-bold',
              stats.change > 0 ? 'text-rose-600' : stats.change < 0 ? 'text-emerald-600' : ''
            )}>
              {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} {unit}
            </p>
          </div>

          {targetWeight && (
            <div className="rounded-xl bg-amber-500/10 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Target</span>
              </div>
              <p className="text-xl font-bold">{targetWeight.toFixed(1)} {unit}</p>
            </div>
          )}

          <div className="rounded-xl bg-violet-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Period</span>
            </div>
            <p className="text-xl font-bold">{chartData.length}</p>
            <p className="text-xs text-muted-foreground">data points</p>
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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="dateStr"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${Math.round(Number(value))}kg`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)} ${unit}`, 'Weight']}
              />

              {/* Target line */}
              {targetWeight && (
                <ReferenceLine
                  y={targetWeight}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{
                    value: `Target: ${targetWeight}`,
                    fill: '#f59e0b',
                    fontSize: 12,
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#weightGradient)"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export type { WeightDataPoint }
