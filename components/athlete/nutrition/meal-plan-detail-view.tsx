'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  User,
  Calendar,
  ShoppingCart,
  Flame,
  Zap,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Soup,
  Cookie,
} from 'lucide-react'
import Link from 'next/link'
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
}

interface DayPlan {
  meals: Meal[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface MealPlanDetail {
  id: string
  name: string
  description?: string
  coachName: string
  startDate: Date
  trainingDay: DayPlan
  restDay: DayPlan
}

interface MealPlanDetailViewProps {
  mealPlan: MealPlanDetail
}

const mealIcons: Record<string, typeof Coffee> = {
  Breakfast: Coffee,
  'Morning Snack': Sun,
  Lunch: Sun,
  'Afternoon Snack': Cookie,
  Dinner: Moon,
  'Evening Snack': Soup,
}

function MacroPill({ label, value, unit = 'g', color }: { label: string; value: number; unit?: string; color: string }) {
  return (
    <div className={cn('rounded-lg px-3 py-1.5', color)}>
      <span className="text-sm font-medium">{value}{unit}</span>
      <span className="ml-1 text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function MealCard({ meal }: { meal: Meal }) {
  const Icon = mealIcons[meal.name] || UtensilsCrossed
  const totalMacros = meal.foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
      <div className="flex items-center justify-between bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Icon className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold">{meal.name}</p>
            <p className="text-xs text-muted-foreground">{meal.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-medium">{Math.round(totalMacros.calories)}</span>
          <span className="text-muted-foreground">kcal</span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {meal.foods.map((food, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
          >
            <div>
              <p className="font-medium">{food.name}</p>
              <p className="text-xs text-muted-foreground">{food.portion}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-orange-500">{Math.round(food.calories)}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-blue-500">{Math.round(food.protein)}P</span>
              <span className="text-amber-500">{Math.round(food.carbs)}C</span>
              <span className="text-rose-500">{Math.round(food.fat)}F</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/10 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Meal Totals
        </span>
        <div className="flex gap-2">
          <MacroPill label="P" value={Math.round(totalMacros.protein)} color="bg-blue-500/10 text-blue-600" />
          <MacroPill label="C" value={Math.round(totalMacros.carbs)} color="bg-amber-500/10 text-amber-600" />
          <MacroPill label="F" value={Math.round(totalMacros.fat)} color="bg-rose-500/10 text-rose-600" />
        </div>
      </div>
    </div>
  )
}

function DayPlanSection({ plan, title, isActive }: { plan: DayPlan; title: string; isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('space-y-4', !isActive && 'hidden')}
    >
      {/* Day heading */}
      <h3 className="text-lg font-semibold">{title}</h3>

      {/* Day summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl bg-orange-500/10 p-4 text-center">
          <Flame className="mx-auto h-5 w-5 text-orange-500" />
          <p className="mt-2 text-2xl font-bold">{Math.round(plan.totalCalories)}</p>
          <p className="text-xs text-muted-foreground">Calories</p>
        </div>
        <div className="rounded-xl bg-blue-500/10 p-4 text-center">
          <Zap className="mx-auto h-5 w-5 text-blue-500" />
          <p className="mt-2 text-2xl font-bold">{Math.round(plan.totalProtein)}g</p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-4 text-center">
          <p className="mt-2 text-2xl font-bold">{Math.round(plan.totalCarbs)}g</p>
          <p className="text-xs text-muted-foreground">Carbs</p>
        </div>
        <div className="rounded-xl bg-rose-500/10 p-4 text-center">
          <p className="mt-2 text-2xl font-bold">{Math.round(plan.totalFat)}g</p>
          <p className="text-xs text-muted-foreground">Fat</p>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {plan.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} />
        ))}
      </div>
    </motion.div>
  )
}

export function MealPlanDetailView({ mealPlan }: MealPlanDetailViewProps) {
  const [activeDay, setActiveDay] = useState<'training' | 'rest'>('training')

  const generateShoppingList = () => {
    // Combine all foods from both plans
    const allFoods = [
      ...mealPlan.trainingDay.meals.flatMap(m => m.foods),
      ...mealPlan.restDay.meals.flatMap(m => m.foods),
    ]

    // Group by food name
    const grouped = allFoods.reduce((acc, food) => {
      if (!acc[food.name]) {
        acc[food.name] = []
      }
      acc[food.name].push(food.portion)
      return acc
    }, {} as Record<string, string[]>)

    // Generate text
    const list = Object.entries(grouped)
      .map(([name, portions]) => `- ${name}: ${portions.join(', ')}`)
      .join('\n')

    // Copy to clipboard
    navigator.clipboard.writeText(`Shopping List for ${mealPlan.name}\n\n${list}`)
    alert('Shopping list copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/athlete/nutrition"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Nutrition
          </Link>
          <h1 className="text-2xl font-bold">{mealPlan.name}</h1>
          {mealPlan.description && (
            <p className="mt-2 text-muted-foreground">{mealPlan.description}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {mealPlan.coachName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Since {mealPlan.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        <button
          onClick={generateShoppingList}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ShoppingCart className="h-4 w-4" />
          Generate Shopping List
        </button>
      </div>

      {/* Day toggle */}
      <div className="flex rounded-xl border border-border p-1">
        <button
          onClick={() => setActiveDay('training')}
          className={cn(
            'flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
            activeDay === 'training'
              ? 'bg-amber-500/10 text-amber-600'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Training Day
        </button>
        <button
          onClick={() => setActiveDay('rest')}
          className={cn(
            'flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
            activeDay === 'rest'
              ? 'bg-blue-500/10 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Rest Day
        </button>
      </div>

      {/* Day content */}
      <DayPlanSection
        plan={mealPlan.trainingDay}
        title="Training Day"
        isActive={activeDay === 'training'}
      />
      <DayPlanSection
        plan={mealPlan.restDay}
        title="Rest Day"
        isActive={activeDay === 'rest'}
      />
    </div>
  )
}

export type { MealPlanDetail, DayPlan, Meal, Food }
