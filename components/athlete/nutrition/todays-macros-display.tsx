'use client'

import { motion } from 'framer-motion'
import { Flame, Zap, Wheat, Droplet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MacroData {
  target: number
  logged: number
}

interface TodaysMacrosDisplayProps {
  isTrainingDay: boolean
  calories: MacroData
  protein: MacroData
  carbs: MacroData
  fat: MacroData
  onToggleTrainingDay?: () => void
  isLoading?: boolean
}

function MacroProgressBar({
  label,
  icon: Icon,
  target,
  logged,
  color,
  delay = 0,
}: {
  label: string
  icon: typeof Flame
  target: number
  logged: number
  color: string
  delay?: number
}) {
  const percentage = Math.min((logged / target) * 100, 100)
  const remaining = Math.max(target - logged, 0)
  const isOver = logged > target

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', color)}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-right">
          <span className={cn('text-lg font-bold', isOver && 'text-rose-500')}>
            {logged}
          </span>
          <span className="text-muted-foreground"> / {target}</span>
          <span className="ml-1 text-sm text-muted-foreground">
            {label === 'Calories' ? 'kcal' : 'g'}
          </span>
        </div>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, delay: delay + 0.1, ease: 'easeOut' }}
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isOver ? 'bg-rose-500' : color.replace('/10', '')
          )}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {isOver
          ? `${logged - target} ${label === 'Calories' ? 'kcal' : 'g'} over target`
          : `${remaining} ${label === 'Calories' ? 'kcal' : 'g'} remaining`}
      </p>
    </motion.div>
  )
}

export function TodaysMacrosDisplay({
  isTrainingDay,
  calories,
  protein,
  carbs,
  fat,
  onToggleTrainingDay,
  isLoading = false,
}: TodaysMacrosDisplayProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-8 w-32 rounded-full bg-muted" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-5 w-24 rounded bg-muted" />
                <div className="h-5 w-20 rounded bg-muted" />
              </div>
              <div className="h-3 w-full rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Today&apos;s Macros
        </h3>
        {onToggleTrainingDay && (
          <button
            onClick={onToggleTrainingDay}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              isTrainingDay
                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
            )}
          >
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isTrainingDay ? 'bg-amber-500' : 'bg-blue-500'
              )}
            />
            {isTrainingDay ? 'Training Day' : 'Rest Day'}
          </button>
        )}
      </div>

      {/* Macro bars */}
      <div className="space-y-5">
        <MacroProgressBar
          label="Calories"
          icon={Flame}
          target={calories.target}
          logged={calories.logged}
          color="bg-orange-500/10 text-orange-500"
          delay={0}
        />
        <MacroProgressBar
          label="Protein"
          icon={Zap}
          target={protein.target}
          logged={protein.logged}
          color="bg-blue-500/10 text-blue-500"
          delay={0.05}
        />
        <MacroProgressBar
          label="Carbs"
          icon={Wheat}
          target={carbs.target}
          logged={carbs.logged}
          color="bg-amber-500/10 text-amber-500"
          delay={0.1}
        />
        <MacroProgressBar
          label="Fat"
          icon={Droplet}
          target={fat.target}
          logged={fat.logged}
          color="bg-rose-500/10 text-rose-500"
          delay={0.15}
        />
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Logged</p>
          <p className="mt-1 text-xl font-bold">{calories.logged}</p>
          <p className="text-xs text-muted-foreground">kcal</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p
            className={cn(
              'mt-1 text-xl font-bold',
              calories.logged > calories.target && 'text-rose-500'
            )}
          >
            {Math.abs(calories.target - calories.logged)}
          </p>
          <p className="text-xs text-muted-foreground">
            {calories.logged > calories.target ? 'over' : 'kcal to go'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
