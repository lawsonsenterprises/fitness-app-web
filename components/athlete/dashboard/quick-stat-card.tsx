'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
    label?: string
  }
  accentColor?: 'amber' | 'emerald' | 'blue' | 'violet' | 'rose'
  isLoading?: boolean
  delay?: number
}

const accentColors = {
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    glow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    glow: 'shadow-emerald-500/20',
    ring: 'ring-emerald-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    glow: 'shadow-blue-500/20',
    ring: 'ring-blue-500/20',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-500',
    glow: 'shadow-violet-500/20',
    ring: 'ring-violet-500/20',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    glow: 'shadow-rose-500/20',
    ring: 'ring-rose-500/20',
  },
}

const trendColors = {
  up: 'text-emerald-500',
  down: 'text-rose-500',
  stable: 'text-muted-foreground',
}

const TrendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

export function QuickStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'amber',
  isLoading = false,
  delay = 0,
}: QuickStatCardProps) {
  const colors = accentColors[accentColor]

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-10 w-10 rounded-xl bg-muted" />
          </div>
          <div className="h-8 w-20 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card p-5',
        'transition-shadow duration-300 hover:shadow-lg',
        `hover:${colors.glow}`
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          'bg-gradient-to-br from-transparent via-transparent to-muted/30'
        )}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              colors.bg,
              'ring-1',
              colors.ring
            )}
          >
            <Icon className={cn('h-5 w-5', colors.text)} />
          </motion.div>
        </div>

        {/* Value */}
        <motion.p
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: delay + 0.1 }}
        >
          {value}
        </motion.p>

        {/* Subtitle & Trend */}
        <div className="mt-1 flex items-center gap-2">
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
          {trend && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: delay + 0.2 }}
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                trendColors[trend.direction]
              )}
            >
              {(() => {
                const TIcon = TrendIcon[trend.direction]
                return <TIcon className="h-3 w-3" />
              })()}
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-muted-foreground"> {trend.label}</span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Grid wrapper for consistent layout
export function QuickStatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  )
}
