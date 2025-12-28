'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'

interface DataPoint {
  [key: string]: string | number
}

interface BarConfig {
  dataKey: string
  name: string
  color: string
  radius?: [number, number, number, number]
}

interface BarChartProps {
  data: DataPoint[]
  bars: BarConfig[]
  xAxisKey: string
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number | undefined, name: string | undefined) => [string, string]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  layout?: 'horizontal' | 'vertical'
  colorByValue?: boolean
  colorScale?: { threshold: number; color: string }[]
  className?: string
}

export function BarChart({
  data,
  bars,
  xAxisKey,
  yAxisFormatter,
  tooltipFormatter,
  height = 300,
  showGrid = true,
  showLegend = false,
  stacked = false,
  layout = 'horizontal',
  colorByValue = false,
  colorScale,
  className,
}: BarChartProps) {
  const getColorForValue = (value: number): string => {
    if (!colorScale || colorScale.length === 0) return bars[0]?.color || '#3b82f6'
    for (let i = colorScale.length - 1; i >= 0; i--) {
      if (value >= colorScale[i].threshold) {
        return colorScale[i].color
      }
    }
    return colorScale[0].color
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 10, left: layout === 'vertical' ? 60 : 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              horizontal={layout === 'horizontal'}
              vertical={layout === 'vertical'}
            />
          )}
          {layout === 'horizontal' ? (
            <>
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
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={yAxisFormatter}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={tooltipFormatter}
          />
          {showLegend && <Legend />}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              radius={bar.radius ?? [4, 4, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
            >
              {colorByValue &&
                data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColorForValue(entry[bar.dataKey] as number)}
                  />
                ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export type { DataPoint as BarDataPoint, BarConfig, BarChartProps }
