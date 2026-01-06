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
        .select('*')
        .eq('programme_day_id', programmeDayId)
        .or('is_soft_deleted.is.null,is_soft_deleted.eq.false')
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching workout items:', error)
        return []
      }

      // Fetch exercises separately for all items
      const exerciseIds = (data || [])
        .map(item => item.exercise_library_item_id)
        .filter((id): id is string => id !== null)

      let exercisesMap = new Map()
      if (exerciseIds.length > 0) {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id, name, primary_muscle, equipment')
          .in('id', exerciseIds)

        if (exercises) {
          exercises.forEach(ex => {
            exercisesMap.set(ex.id, {
              id: ex.id,
              name: ex.name,
              primaryMuscle: ex.primary_muscle,
              equipment: ex.equipment,
            })
          })
        }
      }

      return (data || []).map(row => {
        // Convert reps back to string format
        let reps = ''
        if (row.target_reps_lower !== null && row.target_reps_upper !== null) {
          reps = row.target_reps_lower === row.target_reps_upper
            ? row.target_reps_lower.toString()
            : `${row.target_reps_lower}-${row.target_reps_upper}`
        }

        // Convert RPE to single value (use upper for display)
        const rpeTarget = row.target_rpe_upper

        return {
          id: row.id,
          programmeDayId: row.programme_day_id,
          exerciseId: row.exercise_library_item_id,
          orderIndex: row.sort_order,
          sets: row.target_sets || 0,
          reps,
          targetWeightKg: null, // Not stored in this schema
          restSeconds: row.target_rest_seconds || 0,
          rpeTarget,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          exercise: row.exercise_library_item_id ? exercisesMap.get(row.exercise_library_item_id) : undefined,
        }
      })
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
      // Get current user for user_id
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      // Get the current max sort_order
      const { data: existingItems } = await supabase
        .from('workout_items')
        .select('sort_order')
        .eq('programme_day_id', data.programmeDayId)
        .order('sort_order', { ascending: false })
        .limit(1)

      const nextSortOrder = existingItems && existingItems.length > 0
        ? (existingItems[0].sort_order + 1)
        : 0

      // Parse reps string into lower/upper bounds
      let repsLower = null
      let repsUpper = null
      if (data.reps) {
        const repsMatch = data.reps.match(/^(\d+)-(\d+)$/)
        if (repsMatch) {
          repsLower = parseInt(repsMatch[1])
          repsUpper = parseInt(repsMatch[2])
        } else if (/^\d+$/.test(data.reps)) {
          const repsNum = parseInt(data.reps)
          repsLower = repsNum
          repsUpper = repsNum
        }
      }

      // Parse RPE into lower/upper bounds
      let rpeLower = null
      let rpeUpper = null
      if (data.rpeTarget) {
        rpeLower = data.rpeTarget
        rpeUpper = data.rpeTarget
      }

      const { data: newItem, error } = await supabase
        .from('workout_items')
        .insert({
          user_id: user.id,
          programme_day_id: data.programmeDayId,
          exercise_library_item_id: data.exerciseId,
          sort_order: nextSortOrder,
          target_sets: data.sets,
          target_reps_lower: repsLower,
          target_reps_upper: repsUpper,
          target_rest_seconds: data.restSeconds || 90,
          target_rpe_lower: rpeLower,
          target_rpe_upper: rpeUpper,
          notes: data.notes || null,
        })
        .select('*')
        .single()

      if (error) {
        console.error('Error creating workout item:', error)
        throw new Error('Failed to create workout item')
      }

      // Fetch the exercise details separately
      let exerciseData = undefined
      if (newItem.exercise_library_item_id) {
        const { data: exercise } = await supabase
          .from('exercises')
          .select('id, name, primary_muscle, equipment')
          .eq('id', newItem.exercise_library_item_id)
          .single()

        if (exercise) {
          exerciseData = {
            id: exercise.id,
            name: exercise.name,
            primaryMuscle: exercise.primary_muscle,
            equipment: exercise.equipment,
          }
        }
      }

      // Convert back to frontend format
      let reps = ''
      if (newItem.target_reps_lower !== null && newItem.target_reps_upper !== null) {
        reps = newItem.target_reps_lower === newItem.target_reps_upper
          ? newItem.target_reps_lower.toString()
          : `${newItem.target_reps_lower}-${newItem.target_reps_upper}`
      }

      return {
        id: newItem.id,
        programmeDayId: newItem.programme_day_id,
        exerciseId: newItem.exercise_library_item_id,
        orderIndex: newItem.sort_order,
        sets: newItem.target_sets || 0,
        reps,
        targetWeightKg: null,
        restSeconds: newItem.target_rest_seconds || 0,
        rpeTarget: newItem.target_rpe_upper,
        notes: newItem.notes,
        createdAt: newItem.created_at,
        updatedAt: newItem.updated_at,
        exercise: exerciseData,
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

      if (data.sets !== undefined) updateData.target_sets = data.sets

      if (data.reps !== undefined) {
        // Parse reps string into lower/upper bounds
        const repsMatch = data.reps.match(/^(\d+)-(\d+)$/)
        if (repsMatch) {
          updateData.target_reps_lower = parseInt(repsMatch[1])
          updateData.target_reps_upper = parseInt(repsMatch[2])
        } else if (/^\d+$/.test(data.reps)) {
          const repsNum = parseInt(data.reps)
          updateData.target_reps_lower = repsNum
          updateData.target_reps_upper = repsNum
        } else {
          updateData.target_reps_lower = null
          updateData.target_reps_upper = null
        }
      }

      if (data.restSeconds !== undefined) updateData.target_rest_seconds = data.restSeconds

      if (data.rpeTarget !== undefined) {
        updateData.target_rpe_lower = data.rpeTarget
        updateData.target_rpe_upper = data.rpeTarget
      }

      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.orderIndex !== undefined) updateData.sort_order = data.orderIndex

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
          .update({ sort_order: item.orderIndex })
          .eq('id', item.id)
      )

      await Promise.all(updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-items', variables.programmeDayId] })
    },
  })
}
