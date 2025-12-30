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

interface SleepBankChartProps {
  data: DailySleepSummary[]
  className?: string
}

export function SleepBankChart({ data, className }: SleepBankChartProps) {
  const chartData = data.map(d => ({
    date: d.date,
    formattedDate: format(parseISO(d.date), 'MMM dd'),
    minutes: d.sleep_bank_minutes || 0,
  }))

  // Find min and max for domain
  const minValue = Math.min(...chartData.map(d => d.minutes), 0)
  const maxValue = Math.max(...chartData.map(d => d.minutes), 0)
  const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue), 60) // At least 1 hour

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(Math.abs(mins) / 60)
    const minutes = Math.abs(mins) % 60
    const sign = mins < 0 ? '-' : '+'
    return hours > 0 ? `${sign}${hours}h ${minutes}m` : `${sign}${minutes}m`
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sleepBankPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sleepBankNegative" x1="0" y1="1" x2="0" y2="0">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
            domain={[-absMax, absMax]}
            tickFormatter={(value) => `${value > 0 ? '+' : ''}${Math.round(value / 60)}h`}
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
            formatter={(value) => [formatMinutes(Number(value) || 0), 'Sleep Bank']}
          />
          <ReferenceLine
            y={0}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#sleepBankPositive)"
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Surplus</span>
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Debt</span>
        </span>
      </div>
    </div>
  )
}
