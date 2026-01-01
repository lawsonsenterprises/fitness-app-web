'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Search,
  Calendar,
  Loader2,
  Check,
  Utensils,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MealPlanGoalBadge } from '@/components/meal-plans/meal-plan-type-badge'
import { ClientStatusBadge } from '@/components/clients/client-status-badge'
import { useMealPlans, useMealPlan, useAssignMealPlan } from '@/hooks/use-meal-plans'
import { useClients } from '@/hooks/use-clients'
import { getClientDisplayName, getClientInitials } from '@/types'
import { cn } from '@/lib/utils'

function AssignMealPlanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTemplateId = searchParams.get('template')

  // Data fetching
  const { data: mealPlansData } = useMealPlans()
  const { data: preselectedMealPlan } = useMealPlan(preselectedTemplateId || '')
  const { data: clientsData, isLoading: isLoadingClients } = useClients({ status: 'active' })
  const assignMealPlan = useAssignMealPlan()

  const mealPlans = mealPlansData?.data || []
  const clients = clientsData?.data || []

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preselectedTemplateId || ''
  )
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [coachNotes, setCoachNotes] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [mealPlanSearch, setMealPlanSearch] = useState('')

  // Filter clients
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients
    const search = clientSearch.toLowerCase()
    return clients.filter((client) => {
      const name = getClientDisplayName(client).toLowerCase()
      const email = client.email?.toLowerCase() || ''
      return name.includes(search) || email.includes(search)
    })
  }, [clients, clientSearch])

  // Filter meal plans
  const filteredMealPlans = useMemo(() => {
    if (!mealPlanSearch) return mealPlans
    const search = mealPlanSearch.toLowerCase()
    return mealPlans.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
    )
  }, [mealPlans, mealPlanSearch])

  // Get selected meal plan details
  const selectedMealPlan = selectedTemplateId
    ? preselectedMealPlan?.id === selectedTemplateId
      ? preselectedMealPlan
      : mealPlans.find((p) => p.id === selectedTemplateId)
    : null

  // Get selected client details
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null

  // Calculate end date
  const endDate = useMemo(() => {
    if (!startDate || !selectedMealPlan?.durationWeeks) return null
    const start = new Date(startDate)
    start.setDate(start.getDate() + selectedMealPlan.durationWeeks * 7)
    return start.toISOString().split('T')[0]
  }, [startDate, selectedMealPlan?.durationWeeks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTemplateId) {
      toast.error('Please select a meal plan')
      return
    }

    if (!selectedClientId) {
      toast.error('Please select a client')
      return
    }

    if (!startDate) {
      toast.error('Please select a start date')
      return
    }

    try {
      await assignMealPlan.mutateAsync({
        templateId: selectedTemplateId,
        clientId: selectedClientId,
        name: selectedMealPlan?.name || 'Meal Plan',
        content: selectedMealPlan?.content || {},
        startDate,
        endDate: endDate || undefined,
        targetCalories: selectedMealPlan?.targetCalories || undefined,
        targetProtein: selectedMealPlan?.targetProtein || undefined,
        targetCarbs: selectedMealPlan?.targetCarbs || undefined,
        targetFat: selectedMealPlan?.targetFat || undefined,
        targetFibre: selectedMealPlan?.targetFibre || undefined,
        dietaryRequirements: selectedMealPlan?.dietaryRequirements || undefined,
        allergies: selectedMealPlan?.allergies || undefined,
        coachNotes: coachNotes.trim() || undefined,
      })

      toast.success('Meal plan assigned successfully')
      router.push(`/clients/${selectedClientId}/nutrition`)
    } catch (error) {
      console.error('Failed to assign meal plan:', error)
      toast.error('Failed to assign meal plan')
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Assign Meal Plan" />

      <div className="p-4 lg:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Meal Plan Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Meal Plan</h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={mealPlanSearch}
                  onChange={(e) => setMealPlanSearch(e.target.value)}
                  placeholder="Search meal plans..."
                  className="pl-10"
                />
              </div>

              {/* Meal Plan List */}
              <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
                {filteredMealPlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Utensils className="mb-2 h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No meal plans found</p>
                  </div>
                ) : (
                  filteredMealPlans.map((mealPlan) => (
                    <button
                      key={mealPlan.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(mealPlan.id)}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-colors',
                        selectedTemplateId === mealPlan.id
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{mealPlan.name}</span>
                            {selectedTemplateId === mealPlan.id && (
                              <Check className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          {mealPlan.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {mealPlan.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <MealPlanGoalBadge goal={mealPlan.goal} size="sm" />
                            {mealPlan.targetCalories && (
                              <span className="text-xs text-muted-foreground">
                                {mealPlan.targetCalories} kcal
                              </span>
                            )}
                            {mealPlan.durationWeeks && (
                              <span className="text-xs text-muted-foreground">
                                {mealPlan.durationWeeks} weeks
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Client Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Client</h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search clients..."
                  className="pl-10"
                />
              </div>

              {/* Client List */}
              <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
                {isLoadingClients ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <User className="mb-2 h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No clients found</p>
                  </div>
                ) : (
                  filteredClients.map((client) => {
                    const displayName = getClientDisplayName(client)
                    const initials = getClientInitials(client)
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => setSelectedClientId(client.id)}
                        className={cn(
                          'w-full rounded-lg border p-3 text-left transition-colors',
                          selectedClientId === client.id
                            ? 'border-amber-500 bg-amber-500/5'
                            : 'border-transparent hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {client.avatarUrl ? (
                            <Image
                              src={client.avatarUrl}
                              alt={displayName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                              {initials || '?'}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{displayName}</span>
                              {selectedClientId === client.id && (
                                <Check className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          </div>
                          <ClientStatusBadge status={client.status} />
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Assignment Details</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>End Date (Calculated)</Label>
                <div className="mt-1.5 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm">
                  {endDate
                    ? new Date(endDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Select a meal plan to calculate'}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="coachNotes">Coach Notes (Optional)</Label>
                <textarea
                  id="coachNotes"
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  placeholder="Add any personalised notes or instructions for this client..."
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {selectedMealPlan && selectedClient && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
              <h3 className="mb-4 font-semibold text-amber-600">Assignment Summary</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Meal Plan</p>
                  <p className="font-medium">{selectedMealPlan.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{getClientDisplayName(selectedClient)}</p>
                </div>
                {selectedMealPlan.durationWeeks && (
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{selectedMealPlan.durationWeeks} weeks</p>
                  </div>
                )}
                {selectedMealPlan.targetCalories && (
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Calories</p>
                    <p className="font-medium">{selectedMealPlan.targetCalories} kcal</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                assignMealPlan.isPending || !selectedTemplateId || !selectedClientId
              }
              className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
            >
              {assignMealPlan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Assign Meal Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AssignMealPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <TopBar title="Assign Meal Plan" />
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      }
    >
      <AssignMealPlanContent />
    </Suspense>
  )
}
