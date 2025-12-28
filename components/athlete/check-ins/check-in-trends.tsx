'use client'

import { useMemo, useState } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  Scale,
  Footprints,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendDataPoint {
  date: Date
  weight?: number
  steps?: number
  sleep?: number
}

interface CheckInTrendsProps {
  data: TrendDataPoint[]
  weightUnit?: string
}

type MetricType = 'weight' | 'steps' | 'sleep'

const metricConfig = {
  weight: {
    label: 'Weight',
    unit: 'kg',
    color: '#10b981',
    icon: Scale,
    domain: (data: number[]) => {
      const min = Math.min(...data)
      const max = Math.max(...data)
      const padding = (max - min) * 0.2
      return [Math.max(0, min - padding), max + padding]
    },
  },
  steps: {
    label: 'Steps',
    unit: 'steps',
    color: '#3b82f6',
    icon: Footprints,
    domain: () => [0, 'auto'] as [number, 'auto'],
  },
  sleep: {
    label: 'Sleep',
    unit: 'hrs',
    color: '#8b5cf6',
    icon: Moon,
    domain: () => [0, 12] as [number, number],
  },
}

function MetricToggle({
  metric,
  isActive,
  onClick,
  value,
  change,
  unitOverride,
}: {
  metric: MetricType
  isActive: boolean
  onClick: () => void
  value?: number
  change?: number
  unitOverride?: string
}) {
  const config = metricConfig[metric]
  const unit = unitOverride || config.unit
  const Icon = config.icon

  const getTrendIcon = (change?: number) => {
    if (!change) return null
    if (change > 0) return { Icon: TrendingUp, color: metric === 'weight' ? 'text-rose-500' : 'text-emerald-500' }
    if (change < 0) return { Icon: TrendingDown, color: metric === 'weight' ? 'text-emerald-500' : 'text-rose-500' }
    return { Icon: Minus, color: 'text-muted-foreground' }
  }

  const trend = getTrendIcon(change)

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg p-3 text-left transition-all',
        isActive
          ? 'ring-2 ring-offset-2'
          : 'bg-muted/30 hover:bg-muted/50'
      )}
      style={{
        backgroundColor: isActive ? `${config.color}10` : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon
          className="h-4 w-4"
          style={{ color: config.color }}
        />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
      {value !== undefined ? (
        <>
          <p className="text-xl font-bold">
            {metric === 'steps' ? value.toLocaleString() : value}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          </p>
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs mt-1', trend.color)}>
              <trend.Icon className="h-3 w-3" />
              {change! > 0 ? '+' : ''}{metric === 'steps' ? change?.toLocaleString() : change?.toFixed(1)}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No data</p>
      )}
    </button>
  )
}

export function CheckInTrends({ data, weightUnit = 'kg' }: CheckInTrendsProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('weight')

  // Override weight unit in config
  const activeConfig = {
    ...metricConfig,
    weight: {
      ...metricConfig.weight,
      unit: weightUnit,
    },
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(d => ({
        ...d,
        dateStr: d.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      }))
  }, [data])

  // Calculate averages and changes
  const stats = useMemo(() => {
    const weights = data.filter(d => d.weight !== undefined).map(d => d.weight!)
    const steps = data.filter(d => d.steps !== undefined).map(d => d.steps!)
    const sleeps = data.filter(d => d.sleep !== undefined).map(d => d.sleep!)

    const calcAvg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined
    const calcChange = (arr: number[]) => arr.length >= 2 ? arr[arr.length - 1] - arr[0] : undefined

    return {
      weight: {
        avg: weights.length > 0 ? weights[weights.length - 1] : undefined,
        change: calcChange(weights),
      },
      steps: {
        avg: calcAvg(steps) ? Math.round(calcAvg(steps)!) : undefined,
        change: calcChange(steps) ? Math.round(calcChange(steps)!) : undefined,
      },
      sleep: {
        avg: calcAvg(sleeps) ? Number(calcAvg(sleeps)!.toFixed(1)) : undefined,
        change: calcChange(sleeps) ? Number(calcChange(sleeps)!.toFixed(1)) : undefined,
      },
    }
  }, [data])

  const config = activeConfig[activeMetric]
  const metricValues = chartData.map(d => d[activeMetric]).filter(v => v !== undefined) as number[]
  const yDomain = config.domain(metricValues)

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No trend data yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Submit check-ins to see your progress over time
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Metric toggles */}
      <div className="flex gap-3">
        <MetricToggle
          metric="weight"
          isActive={activeMetric === 'weight'}
          onClick={() => setActiveMetric('weight')}
          value={stats.weight.avg}
          change={stats.weight.change}
          unitOverride={weightUnit}
        />
        <MetricToggle
          metric="steps"
          isActive={activeMetric === 'steps'}
          onClick={() => setActiveMetric('steps')}
          value={stats.steps.avg}
          change={stats.steps.change}
        />
        <MetricToggle
          metric="sleep"
          isActive={activeMetric === 'sleep'}
          onClick={() => setActiveMetric('sleep')}
          value={stats.sleep.avg}
          change={stats.sleep.change}
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
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
                tickFormatter={(value) =>
                  activeMetric === 'steps' ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined, name: string | undefined) => [
                  activeMetric === 'steps'
                    ? (value ?? 0).toLocaleString()
                    : value ?? 0,
                  name || config.label,
                ]}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={config.color}
                strokeWidth={2}
                fill={`url(#gradient-${activeMetric})`}
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground">
        Showing data from {chartData.length} check-in{chartData.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export type { TrendDataPoint }
