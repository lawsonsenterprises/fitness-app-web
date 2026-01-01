'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Camera,
  Barcode,
  Beef,
  Wheat,
  Droplets,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Star,
  History,
  Heart,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Apple,
  Loader2,
} from 'lucide-react'
import { format, addDays, subDays, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import {
  useDailyNutritionLog,
  useFoodDatabase,
  useAddFoodEntry,
  useRemoveFoodEntry,
  type FoodItem,
} from '@/hooks/athlete'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

const mealTypes: { id: MealType; label: string; icon: typeof Coffee; colour: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, colour: '#f59e0b' },
  { id: 'lunch', label: 'Lunch', icon: Sun, colour: '#22c55e' },
  { id: 'dinner', label: 'Dinner', icon: Moon, colour: '#8b5cf6' },
  { id: 'snacks', label: 'Snacks', icon: Apple, colour: '#ec4899' },
]

export default function FoodLogPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [servings, setServings] = useState(1)
  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'favourites'>('search')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  // Fetch data
  const { data: nutritionData, isLoading: nutritionLoading } = useDailyNutritionLog(user?.id, dateStr)
  const { data: foodDatabase, isLoading: foodsLoading } = useFoodDatabase(user?.id, debouncedSearch)
  const addFoodMutation = useAddFoodEntry()
  const removeFoodMutation = useRemoveFoodEntry()

  const dailyTargets = nutritionData?.targets || {
    calories: 2500,
    protein: 180,
    carbs: 280,
    fat: 80,
  }

  // Calculate daily totals from summary or meals
  const dailyTotals = nutritionData?.summary
    ? {
        calories: nutritionData.summary.actualCalories,
        protein: nutritionData.summary.actualProtein,
        carbs: nutritionData.summary.actualCarbs,
        fat: nutritionData.summary.actualFat,
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 }

  // Calculate meal totals
  const getMealTotals = (mealType: MealType) => {
    const meal = nutritionData?.meals?.find(m => m.mealType === mealType)
    if (!meal) return { calories: 0, protein: 0, carbs: 0, fat: 0 }

    return meal.entries.reduce(
      (acc: { calories: number; protein: number; carbs: number; fat: number }, entry: { calories: number; protein: number; carbs: number; fat: number }) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const getMealFoods = (mealType: MealType) => {
    const meal = nutritionData?.meals?.find(m => m.mealType === mealType)
    return meal?.entries || []
  }

  const handleAddFood = async () => {
    if (!selectedFood || !user?.id) return

    try {
      await addFoodMutation.mutateAsync({
        athleteId: user.id,
        date: dateStr,
        mealType: selectedMealType,
        foodItem: selectedFood,
        quantity: servings,
      })
      setShowAddModal(false)
      setSelectedFood(null)
      setServings(1)
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to add food:', error)
    }
  }

  const handleRemoveFood = async (entry: {
    id: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }) => {
    if (!user?.id || !nutritionData?.summary) return

    try {
      await removeFoodMutation.mutateAsync({
        entryId: entry.id,
        athleteId: user.id,
        date: dateStr,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        summaryId: nutritionData.summary.id,
      })
    } catch (error) {
      console.error('Failed to remove food:', error)
    }
  }

  const openAddModal = (mealType: MealType) => {
    setSelectedMealType(mealType)
    setShowAddModal(true)
  }

  const getProgressColour = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage < 80) return 'bg-blue-500'
    if (percentage < 100) return 'bg-emerald-500'
    if (percentage < 110) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  // Filter foods based on active tab
  const getDisplayedFoods = () => {
    if (!foodDatabase) return []

    if (activeTab === 'search' && debouncedSearch) {
      return foodDatabase
    }
    if (activeTab === 'recent') {
      return foodDatabase.filter(f => f.isRecent)
    }
    if (activeTab === 'favourites') {
      return foodDatabase.filter(f => f.isFavourite)
    }
    return foodDatabase.slice(0, 6)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with date selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Food Log</h1>
          <p className="text-muted-foreground mt-1">Track your daily nutrition</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              isToday(selectedDate)
                ? 'bg-foreground text-background'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEE, d MMM')}
          </button>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {nutritionLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Daily summary card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Daily Summary</h2>
              <div className="text-right">
                <p className="text-2xl font-bold">{Math.round(dailyTotals.calories)}</p>
                <p className="text-sm text-muted-foreground">
                  of {dailyTargets.calories} kcal
                </p>
              </div>
            </div>

            {/* Calorie progress bar */}
            <div className="mb-6">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((dailyTotals.calories / dailyTargets.calories) * 100, 100)}%`,
                  }}
                  className={cn(
                    'h-full rounded-full transition-colors',
                    getProgressColour(dailyTotals.calories, dailyTargets.calories)
                  )}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>
                  {Math.round(dailyTargets.calories - dailyTotals.calories)} kcal remaining
                </span>
                <span>
                  {Math.round((dailyTotals.calories / dailyTargets.calories) * 100)}%
                </span>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: 'Protein',
                  current: dailyTotals.protein,
                  target: dailyTargets.protein,
                  unit: 'g',
                  icon: Beef,
                  colour: '#ef4444',
                },
                {
                  label: 'Carbs',
                  current: dailyTotals.carbs,
                  target: dailyTargets.carbs,
                  unit: 'g',
                  icon: Wheat,
                  colour: '#f59e0b',
                },
                {
                  label: 'Fat',
                  current: dailyTotals.fat,
                  target: dailyTargets.fat,
                  unit: 'g',
                  icon: Droplets,
                  colour: '#3b82f6',
                },
              ].map((macro) => {
                const Icon = macro.icon
                const percentage = (macro.current / macro.target) * 100
                return (
                  <div key={macro.label} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="6"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke={macro.colour}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={176}
                          initial={{ strokeDashoffset: 176 }}
                          animate={{
                            strokeDashoffset: 176 - (176 * Math.min(percentage, 100)) / 100,
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-5 w-5" style={{ color: macro.colour }} />
                      </div>
                    </div>
                    <p className="text-sm font-medium">{macro.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(macro.current)}/{macro.target}{macro.unit}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Meal sections */}
          <div className="space-y-4">
            {mealTypes.map((meal) => {
              const Icon = meal.icon
              const mealFoods = getMealFoods(meal.id)
              const mealTotals = getMealTotals(meal.id)

              return (
                <div
                  key={meal.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Meal header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ borderLeft: `4px solid ${meal.colour}` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${meal.colour}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: meal.colour }} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{meal.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {mealFoods.length} item{mealFoods.length !== 1 ? 's' : ''} •{' '}
                          {Math.round(mealTotals.calories)} kcal
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openAddModal(meal.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                      style={{ color: meal.colour }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Food
                    </button>
                  </div>

                  {/* Logged foods */}
                  {mealFoods.length > 0 && (
                    <div className="border-t border-border divide-y divide-border">
                      {mealFoods.map((food: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number; quantity: number; servingUnit: string | null }) => (
                        <div
                          key={food.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{food.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {food.quantity} × {food.servingUnit || 'serving'}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {Math.round(food.calories)} kcal
                              </p>
                              <p className="text-xs text-muted-foreground">
                                P: {Math.round(food.protein)}g • C:{' '}
                                {Math.round(food.carbs)}g • F:{' '}
                                {Math.round(food.fat)}g
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFood(food)}
                              disabled={removeFoodMutation.isPending}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Quick add buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-blue-500/50 transition-colors">
          <Camera className="h-6 w-6 text-blue-500" />
          <span className="text-sm font-medium">Scan Food</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-purple-500/50 transition-colors">
          <Barcode className="h-6 w-6 text-purple-500" />
          <span className="text-sm font-medium">Scan Barcode</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-colors">
          <Utensils className="h-6 w-6 text-emerald-500" />
          <span className="text-sm font-medium">Quick Add</span>
        </button>
      </div>

      {/* Add food modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false)
                setSelectedFood(null)
                setServings(1)
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden"
            >
              <div className="rounded-t-2xl border border-border bg-card shadow-2xl">
                {/* Modal header */}
                <div className="sticky top-0 bg-card border-b border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">
                      Add to {mealTypes.find((m) => m.id === selectedMealType)?.label}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddModal(false)
                        setSelectedFood(null)
                        setServings(1)
                      }}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search foods..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                      autoFocus
                    />
                  </div>

                  {/* Tabs */}
                  {!selectedFood && (
                    <div className="flex gap-2 mt-4">
                      {[
                        { id: 'search', label: 'Search', icon: Search },
                        { id: 'recent', label: 'Recent', icon: History },
                        { id: 'favourites', label: 'Favourites', icon: Heart },
                      ].map((tab) => {
                        const TabIcon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                              activeTab === tab.id
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <TabIcon className="h-3.5 w-3.5" />
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Modal content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {selectedFood ? (
                    // Selected food details
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedFood.name}</h3>
                        {selectedFood.brand && (
                          <p className="text-sm text-muted-foreground">
                            {selectedFood.brand}
                          </p>
                        )}
                      </div>

                      {/* Serving size selector */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Number of Servings
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <input
                            type="number"
                            value={servings}
                            onChange={(e) =>
                              setServings(Math.max(0.5, Number(e.target.value)))
                            }
                            step={0.5}
                            min={0.5}
                            className="w-20 text-center rounded-lg border border-border bg-background px-3 py-2 text-lg font-medium outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => setServings(servings + 0.5)}
                            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <span className="text-sm text-muted-foreground">
                            × {selectedFood.servingSize || 1}
                            {selectedFood.servingUnit || 'g'}
                          </span>
                        </div>
                      </div>

                      {/* Nutrition preview */}
                      <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Calories</span>
                          <span className="text-lg font-bold">
                            {Math.round(selectedFood.calories * servings)} kcal
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Protein</p>
                            <p className="font-medium">
                              {Math.round(selectedFood.protein * servings)}g
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Carbs</p>
                            <p className="font-medium">
                              {Math.round(selectedFood.carbs * servings)}g
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Fat</p>
                            <p className="font-medium">
                              {Math.round(selectedFood.fat * servings)}g
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedFood(null)
                            setServings(1)
                          }}
                          className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors font-medium"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleAddFood}
                          disabled={addFoodMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50"
                        >
                          {addFoodMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Check className="h-5 w-5" />
                          )}
                          Add Food
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Food list
                    <div className="space-y-2">
                      {foodsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : getDisplayedFoods().length > 0 ? (
                        getDisplayedFoods().map((food) => (
                          <button
                            key={food.id}
                            onClick={() => setSelectedFood(food)}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-blue-500/50 transition-colors text-left"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {food.name}
                                {food.brand && (
                                  <span className="text-muted-foreground text-sm ml-1">
                                    ({food.brand})
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {food.servingSize || 1}
                                {food.servingUnit || 'g'} • {food.calories} kcal
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right text-xs text-muted-foreground">
                                <p>P: {food.protein}g</p>
                                <p>C: {food.carbs}g</p>
                                <p>F: {food.fat}g</p>
                              </div>
                              {food.isFavourite && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            {debouncedSearch
                              ? 'No foods found matching your search'
                              : 'No foods in your database yet'}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Foods logged from the iOS app will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
