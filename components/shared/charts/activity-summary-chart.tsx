'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import type { DailyReadinessSummary } from '@/types/healthkit'

interface ActivitySummaryChartProps {
  data: Pick<DailyReadinessSummary, 'date' | 'exercise_minutes'>[]
  targetMinutes?: number
  className?: string
}

export function ActivitySummaryChart({ data, targetMinutes = 30, className }: ActivitySummaryChartProps) {
  // Take last 7 days
  const recentData = data.slice(-7)

  const chartData = recentData.map(d => ({
    date: d.date,
    formattedDate: format(parseISO(d.date), 'EEE'),
    minutes: d.exercise_minutes || 0,
    target: targetMinutes,
  }))

  const getBarColour = (minutes: number) => {
    if (minutes >= targetMinutes) return '#22c55e' // Green - target met
    if (minutes >= targetMinutes * 0.5) return '#f59e0b' // Amber - partial
    return '#9ca3af' // Grey - minimal
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="formattedDate"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}m`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelFormatter={(_, payload) => {
              if (payload && payload[0]) {
                return format(parseISO(payload[0].payload.date), 'EEEE, MMM dd')
              }
              return ''
            }}
            formatter={(value) => [`${value ?? 0} mins`, 'Exercise']}
          />
          <ReferenceLine
            y={targetMinutes}
            stroke="#22c55e"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{
              value: 'Target',
              position: 'right',
              fill: '#22c55e',
              fontSize: 10,
            }}
          />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColour(entry.minutes)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
