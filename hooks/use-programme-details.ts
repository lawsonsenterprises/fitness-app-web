'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ==================== Programme Days ====================

export interface ProgrammeDay {
  id: string
  programmeId: string
  weekNumber: number
  dayNumber: number
  dayName: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export function useProgrammeDays(programmeId: string) {
  return useQuery({
    queryKey: ['programme-days', programmeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programme_days')
        .select('*')
        .eq('programme_id', programmeId)
        .or('is_soft_deleted.is.null,is_soft_deleted.eq.false')
        .order('sort_order', { ascending: true })
        .order('weekday', { ascending: true })

      if (error) {
        console.error('Error fetching programme days:', error)
        return []
      }

      return (data || []).map(row => ({
        id: row.id,
        programmeId: row.programme_id,
        weekNumber: row.sort_order,
        dayNumber: row.weekday,
        dayName: row.name,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    },
    enabled: !!programmeId,
  })
}

export function useProgrammeDay(programmeId: string, weekNumber: number, dayNumber: number) {
  return useQuery({
    queryKey: ['programme-day', programmeId, weekNumber, dayNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programme_days')
        .select('*')
        .eq('programme_id', programmeId)
        .eq('sort_order', weekNumber)
        .eq('weekday', dayNumber)
        .or('is_soft_deleted.is.null,is_soft_deleted.eq.false')
        .maybeSingle()

      if (error) {
        console.error('Error fetching programme day:', error)
        return null
      }

      if (!data) return null

      return {
        id: data.id,
        programmeId: data.programme_id,
        weekNumber: data.sort_order,
        dayNumber: data.weekday,
        dayName: data.name,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    },
    enabled: !!programmeId,
  })
}

export interface CreateProgrammeDayData {
  programmeId: string
  weekNumber: number
  dayNumber: number
  dayName?: string
  notes?: string
}

export function useCreateProgrammeDay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProgrammeDayData) => {
      // Get current user for user_id
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      const { data: newDay, error } = await supabase
        .from('programme_days')
        .insert({
          user_id: user.id,
          programme_id: data.programmeId,
          sort_order: data.weekNumber,
          weekday: data.dayNumber,
          name: data.dayName || '',
          notes: data.notes || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating programme day:', error)
        throw new Error('Failed to create programme day')
      }

      return {
        id: newDay.id,
        programmeId: newDay.programme_id,
        weekNumber: newDay.sort_order,
        dayNumber: newDay.weekday,
        dayName: newDay.name,
        notes: newDay.notes,
        createdAt: newDay.created_at,
        updatedAt: newDay.updated_at,
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programme-days', variables.programmeId] })
      queryClient.invalidateQueries({ queryKey: ['programme-day', variables.programmeId, variables.weekNumber, variables.dayNumber] })
    },
  })
}

export interface UpdateProgrammeDayData {
  dayId: string
  programmeId: string
  dayName?: string
  notes?: string
}

export function useUpdateProgrammeDay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProgrammeDayData) => {
      const updateData: Record<string, unknown> = {}
      if (data.dayName !== undefined) updateData.name = data.dayName
      if (data.notes !== undefined) updateData.notes = data.notes

      const { data: updated, error } = await supabase
        .from('programme_days')
        .update(updateData)
        .eq('id', data.dayId)
        .select()
        .single()

      if (error) {
        console.error('Error updating programme day:', error)
        throw new Error('Failed to update programme day')
      }

      return {
        id: updated.id,
        programmeId: updated.programme_id,
        weekNumber: updated.sort_order,
        dayNumber: updated.weekday,
        dayName: updated.name,
        notes: updated.notes,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programme-days', data.programmeId] })
      queryClient.invalidateQueries({ queryKey: ['programme-day', data.programmeId, data.weekNumber, data.dayNumber] })
    },
  })
}

// ==================== Workout Items ====================

export interface WorkoutItem {
  id: string
  programmeDayId: string
  exerciseId: string
  orderIndex: number
  sets: number
  reps: string
  targetWeightKg: number | null
  restSeconds: number
  rpeTarget: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  exercise?: {
    id: string
    name: string
    primaryMuscle: string
    equipment: string
  }
}

export function useWorkoutItems(programmeDayId: string) {
  return useQuery({
    queryKey: ['workout-items', programmeDayId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_items')
        .select(`
          *,
          exercises (
            id,
            name,
            primary_muscle,
            equipment
          )
        `)
        .eq('programme_day_id', programmeDayId)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching workout items:', error)
        return []
      }

      return (data || []).map(row => ({
        id: row.id,
        programmeDayId: row.programme_day_id,
        exerciseId: row.exercise_id,
        orderIndex: row.order_index,
        sets: row.sets,
        reps: row.reps,
        targetWeightKg: row.target_weight_kg,
        restSeconds: row.rest_seconds,
        rpeTarget: row.rpe_target,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        exercise: row.exercises ? {
          id: row.exercises.id,
          name: row.exercises.name,
          primaryMuscle: row.exercises.primary_muscle,
          equipment: row.exercises.equipment,
        } : undefined,
      }))
    },
    enabled: !!programmeDayId,
  })
}

export interface CreateWorkoutItemData {
  programmeDayId: string
  exerciseId: string
  sets: number
  reps: string
  targetWeightKg?: number
  restSeconds?: number
  rpeTarget?: number
  notes?: string
}

export function useCreateWorkoutItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkoutItemData) => {
      // Get the current max order_index
      const { data: existingItems } = await supabase
        .from('workout_items')
        .select('order_index')
        .eq('programme_day_id', data.programmeDayId)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrderIndex = existingItems && existingItems.length > 0
        ? (existingItems[0].order_index + 1)
        : 0

      const { data: newItem, error } = await supabase
        .from('workout_items')
        .insert({
          programme_day_id: data.programmeDayId,
          exercise_id: data.exerciseId,
          order_index: nextOrderIndex,
          sets: data.sets,
          reps: data.reps,
          target_weight_kg: data.targetWeightKg || null,
          rest_seconds: data.restSeconds || 90,
          rpe_target: data.rpeTarget || null,
          notes: data.notes || null,
        })
        .select(`
          *,
          exercises (
            id,
            name,
            primary_muscle,
            equipment
          )
        `)
        .single()

      if (error) {
        console.error('Error creating workout item:', error)
        throw new Error('Failed to create workout item')
      }

      return {
        id: newItem.id,
        programmeDayId: newItem.programme_day_id,
        exerciseId: newItem.exercise_id,
        orderIndex: newItem.order_index,
        sets: newItem.sets,
        reps: newItem.reps,
        targetWeightKg: newItem.target_weight_kg,
        restSeconds: newItem.rest_seconds,
        rpeTarget: newItem.rpe_target,
        notes: newItem.notes,
        createdAt: newItem.created_at,
        updatedAt: newItem.updated_at,
        exercise: newItem.exercises ? {
          id: newItem.exercises.id,
          name: newItem.exercises.name,
          primaryMuscle: newItem.exercises.primary_muscle,
          equipment: newItem.exercises.equipment,
        } : undefined,
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-items', variables.programmeDayId] })
    },
  })
}

export interface UpdateWorkoutItemData {
  itemId: string
  programmeDayId: string
  sets?: number
  reps?: string
  targetWeightKg?: number | null
  restSeconds?: number
  rpeTarget?: number | null
  notes?: string | null
  orderIndex?: number
}

export function useUpdateWorkoutItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateWorkoutItemData) => {
      const updateData: Record<string, unknown> = {}
      if (data.sets !== undefined) updateData.sets = data.sets
      if (data.reps !== undefined) updateData.reps = data.reps
      if (data.targetWeightKg !== undefined) updateData.target_weight_kg = data.targetWeightKg
      if (data.restSeconds !== undefined) updateData.rest_seconds = data.restSeconds
      if (data.rpeTarget !== undefined) updateData.rpe_target = data.rpeTarget
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex

      const { error } = await supabase
        .from('workout_items')
        .update(updateData)
        .eq('id', data.itemId)

      if (error) {
        console.error('Error updating workout item:', error)
        throw new Error('Failed to update workout item')
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-items', variables.programmeDayId] })
    },
  })
}

export function useDeleteWorkoutItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, programmeDayId }: { itemId: string; programmeDayId: string }) => {
      const { error } = await supabase
        .from('workout_items')
        .delete()
        .eq('id', itemId)

      if (error) {
        console.error('Error deleting workout item:', error)
        throw new Error('Failed to delete workout item')
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-items', variables.programmeDayId] })
    },
  })
}

// Reorder workout items
export function useReorderWorkoutItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ programmeDayId, items }: { programmeDayId: string; items: { id: string; orderIndex: number }[] }) => {
      // Update all items in a single transaction
      const updates = items.map(item =>
        supabase
          .from('workout_items')
          .update({ order_index: item.orderIndex })
          .eq('id', item.id)
      )

      await Promise.all(updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-items', variables.programmeDayId] })
    },
  })
}
