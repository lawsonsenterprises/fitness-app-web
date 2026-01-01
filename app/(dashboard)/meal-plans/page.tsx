'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  UtensilsCrossed,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MealPlanTemplateCard } from '@/components/meal-plans/meal-plan-template-card'
import { useMealPlans, useDuplicateMealPlan, useDeleteMealPlan } from '@/hooks/use-meal-plans'
import { cn } from '@/lib/utils'
import type { MealPlanGoal } from '@/types'

const mealPlanGoals: { value: MealPlanGoal | 'all'; label: string }[] = [
  { value: 'all', label: 'All Goals' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'performance', label: 'Performance' },
  { value: 'health', label: 'Health' },
]

export default function MealPlansPage() {
  const [search, setSearch] = useState('')
  const [goalFilter, setGoalFilter] = useState<MealPlanGoal | 'all'>('all')
  const [showGoalDropdown, setShowGoalDropdown] = useState(false)

  const { data: mealPlansData, isLoading } = useMealPlans({
    goal: goalFilter !== 'all' ? goalFilter : undefined,
    search,
  })

  const duplicateMealPlan = useDuplicateMealPlan()
  const deleteMealPlan = useDeleteMealPlan()

  const mealPlans = mealPlansData?.data || []

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMealPlan.mutateAsync(id)
      toast.success('Meal plan duplicated', {
        description: 'A copy of the meal plan has been created.',
      })
    } catch {
      toast.error('Failed to duplicate meal plan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal plan? This action cannot be undone.')) {
      return
    }
    try {
      await deleteMealPlan.mutateAsync(id)
      toast.success('Meal plan deleted')
    } catch {
      toast.error('Failed to delete meal plan')
    }
  }

  const currentGoal = mealPlanGoals.find((g) => g.value === goalFilter) || mealPlanGoals[0]

  return (
    <div className="min-h-screen">
      <TopBar title="Meal Plans" />

      <div className="p-4 lg:p-8">
        {/* Header with stats and actions */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-muted-foreground">
                Create personalised nutrition plans for your clients
              </p>

              {/* Quick stats */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{mealPlansData?.total || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Public:</span>
                  <span className="font-medium">
                    {mealPlans.filter((p) => p.isPublic).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Private:</span>
                  <span className="font-medium">
                    {mealPlans.filter((p) => !p.isPublic).length}
                  </span>
                </div>
              </div>
            </div>

            <Link href="/meal-plans/new">
              <Button className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90">
                <Plus className="mr-2 h-4 w-4" />
                New Meal Plan
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search meal plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'h-11 rounded-lg border-border bg-background pl-10 pr-4',
                'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
              )}
            />
          </div>

          {/* Goal filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowGoalDropdown(!showGoalDropdown)}
              className="h-11 min-w-[140px] justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {currentGoal.label}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showGoalDropdown && 'rotate-180'
                )}
              />
            </Button>

            {showGoalDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowGoalDropdown(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                  {mealPlanGoals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => {
                        setGoalFilter(goal.value)
                        setShowGoalDropdown(false)
                      }}
                      className={cn(
                        'flex w-full items-center px-3 py-2 text-sm hover:bg-muted',
                        goalFilter === goal.value && 'bg-muted'
                      )}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active filters */}
        {goalFilter !== 'all' && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filters:</span>
            <button
              onClick={() => setGoalFilter('all')}
              className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs hover:bg-muted/80"
            >
              {currentGoal.label}
              <span className="text-muted-foreground">×</span>
            </button>
          </div>
        )}

        {/* Meal plans grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : mealPlans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mealPlans.map((mealPlan) => (
              <MealPlanTemplateCard
                key={mealPlan.id}
                mealPlan={mealPlan}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">
              {search || goalFilter !== 'all'
                ? 'No matching meal plans'
                : 'No meal plans yet'}
            </h3>
            <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
              {search || goalFilter !== 'all'
                ? 'Try adjusting your filters or search term.'
                : 'Create your first meal plan to provide nutritional guidance for your clients.'}
            </p>
            {!search && goalFilter === 'all' && (
              <Link href="/meal-plans/new">
                <Button className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Meal Plan
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
