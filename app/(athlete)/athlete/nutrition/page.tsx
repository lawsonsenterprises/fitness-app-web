'use client'

import { useState } from 'react'
import {
  UtensilsCrossed,
  Flame,
  Target,
  Droplets,
  Plus,
  ChevronRight,
  Clock,
  Apple,
  Beef,
  Wheat,
  Check,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock data
const mockMacros = {
  calories: { current: 1840, target: 2400, unit: 'kcal' },
  protein: { current: 145, target: 180, unit: 'g' },
  carbs: { current: 180, target: 260, unit: 'g' },
  fat: { current: 55, target: 75, unit: 'g' },
  fiber: { current: 22, target: 30, unit: 'g' },
  water: { current: 2.1, target: 3, unit: 'L' },
}

const mockMealPlan = {
  name: 'High Protein Cut',
  targetCalories: 2400,
  meals: [
    {
      id: '1',
      name: 'Breakfast',
      time: '07:30',
      logged: true,
      target: { calories: 500, protein: 35, carbs: 45, fat: 20 },
      logged_values: { calories: 520, protein: 38, carbs: 42, fat: 22 },
      foods: ['Eggs (3)', 'Oatmeal (80g)', 'Banana', 'Peanut butter (1 tbsp)'],
    },
    {
      id: '2',
      name: 'Lunch',
      time: '12:30',
      logged: true,
      target: { calories: 650, protein: 50, carbs: 60, fat: 25 },
      logged_values: { calories: 680, protein: 52, carbs: 65, fat: 24 },
      foods: ['Chicken breast (200g)', 'Rice (150g)', 'Broccoli', 'Olive oil'],
    },
    {
      id: '3',
      name: 'Pre-Workout Snack',
      time: '16:00',
      logged: true,
      target: { calories: 300, protein: 20, carbs: 40, fat: 8 },
      logged_values: { calories: 280, protein: 22, carbs: 35, fat: 7 },
      foods: ['Greek yogurt', 'Honey', 'Granola'],
    },
    {
      id: '4',
      name: 'Post-Workout',
      time: '18:30',
      logged: false,
      target: { calories: 400, protein: 40, carbs: 50, fat: 8 },
      logged_values: null,
      foods: ['Protein shake', 'Banana', 'Rice cakes'],
    },
    {
      id: '5',
      name: 'Dinner',
      time: '20:00',
      logged: false,
      target: { calories: 550, protein: 35, carbs: 65, fat: 14 },
      logged_values: null,
      foods: ['Salmon (180g)', 'Sweet potato', 'Asparagus', 'Lemon'],
    },
  ],
}

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'plan'>('today')

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Nutrition</h1>
        <p className="mt-1 text-muted-foreground">
          Track your meals and hit your macros
        </p>
      </div>

      {/* Macro Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Today&apos;s Macros</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Quick Add
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          <MacroCard
            icon={Flame}
            label="Calories"
            current={mockMacros.calories.current}
            target={mockMacros.calories.target}
            unit={mockMacros.calories.unit}
            color="orange"
          />
          <MacroCard
            icon={Beef}
            label="Protein"
            current={mockMacros.protein.current}
            target={mockMacros.protein.target}
            unit={mockMacros.protein.unit}
            color="red"
          />
          <MacroCard
            icon={Wheat}
            label="Carbs"
            current={mockMacros.carbs.current}
            target={mockMacros.carbs.target}
            unit={mockMacros.carbs.unit}
            color="amber"
          />
          <MacroCard
            icon={Target}
            label="Fat"
            current={mockMacros.fat.current}
            target={mockMacros.fat.target}
            unit={mockMacros.fat.unit}
            color="purple"
          />
          <MacroCard
            icon={Apple}
            label="Fiber"
            current={mockMacros.fiber.current}
            target={mockMacros.fiber.target}
            unit={mockMacros.fiber.unit}
            color="green"
          />
          <MacroCard
            icon={Droplets}
            label="Water"
            current={mockMacros.water.current}
            target={mockMacros.water.target}
            unit={mockMacros.water.unit}
            color="blue"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'today', label: "Today's Meals" },
          { id: 'plan', label: 'Meal Plan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-foreground text-background'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'today' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {mockMealPlan.meals.map((meal, idx) => (
            <div
              key={meal.id}
              className={cn(
                'rounded-xl border border-border bg-card overflow-hidden',
                !meal.logged && 'opacity-75'
              )}
            >
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    meal.logged ? 'bg-green-500/10' : 'bg-muted'
                  )}>
                    {meal.logged ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{meal.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{meal.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {meal.logged && meal.logged_values && (
                    <div className="hidden md:flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {meal.logged_values.calories} kcal
                      </span>
                      <span className="text-red-500">P: {meal.logged_values.protein}g</span>
                      <span className="text-amber-500">C: {meal.logged_values.carbs}g</span>
                      <span className="text-purple-500">F: {meal.logged_values.fat}g</span>
                    </div>
                  )}
                  <Button variant={meal.logged ? 'outline' : 'default'} size="sm">
                    {meal.logged ? 'Edit' : 'Log Meal'}
                  </Button>
                </div>
              </div>

              {/* Expanded meal details */}
              <div className="px-4 pb-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">
                    {meal.foods.join(' • ')}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Custom Meal
          </Button>
        </motion.div>
      )}

      {activeTab === 'plan' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold">{mockMealPlan.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {mockMealPlan.targetCalories} kcal daily target • 5 meals
                </p>
              </div>
              <Button variant="outline">
                View Full Plan
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              {mockMealPlan.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                >
                  <div>
                    <h3 className="font-medium">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {meal.foods.slice(0, 2).join(', ')}{meal.foods.length > 2 && ` +${meal.foods.length - 2} more`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{meal.target.calories} kcal</p>
                    <p className="text-xs text-muted-foreground">
                      P: {meal.target.protein}g • C: {meal.target.carbs}g • F: {meal.target.fat}g
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">Meal Plan Notes</h3>
            <p className="text-sm text-muted-foreground">
              This meal plan is designed to support your strength training goals while maintaining a slight caloric deficit.
              Focus on hitting protein targets first, then fill in carbs around workouts for energy.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

interface MacroCardProps {
  icon: React.ElementType
  label: string
  current: number
  target: number
  unit: string
  color: 'orange' | 'red' | 'amber' | 'purple' | 'green' | 'blue'
}

function MacroCard({ icon: Icon, label, current, target, unit, color }: MacroCardProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const remaining = target - current

  const colorClasses = {
    orange: 'text-orange-500 bg-orange-500',
    red: 'text-red-500 bg-red-500',
    amber: 'text-amber-500 bg-amber-500',
    purple: 'text-purple-500 bg-purple-500',
    green: 'text-green-500 bg-green-500',
    blue: 'text-blue-500 bg-blue-500',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', colorClasses[color].split(' ')[0])} />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{current}</span>
        <span className="text-sm text-muted-foreground">/ {target}{unit}</span>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color].split(' ')[1])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {remaining > 0 ? `${remaining}${unit} left` : 'Target reached!'}
      </p>
    </div>
  )
}
