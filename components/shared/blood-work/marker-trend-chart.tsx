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
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

interface MarkerDataPoint {
  date: string
  value: number
}

interface MarkerConfig {
  id: string
  name: string
  unit: string
  colour: string
  data: MarkerDataPoint[]
  reference?: {
    low: number
    high: number
  }
  optimal?: {
    low: number
    high: number
  }
}

interface MarkerTrendChartProps {
  markers: MarkerConfig[]
  height?: number
  showLegend?: boolean
  showReferenceAreas?: boolean
  showOptimalAreas?: boolean
  dateFormatter?: (date: string) => string
  className?: string
}

export function MarkerTrendChart({
  markers,
  height = 400,
  showLegend = true,
  showReferenceAreas = true,
  showOptimalAreas = false,
  dateFormatter,
  className,
}: MarkerTrendChartProps) {
  // Combine all marker data into chart format
  const chartData = useMemo(() => {
    if (markers.length === 0) return []

    // Get all unique dates
    const allDates = new Set<string>()
    markers.forEach((marker) => {
      marker.data.forEach((point) => allDates.add(point.date))
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })

    // Build combined data
    return sortedDates.map((date) => {
      const point: Record<string, string | number> = { date }
      markers.forEach((marker) => {
        const dataPoint = marker.data.find((d) => d.date === date)
        if (dataPoint) {
          point[marker.id] = dataPoint.value
        }
      })
      return point
    })
  }, [markers])

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    if (markers.length === 0) return [0, 100]

    let min = Infinity
    let max = -Infinity

    markers.forEach((marker) => {
      marker.data.forEach((point) => {
        min = Math.min(min, point.value)
        max = Math.max(max, point.value)
      })
      if (marker.reference) {
        min = Math.min(min, marker.reference.low * 0.9)
        max = Math.max(max, marker.reference.high * 1.1)
      }
    })

    // Add 10% padding
    const padding = (max - min) * 0.1
    return [Math.max(0, min - padding), max + padding]
  }, [markers])

  if (markers.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border border-border bg-card',
          className
        )}
        style={{ height }}
      >
        <p className="text-muted-foreground">No markers selected</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {markers.map((marker) => (
              <linearGradient
                key={`gradient-${marker.id}`}
                id={`gradient-${marker.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={marker.colour} stopOpacity={0.3} />
                <stop offset="95%" stopColor={marker.colour} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={dateFormatter}
          />

          <YAxis
            domain={yDomain}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 8 }}
            formatter={(value: number, name: string) => {
              const marker = markers.find((m) => m.id === name)
              return [
                <span key={name}>
                  {value} {marker?.unit}
                </span>,
                marker?.name || name,
              ]
            }}
          />

          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                const marker = markers.find((m) => m.id === value)
                return marker?.name || value
              }}
            />
          )}

          {/* Reference areas for each marker (if single marker) */}
          {showReferenceAreas && markers.length === 1 && markers[0].reference && (
            <>
              {/* Low reference area */}
              <ReferenceArea
                y1={0}
                y2={markers[0].reference.low}
                fill="#fef3c7"
                fillOpacity={0.3}
              />
              {/* High reference area */}
              <ReferenceArea
                y1={markers[0].reference.high}
                y2={yDomain[1]}
                fill="#fee2e2"
                fillOpacity={0.3}
              />
              {/* Reference lines */}
              <ReferenceLine
                y={markers[0].reference.low}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: 'Low', position: 'left', fill: '#f59e0b', fontSize: 10 }}
              />
              <ReferenceLine
                y={markers[0].reference.high}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: 'High', position: 'left', fill: '#ef4444', fontSize: 10 }}
              />
            </>
          )}

          {/* Optimal range (if single marker and enabled) */}
          {showOptimalAreas && markers.length === 1 && markers[0].optimal && (
            <ReferenceArea
              y1={markers[0].optimal.low}
              y2={markers[0].optimal.high}
              fill="#22c55e"
              fillOpacity={0.1}
              stroke="#22c55e"
              strokeDasharray="3 3"
            />
          )}

          {/* Lines for each marker */}
          {markers.map((marker) => (
            <Line
              key={marker.id}
              type="monotone"
              dataKey={marker.id}
              name={marker.id}
              stroke={marker.colour}
              strokeWidth={2}
              dot={{ fill: marker.colour, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: marker.colour }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export type { MarkerConfig, MarkerDataPoint, MarkerTrendChartProps }
