'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import type { DailySleepSummary } from '@/types/healthkit'

interface SleepPhasesChartProps {
  data: DailySleepSummary[]
  className?: string
}

const PHASE_COLOURS = {
  deep: '#3b82f6', // Blue
  rem: '#8b5cf6', // Purple
  light: '#93c5fd', // Light blue
  awake: '#9ca3af', // Grey
}

export function SleepPhasesChart({ data, className }: SleepPhasesChartProps) {
  // Take last 7 days for clarity
  const recentData = data.slice(-7)

  const chartData = recentData.map(d => ({
    date: d.date,
    formattedDate: format(parseISO(d.date), 'EEE'),
    deep: d.deep_minutes || 0,
    rem: d.rem_minutes || 0,
    light: d.light_minutes || 0,
    awake: d.awake_minutes || 0,
  }))

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
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
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${Math.floor(value / 60)}h`}
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
            formatter={(value, name) => [formatMinutes(Number(value) || 0), String(name)]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={(value) => (
              <span className="text-sm capitalize text-muted-foreground">{value}</span>
            )}
          />
          <Bar dataKey="deep" stackId="sleep" fill={PHASE_COLOURS.deep} name="Deep" radius={[0, 0, 0, 0]} />
          <Bar dataKey="rem" stackId="sleep" fill={PHASE_COLOURS.rem} name="REM" radius={[0, 0, 0, 0]} />
          <Bar dataKey="light" stackId="sleep" fill={PHASE_COLOURS.light} name="Light" radius={[0, 0, 0, 0]} />
          <Bar dataKey="awake" stackId="sleep" fill={PHASE_COLOURS.awake} name="Awake" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
