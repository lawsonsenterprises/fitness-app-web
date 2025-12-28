'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkerInsight {
  name: string
  currentValue: number
  previousValue?: number
  unit: string
  status: 'optimal' | 'normal' | 'borderline' | 'out-of-range'
  trend: 'improving' | 'declining' | 'stable' | 'new'
  percentChange?: number
  insight?: string
}

interface QuickInsightsProps {
  improving: MarkerInsight[]
  declining: MarkerInsight[]
  outOfRange: MarkerInsight[]
  onMarkerClick?: (markerName: string) => void
}

const statusConfig = {
  optimal: { color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  normal: { color: 'text-blue-600', bg: 'bg-blue-500/10' },
  borderline: { color: 'text-amber-600', bg: 'bg-amber-500/10' },
  'out-of-range': { color: 'text-rose-600', bg: 'bg-rose-500/10' },
}

function InsightCard({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  markers,
  emptyMessage,
  onMarkerClick,
}: {
  title: string
  icon: typeof TrendingUp
  iconColor: string
  iconBg: string
  markers: MarkerInsight[]
  emptyMessage: string
  onMarkerClick?: (name: string) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-3">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{markers.length} marker{markers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {markers.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {markers.map((marker, i) => {
            const config = statusConfig[marker.status]
            return (
              <motion.button
                key={marker.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onMarkerClick?.(marker.name)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{marker.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', config.bg, config.color)}>
                      {marker.currentValue} {marker.unit}
                    </span>
                    {marker.percentChange !== undefined && (
                      <span className={cn(
                        'text-xs font-medium',
                        marker.trend === 'improving' ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        {marker.percentChange > 0 ? '+' : ''}{marker.percentChange.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function QuickInsights({
  improving,
  declining,
  outOfRange,
  onMarkerClick,
}: QuickInsightsProps) {
  const hasIssues = declining.length > 0 || outOfRange.length > 0

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className={cn(
        'rounded-xl p-4',
        hasIssues ? 'bg-amber-500/10' : 'bg-emerald-500/10'
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            hasIssues ? 'bg-amber-500/20' : 'bg-emerald-500/20'
          )}>
            {hasIssues ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <Sparkles className="h-5 w-5 text-emerald-500" />
            )}
          </div>
          <div>
            <p className={cn('font-semibold', hasIssues ? 'text-amber-600' : 'text-emerald-600')}>
              {hasIssues
                ? `${outOfRange.length + declining.length} markers need attention`
                : 'All markers looking good!'}
            </p>
            <p className="text-sm text-muted-foreground">
              {improving.length > 0 && `${improving.length} improving`}
              {improving.length > 0 && declining.length > 0 && ' • '}
              {declining.length > 0 && `${declining.length} declining`}
              {(improving.length > 0 || declining.length > 0) && outOfRange.length > 0 && ' • '}
              {outOfRange.length > 0 && `${outOfRange.length} out of range`}
            </p>
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Out of range - show first if any */}
        {outOfRange.length > 0 && (
          <InsightCard
            title="Needs Attention"
            icon={AlertTriangle}
            iconColor="text-rose-500"
            iconBg="bg-rose-500/10"
            markers={outOfRange}
            emptyMessage="No markers out of range"
            onMarkerClick={onMarkerClick}
          />
        )}

        {/* Improving */}
        <InsightCard
          title="Improving"
          icon={TrendingUp}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
          markers={improving}
          emptyMessage="No markers improving since last test"
          onMarkerClick={onMarkerClick}
        />

        {/* Declining */}
        <InsightCard
          title="Declining"
          icon={TrendingDown}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          markers={declining}
          emptyMessage="No markers declining"
          onMarkerClick={onMarkerClick}
        />
      </div>

      {/* Tips */}
      {outOfRange.length > 0 && (
        <div className="rounded-xl bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-600">Pro tip</p>
              <p className="text-sm text-blue-600/80 mt-1">
                For markers outside the optimal range, consider discussing with your coach or healthcare provider.
                Track trends over multiple tests before making significant changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { MarkerInsight }
