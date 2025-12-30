'use client'

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
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import type { DailyRecoverySummary } from '@/types/healthkit'

interface RestingHRChartProps {
  data: DailyRecoverySummary[]
  className?: string
}

export function RestingHRChart({ data, className }: RestingHRChartProps) {
  // Calculate 7-day rolling average
  const chartData = data.map((d, index) => {
    const last7Days = data.slice(Math.max(0, index - 6), index + 1)
    const rhrValues = last7Days.filter(day => day.resting_hr != null).map(day => day.resting_hr!)
    const avg = rhrValues.length > 0
      ? Math.round(rhrValues.reduce((sum, val) => sum + val, 0) / rhrValues.length)
      : null

    return {
      date: d.date,
      formattedDate: format(parseISO(d.date), 'MMM dd'),
      rhr: d.resting_hr || null,
      avg,
    }
  })

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            domain={['dataMin - 5', 'dataMax + 5']}
            tickFormatter={(value) => `${value}`}
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
            formatter={(value, name) => [
              value != null ? `${value} bpm` : 'N/A',
              name === 'rhr' ? 'Daily RHR' : '7-day Avg'
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground">
                {value === 'rhr' ? 'Daily RHR' : '7-day Average'}
              </span>
            )}
          />
          {/* Daily RHR */}
          <Line
            type="monotone"
            dataKey="rhr"
            stroke="#fca5a5"
            strokeWidth={1.5}
            dot={{ fill: '#fca5a5', r: 2, strokeWidth: 0 }}
            activeDot={{ fill: '#ef4444', r: 4, strokeWidth: 2, stroke: '#fff' }}
            connectNulls
            name="rhr"
          />
          {/* 7-day rolling average */}
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ fill: '#ef4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
            connectNulls
            name="avg"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
