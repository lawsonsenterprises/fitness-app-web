'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { UtensilsCrossed, Plus, Calendar, Target, ArrowRight, Clock, Trophy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AdherenceTrackingCard } from '@/components/meal-plans/adherence-tracking-card'
import { useClient } from '@/hooks/use-clients'
import { useClientMealPlanAssignments } from '@/hooks/use-meal-plans'

export default function ClientNutritionPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)
  const { data: assignmentsData, isLoading } = useClientMealPlanAssignments(clientId)

  const assignments = assignmentsData?.data || []
  const activeAssignment = assignments.find((a) => a.status === 'active')
  const scheduledAssignments = assignments.filter((a) => a.status === 'scheduled')
  const completedAssignments = assignments.filter((a) => a.status === 'completed')

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="space-y-8">
      {/* Current Meal Plan */}
      {activeAssignment ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{activeAssignment.name}</h2>
              <p className="text-sm text-muted-foreground">
                {activeAssignment.template?.goal && (
                  <span className="capitalize">{activeAssignment.template.goal.replace('_', ' ')}</span>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Modify Meal Plan
            </Button>
          </div>

          {/* Macro targets from template */}
          {activeAssignment.template && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-500" />
                  <h3 className="font-medium">Daily Targets</h3>
                </div>
                <div className="space-y-2">
                  {activeAssignment.template.targetCalories && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Calories</span>
                      <span className="font-semibold">{activeAssignment.template.targetCalories} kcal</span>
                    </div>
                  )}
                  {activeAssignment.template.targetProtein && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Protein</span>
                      <span className="font-medium">{activeAssignment.template.targetProtein}g</span>
                    </div>
                  )}
                  {activeAssignment.template.targetCarbs && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Carbs</span>
                      <span className="font-medium">{activeAssignment.template.targetCarbs}g</span>
                    </div>
                  )}
                  {activeAssignment.template.targetFat && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Fat</span>
                      <span className="font-medium">{activeAssignment.template.targetFat}g</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Plan Details</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Started</span>
                    <span className="font-medium">
                      {new Date(activeAssignment.startDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {activeAssignment.endDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ends</span>
                      <span className="font-medium">
                        {new Date(activeAssignment.endDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {activeAssignment.template.durationWeeks && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="font-medium">{activeAssignment.template.durationWeeks} weeks</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Coach notes if any */}
          {activeAssignment.coachNotes && (
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm font-medium text-amber-600 mb-1">Coach Notes</p>
              <p className="text-sm text-amber-600/80">{activeAssignment.coachNotes}</p>
            </div>
          )}
        </div>
      ) : (
        /* No active meal plan */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No Active Meal Plan</h3>
          <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
            This client doesn&apos;t have an active meal plan. Assign one to help them with their nutrition.
          </p>
          <Link href="/meal-plans">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Assign Meal Plan
            </Button>
          </Link>
        </div>
      )}

      {/* Scheduled Meal Plans */}
      {scheduledAssignments.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold">Upcoming Meal Plans</h3>
          </div>
          <div className="divide-y divide-border">
            {scheduledAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{assignment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Starts {new Date(assignment.startDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  View <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Meal Plans */}
      {completedAssignments.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold">Previous Meal Plans</h3>
          </div>
          <div className="divide-y divide-border">
            {completedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Trophy className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">{assignment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed {assignment.endDate && new Date(assignment.endDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  View <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adherence Tracking Card */}
      {activeAssignment && (
        <AdherenceTrackingCard assignment={activeAssignment} />
      )}

      {/* Nutrition Tracking Placeholder */}
      {!activeAssignment && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Nutrition Tracking</h3>
          </div>
          <div className="rounded-lg bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Daily nutrition logs sync from the athlete&apos;s app. View their calorie and macro intake, meal adherence, and nutrition trends here once they start logging.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
