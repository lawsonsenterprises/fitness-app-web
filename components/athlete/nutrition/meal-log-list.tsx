'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Coffee,
  Sun,
  Moon,
  Soup,
  Cookie,
  UtensilsCrossed,
  Flame,
  Zap,
  Clock,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoggedFood {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface MealLog {
  id: string
  mealType: string
  loggedAt: Date
  foods: LoggedFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  notes?: string
  adherence?: 'on-plan' | 'off-plan' | 'modified'
}

interface MealLogListProps {
  logs: MealLog[]
  onEdit?: (logId: string) => void
  onDelete?: (logId: string) => void
  onAddMeal?: () => void
  showDate?: boolean
}

const mealIcons: Record<string, typeof Coffee> = {
  breakfast: Coffee,
  'morning snack': Sun,
  lunch: Sun,
  'afternoon snack': Cookie,
  dinner: Moon,
  'evening snack': Soup,
}

const adherenceConfig = {
  'on-plan': {
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    label: 'On Plan',
  },
  'off-plan': {
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    label: 'Off Plan',
  },
  modified: {
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    label: 'Modified',
  },
}

function MealLogCard({
  log,
  index,
  onEdit,
  onDelete,
  showDate,
}: {
  log: MealLog
  index: number
  onEdit?: () => void
  onDelete?: () => void
  showDate?: boolean
}) {
  const Icon = mealIcons[log.mealType.toLowerCase()] || UtensilsCrossed
  const adherence = log.adherence ? adherenceConfig[log.adherence] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Icon className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold capitalize">{log.mealType}</p>
              {adherence && (
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', adherence.bg, adherence.color)}>
                  {adherence.label}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {showDate ? (
                log.loggedAt.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              ) : (
                <>
                  <Clock className="inline h-3 w-3 mr-1" />
                  {formatDistanceToNow(log.loggedAt, { addSuffix: true })}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{log.totalCalories}</span>
            <span className="text-muted-foreground">kcal</span>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 ml-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Foods */}
      <div className="p-4 space-y-2">
        {log.foods.map((food, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2"
          >
            <div>
              <p className="font-medium">{food.name}</p>
              <p className="text-xs text-muted-foreground">{food.portion}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-orange-500 font-medium">{food.calories}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-blue-500">{food.protein}P</span>
              <span className="text-amber-500">{food.carbs}C</span>
              <span className="text-rose-500">{food.fat}F</span>
            </div>
          </div>
        ))}

        {/* Notes */}
        {log.notes && (
          <div className="rounded-lg bg-blue-500/10 px-3 py-2">
            <p className="text-sm text-blue-600">{log.notes}</p>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="flex items-center justify-between border-t border-border bg-muted/10 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Meal Totals
        </span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-600 font-medium">{log.totalProtein}g P</span>
          <span className="text-amber-600 font-medium">{log.totalCarbs}g C</span>
          <span className="text-rose-600 font-medium">{log.totalFat}g F</span>
        </div>
      </div>
    </motion.div>
  )
}

export function MealLogList({
  logs,
  onEdit,
  onDelete,
  onAddMeal,
  showDate = false,
}: MealLogListProps) {
  // Calculate totals
  const totalCalories = logs.reduce((acc, log) => acc + log.totalCalories, 0)
  const totalProtein = logs.reduce((acc, log) => acc + log.totalProtein, 0)
  const totalCarbs = logs.reduce((acc, log) => acc + log.totalCarbs, 0)
  const totalFat = logs.reduce((acc, log) => acc + log.totalFat, 0)

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <UtensilsCrossed className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No meals logged</p>
        <p className="text-sm text-muted-foreground/70">Start logging your meals to track nutrition</p>
        {onAddMeal && (
          <button
            onClick={onAddMeal}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Log a Meal
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl bg-orange-500/10 p-3 text-center">
          <Flame className="mx-auto h-5 w-5 text-orange-500" />
          <p className="mt-1 text-xl font-bold">{totalCalories}</p>
          <p className="text-xs text-muted-foreground">Calories</p>
        </div>
        <div className="rounded-xl bg-blue-500/10 p-3 text-center">
          <Zap className="mx-auto h-5 w-5 text-blue-500" />
          <p className="mt-1 text-xl font-bold">{totalProtein}g</p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3 text-center">
          <p className="mt-1 text-xl font-bold">{totalCarbs}g</p>
          <p className="text-xs text-muted-foreground">Carbs</p>
        </div>
        <div className="rounded-xl bg-rose-500/10 p-3 text-center">
          <p className="mt-1 text-xl font-bold">{totalFat}g</p>
          <p className="text-xs text-muted-foreground">Fat</p>
        </div>
      </div>

      {/* Add meal button */}
      {onAddMeal && (
        <button
          onClick={onAddMeal}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Another Meal
        </button>
      )}

      {/* Log list */}
      <div className="space-y-3">
        {logs.map((log, i) => (
          <MealLogCard
            key={log.id}
            log={log}
            index={i}
            onEdit={onEdit ? () => onEdit(log.id) : undefined}
            onDelete={onDelete ? () => onDelete(log.id) : undefined}
            showDate={showDate}
          />
        ))}
      </div>
    </div>
  )
}

export type { MealLog, LoggedFood }
