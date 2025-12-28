'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

interface DataPoint {
  [key: string]: string | number
}

interface AreaConfig {
  dataKey: string
  name: string
  color: string
  fillOpacity?: number
  strokeWidth?: number
  stacked?: boolean
}

interface AreaChartProps {
  data: DataPoint[]
  areas: AreaConfig[]
  xAxisKey: string
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number | undefined, name: string | undefined) => [string, string]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  className?: string
}

export function AreaChart({
  data,
  areas,
  xAxisKey,
  yAxisFormatter,
  tooltipFormatter,
  height = 300,
  showGrid = true,
  showLegend = false,
  stacked = false,
  className,
}: AreaChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={`gradient-${area.dataKey}`}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={area.color}
                  stopOpacity={area.fillOpacity ?? 0.3}
                />
                <stop offset="95%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          )}
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={tooltipFormatter}
          />
          {showLegend && <Legend />}
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              strokeWidth={area.strokeWidth ?? 2}
              fill={`url(#gradient-${area.dataKey})`}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export type { DataPoint as AreaDataPoint, AreaConfig, AreaChartProps }
