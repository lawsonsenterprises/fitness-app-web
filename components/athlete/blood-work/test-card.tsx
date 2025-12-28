'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Droplets,
  Calendar,
  Building2,
  Tag,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkerSummary {
  name: string
  value: number
  unit: string
  status: 'optimal' | 'normal' | 'borderline' | 'out-of-range'
  trend?: 'improving' | 'declining' | 'stable'
}

interface BloodTest {
  id: string
  date: Date
  lab: string
  markers: MarkerSummary[]
  tags?: string[]
  notes?: string
}

interface TestCardProps {
  test: BloodTest
  onClick?: () => void
  variant?: 'default' | 'compact'
}

const statusConfig = {
  optimal: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    label: 'Optimal',
  },
  normal: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    label: 'Normal',
  },
  borderline: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    label: 'Borderline',
  },
  'out-of-range': {
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    label: 'Out of Range',
  },
}

const trendIcons = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
}

function MarkerBadge({ marker }: { marker: MarkerSummary }) {
  const config = statusConfig[marker.status]
  const TrendIcon = marker.trend ? trendIcons[marker.trend] : null

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-2.5 py-1.5',
        config.bgColor
      )}
    >
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{marker.name}</span>
        <span className={cn('text-sm font-semibold', config.color)}>
          {marker.value} {marker.unit}
        </span>
      </div>
      {TrendIcon && (
        <TrendIcon
          className={cn(
            'h-4 w-4',
            marker.trend === 'improving' && 'text-emerald-500',
            marker.trend === 'declining' && 'text-rose-500',
            marker.trend === 'stable' && 'text-muted-foreground'
          )}
        />
      )}
    </div>
  )
}

export function TestCard({ test, onClick, variant = 'default' }: TestCardProps) {
  // Count markers by status
  const statusCounts = test.markers.reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const hasIssues = (statusCounts['borderline'] || 0) + (statusCounts['out-of-range'] || 0) > 0
  const optimalCount = statusCounts['optimal'] || 0
  const totalMarkers = test.markers.length

  // Key markers to display (up to 3)
  const keyMarkers = test.markers
    .sort((a, b) => {
      const priority = { 'out-of-range': 0, borderline: 1, optimal: 2, normal: 3 }
      return priority[a.status] - priority[b.status]
    })
    .slice(0, 3)

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="w-full flex items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-muted-foreground/30"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            hasIssues ? 'bg-amber-500/10' : 'bg-emerald-500/10'
          )}>
            <Droplets className={cn(
              'h-5 w-5',
              hasIssues ? 'text-amber-500' : 'text-emerald-500'
            )} />
          </div>
          <div>
            <p className="font-medium">
              {test.date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-muted-foreground">{test.lab}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalMarkers} markers
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-all hover:border-muted-foreground/30"
      onClick={onClick}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-4',
        hasIssues ? 'bg-amber-500/5' : 'bg-emerald-500/5'
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            hasIssues ? 'bg-amber-500/20' : 'bg-emerald-500/20'
          )}>
            <Droplets className={cn(
              'h-6 w-6',
              hasIssues ? 'text-amber-500' : 'text-emerald-500'
            )} />
          </div>
          <div>
            <p className="font-semibold">
              {test.date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {test.lab}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDistanceToNow(test.date, { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-3 border-t border-border bg-muted/20 px-4 py-3">
        {hasIssues ? (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {(statusCounts['borderline'] || 0) + (statusCounts['out-of-range'] || 0)} markers need attention
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">
              {optimalCount}/{totalMarkers} markers optimal
            </span>
          </div>
        )}
      </div>

      {/* Key markers */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Key Markers
        </p>
        <div className="flex flex-wrap gap-2">
          {keyMarkers.map((marker) => (
            <MarkerBadge key={marker.name} marker={marker} />
          ))}
          {test.markers.length > 3 && (
            <div className="flex items-center rounded-lg bg-muted/50 px-2.5 py-1.5">
              <span className="text-sm text-muted-foreground">
                +{test.markers.length - 3} more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {test.tags && test.tags.length > 0 && (
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex flex-wrap gap-1.5">
            {test.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export type { BloodTest, MarkerSummary }
