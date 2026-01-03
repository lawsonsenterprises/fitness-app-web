'use client'

import { motion } from 'framer-motion'
import {
  Coffee,
  Sun,
  Moon,
  Soup,
  Cookie,
  UtensilsCrossed,
  Flame,
  Zap,
  Check,
  Clock,
  ChevronRight,
  Dumbbell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Food {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Meal {
  name: string
  time: string
  foods: Food[]
  logged: boolean
  loggedAt?: Date
}

interface DayMealBreakdownProps {
  date: Date
  dayType: 'training' | 'rest'
  meals: Meal[]
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  onMealClick?: (mealName: string) => void
  onLogMeal?: (mealName: string) => void
}

const mealIcons: Record<string, typeof Coffee> = {
  Breakfast: Coffee,
  'Morning Snack': Sun,
  Lunch: Sun,
  'Afternoon Snack': Cookie,
  Dinner: Moon,
  'Evening Snack': Soup,
}

function MealRow({
  meal,
  index,
  onClick,
  onLog,
}: {
  meal: Meal
  index: number
  onClick?: () => void
  onLog?: () => void
}) {
  const Icon = mealIcons[meal.name] || UtensilsCrossed
  const totalCalories = meal.foods.reduce((acc, f) => acc + f.calories, 0)
  const totalProtein = meal.foods.reduce((acc, f) => acc + f.protein, 0)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-xl border overflow-hidden transition-all',
        meal.logged
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-border bg-card hover:border-muted-foreground/30'
      )}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            meal.logged ? 'bg-emerald-500/20' : 'bg-muted/50'
          )}>
            <Icon className={cn(
              'h-5 w-5',
              meal.logged ? 'text-emerald-500' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{meal.name}</p>
              {meal.logged && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="h-3 w-3" />
                  Logged
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{meal.time}</span>
              <span>•</span>
              <span>{meal.foods.length} items</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{Math.round(totalCalories)}</span>
              <span className="text-muted-foreground">kcal</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-blue-500" />
              <span>{Math.round(totalProtein)}g protein</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>

      {/* Foods preview */}
      <div className="border-t border-border bg-muted/20 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {meal.foods.slice(0, 4).map((food, i) => (
            <span
              key={i}
              className="rounded-full bg-background px-2.5 py-1 text-xs font-medium"
            >
              {food.name}
            </span>
          ))}
          {meal.foods.length > 4 && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              +{meal.foods.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Log button for unlogged meals */}
      {!meal.logged && onLog && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onLog()
          }}
          className="w-full border-t border-border bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors"
        >
          Log This Meal
        </button>
      )}
    </motion.div>
  )
}

function MacroProgress({
  label,
  current,
  target,
  color,
  icon: Icon,
}: {
  label: string
  current: number
  target: number
  color: string
  icon?: typeof Flame
}) {
  const progress = Math.min((current / target) * 100, 100)
  const isOver = current > target

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className={cn('h-4 w-4', color)} />}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={cn(
          'text-sm font-medium',
          isOver ? 'text-rose-500' : 'text-muted-foreground'
        )}>
          {Math.round(current)} / {Math.round(target)}{label !== 'Calories' ? 'g' : ''}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isOver ? 'bg-rose-500' : color.replace('text-', 'bg-')
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function DayMealBreakdown({
  date,
  dayType,
  meals,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  onMealClick,
  onLogMeal,
}: DayMealBreakdownProps) {
  // Calculate totals
  const totalCalories = meals.reduce(
    (acc, m) => acc + m.foods.reduce((a, f) => a + f.calories, 0),
    0
  )
  const totalProtein = meals.reduce(
    (acc, m) => acc + m.foods.reduce((a, f) => a + f.protein, 0),
    0
  )
  const totalCarbs = meals.reduce(
    (acc, m) => acc + m.foods.reduce((a, f) => a + f.carbs, 0),
    0
  )
  const totalFat = meals.reduce(
    (acc, m) => acc + m.foods.reduce((a, f) => a + f.fat, 0),
    0
  )

  const loggedMeals = meals.filter(m => m.logged).length
  const totalMeals = meals.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {date.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
              dayType === 'training'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-blue-500/10 text-blue-600'
            )}>
              {dayType === 'training' ? (
                <>
                  <Dumbbell className="h-3 w-3" />
                  Training Day
                </>
              ) : (
                <>
                  <Moon className="h-3 w-3" />
                  Rest Day
                </>
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {loggedMeals}/{totalMeals} meals logged
            </span>
          </div>
        </div>
      </div>

      {/* Macro progress */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Daily Progress
        </h3>
        <MacroProgress
          label="Calories"
          current={Math.round(totalCalories)}
          target={Math.round(targetCalories)}
          color="text-orange-500"
          icon={Flame}
        />
        <MacroProgress
          label="Protein"
          current={Math.round(totalProtein)}
          target={Math.round(targetProtein)}
          color="text-blue-500"
          icon={Zap}
        />
        <MacroProgress
          label="Carbs"
          current={Math.round(totalCarbs)}
          target={Math.round(targetCarbs)}
          color="text-amber-500"
        />
        <MacroProgress
          label="Fat"
          current={Math.round(totalFat)}
          target={Math.round(targetFat)}
          color="text-rose-500"
        />
      </div>

      {/* Meals list */}
      <div className="space-y-3">
        {meals.map((meal, i) => (
          <MealRow
            key={meal.name}
            meal={meal}
            index={i}
            onClick={() => onMealClick?.(meal.name)}
            onLog={() => onLogMeal?.(meal.name)}
          />
        ))}
      </div>
    </div>
  )
}

export type { Meal, Food }
