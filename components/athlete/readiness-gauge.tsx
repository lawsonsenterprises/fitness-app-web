'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ReadinessGaugeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ReadinessGauge({ score, size = 'md', className }: ReadinessGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score))

  // Calculate the stroke dasharray for the arc
  const circumference = 2 * Math.PI * 45 // radius = 45
  const halfCircumference = circumference / 2
  const progress = (clampedScore / 100) * halfCircumference

  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-500', label: 'Excellent' }
    if (s >= 60) return { stroke: '#84cc16', bg: 'bg-lime-500/10', text: 'text-lime-500', label: 'Good' }
    if (s >= 40) return { stroke: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Moderate' }
    if (s >= 20) return { stroke: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'Low' }
    return { stroke: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500', label: 'Poor' }
  }

  const colorInfo = getColor(clampedScore)

  // Size configurations
  const sizeConfig = {
    sm: { width: 140, height: 84, textSize: 'text-2xl', labelPadding: 'px-3 py-0.5', labelText: 'text-xs' },
    md: { width: 200, height: 120, textSize: 'text-4xl', labelPadding: 'px-4 py-1', labelText: 'text-sm' },
    lg: { width: 280, height: 168, textSize: 'text-5xl', labelPadding: 'px-5 py-1.5', labelText: 'text-base' },
  }
  const config = sizeConfig[size]

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative">
        <svg width={config.width} height={config.height} viewBox="0 0 100 60" className="overflow-visible">
          {/* Background arc */}
          <path
            d="M 5 55 A 45 45 0 0 1 95 55"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-muted/30"
          />

          {/* Colored progress arc */}
          <motion.path
            d="M 5 55 A 45 45 0 0 1 95 55"
            fill="none"
            stroke={colorInfo.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            initial={{ strokeDashoffset: halfCircumference }}
            animate={{ strokeDashoffset: halfCircumference - progress }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = Math.PI - (tick / 100) * Math.PI
            const x1 = 50 + 38 * Math.cos(angle)
            const y1 = 55 - 38 * Math.sin(angle)
            const x2 = 50 + 42 * Math.cos(angle)
            const y2 = 55 - 42 * Math.sin(angle)
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-muted-foreground/50"
              />
            )
          })}
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span
            className={cn('font-bold tabular-nums', config.textSize, colorInfo.text)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {clampedScore}
          </motion.span>
        </div>
      </div>

      {/* Label */}
      <motion.div
        className={cn('mt-2 rounded-full font-medium', config.labelPadding, config.labelText, colorInfo.bg, colorInfo.text)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {colorInfo.label}
      </motion.div>

      {size !== 'sm' && (
        <p className="mt-3 text-xs text-muted-foreground text-center max-w-[180px]">
          Based on sleep, recovery, and recent activity
        </p>
      )}
    </div>
  )
}
