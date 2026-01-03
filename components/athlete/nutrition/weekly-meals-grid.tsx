'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Check,
  Clock,
  Dumbbell,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MealSummary {
  name: string
  time: string
  calories: number
  protein: number
  logged: boolean
}

interface DayMeals {
  date: Date
  dayType: 'training' | 'rest'
  meals: MealSummary[]
  totalCalories: number
  targetCalories: number
  totalProtein: number
  targetProtein: number
}

interface WeeklyMealsGridProps {
  days: DayMeals[]
  currentDate?: Date
  onDayClick?: (date: Date) => void
  onMealClick?: (date: Date, mealName: string) => void
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function DayCard({
  day,
  isToday,
  onClick,
  onMealClick,
}: {
  day: DayMeals
  isToday: boolean
  onClick?: () => void
  onMealClick?: (mealName: string) => void
}) {
  const calorieProgress = Math.min((day.totalCalories / day.targetCalories) * 100, 100)
  const proteinProgress = Math.min((day.totalProtein / day.targetProtein) * 100, 100)
  const allLogged = day.meals.every(m => m.logged)
  const dayName = dayNames[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'rounded-xl border overflow-hidden cursor-pointer transition-all',
        isToday ? 'border-amber-500/50 bg-amber-500/5' : 'border-border bg-card hover:border-muted-foreground/30'
      )}
      onClick={onClick}
    >
      {/* Day header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-2',
        day.dayType === 'training' ? 'bg-amber-500/10' : 'bg-blue-500/10'
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-semibold',
            isToday && 'text-amber-600'
          )}>
            {dayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {day.date.getDate()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {day.dayType === 'training' ? (
            <Dumbbell className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-blue-600" />
          )}
          {allLogged && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </div>
      </div>

      {/* Macros progress */}
      <div className="p-3 space-y-2">
        {/* Calories */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-muted-foreground">Calories</span>
            </div>
            <span className="text-xs font-medium">
              {Math.round(day.totalCalories)} / {Math.round(day.targetCalories)}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-300"
              style={{ width: `${calorieProgress}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">Protein</span>
            </div>
            <span className="text-xs font-medium">
              {Math.round(day.totalProtein)}g / {Math.round(day.targetProtein)}g
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${proteinProgress}%` }}
            />
          </div>
        </div>

        {/* Meals list */}
        <div className="pt-2 space-y-1">
          {day.meals.map((meal) => (
            <button
              key={meal.name}
              onClick={(e) => {
                e.stopPropagation()
                onMealClick?.(meal.name)
              }}
              className={cn(
                'w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors',
                meal.logged ? 'bg-emerald-500/10' : 'bg-muted/30 hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-2">
                {meal.logged ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Clock className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-xs font-medium truncate">{meal.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{meal.time}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function WeeklyMealsGrid({
  days,
  currentDate = new Date(),
  onDayClick,
  onMealClick,
}: WeeklyMealsGridProps) {
  const [weekOffset, setWeekOffset] = useState(0)

  // Calculate week start (Monday)
  const getWeekStart = (date: Date, offset: number) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const weekStart = getWeekStart(currentDate, weekOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  // Filter days for current week
  const weekDays = days.filter(day => {
    const dayDate = new Date(day.date)
    dayDate.setHours(0, 0, 0, 0)
    return dayDate >= weekStart && dayDate <= weekEnd
  })

  // Fill in missing days
  const fullWeek: (DayMeals | null)[] = []
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(weekStart)
    checkDate.setDate(checkDate.getDate() + i)
    checkDate.setHours(0, 0, 0, 0)

    const existingDay = weekDays.find(d => {
      const dayDate = new Date(d.date)
      dayDate.setHours(0, 0, 0, 0)
      return dayDate.getTime() === checkDate.getTime()
    })

    fullWeek.push(existingDay || null)
  }

  const formatWeekRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${weekStart.toLocaleDateString('en-GB', options)} - ${weekEnd.toLocaleDateString('en-GB', options)}`
  }

  // Weekly totals
  const weeklyCalories = weekDays.reduce((acc, d) => acc + d.totalCalories, 0)
  const weeklyProtein = weekDays.reduce((acc, d) => acc + d.totalProtein, 0)
  const targetCalories = weekDays.reduce((acc, d) => acc + d.targetCalories, 0)
  const targetProtein = weekDays.reduce((acc, d) => acc + d.targetProtein, 0)

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="text-center">
          <p className="font-semibold">{formatWeekRange()}</p>
          <div className="flex items-center justify-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {Math.round(weeklyCalories).toLocaleString()} / {Math.round(targetCalories).toLocaleString()} kcal
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              {Math.round(weeklyProtein)}g / {Math.round(targetProtein)}g protein
            </span>
          </div>
        </div>

        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 0}
          className={cn(
            'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            weekOffset >= 0
              ? 'text-muted-foreground/50 cursor-not-allowed'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Today button */}
      {weekOffset !== 0 && (
        <button
          onClick={() => setWeekOffset(0)}
          className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 py-2 text-sm font-medium text-amber-600 hover:bg-amber-500/20 transition-colors"
        >
          Back to This Week
        </button>
      )}

      {/* Days grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {fullWeek.map((day, i) => {
          if (!day) {
            const emptyDate = new Date(weekStart)
            emptyDate.setDate(emptyDate.getDate() + i)
            return (
              <div
                key={i}
                className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-3 opacity-50"
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    {dayNames[i]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {emptyDate.getDate()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">No data</p>
                </div>
              </div>
            )
          }

          const dayDate = new Date(day.date)
          dayDate.setHours(0, 0, 0, 0)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const isToday = dayDate.getTime() === today.getTime()

          return (
            <DayCard
              key={i}
              day={day}
              isToday={isToday}
              onClick={() => onDayClick?.(day.date)}
              onMealClick={(meal) => onMealClick?.(day.date, meal)}
            />
          )
        })}
      </div>
    </div>
  )
}

export type { DayMeals, MealSummary }
