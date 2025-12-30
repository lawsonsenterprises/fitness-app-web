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
  ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'

interface WeightDataPoint {
  date: string
  weight_kg: number
}

interface WeightTrendChartProps {
  data: WeightDataPoint[]
  goalWeight?: number
  className?: string
}

export function WeightTrendChart({ data, goalWeight, className }: WeightTrendChartProps) {
  // Calculate 7-day moving average
  const chartData = data.map((d, index) => {
    const last7Days = data.slice(Math.max(0, index - 6), index + 1)
    const weights = last7Days.map(day => day.weight_kg)
    const avg = weights.length > 0
      ? Math.round((weights.reduce((sum, val) => sum + val, 0) / weights.length) * 10) / 10
      : null

    return {
      date: d.date,
      formattedDate: format(parseISO(d.date), 'MMM dd'),
      weight: d.weight_kg,
      avg,
    }
  })

  // Calculate min and max for domain with padding
  const weights = chartData.map(d => d.weight)
  const minWeight = Math.min(...weights, goalWeight || Infinity)
  const maxWeight = Math.max(...weights, goalWeight || -Infinity)
  const padding = (maxWeight - minWeight) * 0.1 || 2

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
            domain={[minWeight - padding, maxWeight + padding]}
            tickFormatter={(value) => `${value}kg`}
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
              value != null ? `${value}kg` : 'N/A',
              name === 'weight' ? 'Daily Weight' : '7-day Avg'
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground">
                {value === 'weight' ? 'Daily Weight' : '7-day Average'}
              </span>
            )}
          />

          {/* Goal weight reference line */}
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `Goal ${goalWeight}kg`,
                position: 'right',
                fill: '#22c55e',
                fontSize: 11,
              }}
            />
          )}

          {/* Daily weight points */}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#93c5fd"
            strokeWidth={1.5}
            dot={{ fill: '#93c5fd', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#f59e0b', r: 5, strokeWidth: 2, stroke: '#fff' }}
            name="weight"
          />

          {/* 7-day moving average */}
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ fill: '#f59e0b', r: 5, strokeWidth: 2, stroke: '#fff' }}
            name="avg"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
