'use client'

import { motion } from 'framer-motion'
import { UtensilsCrossed, User, Calendar, ChevronRight, Flame, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MealPlan {
  id: string
  name: string
  coachName: string
  startDate: Date
  trainingDayMacros: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  nonTrainingDayMacros: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

interface CurrentMealPlanCardProps {
  mealPlan?: MealPlan | null
  isTrainingDay?: boolean
  isLoading?: boolean
}

export function CurrentMealPlanCard({
  mealPlan,
  isTrainingDay = true,
  isLoading = false,
}: CurrentMealPlanCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-muted" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border bg-card p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No Active Meal Plan</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your coach hasn&apos;t assigned a meal plan yet
        </p>
      </motion.div>
    )
  }

  const macros = isTrainingDay ? mealPlan.trainingDayMacros : mealPlan.nonTrainingDayMacros

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{mealPlan.name}</h3>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  isTrainingDay
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-blue-500/10 text-blue-600'
                )}
              >
                {isTrainingDay ? 'Training Day' : 'Rest Day'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {mealPlan.coachName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Since {mealPlan.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500"
          >
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </motion.div>
        </div>

        {/* Macros grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl bg-orange-500/10 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500">
              <Flame className="h-4 w-4" />
            </div>
            <p className="mt-1 text-2xl font-bold">{macros.calories}</p>
            <p className="text-xs text-muted-foreground">Calories</p>
          </div>
          <div className="rounded-xl bg-blue-500/10 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500">
              <Zap className="h-4 w-4" />
            </div>
            <p className="mt-1 text-2xl font-bold">{macros.protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3 text-center">
            <p className="mt-1 text-2xl font-bold">{macros.carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="rounded-xl bg-rose-500/10 p-3 text-center">
            <p className="mt-1 text-2xl font-bold">{macros.fat}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>

        {/* View button */}
        <Link
          href={`/athlete/nutrition/meal-plans/${mealPlan.id}`}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl',
            'bg-foreground px-4 py-3 font-medium text-background',
            'transition-all hover:bg-foreground/90',
            'group-hover:shadow-lg group-hover:shadow-emerald-500/10'
          )}
        >
          View Full Meal Plan
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  )
}

export type { MealPlan }
