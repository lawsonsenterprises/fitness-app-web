'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Flame,
  Target,
  Droplets,
  Clock,
  Printer,
  ShoppingCart,
  Dumbbell,
  Moon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useMealPlanAssignment } from '@/hooks/use-meal-plans'

interface MealFood {
  name: string
  amount: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Meal {
  name: string
  time?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  foods: MealFood[]
}

interface DayPlan {
  calories: number
  protein: number
  carbs: number
  fat: number
  meals: Meal[]
}

export default function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ mealPlanId: string }>
}) {
  const resolvedParams = use(params)
  const { data: assignment, isLoading } = useMealPlanAssignment(resolvedParams.mealPlanId)
  const [selectedDay, setSelectedDay] = useState<'training' | 'non-training'>('training')
  const [expandedMeals, setExpandedMeals] = useState<string[]>(['Breakfast'])

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="h-6 w-32 animate-pulse rounded bg-muted mb-4" />
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="lg:col-span-4 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-24">
          <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Meal plan not found</h2>
          <p className="text-muted-foreground mb-6">This meal plan may have been removed or doesn&apos;t exist.</p>
          <Link
            href="/athlete/nutrition"
            className="text-amber-600 hover:text-amber-700"
          >
            Back to Nutrition
          </Link>
        </div>
      </div>
    )
  }

  // Parse content from the meal plan assignment
  const content = assignment.content as Record<string, unknown>
  const trainingDayPlan = (content?.trainingDayPlan as DayPlan) || null
  const nonTrainingDayPlan = (content?.nonTrainingDayPlan as DayPlan) || null

  // Get macro targets from template or assignment
  const template = assignment.template
  const targetCalories = template?.targetCalories || 2000
  const targetProtein = template?.targetProtein || 150
  const targetCarbs = template?.targetCarbs || 200
  const targetFat = template?.targetFat || 70

  // Use content-based plan if available, otherwise use template targets
  const currentPlan = selectedDay === 'training'
    ? trainingDayPlan || { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat, meals: [] }
    : nonTrainingDayPlan || { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat, meals: [] }

  const macroData = [
    { name: 'Protein', value: currentPlan.protein * 4, color: '#8b5cf6' },
    { name: 'Carbs', value: currentPlan.carbs * 4, color: '#22c55e' },
    { name: 'Fat', value: currentPlan.fat * 9, color: '#f59e0b' },
  ]

  const toggleMeal = (mealName: string) => {
    setExpandedMeals((prev) =>
      prev.includes(mealName)
        ? prev.filter((m) => m !== mealName)
        : [...prev, mealName]
    )
  }

  const hasMeals = currentPlan.meals && currentPlan.meals.length > 0

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/athlete/nutrition"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Nutrition
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{assignment.name}</h1>
            {template?.description && (
              <p className="mt-1 text-muted-foreground max-w-2xl">{template.description}</p>
            )}
            {template?.goal && (
              <span className="mt-2 inline-block rounded-full bg-muted px-3 py-1 text-sm capitalize">
                {template.goal.replace('_', ' ')}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Shopping List
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Day Type Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedDay('training')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedDay === 'training'
              ? 'bg-amber-500 text-white'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          <Dumbbell className="h-4 w-4" />
          Training Day
        </button>
        <button
          onClick={() => setSelectedDay('non-training')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedDay === 'non-training'
              ? 'bg-blue-500 text-white'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          <Moon className="h-4 w-4" />
          Rest Day
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content - Meals */}
        <div className="lg:col-span-8 space-y-4">
          {hasMeals ? (
            currentPlan.meals.map((meal) => {
              const isExpanded = expandedMeals.includes(meal.name)

              return (
                <motion.div
                  key={meal.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleMeal(meal.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                        <UtensilsCrossed className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{meal.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {meal.time && (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>{meal.time}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{meal.calories} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-3 text-sm">
                        <span className="text-purple-500">P: {meal.protein}g</span>
                        <span className="text-green-500">C: {meal.carbs}g</span>
                        <span className="text-amber-500">F: {meal.fat}g</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && meal.foods && meal.foods.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-2">
                          {meal.foods.map((food, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                            >
                              <div>
                                <p className="font-medium">{food.name}</p>
                                <p className="text-sm text-muted-foreground">{food.amount}</p>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                  <Flame className="h-3 w-3 text-orange-500" />
                                  {food.calories}
                                </span>
                                <span className="text-purple-500">P: {food.protein}g</span>
                                <span className="text-green-500">C: {food.carbs}g</span>
                                <span className="text-amber-500">F: {food.fat}g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold mb-2">No meals configured</h3>
              <p className="text-muted-foreground">
                Your coach hasn&apos;t added specific meals to this plan yet. Use the daily targets as a guide.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar - Daily Totals */}
        <div className="lg:col-span-4 space-y-6">
          {/* Macros Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">Daily Macros</h3>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 text-center">
              <p className="text-3xl font-bold">{currentPlan.calories}</p>
              <p className="text-sm text-muted-foreground">Total Calories</p>
            </div>
          </motion.div>

          {/* Macro Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">Macro Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Protein</span>
                  </span>
                  <span className="text-sm font-bold">{currentPlan.protein}g</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{currentPlan.protein * 4} kcal</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Carbs</span>
                  </span>
                  <span className="text-sm font-bold">{currentPlan.carbs}g</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{currentPlan.carbs * 4} kcal</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Fat</span>
                  </span>
                  <span className="text-sm font-bold">{currentPlan.fat}g</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{currentPlan.fat * 9} kcal</p>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6"
          >
            <h3 className="font-semibold text-amber-600 mb-3">
              {selectedDay === 'training' ? 'Training Day Tips' : 'Rest Day Tips'}
            </h3>
            <ul className="space-y-2 text-sm text-amber-600/80">
              {selectedDay === 'training' ? (
                <>
                  <li>• Eat pre-workout meal 2-3 hours before training</li>
                  <li>• Consume post-workout within 1 hour of training</li>
                  <li>• Higher carbs support training performance</li>
                </>
              ) : (
                <>
                  <li>• Lower carbs on rest days aids fat loss</li>
                  <li>• Maintain high protein for recovery</li>
                  <li>• Healthy fats support hormone production</li>
                </>
              )}
            </ul>
          </motion.div>

          {/* Coach Notes */}
          {assignment.coachNotes && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-green-500/30 bg-green-500/5 p-6"
            >
              <h3 className="font-semibold text-green-600 mb-3">Coach Notes</h3>
              <p className="text-sm text-green-600/80">{assignment.coachNotes}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
