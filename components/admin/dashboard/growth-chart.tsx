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
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { Users, UserPlus, UserMinus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GrowthDataPoint {
  date: string
  totalUsers: number
  coaches: number
  athletes: number
  newSignups?: number
  churned?: number
}

interface GrowthChartProps {
  data: GrowthDataPoint[]
  timeRange?: '3m' | '6m' | '1y' | 'all'
  onTimeRangeChange?: (range: '3m' | '6m' | '1y' | 'all') => void
}

const timeRanges = [
  { value: '3m' as const, label: '3M' },
  { value: '6m' as const, label: '6M' },
  { value: '1y' as const, label: '1Y' },
  { value: 'all' as const, label: 'All' },
]

const lineConfig = [
  { key: 'totalUsers', name: 'Total Users', color: '#3b82f6', show: true },
  { key: 'coaches', name: 'Coaches', color: '#8b5cf6', show: true },
  { key: 'athletes', name: 'Athletes', color: '#10b981', show: true },
]

export function GrowthChart({
  data,
  timeRange = '6m',
  onTimeRangeChange,
}: GrowthChartProps) {
  const [activeRange, setActiveRange] = useState(timeRange)
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    totalUsers: true,
    coaches: true,
    athletes: true,
  })

  // Calculate stats
  const stats = useMemo(() => {
    if (data.length < 2) return null

    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    const first = data[0]

    const totalGrowth = ((current.totalUsers - first.totalUsers) / first.totalUsers) * 100
    const monthlyGrowth = ((current.totalUsers - previous.totalUsers) / previous.totalUsers) * 100

    const totalNewSignups = data.reduce((sum, d) => sum + (d.newSignups || 0), 0)
    const totalChurned = data.reduce((sum, d) => sum + (d.churned || 0), 0)

    return {
      totalUsers: current.totalUsers,
      coaches: current.coaches,
      athletes: current.athletes,
      totalGrowth,
      monthlyGrowth,
      totalNewSignups,
      totalChurned,
      netGrowth: totalNewSignups - totalChurned,
    }
  }, [data])

  const toggleLine = (key: string) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold">User Growth</h3>
          {stats && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold mt-1"
            >
              {stats.totalUsers.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-2">total users</span>
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
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg bg-blue-500/10 p-3">
            <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
              <Users className="h-3 w-3" />
              Total
            </div>
            <p className="text-lg font-semibold">{stats.totalUsers.toLocaleString()}</p>
          </div>

          <div className="rounded-lg bg-violet-500/10 p-3">
            <p className="text-xs text-violet-600 mb-1">Coaches</p>
            <p className="text-lg font-semibold">{stats.coaches.toLocaleString()}</p>
          </div>

          <div className="rounded-lg bg-emerald-500/10 p-3">
            <p className="text-xs text-emerald-600 mb-1">Athletes</p>
            <p className="text-lg font-semibold">{stats.athletes.toLocaleString()}</p>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              Growth
            </div>
            <p className={cn(
              'text-lg font-semibold',
              stats.monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Line toggles */}
      <div className="flex gap-4 mb-4">
        {lineConfig.map((line) => (
          <button
            key={line.key}
            onClick={() => toggleLine(line.key)}
            className={cn(
              'flex items-center gap-2 text-xs font-medium transition-opacity',
              visibleLines[line.key] ? 'opacity-100' : 'opacity-40'
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            {line.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                lineConfig.find((l) => l.key === name)?.name || name,
              ]}
            />
            {lineConfig.map((line) => (
              visibleLines[line.key] && (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Net growth indicator */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-emerald-500" />
            <span className="text-muted-foreground">New signups:</span>
            <span className="font-medium text-emerald-600">+{stats.totalNewSignups.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserMinus className="h-4 w-4 text-rose-500" />
            <span className="text-muted-foreground">Churned:</span>
            <span className="font-medium text-rose-600">-{stats.totalChurned.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Net:</span>
            <span className={cn(
              'font-medium',
              stats.netGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {stats.netGrowth >= 0 ? '+' : ''}{stats.netGrowth.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export type { GrowthDataPoint, GrowthChartProps }
