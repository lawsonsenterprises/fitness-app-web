'use client'

import {
  UtensilsCrossed,
  Calendar,
  Info,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { MealPlanAssignment } from '@/types'

interface AdherenceTrackingCardProps {
  assignment: MealPlanAssignment
  className?: string
}

export function AdherenceTrackingCard({ assignment, className }: AdherenceTrackingCardProps) {
  // Calculate days in plan
  const startDate = new Date(assignment.startDate)
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Adherence Tracking</h3>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Info className="h-6 w-6 text-amber-500" />
          </div>
          <h4 className="font-semibold mb-2">Detailed Tracking Coming Soon</h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Daily nutrition logging and adherence metrics will be available once you start logging meals.
          </p>

          {/* Basic info from assignment */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-semibold">{Math.max(0, daysSinceStart)}</p>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <UtensilsCrossed className="h-4 w-4 mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-semibold">{assignment.template?.targetCalories || '—'}</p>
              <p className="text-xs text-muted-foreground">Target kcal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
