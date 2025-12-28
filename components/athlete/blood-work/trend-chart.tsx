'use client'

import { useMemo } from 'react'
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

interface MarkerTrendData {
  name: string
  unit: string
  color: string
  dataPoints: Array<{
    date: Date
    value: number
  }>
  referenceRange?: { min: number; max: number }
}

interface TrendChartProps {
  markers: MarkerTrendData[]
  title?: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  dateFormat?: 'short' | 'long'
}

const defaultColors = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
]

export function TrendChart({
  markers,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  dateFormat = 'short',
}: TrendChartProps) {
  // Combine all data points into a single dataset for the chart
  const chartData = useMemo(() => {
    // Get all unique dates
    const allDates = new Set<number>()
    markers.forEach(marker => {
      marker.dataPoints.forEach(dp => {
        const dateKey = new Date(dp.date).setHours(0, 0, 0, 0)
        allDates.add(dateKey)
      })
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort((a, b) => a - b)

    // Create data points for each date
    return sortedDates.map(dateTimestamp => {
      const date = new Date(dateTimestamp)
      const point: Record<string, string | number | null> = {
        date: dateTimestamp,
        dateStr: date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: dateFormat === 'short' ? 'short' : 'long',
          year: dateFormat === 'long' ? 'numeric' : undefined,
        }),
      }

      markers.forEach(marker => {
        const dataPoint = marker.dataPoints.find(
          dp => new Date(dp.date).setHours(0, 0, 0, 0) === dateTimestamp
        )
        point[marker.name] = dataPoint?.value ?? null
      })

      return point
    })
  }, [markers, dateFormat])

  // Calculate Y axis domain based on all values and reference ranges
  const yDomain = useMemo(() => {
    let min = Infinity
    let max = -Infinity

    markers.forEach(marker => {
      marker.dataPoints.forEach(dp => {
        min = Math.min(min, dp.value)
        max = Math.max(max, dp.value)
      })
      if (marker.referenceRange) {
        min = Math.min(min, marker.referenceRange.min)
        max = Math.max(max, marker.referenceRange.max)
      }
    })

    const padding = (max - min) * 0.1
    return [Math.max(0, min - padding), max + padding]
  }, [markers])

  if (markers.length === 0 || chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/10"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No data to display</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {title && (
        <div className="border-b border-border px-4 py-3 bg-muted/20">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            )}

            <XAxis
              dataKey="dateStr"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />

            <YAxis
              domain={yDomain}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => value.toFixed(0)}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
              formatter={(value: number | undefined, name: string | undefined) => [
                `${value ?? 0} ${markers.find(m => m.name === name)?.unit || ''}`,
                name || '',
              ]}
            />

            {showLegend && (
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
              />
            )}

            {/* Reference lines for first marker's range */}
            {markers[0]?.referenceRange && (
              <>
                <ReferenceLine
                  y={markers[0].referenceRange.min}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={markers[0].referenceRange.max}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
              </>
            )}

            {/* Lines for each marker */}
            {markers.map((marker, i) => (
              <Line
                key={marker.name}
                type="monotone"
                dataKey={marker.name}
                stroke={marker.color || defaultColors[i % defaultColors.length]}
                strokeWidth={2}
                dot={{
                  fill: marker.color || defaultColors[i % defaultColors.length],
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with units */}
      {markers.length > 1 && (
        <div className="border-t border-border px-4 py-3 bg-muted/10">
          <div className="flex flex-wrap gap-4 justify-center">
            {markers.map((marker, i) => (
              <div key={marker.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: marker.color || defaultColors[i % defaultColors.length] }}
                />
                <span className="text-sm">
                  {marker.name}
                  <span className="text-muted-foreground ml-1">({marker.unit})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export type { MarkerTrendData }
