'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { Users, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EngagementDataPoint {
  date: string
  dau: number // Daily Active Users
  wau: number // Weekly Active Users
  mau: number // Monthly Active Users
}

interface EngagementChartsProps {
  data: EngagementDataPoint[]
  timeRange?: '1m' | '3m' | '6m' | '1y'
  onTimeRangeChange?: (range: '1m' | '3m' | '6m' | '1y') => void
}

const timeRanges = [
  { value: '1m' as const, label: '1M' },
  { value: '3m' as const, label: '3M' },
  { value: '6m' as const, label: '6M' },
  { value: '1y' as const, label: '1Y' },
]

const metricConfig = [
  { key: 'dau', name: 'DAU', color: '#3b82f6', description: 'Daily Active Users' },
  { key: 'wau', name: 'WAU', color: '#8b5cf6', description: 'Weekly Active Users' },
  { key: 'mau', name: 'MAU', color: '#10b981', description: 'Monthly Active Users' },
]

export function EngagementCharts({
  data,
  timeRange = '3m',
  onTimeRangeChange,
}: EngagementChartsProps) {
  const [activeRange, setActiveRange] = useState(timeRange)
  const [activeMetric, setActiveMetric] = useState<'dau' | 'wau' | 'mau'>('dau')

  // Calculate stats
  const stats = useMemo(() => {
    if (data.length < 2) return null

    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    const first = data[0]

    return {
      current,
      dauChange: ((current.dau - previous.dau) / previous.dau) * 100,
      wauChange: ((current.wau - previous.wau) / previous.wau) * 100,
      mauChange: ((current.mau - previous.mau) / previous.mau) * 100,
      dauGrowth: ((current.dau - first.dau) / first.dau) * 100,
      wauGrowth: ((current.wau - first.wau) / first.wau) * 100,
      mauGrowth: ((current.mau - first.mau) / first.mau) * 100,
      dauWauRatio: ((current.dau / current.wau) * 100).toFixed(1),
      wauMauRatio: ((current.wau / current.mau) * 100).toFixed(1),
    }
  }, [data])

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold">User Engagement</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Active users over time
          </p>
        </div>

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

      {/* Metric cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {metricConfig.map((metric) => {
            const value = stats.current[metric.key as keyof typeof stats.current]
            const change = stats[`${metric.key}Change` as keyof typeof stats] as number
            const isActive = activeMetric === metric.key

            return (
              <motion.button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key as typeof activeMetric)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'rounded-lg p-4 text-left transition-colors border',
                  isActive
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: metric.color }}>
                    {metric.name}
                  </span>
                  {change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  )}
                </div>
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                <p className={cn(
                  'text-xs mt-1',
                  change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                )}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}% from yesterday
                </p>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Stickiness metrics */}
      {stats && (
        <div className="flex gap-6 mb-6 p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground">DAU/WAU Ratio</p>
            <p className="text-lg font-semibold">{stats.dauWauRatio}%</p>
            <p className="text-[10px] text-muted-foreground">Daily stickiness</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">WAU/MAU Ratio</p>
            <p className="text-lg font-semibold">{stats.wauMauRatio}%</p>
            <p className="text-[10px] text-muted-foreground">Weekly stickiness</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {metricConfig.map((metric) => (
                <linearGradient
                  key={metric.key}
                  id={`gradient-${metric.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            {metricConfig.map((metric) => (
              <Area
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={activeMetric === metric.key ? 2 : 1}
                fill={`url(#gradient-${metric.key})`}
                fillOpacity={activeMetric === metric.key ? 1 : 0.3}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {metricConfig.map((metric) => (
          <span key={metric.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: metric.color }}
            />
            <span className="text-muted-foreground">{metric.description}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export type { EngagementDataPoint, EngagementChartsProps }
