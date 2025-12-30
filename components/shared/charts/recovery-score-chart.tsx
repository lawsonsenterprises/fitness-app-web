'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'
import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'
import type { DailyRecoverySummary } from '@/types/healthkit'

interface RecoveryScoreChartProps {
  data: DailyRecoverySummary[]
  className?: string
}

export function RecoveryScoreChart({ data, className }: RecoveryScoreChartProps) {
  const chartData = data.map(d => ({
    date: d.date,
    formattedDate: format(parseISO(d.date), 'MMM dd'),
    score: d.recovery_score || 0,
  }))

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="recoveryScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

          {/* Colour zones */}
          <ReferenceArea y1={0} y2={60} fill="#ef4444" fillOpacity={0.05} />
          <ReferenceArea y1={60} y2={80} fill="#f59e0b" fillOpacity={0.05} />
          <ReferenceArea y1={80} y2={100} fill="#22c55e" fillOpacity={0.05} />

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
            ticks={[0, 20, 40, 60, 80, 100]}
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
            formatter={(value) => {
              const numValue = Number(value) || 0
              const status = numValue >= 80 ? 'Optimal' : numValue >= 60 ? 'Moderate' : 'Low'
              return [`${numValue}% (${status})`, 'Recovery']
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#recoveryScoreGradient)"
            dot={{ fill: '#22c55e', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#22c55e', r: 5, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Optimal (80%+)</span>
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Moderate (60-80%)</span>
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Low (&lt;60%)</span>
        </span>
      </div>
    </div>
  )
}
