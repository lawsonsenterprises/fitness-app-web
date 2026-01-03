'use client'

import Link from 'next/link'
import {
  UtensilsCrossed,
  Flame,
  Target,
  ChevronRight,
  Loader2,
  Beef,
  Wheat,
  Apple,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useAthleteDashboard, useCurrentMealPlan } from '@/hooks/athlete'
import { TopBar } from '@/components/dashboard/top-bar'

export default function NutritionPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { data: dashboardData, isLoading: dashboardLoading } = useAthleteDashboard(user?.id)
  const { data: mealPlan, isLoading: mealPlanLoading } = useCurrentMealPlan(user?.id)

  // Show loading while auth is loading OR (user exists AND queries are loading)
  const isLoading = authLoading || (user && (dashboardLoading || mealPlanLoading))

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const todayMacros = dashboardData?.todayMacros || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    targetCalories: 2400,
    targetProtein: 180,
  }

  const hasNutritionData = dashboardData?.hasData?.nutrition

  // Default targets (could come from user profile/settings)
  const targets = {
    calories: todayMacros.targetCalories || 2400,
    protein: todayMacros.targetProtein || 180,
    carbs: 260,
    fat: 75,
    fiber: 30,
    water: 3,
  }

  return (
    <>
      <TopBar title="Nutrition" />
      <div className="p-6 lg:p-8">
        <p className="mb-6 text-muted-foreground">
          Track your meals and hit your macros
        </p>

        {/* Macro Overview */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Today&apos;s Macros</h2>
        </div>

        {hasNutritionData ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MacroCard
              icon={Flame}
              label="Calories"
              current={todayMacros.calories}
              target={targets.calories}
              unit="kcal"
              color="orange"
            />
            <MacroCard
              icon={Beef}
              label="Protein"
              current={todayMacros.protein}
              target={targets.protein}
              unit="g"
              color="red"
            />
            <MacroCard
              icon={Wheat}
              label="Carbs"
              current={todayMacros.carbs}
              target={targets.carbs}
              unit="g"
              color="amber"
            />
            <MacroCard
              icon={Target}
              label="Fat"
              current={todayMacros.fat}
              target={targets.fat}
              unit="g"
              color="purple"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No nutrition data logged today</p>
            <p className="text-sm text-muted-foreground">
              Log your meals in the iOS app to track your macros
            </p>
          </div>
        )}
      </motion.div>

      {/* Meal Plan Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meal Plan</h2>
        </div>

        {mealPlan ? (
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="font-medium">{mealPlan.meal_plans?.name || 'Current Plan'}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {mealPlan.meal_plans?.description || 'Your assigned meal plan'}
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/athlete/nutrition/plan">
                View Full Plan
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Apple className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No Meal Plan Assigned</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Your coach will assign a meal plan tailored to your goals.
            </p>
          </div>
        )}
      </motion.div>

      {/* Log Meals CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center"
      >
        <UtensilsCrossed className="h-8 w-8 mx-auto text-amber-600 mb-3" />
        <h3 className="font-semibold mb-2">Track Your Nutrition</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Use the Synced Momentum iOS app to log your meals and track your daily nutrition.
        </p>
      </motion.div>
      </div>
    </>
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
        <span className="text-xl font-bold">{Math.round(current)}</span>
        <span className="text-sm text-muted-foreground">/ {Math.round(target)}{unit}</span>
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
        {remaining > 0 ? `${Math.round(remaining)}${unit} left` : 'Target reached!'}
      </p>
    </div>
  )
}
