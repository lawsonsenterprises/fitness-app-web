'use client'

import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Marker {
  name: string
  value: number
  unit: string
  referenceRange?: { min: number; max: number }
  optimalRange?: { min: number; max: number }
  status: 'optimal' | 'normal' | 'borderline' | 'out-of-range'
  trend?: 'improving' | 'declining' | 'stable'
  previousValue?: number
  category?: string
}

interface MarkerRowProps {
  marker: Marker
  onClick?: () => void
  showTrend?: boolean
  compact?: boolean
}

const statusConfig = {
  optimal: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    label: 'Optimal',
    icon: Check,
  },
  normal: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    label: 'Normal',
    icon: Check,
  },
  borderline: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    label: 'Borderline',
    icon: AlertTriangle,
  },
  'out-of-range': {
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    label: 'Out of Range',
    icon: AlertTriangle,
  },
}

const trendConfig = {
  improving: {
    icon: TrendingUp,
    color: 'text-emerald-500',
    label: 'Improving',
  },
  declining: {
    icon: TrendingDown,
    color: 'text-rose-500',
    label: 'Declining',
  },
  stable: {
    icon: Minus,
    color: 'text-muted-foreground',
    label: 'Stable',
  },
}

function RangeIndicator({
  value,
  min,
  max,
  optimalMin,
  optimalMax,
}: {
  value: number
  min: number
  max: number
  optimalMin?: number
  optimalMax?: number
}) {
  const range = max - min
  const position = Math.max(0, Math.min(100, ((value - min) / range) * 100))

  return (
    <div className="relative h-2 w-full rounded-full bg-muted">
      {/* Optimal zone */}
      {optimalMin !== undefined && optimalMax !== undefined && (
        <div
          className="absolute top-0 h-full bg-emerald-500/30 rounded-full"
          style={{
            left: `${((optimalMin - min) / range) * 100}%`,
            width: `${((optimalMax - optimalMin) / range) * 100}%`,
          }}
        />
      )}
      {/* Value indicator */}
      <div
        className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-foreground border-2 border-background shadow-sm"
        style={{ left: `calc(${position}% - 6px)` }}
      />
    </div>
  )
}

export function MarkerRow({
  marker,
  onClick,
  showTrend = true,
  compact = false,
}: MarkerRowProps) {
  const config = statusConfig[marker.status]
  const StatusIcon = config.icon
  const trendInfo = marker.trend ? trendConfig[marker.trend] : null
  const TrendIcon = trendInfo?.icon

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.bgColor)}>
            <StatusIcon className={cn('h-4 w-4', config.color)} />
          </div>
          <div>
            <p className="font-medium">{marker.name}</p>
            <p className="text-xs text-muted-foreground">{marker.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('font-semibold', config.color)}>
            {marker.value} {marker.unit}
          </span>
          {TrendIcon && trendInfo && (
            <TrendIcon className={cn('h-4 w-4', trendInfo.color)} />
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full grid grid-cols-12 gap-4 items-center px-4 py-4 text-left hover:bg-muted/30 transition-colors"
    >
      {/* Name */}
      <div className="col-span-4">
        <p className="font-medium">{marker.name}</p>
        {marker.category && (
          <p className="text-xs text-muted-foreground">{marker.category}</p>
        )}
      </div>

      {/* Value */}
      <div className="col-span-2">
        <span className={cn('text-lg font-bold', config.color)}>
          {marker.value}
        </span>
        <span className="ml-1 text-sm text-muted-foreground">{marker.unit}</span>
      </div>

      {/* Range */}
      <div className="col-span-2">
        {marker.referenceRange ? (
          <div className="space-y-1">
            <RangeIndicator
              value={marker.value}
              min={marker.referenceRange.min}
              max={marker.referenceRange.max}
              optimalMin={marker.optimalRange?.min}
              optimalMax={marker.optimalRange?.max}
            />
            <p className="text-xs text-muted-foreground">
              {marker.referenceRange.min} - {marker.referenceRange.max}
            </p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Status */}
      <div className="col-span-2">
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
          config.bgColor,
          config.color
        )}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      {/* Trend */}
      {showTrend && (
        <div className="col-span-2 flex items-center justify-between">
          {trendInfo && TrendIcon ? (
            <div className="flex items-center gap-2">
              <TrendIcon className={cn('h-4 w-4', trendInfo.color)} />
              <div>
                <p className={cn('text-xs font-medium', trendInfo.color)}>
                  {trendInfo.label}
                </p>
                {marker.previousValue !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    was {marker.previousValue}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No history</span>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      )}
    </button>
  )
}

export type { Marker }
