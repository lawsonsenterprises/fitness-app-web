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
  ReferenceArea,
} from 'recharts'
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import type { DailyReadinessSummary } from '@/types/healthkit'

interface StrainRecoveryChartProps {
  data: Pick<DailyReadinessSummary, 'date' | 'strain_score' | 'recovery_score' | 'mode'>[]
  className?: string
}

export function StrainRecoveryChart({ data, className }: StrainRecoveryChartProps) {
  const chartData = data.map(d => ({
    date: d.date,
    formattedDate: format(parseISO(d.date), 'EEE'),
    // Convert strain to percentage (0-21 scale to 0-100%)
    strain: d.strain_score ? Math.round((d.strain_score / 21) * 100) : 0,
    recovery: d.recovery_score || 0,
    isTrainingDay: d.mode === 'training_day',
  }))

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

          {/* Training day background shading */}
          {chartData.map((entry, index) =>
            entry.isTrainingDay ? (
              <ReferenceArea
                key={`training-${index}`}
                x1={entry.formattedDate}
                x2={entry.formattedDate}
                fill="#3b82f6"
                fillOpacity={0.08}
              />
            ) : null
          )}

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
                const dayType = payload[0].payload.isTrainingDay ? 'Training Day' : 'Rest Day'
                return `${format(parseISO(payload[0].payload.date), 'EEEE, MMM dd')} (${dayType})`
              }
              return ''
            }}
            formatter={(value, name) => [
              `${value ?? 0}%`,
              name === 'strain' ? 'Strain' : 'Recovery'
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground">
                {value === 'strain' ? 'Strain' : 'Recovery'}
              </span>
            )}
          />

          {/* Low recovery reference line */}
          <ReferenceLine
            y={60}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: 'Low Recovery',
              position: 'right',
              fill: '#ef4444',
              fontSize: 10,
            }}
          />

          {/* Strain line */}
          <Line
            type="monotone"
            dataKey="strain"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
            activeDot={{ fill: '#f59e0b', r: 6, strokeWidth: 2, stroke: '#fff' }}
            name="strain"
          />

          {/* Recovery line */}
          <Line
            type="monotone"
            dataKey="recovery"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }}
            activeDot={{ fill: '#22c55e', r: 6, strokeWidth: 2, stroke: '#fff' }}
            name="recovery"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend for day types */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/10 border border-blue-500/30" />
          <span className="text-muted-foreground">Training Day</span>
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Strain</span>
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Recovery</span>
        </span>
      </div>
    </div>
  )
}
