'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import type { DailySleepSummary } from '@/types/healthkit'

interface SleepQualityChartProps {
  data: DailySleepSummary[]
  className?: string
}

export function SleepQualityChart({ data, className }: SleepQualityChartProps) {
  const chartData = data.map(d => ({
    date: d.date,
    formattedDate: format(parseISO(d.date), 'MMM dd'),
    score: d.sleep_score || 0,
  }))

  // Calculate average
  const avgScore = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length)
    : 0

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sleepScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
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
            formatter={(value) => [`${value ?? 0}%`, 'Sleep Score']}
          />
          <ReferenceLine
            y={avgScore}
            stroke="#8b5cf6"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Avg ${avgScore}%`,
              position: 'right',
              fill: '#8b5cf6',
              fontSize: 11,
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#sleepScoreGradient)"
            dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
