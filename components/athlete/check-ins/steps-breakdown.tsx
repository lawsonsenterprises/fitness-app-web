'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Footprints,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepsBreakdownProps {
  values: number[]
  onChange: (values: number[]) => void
  daysLabels?: string[]
}

const defaultDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const presets = [
  { label: '5k', value: 5000 },
  { label: '8k', value: 8000 },
  { label: '10k', value: 10000 },
  { label: '12k', value: 12000 },
  { label: '15k', value: 15000 },
]

export function StepsBreakdown({
  values,
  onChange,
  daysLabels = defaultDays,
}: StepsBreakdownProps) {
  const [activeDay, setActiveDay] = useState(0)

  const updateDay = (dayIndex: number, steps: number) => {
    const newValues = [...values]
    newValues[dayIndex] = steps
    onChange(newValues)
  }

  const totalSteps = values.reduce((a, b) => a + b, 0)
  const daysWithData = values.filter(v => v > 0).length
  const avgSteps = daysWithData > 0 ? Math.round(totalSteps / daysWithData) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20">
            <Footprints className="h-7 w-7 text-blue-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Daily Steps</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your steps for each day this week
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalSteps.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total steps</p>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{avgSteps.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Average daily</p>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
          disabled={activeDay === 0}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 flex justify-center gap-1">
          {daysLabels.map((day, i) => (
            <button
              key={day}
              onClick={() => setActiveDay(i)}
              className={cn(
                'flex flex-col items-center rounded-lg px-3 py-2 transition-colors',
                activeDay === i
                  ? 'bg-blue-500 text-white'
                  : values[i] > 0
                  ? 'bg-blue-500/10 text-blue-600'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <span className="text-xs font-medium">{day}</span>
              {values[i] > 0 && (
                <span className="text-[10px] mt-0.5">
                  {(values[i] / 1000).toFixed(0)}k
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveDay(Math.min(6, activeDay + 1))}
          disabled={activeDay === 6}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Input for active day */}
      <motion.div
        key={activeDay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Steps for {daysLabels[activeDay]}
          </p>
          <input
            type="number"
            value={values[activeDay] || ''}
            onChange={(e) => updateDay(activeDay, parseInt(e.target.value) || 0)}
            placeholder="0"
            className="w-40 text-center text-3xl font-bold bg-transparent border-b-2 border-border focus:border-blue-500 focus:outline-none py-2"
          />
        </div>

        {/* Presets */}
        <div className="flex justify-center gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateDay(activeDay, preset.value)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                values[activeDay] === preset.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Visual breakdown */}
      <div className="space-y-2">
        <p className="text-xs text-center text-muted-foreground">This week</p>
        <div className="flex items-end justify-center gap-1 h-20">
          {values.map((steps, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={cn(
                'w-10 rounded-t transition-colors',
                activeDay === i ? 'bg-blue-500' : 'bg-blue-500/30 hover:bg-blue-500/50'
              )}
              style={{
                height: `${Math.max(8, Math.min((steps / 15000) * 100, 100))}%`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-center gap-1">
          {daysLabels.map((day) => (
            <div key={day} className="w-10 text-center text-[10px] text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
