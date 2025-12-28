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
  Download,
  ShoppingCart,
  Dumbbell,
  Moon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock meal plan data
const mockMealPlan = {
  id: '1',
  name: 'Cutting Phase Meal Plan',
  description: 'High protein, moderate carb meal plan optimised for fat loss while preserving muscle mass.',
  coach: 'Andy Lawson',
  startDate: '2024-12-01',
  trainingDayPlan: {
    calories: 2400,
    protein: 180,
    carbs: 250,
    fat: 70,
    meals: [
      {
        name: 'Breakfast',
        time: '07:00',
        calories: 520,
        protein: 40,
        carbs: 55,
        fat: 15,
        foods: [
          { name: 'Oats', amount: '80g', calories: 300, protein: 10, carbs: 52, fat: 6 },
          { name: 'Whey Protein', amount: '30g', calories: 120, protein: 25, carbs: 2, fat: 1 },
          { name: 'Banana', amount: '1 medium', calories: 100, protein: 1, carbs: 25, fat: 0 },
          { name: 'Blueberries', amount: '50g', calories: 30, protein: 0, carbs: 7, fat: 0 },
        ],
      },
      {
        name: 'Pre-Workout',
        time: '11:00',
        calories: 380,
        protein: 35,
        carbs: 45,
        fat: 8,
        foods: [
          { name: 'Chicken Breast', amount: '150g', calories: 230, protein: 35, carbs: 0, fat: 5 },
          { name: 'Rice', amount: '100g cooked', calories: 130, protein: 3, carbs: 28, fat: 0 },
          { name: 'Mixed Vegetables', amount: '100g', calories: 40, protein: 2, carbs: 8, fat: 0 },
        ],
      },
      {
        name: 'Post-Workout',
        time: '15:00',
        calories: 600,
        protein: 50,
        carbs: 75,
        fat: 12,
        foods: [
          { name: 'Lean Beef Mince', amount: '200g', calories: 340, protein: 40, carbs: 0, fat: 10 },
          { name: 'Sweet Potato', amount: '200g', calories: 180, protein: 4, carbs: 40, fat: 0 },
          { name: 'Broccoli', amount: '150g', calories: 50, protein: 4, carbs: 10, fat: 0 },
          { name: 'Olive Oil', amount: '5ml', calories: 45, protein: 0, carbs: 0, fat: 5 },
        ],
      },
      {
        name: 'Dinner',
        time: '19:00',
        calories: 580,
        protein: 45,
        carbs: 50,
        fat: 20,
        foods: [
          { name: 'Salmon Fillet', amount: '180g', calories: 350, protein: 40, carbs: 0, fat: 18 },
          { name: 'Basmati Rice', amount: '120g cooked', calories: 150, protein: 3, carbs: 33, fat: 0 },
          { name: 'Asparagus', amount: '100g', calories: 20, protein: 2, carbs: 4, fat: 0 },
        ],
      },
      {
        name: 'Evening Snack',
        time: '21:00',
        calories: 320,
        protein: 35,
        carbs: 25,
        fat: 10,
        foods: [
          { name: 'Greek Yogurt 0%', amount: '200g', calories: 130, protein: 20, carbs: 8, fat: 0 },
          { name: 'Almonds', amount: '20g', calories: 120, protein: 4, carbs: 2, fat: 10 },
          { name: 'Honey', amount: '15g', calories: 45, protein: 0, carbs: 12, fat: 0 },
        ],
      },
    ],
  },
  nonTrainingDayPlan: {
    calories: 2000,
    protein: 180,
    carbs: 150,
    fat: 75,
    meals: [
      {
        name: 'Breakfast',
        time: '08:00',
        calories: 450,
        protein: 40,
        carbs: 25,
        fat: 22,
        foods: [
          { name: 'Whole Eggs', amount: '3', calories: 210, protein: 18, carbs: 0, fat: 15 },
          { name: 'Egg Whites', amount: '100g', calories: 50, protein: 10, carbs: 0, fat: 0 },
          { name: 'Avocado', amount: '50g', calories: 80, protein: 1, carbs: 4, fat: 7 },
          { name: 'Spinach', amount: '50g', calories: 12, protein: 1, carbs: 1, fat: 0 },
        ],
      },
      {
        name: 'Lunch',
        time: '12:00',
        calories: 520,
        protein: 45,
        carbs: 35,
        fat: 22,
        foods: [
          { name: 'Chicken Thighs', amount: '200g', calories: 340, protein: 40, carbs: 0, fat: 18 },
          { name: 'Mixed Salad', amount: '150g', calories: 30, protein: 2, carbs: 5, fat: 0 },
          { name: 'Olive Oil Dressing', amount: '15ml', calories: 120, protein: 0, carbs: 0, fat: 14 },
          { name: 'Cherry Tomatoes', amount: '100g', calories: 20, protein: 1, carbs: 4, fat: 0 },
        ],
      },
      {
        name: 'Afternoon Snack',
        time: '15:30',
        calories: 280,
        protein: 30,
        carbs: 15,
        fat: 12,
        foods: [
          { name: 'Cottage Cheese', amount: '200g', calories: 180, protein: 28, carbs: 6, fat: 4 },
          { name: 'Walnuts', amount: '15g', calories: 100, protein: 2, carbs: 2, fat: 10 },
        ],
      },
      {
        name: 'Dinner',
        time: '19:00',
        calories: 550,
        protein: 50,
        carbs: 40,
        fat: 20,
        foods: [
          { name: 'White Fish', amount: '200g', calories: 200, protein: 42, carbs: 0, fat: 2 },
          { name: 'Quinoa', amount: '100g cooked', calories: 120, protein: 4, carbs: 22, fat: 2 },
          { name: 'Green Beans', amount: '150g', calories: 50, protein: 3, carbs: 10, fat: 0 },
          { name: 'Butter', amount: '10g', calories: 75, protein: 0, carbs: 0, fat: 8 },
        ],
      },
      {
        name: 'Evening Snack',
        time: '21:00',
        calories: 200,
        protein: 25,
        carbs: 8,
        fat: 8,
        foods: [
          { name: 'Casein Protein', amount: '30g', calories: 120, protein: 24, carbs: 3, fat: 1 },
          { name: 'Peanut Butter', amount: '10g', calories: 60, protein: 2, carbs: 2, fat: 5 },
        ],
      },
    ],
  },
}

export default function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ mealPlanId: string }>
}) {
  const resolvedParams = use(params)
  const [selectedDay, setSelectedDay] = useState<'training' | 'non-training'>('training')
  const [expandedMeals, setExpandedMeals] = useState<string[]>(['Breakfast'])

  const currentPlan = selectedDay === 'training' ? mockMealPlan.trainingDayPlan : mockMealPlan.nonTrainingDayPlan

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
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{mockMealPlan.name}</h1>
            <p className="mt-1 text-muted-foreground max-w-2xl">{mockMealPlan.description}</p>
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
          {currentPlan.meals.map((meal) => {
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
                        <Clock className="h-3 w-3" />
                        <span>{meal.time}</span>
                        <span>•</span>
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
                  {isExpanded && (
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
          })}
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
        </div>
      </div>
    </div>
  )
}
