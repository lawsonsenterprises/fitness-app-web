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
  BarChart,
  Bar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RevenueDataPoint {
  date: string
  mrr: number
  newRevenue?: number
  churnedRevenue?: number
  expansionRevenue?: number
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
  currentMrr?: number
  previousMrr?: number
  currency?: string
  showBreakdown?: boolean
  height?: number
  className?: string
}

const timeRanges = [
  { id: '3m', label: '3M' },
  { id: '6m', label: '6M' },
  { id: '12m', label: '12M' },
  { id: 'all', label: 'All' },
]

const chartViews = [
  { id: 'mrr', label: 'MRR' },
  { id: 'breakdown', label: 'Breakdown' },
]

export function RevenueChart({
  data,
  currentMrr = 0,
  previousMrr = 0,
  currency = '£',
  showBreakdown = true,
  height = 350,
  className,
}: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState('12m')
  const [chartView, setChartView] = useState<'mrr' | 'breakdown'>('mrr')

  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data

    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12
    return data.slice(-months)
  }, [data, timeRange])

  const mrrChange = previousMrr > 0 ? ((currentMrr - previousMrr) / previousMrr) * 100 : 0
  const isPositive = mrrChange >= 0

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${currency}${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${currency}${(value / 1000).toFixed(1)}k`
    }
    return `${currency}${value.toFixed(0)}`
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-3xl font-bold">
                {currency}{currentMrr.toLocaleString()}
              </h2>
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium',
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-rose-500/10 text-rose-600'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {isPositive ? '+' : ''}{mrrChange.toFixed(1)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {currency}{previousMrr.toLocaleString()} last month
            </p>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {/* Time range selector */}
            <div className="flex gap-1 p-1 rounded-lg bg-muted">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    timeRange === range.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Chart view toggle */}
            {showBreakdown && (
              <div className="flex gap-1 p-1 rounded-lg bg-muted">
                {chartViews.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setChartView(view.id as 'mrr' | 'breakdown')}
                    className={cn(
                      'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                      chartView === view.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {chartView === 'mrr' ? (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number | undefined) => [
                    `${currency}${(value ?? 0).toLocaleString()}`,
                    'MRR',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#mrrGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number | undefined, name: string | undefined) => [
                    `${currency}${(value ?? 0).toLocaleString()}`,
                    name === 'newRevenue'
                      ? 'New'
                      : name === 'churnedRevenue'
                        ? 'Churned'
                        : 'Expansion',
                  ]}
                />
                <Bar
                  dataKey="newRevenue"
                  name="New"
                  fill="#22c55e"
                  stackId="stack"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="expansionRevenue"
                  name="Expansion"
                  fill="#3b82f6"
                  stackId="stack"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="churnedRevenue"
                  name="Churned"
                  fill="#ef4444"
                  stackId="stack"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legend for breakdown view */}
      {chartView === 'breakdown' && showBreakdown && (
        <div className="px-6 pb-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-sm text-muted-foreground">New Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-sm text-muted-foreground">Expansion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-sm text-muted-foreground">Churned</span>
          </div>
        </div>
      )}
    </div>
  )
}

export type { RevenueDataPoint, RevenueChartProps }
