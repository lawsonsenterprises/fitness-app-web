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
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RevenueDataPoint {
  date: string
  mrr: number
  newRevenue?: number
  churnedRevenue?: number
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
  timeRange?: '3m' | '6m' | '1y' | 'all'
  onTimeRangeChange?: (range: '3m' | '6m' | '1y' | 'all') => void
}

const timeRanges = [
  { value: '3m' as const, label: '3M' },
  { value: '6m' as const, label: '6M' },
  { value: '1y' as const, label: '1Y' },
  { value: 'all' as const, label: 'All' },
]

export function RevenueChart({
  data,
  timeRange = '6m',
  onTimeRangeChange,
}: RevenueChartProps) {
  const [activeRange, setActiveRange] = useState(timeRange)

  // Calculate stats
  const stats = useMemo(() => {
    if (data.length < 2) return null

    const currentMRR = data[data.length - 1].mrr
    const previousMRR = data[data.length - 2].mrr
    const startMRR = data[0].mrr

    const monthlyChange = ((currentMRR - previousMRR) / previousMRR) * 100
    const totalGrowth = ((currentMRR - startMRR) / startMRR) * 100

    const totalNewRevenue = data.reduce((sum, d) => sum + (d.newRevenue || 0), 0)
    const totalChurned = data.reduce((sum, d) => sum + (d.churnedRevenue || 0), 0)

    return {
      currentMRR,
      monthlyChange,
      totalGrowth,
      totalNewRevenue,
      totalChurned,
    }
  }, [data])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold">Revenue</h3>
          {stats && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold mt-1"
            >
              {formatCurrency(stats.currentMRR)}
              <span className="text-sm font-normal text-muted-foreground ml-2">MRR</span>
            </motion.p>
          )}
        </div>

        {/* Time range selector */}
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

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              {stats.monthlyChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-rose-500" />
              )}
              Monthly Change
            </div>
            <p className={cn(
              'text-lg font-semibold',
              stats.monthlyChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {stats.monthlyChange >= 0 ? '+' : ''}{stats.monthlyChange.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-lg bg-emerald-500/10 p-3">
            <p className="text-xs text-emerald-600 mb-1">New Revenue</p>
            <p className="text-lg font-semibold text-emerald-600">
              +{formatCurrency(stats.totalNewRevenue)}
            </p>
          </div>

          <div className="rounded-lg bg-rose-500/10 p-3">
            <p className="text-xs text-rose-600 mb-1">Churned</p>
            <p className="text-lg font-semibold text-rose-600">
              -{formatCurrency(stats.totalChurned)}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
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
              tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'MRR']}
            />
            <Area
              type="monotone"
              dataKey="mrr"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#mrrGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export type { RevenueDataPoint, RevenueChartProps }
