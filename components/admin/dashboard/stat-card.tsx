'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
  prefix?: string
  suffix?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  iconColor = 'text-blue-500',
  trend,
  format = 'number',
  prefix,
  suffix,
}: StatCardProps) {
  // Determine trend from change if not provided
  const effectiveTrend = trend ?? (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral')

  // Format the value
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return new Intl.NumberFormat('en-GB').format(val)
    }
  }

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    down: { icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-500/10' },
    neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted' },
  }

  const TrendIcon = trendConfig[effectiveTrend].icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight"
          >
            {prefix}
            {formatValue(value)}
            {suffix}
          </motion.p>
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          iconColor.replace('text-', 'bg-').replace('500', '500/10')
        )}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            trendConfig[effectiveTrend].bg,
            trendConfig[effectiveTrend].color
          )}>
            <TrendIcon className="h-3 w-3" />
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  )
}

export type { StatCardProps }
