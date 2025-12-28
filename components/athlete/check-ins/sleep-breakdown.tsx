'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Moon,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SleepBreakdownProps {
  values: number[]
  onChange: (values: number[]) => void
  nightsLabels?: string[]
}

const defaultNights = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function SleepBreakdown({
  values,
  onChange,
  nightsLabels = defaultNights,
}: SleepBreakdownProps) {
  const [activeNight, setActiveNight] = useState(0)

  const updateNight = (nightIndex: number, hours: number) => {
    const newValues = [...values]
    newValues[nightIndex] = Math.max(0, Math.min(14, hours))
    onChange(newValues)
  }

  const totalSleep = values.reduce((a, b) => a + b, 0)
  const nightsWithData = values.filter(v => v > 0).length
  const avgSleep = nightsWithData > 0 ? totalSleep / nightsWithData : 0

  const getSleepQuality = (hours: number): { label: string; color: string } => {
    if (hours === 0) return { label: '', color: '' }
    if (hours >= 7 && hours <= 9) return { label: 'Optimal', color: 'text-emerald-500' }
    if (hours >= 6 && hours < 7) return { label: 'OK', color: 'text-amber-500' }
    if (hours > 9) return { label: 'Long', color: 'text-blue-500' }
    return { label: 'Short', color: 'text-rose-500' }
  }

  const currentQuality = getSleepQuality(values[activeNight])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/20">
            <Moon className="h-7 w-7 text-violet-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Sleep Tracking</h2>
        <p className="text-sm text-muted-foreground mt-1">
          How many hours did you sleep each night?
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-violet-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-violet-600">{totalSleep.toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground">Total this week</p>
        </div>
        <div className="rounded-lg bg-violet-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-violet-600">{avgSleep.toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground">Nightly average</p>
        </div>
      </div>

      {/* Night selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveNight(Math.max(0, activeNight - 1))}
          disabled={activeNight === 0}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 flex justify-center gap-1">
          {nightsLabels.map((night, i) => (
            <button
              key={night}
              onClick={() => setActiveNight(i)}
              className={cn(
                'flex flex-col items-center rounded-lg px-3 py-2 transition-colors',
                activeNight === i
                  ? 'bg-violet-500 text-white'
                  : values[i] > 0
                  ? 'bg-violet-500/10 text-violet-600'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <span className="text-xs font-medium">{night}</span>
              {values[i] > 0 && (
                <span className="text-[10px] mt-0.5">{values[i]}h</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveNight(Math.min(6, activeNight + 1))}
          disabled={activeNight === 6}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Input for active night */}
      <motion.div
        key={activeNight}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Sleep on {nightsLabels[activeNight]} night
          </p>

          {/* Hour controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => updateNight(activeNight, values[activeNight] - 0.5)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
            >
              <Minus className="h-5 w-5" />
            </button>

            <div className="text-center">
              <span className="text-4xl font-bold">{values[activeNight] || 0}</span>
              <span className="text-lg text-muted-foreground ml-1">hrs</span>
              {currentQuality.label && (
                <p className={cn('text-sm font-medium mt-1', currentQuality.color)}>
                  {currentQuality.label}
                </p>
              )}
            </div>

            <button
              onClick={() => updateNight(activeNight, values[activeNight] + 0.5)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex justify-center gap-2">
          {[5, 6, 7, 8, 9].map((hours) => (
            <button
              key={hours}
              onClick={() => updateNight(activeNight, hours)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                values[activeNight] === hours
                  ? 'bg-violet-500 text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {hours}h
            </button>
          ))}
        </div>
      </motion.div>

      {/* Visual breakdown */}
      <div className="space-y-2">
        <p className="text-xs text-center text-muted-foreground">This week</p>
        <div className="flex items-end justify-center gap-1 h-20">
          {values.map((hours, i) => {
            const quality = getSleepQuality(hours)
            return (
              <button
                key={i}
                onClick={() => setActiveNight(i)}
                className={cn(
                  'w-10 rounded-t transition-colors',
                  activeNight === i ? 'bg-violet-500' : 'bg-violet-500/30 hover:bg-violet-500/50'
                )}
                style={{
                  height: `${Math.max(8, Math.min((hours / 10) * 100, 100))}%`,
                }}
              />
            )
          })}
        </div>
        <div className="flex justify-center gap-1">
          {nightsLabels.map((night, i) => (
            <div key={night} className="w-10 text-center text-[10px] text-muted-foreground">
              {night}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            7-9h optimal
          </span>
        </div>
      </div>
    </div>
  )
}
