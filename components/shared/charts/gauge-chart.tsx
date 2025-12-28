'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GaugeChartProps {
  value: number
  min?: number
  max?: number
  label?: string
  sublabel?: string
  size?: 'sm' | 'md' | 'lg'
  colorScale?: { threshold: number; color: string }[]
  showValue?: boolean
  unit?: string
  className?: string
}

const defaultColorScale = [
  { threshold: 0, color: '#ef4444' },   // red
  { threshold: 33, color: '#f59e0b' },  // amber
  { threshold: 66, color: '#10b981' },  // emerald
]

const sizeConfig = {
  sm: { size: 80, strokeWidth: 8, fontSize: 'text-lg', sublabelSize: 'text-[10px]' },
  md: { size: 120, strokeWidth: 10, fontSize: 'text-2xl', sublabelSize: 'text-xs' },
  lg: { size: 160, strokeWidth: 12, fontSize: 'text-4xl', sublabelSize: 'text-sm' },
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  label,
  sublabel,
  size = 'md',
  colorScale = defaultColorScale,
  showValue = true,
  unit = '',
  className,
}: GaugeChartProps) {
  const config = sizeConfig[size]
  const radius = (config.size - config.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Normalize value to 0-100 for percentage calculation
  const normalizedValue = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))

  // We want a semicircle (180 degrees), so use half circumference
  const halfCircumference = circumference / 2
  const progress = (normalizedValue / 100) * halfCircumference
  const offset = halfCircumference - progress

  // Get color based on value
  const getColor = (): string => {
    for (let i = colorScale.length - 1; i >= 0; i--) {
      if (normalizedValue >= colorScale[i].threshold) {
        return colorScale[i].color
      }
    }
    return colorScale[0].color
  }

  const color = getColor()

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.size, height: config.size / 2 + 20 }}>
        <svg
          className="transform rotate-180"
          width={config.size}
          height={config.size / 2 + 10}
          viewBox={`0 0 ${config.size} ${config.size / 2 + 10}`}
        >
          {/* Background arc */}
          <path
            d={`
              M ${config.strokeWidth / 2} ${config.size / 2}
              A ${radius} ${radius} 0 0 1 ${config.size - config.strokeWidth / 2} ${config.size / 2}
            `}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d={`
              M ${config.strokeWidth / 2} ${config.size / 2}
              A ${radius} ${radius} 0 0 1 ${config.size - config.strokeWidth / 2} ${config.size / 2}
            `}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            initial={{ strokeDashoffset: halfCircumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          {showValue && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className={cn('font-bold', config.fontSize)}
            >
              {value}
              {unit && <span className="text-muted-foreground font-normal">{unit}</span>}
            </motion.span>
          )}
          {sublabel && (
            <span className={cn('text-muted-foreground', config.sublabelSize)}>
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      {label && (
        <span className="text-sm font-medium mt-2">{label}</span>
      )}

      {/* Scale markers */}
      <div className="flex justify-between w-full px-1 -mt-1">
        <span className="text-xs text-muted-foreground">{min}</span>
        <span className="text-xs text-muted-foreground">{max}</span>
      </div>
    </div>
  )
}

export type { GaugeChartProps }
