'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Check,
  Info,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'
import { cn } from '@/lib/utils'

interface MarkerDataPoint {
  date: Date
  value: number
  testId: string
}

interface MarkerTrendModalProps {
  isOpen: boolean
  onClose: () => void
  markerName: string
  unit: string
  dataPoints: MarkerDataPoint[]
  referenceRange?: { min: number; max: number }
  optimalRange?: { min: number; max: number }
  description?: string
  tips?: string[]
}

const statusConfig = {
  optimal: { color: 'text-emerald-600', label: 'Optimal' },
  normal: { color: 'text-blue-600', label: 'Normal' },
  borderline: { color: 'text-amber-600', label: 'Borderline' },
  'out-of-range': { color: 'text-rose-600', label: 'Out of Range' },
}

function getValueStatus(
  value: number,
  referenceRange?: { min: number; max: number },
  optimalRange?: { min: number; max: number }
): 'optimal' | 'normal' | 'borderline' | 'out-of-range' {
  if (!referenceRange) return 'normal'

  if (value < referenceRange.min || value > referenceRange.max) {
    return 'out-of-range'
  }

  if (optimalRange && value >= optimalRange.min && value <= optimalRange.max) {
    return 'optimal'
  }

  const rangeWidth = referenceRange.max - referenceRange.min
  if (value < referenceRange.min + rangeWidth * 0.1 || value > referenceRange.max - rangeWidth * 0.1) {
    return 'borderline'
  }

  return 'normal'
}

export function MarkerTrendModal({
  isOpen,
  onClose,
  markerName,
  unit,
  dataPoints,
  referenceRange,
  optimalRange,
  description,
  tips,
}: MarkerTrendModalProps) {
  // Sort by date and format for chart
  const chartData = useMemo(() => {
    return [...dataPoints]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(dp => ({
        ...dp,
        dateStr: dp.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        status: getValueStatus(dp.value, referenceRange, optimalRange),
      }))
  }, [dataPoints, referenceRange, optimalRange])

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    const percentChange = ((last - first) / first) * 100

    if (Math.abs(percentChange) < 5) return { type: 'stable' as const, change: percentChange }
    return {
      type: percentChange > 0 ? 'increasing' as const : 'decreasing' as const,
      change: percentChange,
    }
  }, [chartData])

  // Get current status
  const currentValue = chartData[chartData.length - 1]?.value
  const currentStatus = currentValue
    ? getValueStatus(currentValue, referenceRange, optimalRange)
    : 'normal'

  // Calculate Y axis domain
  const values = chartData.map(d => d.value)
  const minVal = Math.min(...values, referenceRange?.min || Infinity)
  const maxVal = Math.max(...values, referenceRange?.max || -Infinity)
  const padding = (maxVal - minVal) * 0.1
  const yDomain = [Math.max(0, minVal - padding), maxVal + padding]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-xl font-bold">{markerName}</h2>
              <p className="text-sm text-muted-foreground">
                Historical trend • {chartData.length} data points
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            {/* Current stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className={cn('text-2xl font-bold', statusConfig[currentStatus].color)}>
                  {currentValue} {unit}
                </p>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium mt-1',
                  currentStatus === 'optimal' && 'bg-emerald-500/10 text-emerald-600',
                  currentStatus === 'normal' && 'bg-blue-500/10 text-blue-600',
                  currentStatus === 'borderline' && 'bg-amber-500/10 text-amber-600',
                  currentStatus === 'out-of-range' && 'bg-rose-500/10 text-rose-600'
                )}>
                  {statusConfig[currentStatus].label}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Reference Range</p>
                {referenceRange ? (
                  <p className="text-lg font-semibold">
                    {referenceRange.min} - {referenceRange.max} {unit}
                  </p>
                ) : (
                  <p className="text-lg text-muted-foreground">Not specified</p>
                )}
                {optimalRange && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Optimal: {optimalRange.min} - {optimalRange.max}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Trend</p>
                {trend ? (
                  <div className="flex items-center gap-2">
                    {trend.type === 'increasing' && <TrendingUp className="h-5 w-5 text-emerald-500" />}
                    {trend.type === 'decreasing' && <TrendingDown className="h-5 w-5 text-rose-500" />}
                    {trend.type === 'stable' && <Minus className="h-5 w-5 text-muted-foreground" />}
                    <span className="text-lg font-semibold">
                      {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                    </span>
                  </div>
                ) : (
                  <p className="text-lg text-muted-foreground">Not enough data</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Since first test</p>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold mb-4">Historical Values</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

                    {/* Reference range area */}
                    {referenceRange && (
                      <ReferenceArea
                        y1={referenceRange.min}
                        y2={referenceRange.max}
                        fill="hsl(var(--muted))"
                        fillOpacity={0.3}
                      />
                    )}

                    {/* Optimal range area */}
                    {optimalRange && (
                      <ReferenceArea
                        y1={optimalRange.min}
                        y2={optimalRange.max}
                        fill="hsl(142.1 76.2% 36.3%)"
                        fillOpacity={0.1}
                      />
                    )}

                    <XAxis
                      dataKey="dateStr"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      domain={yDomain}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => value.toFixed(0)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0} ${unit}`, name || markerName]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--foreground))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data points table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 border-b border-border">
                <h3 className="font-semibold">All Values</h3>
              </div>
              <div className="divide-y divide-border max-h-48 overflow-y-auto">
                {chartData.slice().reverse().map((dp, i) => {
                  const config = statusConfig[dp.status]
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{dp.date.toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn('font-semibold', config.color)}>
                          {dp.value} {unit}
                        </span>
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          dp.status === 'optimal' && 'bg-emerald-500/10 text-emerald-600',
                          dp.status === 'normal' && 'bg-blue-500/10 text-blue-600',
                          dp.status === 'borderline' && 'bg-amber-500/10 text-amber-600',
                          dp.status === 'out-of-range' && 'bg-rose-500/10 text-rose-600'
                        )}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="rounded-xl bg-blue-500/10 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-600">About {markerName}</p>
                    <p className="text-sm text-blue-600/80 mt-1">{description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {tips && tips.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3">Optimization Tips</h3>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export type { MarkerDataPoint }
