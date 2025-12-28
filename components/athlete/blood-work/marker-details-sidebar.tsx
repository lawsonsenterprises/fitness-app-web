'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ExternalLink,
  Check,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkerHistory {
  date: Date
  value: number
  status: 'optimal' | 'normal' | 'borderline' | 'out-of-range'
}

interface MarkerDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  markerName: string
  currentValue: number
  unit: string
  status: 'optimal' | 'normal' | 'borderline' | 'out-of-range'
  trend?: 'improving' | 'declining' | 'stable'
  percentChange?: number
  referenceRange?: { min: number; max: number }
  optimalRange?: { min: number; max: number }
  category?: string
  history: MarkerHistory[]
  description?: string
  tips?: string[]
  learnMoreUrl?: string
  onViewTrends?: () => void
}

const statusConfig = {
  optimal: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    label: 'Optimal',
    icon: Check,
  },
  normal: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'Normal',
    icon: Check,
  },
  borderline: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: 'Borderline',
    icon: AlertTriangle,
  },
  'out-of-range': {
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    label: 'Out of Range',
    icon: AlertTriangle,
  },
}

const trendConfig = {
  improving: { icon: TrendingUp, color: 'text-emerald-500', label: 'Improving' },
  declining: { icon: TrendingDown, color: 'text-rose-500', label: 'Declining' },
  stable: { icon: Minus, color: 'text-muted-foreground', label: 'Stable' },
}

export function MarkerDetailsSidebar({
  isOpen,
  onClose,
  markerName,
  currentValue,
  unit,
  status,
  trend,
  percentChange,
  referenceRange,
  optimalRange,
  category,
  history,
  description,
  tips,
  learnMoreUrl,
  onViewTrends,
}: MarkerDetailsSidebarProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const trendInfo = trend ? trendConfig[trend] : null
  const TrendIcon = trendInfo?.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className={cn('flex items-center justify-between p-4 border-b', config.bgColor)}>
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.bgColor)}>
                  <StatusIcon className={cn('h-5 w-5', config.color)} />
                </div>
                <div>
                  <h2 className="font-bold">{markerName}</h2>
                  {category && (
                    <p className="text-sm text-muted-foreground">{category}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4 space-y-6" style={{ height: 'calc(100% - 73px)' }}>
              {/* Current value */}
              <div className={cn('rounded-xl border p-4', config.borderColor)}>
                <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                <div className="flex items-end gap-2">
                  <span className={cn('text-4xl font-bold', config.color)}>
                    {currentValue}
                  </span>
                  <span className="text-lg text-muted-foreground mb-1">{unit}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                    config.bgColor,
                    config.color
                  )}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </span>
                  {trendInfo && TrendIcon && (
                    <span className="flex items-center gap-1 text-xs">
                      <TrendIcon className={cn('h-3.5 w-3.5', trendInfo.color)} />
                      <span className={trendInfo.color}>
                        {percentChange !== undefined && (
                          <>{percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%</>
                        )}
                        {' '}{trendInfo.label}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Reference ranges */}
              {referenceRange && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Reference Range</h3>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{referenceRange.min}</span>
                      <span className="text-sm">{referenceRange.max}</span>
                    </div>
                    {/* Range bar */}
                    <div className="relative h-3 w-full rounded-full bg-muted">
                      {optimalRange && (
                        <div
                          className="absolute top-0 h-full bg-emerald-500/30 rounded-full"
                          style={{
                            left: `${((optimalRange.min - referenceRange.min) / (referenceRange.max - referenceRange.min)) * 100}%`,
                            width: `${((optimalRange.max - optimalRange.min) / (referenceRange.max - referenceRange.min)) * 100}%`,
                          }}
                        />
                      )}
                      {/* Current value indicator */}
                      <div
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-background shadow-sm',
                          config.bgColor.replace('/10', '')
                        )}
                        style={{
                          left: `calc(${Math.max(0, Math.min(100, ((currentValue - referenceRange.min) / (referenceRange.max - referenceRange.min)) * 100))}% - 8px)`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>Low</span>
                      {optimalRange && <span className="text-emerald-600">Optimal</span>}
                      <span>High</span>
                    </div>
                  </div>
                  {optimalRange && (
                    <p className="text-xs text-muted-foreground">
                      Optimal range: {optimalRange.min} - {optimalRange.max} {unit}
                    </p>
                  )}
                </div>
              )}

              {/* Recent history */}
              {history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Recent History</h3>
                    {onViewTrends && (
                      <button
                        onClick={onViewTrends}
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        View trends
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {history.slice(0, 5).map((h, i) => {
                      const histConfig = statusConfig[h.status]
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {h.date.toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <span className={cn('font-medium', histConfig.color)}>
                            {h.value} {unit}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="rounded-xl bg-blue-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-600">About this marker</p>
                      <p className="text-sm text-blue-600/80 mt-1">{description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              {tips && tips.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Optimization Tips</h3>
                  <ul className="space-y-2">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learn more */}
              {learnMoreUrl && (
                <a
                  href={learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <ExternalLink className="h-4 w-4" />
                  Learn more about {markerName}
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export type { MarkerHistory }
