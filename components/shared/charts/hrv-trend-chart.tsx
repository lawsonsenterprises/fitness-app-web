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

interface HRVTrendChartProps {
  data: DailyRecoverySummary[]
  className?: string
}

export function HRVTrendChart({ data, className }: HRVTrendChartProps) {
  // Calculate 7-day rolling average
  const chartData = data.map((d, index) => {
    const last7Days = data.slice(Math.max(0, index - 6), index + 1)
    const hrvValues = last7Days.filter(day => day.resting_hrv != null).map(day => day.resting_hrv!)
    const avg = hrvValues.length > 0
      ? Math.round(hrvValues.reduce((sum, val) => sum + val, 0) / hrvValues.length)
      : null

    return {
      date: d.date,
      formattedDate: format(parseISO(d.date), 'MMM dd'),
      hrv: d.resting_hrv || null,
      avg,
    }
  })

  // Calculate baseline (30-day average)
  const allHRVValues = data.filter(d => d.resting_hrv != null).map(d => d.resting_hrv!)
  const baseline = allHRVValues.length > 0
    ? Math.round(allHRVValues.reduce((sum, val) => sum + val, 0) / allHRVValues.length)
    : 0

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
            domain={['dataMin - 10', 'dataMax + 10']}
            tickFormatter={(value) => `${value}ms`}
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
              value != null ? `${value}ms` : 'N/A',
              name === 'hrv' ? 'Daily HRV' : '7-day Avg'
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground">
                {value === 'hrv' ? 'Daily HRV' : '7-day Average'}
              </span>
            )}
          />
          {/* Baseline reference */}
          {baseline > 0 && (
            <Line
              type="monotone"
              dataKey={() => baseline}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              strokeWidth={1}
              dot={false}
              name="baseline"
              legendType="none"
            />
          )}
          {/* Daily HRV - lighter line */}
          <Line
            type="monotone"
            dataKey="hrv"
            stroke="#93c5fd"
            strokeWidth={1.5}
            dot={{ fill: '#93c5fd', r: 2, strokeWidth: 0 }}
            activeDot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
            connectNulls
            name="hrv"
          />
          {/* 7-day rolling average - bold line */}
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
            connectNulls
            name="avg"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
