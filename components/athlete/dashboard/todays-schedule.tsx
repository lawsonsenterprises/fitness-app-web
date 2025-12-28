'use client'

import { motion } from 'framer-motion'
import {
  Dumbbell,
  UtensilsCrossed,
  Clock,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TrainingSession {
  id: string
  name: string
  type: string
  startTime: string
  duration: number
  exerciseCount: number
}

interface Meal {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface TodaysScheduleProps {
  trainingSession?: TrainingSession | null
  upcomingMeals?: Meal[]
  isLoading?: boolean
}

export function TodaysSchedule({
  trainingSession,
  upcomingMeals = [],
  isLoading = false,
}: TodaysScheduleProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-20 rounded-xl bg-muted" />
            <div className="h-16 rounded-xl bg-muted" />
            <div className="h-16 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Today&apos;s Schedule
      </h3>

      <div className="space-y-3">
        {/* Training Session */}
        {trainingSession ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
            className="group relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-600/10 p-4"
          >
            {/* Glow effect */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                  <Dumbbell className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">{trainingSession.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {trainingSession.startTime}
                    </span>
                    <span>{trainingSession.duration} min</span>
                    <span>{trainingSession.exerciseCount} exercises</span>
                  </div>
                </div>
              </div>
              <Link
                href="/athlete/training"
                className="flex items-center gap-1 text-sm font-medium text-amber-500 opacity-0 transition-opacity group-hover:opacity-100"
              >
                Start <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
            <Dumbbell className="mx-auto h-6 w-6 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No training scheduled today</p>
          </div>
        )}

        {/* Upcoming Meals */}
        {upcomingMeals.length > 0 ? (
          upcomingMeals.slice(0, 3).map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <UtensilsCrossed className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">{meal.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {meal.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Macro badges */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500">
                    <Flame className="h-3 w-3" />
                    {meal.calories}
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
                    <Zap className="h-3 w-3" />
                    {meal.protein}g
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
            <UtensilsCrossed className="mx-auto h-6 w-6 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No meals planned</p>
          </div>
        )}
      </div>

      {/* View full schedule link */}
      <Link
        href="/athlete/nutrition"
        className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View full schedule <ChevronRight className="h-4 w-4" />
      </Link>
    </motion.div>
  )
}
