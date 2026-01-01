'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Utensils,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateMealPlan } from '@/hooks/use-meal-plans'
import type { MealPlanGoal, Meal, MealFood } from '@/types'

const goalOptions: { value: MealPlanGoal; label: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'performance', label: 'Performance' },
  { value: 'health', label: 'Health' },
  { value: 'custom', label: 'Custom' },
]

const commonDietaryRequirements = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'High-Protein',
]

const commonAllergies = [
  'Nuts',
  'Peanuts',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish',
]

function createEmptyMeal(sortOrder: number): Meal {
  return {
    id: crypto.randomUUID(),
    mealPlanId: '',
    isTrainingDay: false,
    name: `Meal ${sortOrder + 1}`,
    time: '12:00',
    sortOrder,
    foods: [],
  }
}

function createEmptyFood(sortOrder: number): MealFood {
  return {
    id: crypto.randomUUID(),
    mealId: '',
    foodId: '',
    foodName: '',
    quantity: 1,
    unit: 'serving',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }
}

export default function NewMealPlanPage() {
  const router = useRouter()
  const createMealPlan = useCreateMealPlan()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState<MealPlanGoal>('maintenance')
  const [durationWeeks, setDurationWeeks] = useState(4)
  const [targetCalories, setTargetCalories] = useState<number | undefined>(2000)
  const [targetProtein, setTargetProtein] = useState<number | undefined>(150)
  const [targetCarbs, setTargetCarbs] = useState<number | undefined>(200)
  const [targetFat, setTargetFat] = useState<number | undefined>(70)
  const [targetFibre, setTargetFibre] = useState<number | undefined>(30)
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [meals, setMeals] = useState<Meal[]>([
    { ...createEmptyMeal(0), name: 'Breakfast', time: '07:00' },
    { ...createEmptyMeal(1), name: 'Lunch', time: '12:00' },
    { ...createEmptyMeal(2), name: 'Dinner', time: '18:00' },
  ])

  const toggleDietaryRequirement = (req: string) => {
    setDietaryRequirements((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    )
  }

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    )
  }

  const addMeal = () => {
    setMeals([...meals, createEmptyMeal(meals.length)])
  }

  const updateMeal = (mealId: string, updates: Partial<Meal>) => {
    setMeals(meals.map((meal) => (meal.id === mealId ? { ...meal, ...updates } : meal)))
  }

  const removeMeal = (mealId: string) => {
    setMeals(meals.filter((meal) => meal.id !== mealId))
  }

  const addFood = (mealId: string) => {
    setMeals(
      meals.map((meal) => {
        if (meal.id === mealId) {
          return { ...meal, foods: [...meal.foods, createEmptyFood(meal.foods.length)] }
        }
        return meal
      })
    )
  }

  const updateFood = (mealId: string, foodId: string, updates: Partial<MealFood>) => {
    setMeals(
      meals.map((meal) => {
        if (meal.id === mealId) {
          return {
            ...meal,
            foods: meal.foods.map((food) =>
              food.id === foodId ? { ...food, ...updates } : food
            ),
          }
        }
        return meal
      })
    )
  }

  const removeFood = (mealId: string, foodId: string) => {
    setMeals(
      meals.map((meal) => {
        if (meal.id === mealId) {
          return { ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }
        }
        return meal
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter a meal plan name')
      return
    }

    try {
      const mealPlan = await createMealPlan.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        goal,
        durationWeeks,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        targetFibre,
        dietaryRequirements: dietaryRequirements.length > 0 ? dietaryRequirements : undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
        isTemplate: true,
        isPublic,
        content: { meals },
      })

      toast.success('Meal plan created successfully')
      router.push(`/meal-plans/${mealPlan.id}`)
    } catch (error) {
      console.error('Failed to create meal plan:', error)
      toast.error('Failed to create meal plan')
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="New Meal Plan" />

      <div className="p-4 lg:p-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/meal-plans')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meal Plans
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Meal Plan Details</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Meal Plan Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., High Protein Cutting Plan"
                  className="mt-1.5"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the meal plan goals, who it's designed for, and key features..."
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <Label htmlFor="goal">Goal</Label>
                <select
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as MealPlanGoal)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {goalOptions.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (Weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Macro Targets */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Daily Targets</h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  min={0}
                  value={targetCalories || ''}
                  onChange={(e) =>
                    setTargetCalories(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="2000"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  min={0}
                  value={targetProtein || ''}
                  onChange={(e) =>
                    setTargetProtein(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="150"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  min={0}
                  value={targetCarbs || ''}
                  onChange={(e) =>
                    setTargetCarbs(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="200"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  min={0}
                  value={targetFat || ''}
                  onChange={(e) =>
                    setTargetFat(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="70"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="fibre">Fibre (g)</Label>
                <Input
                  id="fibre"
                  type="number"
                  min={0}
                  value={targetFibre || ''}
                  onChange={(e) =>
                    setTargetFibre(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="30"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Dietary Requirements & Allergies */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Dietary Preferences</h2>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Dietary Requirements</Label>
                <div className="flex flex-wrap gap-2">
                  {commonDietaryRequirements.map((req) => (
                    <button
                      key={req}
                      type="button"
                      onClick={() => toggleDietaryRequirement(req)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        dietaryRequirements.includes(req)
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {req}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Allergies</Label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergies.map((allergy) => (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        allergies.includes(allergy)
                          ? 'border-red-500 bg-red-500/10 text-red-600'
                          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-amber-500 focus:ring-amber-500"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this meal plan publicly visible
                </Label>
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Meals</h2>
                <p className="text-sm text-muted-foreground">
                  Configure the meals for a typical day
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addMeal} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Meal
              </Button>
            </div>

            <div className="space-y-4">
              {meals.map((meal, mealIndex) => (
                <div
                  key={meal.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Meal Header */}
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={meal.name}
                        onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                        className="h-8 w-32 font-medium"
                        placeholder="Meal name"
                      />
                      <Input
                        type="time"
                        value={meal.time}
                        onChange={(e) => updateMeal(meal.id, { time: e.target.value })}
                        className="h-8 w-28"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {meal.foods.length} food{meal.foods.length !== 1 ? 's' : ''}
                      </span>
                      {meals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMeal(meal.id)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Foods */}
                  <div className="p-4">
                    {meal.foods.length > 0 ? (
                      <div className="space-y-3">
                        {meal.foods.map((food, foodIndex) => (
                          <div
                            key={food.id}
                            className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {foodIndex + 1}
                            </span>
                            <div className="grid flex-1 gap-2 sm:grid-cols-6">
                              <div className="sm:col-span-2">
                                <Input
                                  value={food.foodName}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, { foodName: e.target.value })
                                  }
                                  placeholder="Food name"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  min={0}
                                  value={food.quantity}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, {
                                      quantity: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  placeholder="Qty"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Input
                                  value={food.unit}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, { unit: e.target.value })
                                  }
                                  placeholder="Unit"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  min={0}
                                  value={food.calories || ''}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, {
                                      calories: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  placeholder="Kcal"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  min={0}
                                  value={food.protein || ''}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, {
                                      protein: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  placeholder="Protein"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFood(meal.id, food.id)}
                              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Utensils className="mb-2 h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No foods added yet</p>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFood(meal.id)}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Food
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Link href="/meal-plans">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createMealPlan.isPending}
              className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
            >
              {createMealPlan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Meal Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
