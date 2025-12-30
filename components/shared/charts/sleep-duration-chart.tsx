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
import type { DailySleepSummary } from '@/types/healthkit'

interface SleepDurationChartProps {
  data: DailySleepSummary[]
  targetHours?: number
  className?: string
}

export function SleepDurationChart({ data, targetHours = 8, className }: SleepDurationChartProps) {
  const chartData = data.map(d => ({
    date: d.date,
    formattedDate: format(parseISO(d.date), 'MMM dd'),
    hours: d.time_asleep_minutes ? Math.round((d.time_asleep_minutes / 60) * 10) / 10 : 0,
    target: targetHours,
  }))

  const getBarColour = (hours: number) => {
    if (hours < 6) return '#ef4444' // Red - poor
    if (hours < 7) return '#f59e0b' // Amber - low
    if (hours <= 9) return '#22c55e' // Green - optimal
    return '#3b82f6' // Blue - oversleep
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="formattedDate"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(chartData.length / 7)}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={[0, 12]}
            tickFormatter={(value) => `${value}h`}
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
            formatter={(value) => [`${value ?? 0}h`, 'Sleep']}
          />
          <ReferenceLine
            y={targetHours}
            stroke="#22c55e"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{
              value: 'Target',
              position: 'right',
              fill: '#22c55e',
              fontSize: 11,
            }}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColour(entry.hours)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
