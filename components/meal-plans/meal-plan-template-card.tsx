'use client'

import Link from 'next/link'
import {
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Globe,
  Lock,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { MealPlanGoalBadge } from './meal-plan-type-badge'
import { cn } from '@/lib/utils'
import type { MealPlanTemplate } from '@/types'

interface MealPlanTemplateCardProps {
  mealPlan: MealPlanTemplate
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
}

export function MealPlanTemplateCard({
  mealPlan,
  onDuplicate,
  onDelete,
}: MealPlanTemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border bg-card p-5 transition-all',
        'hover:border-amber-500/30 hover:shadow-lg hover:-translate-y-0.5'
      )}
    >
      {/* Status indicator */}
      <div className="absolute -top-px left-6 h-1 w-16 rounded-b-full bg-gradient-to-r from-amber-400 to-amber-600" />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <MealPlanGoalBadge goal={mealPlan.goal} size="sm" />
          {mealPlan.isPublic ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <Globe className="h-3 w-3" />
              Public
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Private
            </span>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                <Link
                  href={`/meal-plans/${mealPlan.id}`}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setShowMenu(false)}
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  View Details
                </Link>
                <Link
                  href={`/meal-plans/${mealPlan.id}/edit`}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setShowMenu(false)}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit
                </Link>
                <button
                  onClick={() => {
                    onDuplicate?.(mealPlan.id)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  Duplicate
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={() => {
                    onDelete?.(mealPlan.id)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title and description */}
      <Link href={`/meal-plans/${mealPlan.id}`} className="block">
        <h3 className="mb-2 font-semibold text-lg leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors">
          {mealPlan.name}
        </h3>
        {mealPlan.description && (
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
            {mealPlan.description}
          </p>
        )}
      </Link>

      {/* Target macros */}
      {(mealPlan.targetCalories || mealPlan.targetProtein || mealPlan.targetCarbs || mealPlan.targetFat) && (
        <div className="mb-4 rounded-lg bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Daily Targets
          </p>
          <div className="flex items-center gap-1 mb-1">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="font-semibold">{mealPlan.targetCalories || '-'}</span>
            <span className="text-xs text-muted-foreground">kcal</span>
          </div>
          <div className="text-xs text-muted-foreground">
            P:{mealPlan.targetProtein || 0}g C:{mealPlan.targetCarbs || 0}g F:{mealPlan.targetFat || 0}g
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          {mealPlan.durationWeeks && (
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              <span>{mealPlan.durationWeeks} weeks</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick assign button on hover */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/meal-plans/assign?template=${mealPlan.id}`}>
          <Button size="sm" className="w-full bg-amber-500 text-white hover:bg-amber-600">
            Assign to Client
          </Button>
        </Link>
      </div>
    </div>
  )
}
