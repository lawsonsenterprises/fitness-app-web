'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeightInputProps {
  value: number
  unit: 'kg' | 'lbs'
  previousWeight?: number
  onChange: (weight: number) => void
  onUnitChange: (unit: 'kg' | 'lbs') => void
}

export function WeightInput({
  value,
  unit,
  previousWeight,
  onChange,
  onUnitChange,
}: WeightInputProps) {
  const [inputValue, setInputValue] = useState(value > 0 ? value.toString() : '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    const numVal = parseFloat(val)
    if (!isNaN(numVal) && numVal > 0) {
      onChange(numVal)
    }
  }

  const increment = (amount: number) => {
    const newValue = Math.max(0, (value || previousWeight || 70) + amount)
    setInputValue(newValue.toFixed(1))
    onChange(newValue)
  }

  const weightDiff = previousWeight ? value - previousWeight : null

  const getTrend = () => {
    if (!weightDiff) return null
    if (weightDiff > 0.2) return { Icon: TrendingUp, color: 'text-rose-500', label: 'up' }
    if (weightDiff < -0.2) return { Icon: TrendingDown, color: 'text-emerald-500', label: 'down' }
    return { Icon: Minus, color: 'text-muted-foreground', label: 'stable' }
  }

  const trend = getTrend()

  // Quick select buttons based on previous weight
  const quickSelectOptions = previousWeight
    ? [
        previousWeight - 1,
        previousWeight - 0.5,
        previousWeight,
        previousWeight + 0.5,
        previousWeight + 1,
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20">
            <Scale className="h-7 w-7 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold">What's your weight today?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Weigh yourself first thing in the morning for consistency
        </p>
      </div>

      {/* Unit toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-border p-1">
          <button
            onClick={() => onUnitChange('kg')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              unit === 'kg'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            kg
          </button>
          <button
            onClick={() => onUnitChange('lbs')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              unit === 'lbs'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            lbs
          </button>
        </div>
      </div>

      {/* Weight input */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => increment(-0.1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
        >
          <Minus className="h-5 w-5" />
        </button>

        <div className="relative">
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            placeholder={previousWeight?.toString() || '70.0'}
            step="0.1"
            min="0"
            className="w-32 text-center text-4xl font-bold bg-transparent focus:outline-none"
          />
          <span className="absolute -right-10 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
            {unit}
          </span>
        </div>

        <button
          onClick={() => increment(0.1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Trend indicator */}
      {trend && value > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className={cn('flex items-center gap-2 rounded-full px-4 py-2', trend.color.replace('text-', 'bg-').replace('500', '500/10'))}>
            <trend.Icon className={cn('h-4 w-4', trend.color)} />
            <span className={cn('font-medium', trend.color)}>
              {weightDiff! > 0 ? '+' : ''}{weightDiff!.toFixed(1)} {unit} since last check-in
            </span>
          </div>
        </motion.div>
      )}

      {/* Quick select */}
      {quickSelectOptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-center text-muted-foreground">Quick select</p>
          <div className="flex justify-center gap-2">
            {quickSelectOptions.map((weight) => (
              <button
                key={weight}
                onClick={() => {
                  setInputValue(weight.toFixed(1))
                  onChange(weight)
                }}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  value === weight
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {weight.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Previous weight reference */}
      {previousWeight && (
        <p className="text-center text-sm text-muted-foreground">
          Previous: {previousWeight.toFixed(1)} {unit}
        </p>
      )}
    </div>
  )
}
