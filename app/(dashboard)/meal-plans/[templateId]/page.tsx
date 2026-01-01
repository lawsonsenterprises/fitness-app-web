'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Pencil,
  Copy,
  Trash2,
  Play,
  Globe,
  Lock,
  Utensils,
  Flame,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { MealPlanGoalBadge } from '@/components/meal-plans/meal-plan-type-badge'
import {
  useMealPlan,
  useDuplicateMealPlan,
  useDeleteMealPlan,
  useUpdateMealPlanTemplate,
} from '@/hooks/use-meal-plans'
import type { Meal, MealFood } from '@/types'

// Parse meals from content JSON
function getMeals(content: Record<string, unknown>): Meal[] {
  if (!content || typeof content !== 'object') return []
  const meals = content.meals as Meal[] | undefined
  return meals ?? []
}

export default function MealPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.templateId as string

  const { data: mealPlan, isLoading } = useMealPlan(templateId)
  const duplicateMealPlan = useDuplicateMealPlan()
  const deleteMealPlan = useDeleteMealPlan()
  const updateMealPlan = useUpdateMealPlanTemplate()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDuplicate = async () => {
    try {
      const newMealPlan = await duplicateMealPlan.mutateAsync(templateId)
      toast.success('Meal plan duplicated')
      router.push(`/meal-plans/${newMealPlan.id}`)
    } catch {
      toast.error('Failed to duplicate meal plan')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMealPlan.mutateAsync(templateId)
      toast.success('Meal plan deleted')
      router.push('/meal-plans')
    } catch {
      toast.error('Failed to delete meal plan')
    }
  }

  const handleTogglePublic = async () => {
    try {
      await updateMealPlan.mutateAsync({
        templateId,
        isPublic: !mealPlan?.isPublic,
      })
      toast.success(mealPlan?.isPublic ? 'Meal plan made private' : 'Meal plan made public')
    } catch {
      toast.error('Failed to update meal plan')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Meal Plan" />
        <div className="p-4 lg:p-8">
          <div className="space-y-6">
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen">
        <TopBar title="Meal Plan" />
        <div className="flex flex-col items-center justify-center p-8 py-24">
          <p className="text-muted-foreground">Meal plan not found</p>
          <Link href="/meal-plans" className="mt-4 text-amber-600 hover:text-amber-700">
            Back to meal plans
          </Link>
        </div>
      </div>
    )
  }

  const meals = getMeals(mealPlan.content)

  return (
    <div className="min-h-screen">
      <TopBar title={mealPlan.name} />

      <div className="p-4 lg:p-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/meal-plans')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meal Plans
        </Button>

        {/* Header card */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <MealPlanGoalBadge goal={mealPlan.goal} />
                {mealPlan.isPublic ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600">
                    <Globe className="h-3 w-3" />
                    Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Private
                  </span>
                )}
              </div>

              <h1 className="mb-2 text-2xl font-bold">{mealPlan.name}</h1>

              {mealPlan.description && (
                <p className="mb-4 text-muted-foreground">{mealPlan.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {mealPlan.durationWeeks && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{mealPlan.durationWeeks} weeks</span>
                  </div>
                )}
                <div>
                  <span>Last updated </span>
                  {new Date(mealPlan.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link href={`/meal-plans/assign?template=${mealPlan.id}`}>
                <Button className="gap-2 bg-amber-500 text-white hover:bg-amber-600">
                  <Play className="h-4 w-4" />
                  Assign to Client
                </Button>
              </Link>
              <Link href={`/meal-plans/${mealPlan.id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDuplicate} className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                onClick={handleTogglePublic}
                disabled={updateMealPlan.isPending}
              >
                {mealPlan.isPublic ? 'Make Private' : 'Make Public'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-red-600 hover:bg-red-500/10 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Meal Plan"
          description={`Are you sure you want to delete "${mealPlan.name}"? This will permanently remove the template. Any active client assignments will not be affected.`}
          confirmLabel="Delete"
          variant="destructive"
        />

        {/* Macro Targets */}
        {(mealPlan.targetCalories ||
          mealPlan.targetProtein ||
          mealPlan.targetCarbs ||
          mealPlan.targetFat) && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {mealPlan.targetCalories && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm">Daily Calories</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{mealPlan.targetCalories}</p>
              </div>
            )}
            {mealPlan.targetProtein && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Protein</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{mealPlan.targetProtein}g</p>
              </div>
            )}
            {mealPlan.targetCarbs && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Carbs</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{mealPlan.targetCarbs}g</p>
              </div>
            )}
            {mealPlan.targetFat && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Fat</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{mealPlan.targetFat}g</p>
              </div>
            )}
            {mealPlan.targetFibre && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Fibre</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{mealPlan.targetFibre}g</p>
              </div>
            )}
          </div>
        )}

        {/* Dietary Info */}
        {((mealPlan.dietaryRequirements && mealPlan.dietaryRequirements.length > 0) ||
          (mealPlan.allergies && mealPlan.allergies.length > 0)) && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Dietary Information</h2>
            <div className="flex flex-wrap gap-6">
              {mealPlan.dietaryRequirements && mealPlan.dietaryRequirements.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {mealPlan.dietaryRequirements.map((req) => (
                      <span
                        key={req}
                        className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-600"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {mealPlan.allergies && mealPlan.allergies.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {mealPlan.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-600"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meals */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Daily Meals</h2>

          {meals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {meals.map((meal: Meal) => (
                <div key={meal.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">{meal.name}</h3>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {meal.time}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {meal.foods?.map((food: MealFood, index: number) => (
                      <div
                        key={food.id || index}
                        className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{food.foodName}</span>
                        <span className="text-muted-foreground">
                          {food.quantity} {food.unit}
                        </span>
                      </div>
                    ))}
                    {(!meal.foods || meal.foods.length === 0) && (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No foods added
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Utensils className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">No meals configured yet.</p>
              <Link href={`/meal-plans/${mealPlan.id}/edit`}>
                <Button variant="outline" className="mt-4">
                  Add Meals
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
