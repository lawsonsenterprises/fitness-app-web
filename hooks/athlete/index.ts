import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ============================================================================
// Blood Work Hooks
// ============================================================================

export function useBloodTests(athleteId?: string) {
  return useQuery({
    queryKey: ['blood-tests', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_panels')
        .select('*')
        .eq('user_id', athleteId!)
        .order('date', { ascending: false })

      // Return empty array on error (likely RLS or no data)
      if (error) {
        console.error('Error fetching blood tests:', error)
        return []
      }
      // Map to expected format
      return (data || []).map(panel => ({
        id: panel.id,
        test_date: panel.date,
        lab_name: panel.lab_name,
        notes: panel.notes,
      }))
    },
    enabled: !!athleteId,
  })
}

export function useBloodTest(testId: string) {
  return useQuery({
    queryKey: ['blood-test', testId],
    queryFn: async () => {
      // Query blood_panels (correct table) with its markers
      const { data, error } = await supabase
        .from('blood_panels')
        .select('*, blood_markers(*)')
        .eq('id', testId)
        .single()

      if (error) {
        console.error('Error fetching blood test:', error)
        return null
      }
      return data
    },
    enabled: !!testId,
  })
}

export function useBloodMarkerTrends(athleteId: string, markerCodes: string[]) {
  return useQuery({
    queryKey: ['blood-marker-trends', athleteId, markerCodes],
    queryFn: async () => {
      // Query blood_markers with correct column names
      const { data, error } = await supabase
        .from('blood_markers')
        .select('*, blood_panels!inner(date)')
        .in('code', markerCodes)
        .eq('blood_panels.user_id', athleteId)
        .order('blood_panels(date)', { ascending: true })

      if (error) {
        console.error('Error fetching blood marker trends:', error)
        return []
      }
      return data || []
    },
    enabled: !!athleteId && markerCodes.length > 0,
  })
}

export interface BloodMarkerInput {
  name: string
  code?: string
  value: number
  unit: string
  reference: { low: number; high: number }
  category?: string
}

export function useCreateBloodTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      athleteId: string
      date: string
      labName: string
      notes?: string
      markers: BloodMarkerInput[]
    }) => {
      // Create the blood panel first
      const { data: panel, error: panelError } = await supabase
        .from('blood_panels')
        .insert({
          user_id: data.athleteId,
          date: data.date,
          lab_name: data.labName,
          notes: data.notes,
        })
        .select('id')
        .single()

      if (panelError) throw panelError

      // Create the blood markers
      if (data.markers.length > 0) {
        const markersToInsert = data.markers.map(marker => ({
          blood_panel_id: panel.id,
          name: marker.name,
          code: marker.code || marker.name.toLowerCase().replace(/\s+/g, '_'),
          value: marker.value,
          unit: marker.unit,
          reference_low: marker.reference.low,
          reference_high: marker.reference.high,
          category: marker.category || 'General',
        }))

        const { error: markersError } = await supabase
          .from('blood_markers')
          .insert(markersToInsert)

        if (markersError) throw markersError
      }

      return { panelId: panel.id }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blood-tests', variables.athleteId] })
    },
  })
}

// ============================================================================
// Check-In Hooks
// ============================================================================

export function useCheckIns(athleteId?: string) {
  return useQuery({
    queryKey: ['check-ins', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', athleteId!)
        .is('deleted_at', null)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching check-ins:', error)
        return []
      }
      return data || []
    },
    enabled: !!athleteId,
  })
}

export function useCheckIn(checkInId: string) {
  return useQuery({
    queryKey: ['check-in', checkInId],
    queryFn: async () => {
      // check_in_photos table doesn't exist - photo data is in check_ins.photo_data
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('id', checkInId)
        .single()

      if (error) {
        console.error('Error fetching check-in:', error)
        return null
      }
      return data
    },
    enabled: !!checkInId,
  })
}

export function useSubmitCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (checkInData: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('check_ins')
        .insert(checkInData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-ins'] })
    },
  })
}

// ============================================================================
// Training Hooks
// ============================================================================

// Fetch a single programme assignment for the athlete (from coach)
export function useProgrammeAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ['athlete-programme-assignment', assignmentId],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Auth error:', authError)
        return null
      }

      const { data, error } = await supabase
        .from('programme_assignments')
        .select(`
          *,
          template:programme_templates (*)
        `)
        .eq('id', assignmentId)
        .eq('client_id', user.id) // Ensure athlete can only access their own assignments
        .single()

      if (error) {
        console.error('Error fetching programme assignment:', error)
        return null
      }

      // Transform to frontend format
      return {
        id: data.id,
        clientId: data.client_id,
        coachId: data.coach_id,
        templateId: data.template_id,
        name: data.name,
        content: data.content,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status ?? 'scheduled',
        currentWeek: data.current_week,
        currentDay: data.current_day,
        progressPercentage: data.progress_percentage,
        lastWorkoutAt: data.last_workout_at,
        coachNotes: data.coach_notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        template: data.template ? {
          id: data.template.id,
          coachId: data.template.coach_id,
          name: data.template.name,
          description: data.template.description,
          type: data.template.type,
          difficulty: data.template.difficulty,
          durationWeeks: data.template.duration_weeks,
          daysPerWeek: data.template.days_per_week,
          isTemplate: data.template.is_template ?? true,
          isPublic: data.template.is_public ?? false,
          tags: data.template.tags,
          content: data.template.content,
          createdAt: data.template.created_at,
          updatedAt: data.template.updated_at,
        } : undefined,
      }
    },
    enabled: !!assignmentId,
  })
}

// Fetch all programme assignments for the athlete
export function useProgrammeAssignments(athleteId?: string) {
  return useQuery({
    queryKey: ['athlete-programme-assignments', athleteId],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Auth error:', authError)
        return []
      }

      const { data, error } = await supabase
        .from('programme_assignments')
        .select(`
          *,
          template:programme_templates (*)
        `)
        .eq('client_id', athleteId || user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching programme assignments:', error)
        return []
      }

      return (data || []).map(row => ({
        id: row.id,
        clientId: row.client_id,
        coachId: row.coach_id,
        templateId: row.template_id,
        name: row.name,
        content: row.content,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status ?? 'scheduled',
        currentWeek: row.current_week,
        currentDay: row.current_day,
        progressPercentage: row.progress_percentage,
        lastWorkoutAt: row.last_workout_at,
        coachNotes: row.coach_notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        template: row.template ? {
          id: row.template.id,
          coachId: row.template.coach_id,
          name: row.template.name,
          description: row.template.description,
          type: row.template.type,
          difficulty: row.template.difficulty,
          durationWeeks: row.template.duration_weeks,
          daysPerWeek: row.template.days_per_week,
          isTemplate: row.template.is_template ?? true,
          isPublic: row.template.is_public ?? false,
          tags: row.template.tags,
          content: row.template.content,
          createdAt: row.template.created_at,
          updatedAt: row.template.updated_at,
        } : undefined,
      }))
    },
    enabled: !!athleteId,
  })
}

export function useCurrentProgramme(athleteId?: string) {
  return useQuery({
    queryKey: ['current-programme', athleteId],
    queryFn: async () => {
      // Query programmes table directly (client_programmes doesn't exist)
      const { data, error } = await supabase
        .from('programmes')
        .select('*')
        .eq('user_id', athleteId!)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        console.error('Error fetching current programme:', error)
        return null
      }

      // Map to expected format for backwards compatibility
      if (data) {
        return {
          id: data.id,
          client_id: data.user_id,
          current_week: data.current_week,
          status: data.is_active ? 'active' : 'inactive',
          programme_templates: {
            name: data.name,
            description: data.description,
            duration_weeks: data.duration_weeks,
          }
        }
      }
      return null
    },
    enabled: !!athleteId,
  })
}

export function useSessionHistory(athleteId?: string, limit = 20) {
  return useQuery({
    queryKey: ['session-history', athleteId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', athleteId!)
        .order('date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching session history:', error)
        return []
      }
      return data || []
    },
    enabled: !!athleteId,
  })
}

export function usePersonalRecords(athleteId?: string) {
  return useQuery({
    queryKey: ['personal-records', athleteId],
    queryFn: async () => {
      // Query personal_bests directly - exercise_library_items table doesn't exist
      // The iOS app stores exercise names in a different way
      const { data, error } = await supabase
        .from('personal_bests')
        .select('*')
        .eq('user_id', athleteId!)
        .or('is_soft_deleted.is.null,is_soft_deleted.eq.false')
        .order('achieved_at', { ascending: false })

      if (error) {
        console.error('Error fetching personal records:', error)
        return []
      }

      // Try to get exercise names from logged_sets if available
      const pbsWithSets = data?.filter(pb => pb.logged_set_id) || []
      let exerciseNames: Record<string, string> = {}

      if (pbsWithSets.length > 0) {
        const setIds = pbsWithSets.map(pb => pb.logged_set_id).filter(Boolean)
        const { data: sets } = await supabase
          .from('logged_sets')
          .select('id, exercises(name)')
          .in('id', setIds)

        if (sets) {
          sets.forEach((set: { id: string; exercises?: { name: string } | { name: string }[] | null }) => {
            const exercise = Array.isArray(set.exercises) ? set.exercises[0] : set.exercises
            if (exercise?.name) {
              exerciseNames[set.id] = exercise.name
            }
          })
        }
      }

      return (data || []).map((pb: { id: string; logged_set_id: string | null; pb_type: string | null; weight: number | null; reps: number | null; achieved_at: string | null }) => ({
        id: pb.id,
        exercise_name: pb.logged_set_id && exerciseNames[pb.logged_set_id]
          ? exerciseNames[pb.logged_set_id]
          : pb.pb_type || 'Personal Best',
        weight_kg: pb.weight,
        reps: pb.reps,
        achieved_at: pb.achieved_at,
      }))
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// Nutrition Hooks
// ============================================================================

export function useCurrentMealPlan(athleteId?: string) {
  return useQuery({
    queryKey: ['current-meal-plan', athleteId],
    queryFn: async () => {
      // Query meal_plans directly (client_meal_plans doesn't exist)
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', athleteId!)
        .is('deleted_at', null)
        .maybeSingle()

      if (error) {
        console.error('Error fetching current meal plan:', error)
        return null
      }

      // Map to expected format for backwards compatibility
      if (data) {
        return {
          id: data.id,
          client_id: data.user_id,
          status: 'active',
          meal_plans: {
            name: data.name || 'Meal Plan',
            description: data.description,
          }
        }
      }
      return null
    },
    enabled: !!athleteId,
  })
}

export function useDailyMacros(athleteId?: string, date?: string) {
  return useQuery({
    queryKey: ['daily-macros', athleteId, date],
    queryFn: async () => {
      // Query nutrition_daily_summaries (meal_logs doesn't exist)
      const { data, error } = await supabase
        .from('nutrition_daily_summaries')
        .select('*')
        .eq('user_id', athleteId!)
        .eq('date', date!)
        .maybeSingle()

      if (error) {
        console.error('Error fetching daily macros:', error)
        return { logs: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
      }

      const totals = {
        calories: data?.actual_calories || 0,
        protein: data?.actual_protein || 0,
        carbs: data?.actual_carbs || 0,
        fat: data?.actual_fat || 0,
      }

      return { logs: data ? [data] : [], totals }
    },
    enabled: !!athleteId && !!date,
  })
}

// Nutrition log hooks
export interface FoodItem {
  id: string
  name: string
  brand: string | null
  servingSize: number | null
  servingUnit: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  fibre: number | null
  isFavourite: boolean
  isRecent: boolean
}

export interface LoggedFood {
  id: string
  mealId: string
  mealType: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity: number
  servingUnit: string | null
  loggedAt: string
}

export function useFoodDatabase(athleteId?: string, searchQuery?: string) {
  return useQuery({
    queryKey: ['food-database', athleteId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('nutrition_food_items')
        .select('*')
        .eq('user_id', athleteId!)
        .order('use_count', { ascending: false, nullsFirst: false })
        .limit(50)

      if (searchQuery && searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching food database:', error)
        return []
      }

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        servingSize: item.serving_size,
        servingUnit: item.serving_unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbohydrates,
        fat: item.fat,
        fibre: item.fibre,
        isFavourite: item.is_favourite ?? false,
        isRecent: item.last_used ? new Date(item.last_used) > sevenDaysAgo : false,
      })) as FoodItem[]
    },
    enabled: !!athleteId,
  })
}

export function useDailyNutritionLog(athleteId?: string, date?: string) {
  return useQuery({
    queryKey: ['daily-nutrition-log', athleteId, date],
    queryFn: async () => {
      // First get the daily summary for this date
      const { data: summary, error: summaryError } = await supabase
        .from('nutrition_daily_summaries')
        .select('*')
        .eq('user_id', athleteId!)
        .eq('date', date!)
        .maybeSingle()

      if (summaryError) {
        console.error('Error fetching daily summary:', summaryError)
      }

      if (!summary) {
        return {
          summary: null,
          meals: [],
          targets: {
            calories: 2500,
            protein: 180,
            carbs: 280,
            fat: 80,
          },
        }
      }

      // Get meals for this summary
      const { data: meals, error: mealsError } = await supabase
        .from('nutrition_meals')
        .select(`
          *,
          entries:nutrition_food_entries(*)
        `)
        .eq('daily_summary_id', summary.id)
        .order('order_index', { ascending: true })

      if (mealsError) {
        console.error('Error fetching meals:', mealsError)
      }

      // Transform meals and entries
      const transformedMeals = (meals || []).map(meal => ({
        id: meal.id,
        mealType: meal.meal_type,
        name: meal.name,
        entries: (meal.entries || []).map((entry: {
          id: string
          name: string | null
          calories: number | null
          protein: number | null
          carbohydrates: number | null
          fat: number | null
          quantity: number | null
          serving_unit: string | null
          created_at: string | null
        }) => ({
          id: entry.id,
          mealId: meal.id,
          mealType: meal.meal_type,
          name: entry.name || 'Unknown Food',
          calories: entry.calories || 0,
          protein: entry.protein || 0,
          carbs: entry.carbohydrates || 0,
          fat: entry.fat || 0,
          quantity: entry.quantity || 1,
          servingUnit: entry.serving_unit,
          loggedAt: entry.created_at || new Date().toISOString(),
        })),
      }))

      return {
        summary: {
          id: summary.id,
          date: summary.date,
          actualCalories: summary.actual_calories || 0,
          actualProtein: summary.actual_protein || 0,
          actualCarbs: summary.actual_carbs || 0,
          actualFat: summary.actual_fat || 0,
        },
        meals: transformedMeals,
        targets: {
          calories: summary.target_calories || 2500,
          protein: summary.target_protein || 180,
          carbs: summary.target_carbs || 280,
          fat: summary.target_fat || 80,
        },
      }
    },
    enabled: !!athleteId && !!date,
  })
}

export function useAddFoodEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      athleteId: string
      date: string
      mealType: string
      foodItem: FoodItem
      quantity: number
    }) => {
      // First, ensure we have a daily summary for this date
      let { data: summary, error: summaryError } = await supabase
        .from('nutrition_daily_summaries')
        .select('id')
        .eq('user_id', data.athleteId)
        .eq('date', data.date)
        .maybeSingle()

      if (summaryError) throw summaryError

      // Create daily summary if it doesn't exist
      if (!summary) {
        const { data: newSummary, error: createError } = await supabase
          .from('nutrition_daily_summaries')
          .insert({
            user_id: data.athleteId,
            date: data.date,
            actual_calories: 0,
            actual_protein: 0,
            actual_carbs: 0,
            actual_fat: 0,
          })
          .select('id')
          .single()

        if (createError) throw createError
        summary = newSummary
      }

      // Find or create meal for this meal type
      let { data: meal, error: mealError } = await supabase
        .from('nutrition_meals')
        .select('id')
        .eq('daily_summary_id', summary.id)
        .eq('meal_type', data.mealType)
        .maybeSingle()

      if (mealError) throw mealError

      if (!meal) {
        const { data: newMeal, error: createMealError } = await supabase
          .from('nutrition_meals')
          .insert({
            user_id: data.athleteId,
            daily_summary_id: summary.id,
            meal_type: data.mealType,
            name: data.mealType.charAt(0).toUpperCase() + data.mealType.slice(1),
          })
          .select('id')
          .single()

        if (createMealError) throw createMealError
        meal = newMeal
      }

      // Add the food entry
      const calories = Math.round(data.foodItem.calories * data.quantity)
      const protein = Math.round(data.foodItem.protein * data.quantity)
      const carbs = Math.round(data.foodItem.carbs * data.quantity)
      const fat = Math.round(data.foodItem.fat * data.quantity)

      const { error: entryError } = await supabase
        .from('nutrition_food_entries')
        .insert({
          user_id: data.athleteId,
          meal_id: meal.id,
          nutrition_food_item_id: data.foodItem.id,
          name: data.foodItem.name,
          quantity: data.quantity,
          serving_unit: data.foodItem.servingUnit,
          calories,
          protein,
          carbohydrates: carbs,
          fat,
        })

      if (entryError) throw entryError

      // Update daily summary totals
      const { data: currentSummary } = await supabase
        .from('nutrition_daily_summaries')
        .select('actual_calories, actual_protein, actual_carbs, actual_fat')
        .eq('id', summary.id)
        .single()

      await supabase
        .from('nutrition_daily_summaries')
        .update({
          actual_calories: (currentSummary?.actual_calories || 0) + calories,
          actual_protein: (currentSummary?.actual_protein || 0) + protein,
          actual_carbs: (currentSummary?.actual_carbs || 0) + carbs,
          actual_fat: (currentSummary?.actual_fat || 0) + fat,
        })
        .eq('id', summary.id)

      // Update food item usage
      await supabase
        .from('nutrition_food_items')
        .update({
          last_used: new Date().toISOString(),
          use_count: (data.foodItem as { useCount?: number }).useCount ? ((data.foodItem as { useCount?: number }).useCount || 0) + 1 : 1,
        })
        .eq('id', data.foodItem.id)

      return { success: true }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-nutrition-log', variables.athleteId, variables.date] })
      queryClient.invalidateQueries({ queryKey: ['daily-macros', variables.athleteId, variables.date] })
      queryClient.invalidateQueries({ queryKey: ['food-database', variables.athleteId] })
    },
  })
}

export function useRemoveFoodEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      entryId: string
      athleteId: string
      date: string
      calories: number
      protein: number
      carbs: number
      fat: number
      summaryId: string
    }) => {
      // Delete the entry
      const { error: deleteError } = await supabase
        .from('nutrition_food_entries')
        .delete()
        .eq('id', data.entryId)

      if (deleteError) throw deleteError

      // Update daily summary totals
      const { data: currentSummary } = await supabase
        .from('nutrition_daily_summaries')
        .select('actual_calories, actual_protein, actual_carbs, actual_fat')
        .eq('id', data.summaryId)
        .single()

      await supabase
        .from('nutrition_daily_summaries')
        .update({
          actual_calories: Math.max(0, (currentSummary?.actual_calories || 0) - data.calories),
          actual_protein: Math.max(0, (currentSummary?.actual_protein || 0) - data.protein),
          actual_carbs: Math.max(0, (currentSummary?.actual_carbs || 0) - data.carbs),
          actual_fat: Math.max(0, (currentSummary?.actual_fat || 0) - data.fat),
        })
        .eq('id', data.summaryId)

      return { success: true }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-nutrition-log', variables.athleteId, variables.date] })
      queryClient.invalidateQueries({ queryKey: ['daily-macros', variables.athleteId, variables.date] })
    },
  })
}

// ============================================================================
// User Profile Hooks
// ============================================================================

export interface UserDietaryProfile {
  id: string
  targetWeightKg: number | null
  currentWeightKg: number | null
  targetCalories: number | null
  targetProtein: number | null
  targetCarbs: number | null
  targetFat: number | null
  primaryGoal: string | null
  activityLevel: string | null
  heightCm: number | null
  mealsPerDay: number | null
}

export function useUserDietaryProfile(athleteId?: string) {
  return useQuery({
    queryKey: ['user-dietary-profile', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_dietary_profiles')
        .select('*')
        .eq('user_id', athleteId!)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user dietary profile:', error)
        return null
      }

      if (!data) return null

      return {
        id: data.id,
        targetWeightKg: data.target_weight_kg,
        currentWeightKg: data.current_weight_kg,
        targetCalories: data.target_calories,
        targetProtein: data.target_protein,
        targetCarbs: data.target_carbs,
        targetFat: data.target_fat,
        primaryGoal: data.primary_goal,
        activityLevel: data.activity_level,
        heightCm: data.height_cm,
        mealsPerDay: data.meals_per_day,
      } as UserDietaryProfile
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// Progress Hooks
// ============================================================================

export function useWeightTrends(athleteId?: string, days = 90) {
  return useQuery({
    queryKey: ['weight-trends', athleteId, days],
    queryFn: async () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', athleteId!)
        .is('deleted_at', null)
        .gte('day', startDate.toISOString().split('T')[0])
        .order('day', { ascending: true })

      if (error) {
        console.error('Error fetching weight trends:', error)
        return []
      }
      return data || []
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// Recovery Hooks
// ============================================================================

export function useReadinessScore(athleteId?: string) {
  return useQuery({
    queryKey: ['readiness-score', athleteId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data: sleepData, error } = await supabase
        .from('sleep_records')
        .select('*')
        .eq('user_id', athleteId!)
        .gte('date', weekAgo)
        .lte('date', today)

      if (error) {
        console.error('Error fetching sleep data:', error)
        return { score: 0, breakdown: { sleep: 0, compliance: 75, strain: 70 } }
      }

      // Calculate composite score from sleep data
      const avgSleepMins = sleepData?.reduce((acc, log) => acc + (log.total_minutes || 0), 0) || 0
      const avgSleepHours = avgSleepMins / 60 / (sleepData?.length || 1)
      const avgSleepScore = sleepData?.reduce((acc, log) => acc + (log.sleep_score || 0), 0) || 0

      const sleepScore = avgSleepScore > 0
        ? avgSleepScore / (sleepData?.length || 1) * 0.5
        : Math.min((avgSleepHours / 8) * 100, 100) * 0.5
      const complianceScore = 75 * 0.25
      const strainScore = 70 * 0.25

      return {
        score: Math.round(sleepScore + complianceScore + strainScore),
        breakdown: {
          sleep: sleepScore / 0.5,
          compliance: complianceScore / 0.25,
          strain: strainScore / 0.25,
        },
      }
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// Coach Relationship Hooks
// ============================================================================

export interface CoachRelationship {
  id: string // coach_clients.id - used for messaging
  coachId: string
  coach: {
    id: string
    displayName: string | null
    avatarUrl: string | null
    email: string | null
  } | null
  status: string
  createdAt: string
}

export function useCoachRelationship(athleteId?: string) {
  return useQuery({
    queryKey: ['coach-relationship', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_clients')
        .select(`
          id,
          coach_id,
          status,
          created_at,
          coach:profiles!coach_clients_coach_id_fkey(
            id,
            display_name,
            avatar_url,
            email
          )
        `)
        .eq('client_id', athleteId!)
        .eq('status', 'active')
        .maybeSingle()

      if (error) {
        console.error('Error fetching coach relationship:', error)
        return null
      }

      if (!data) return null

      // Handle coach data - could be array or single object from Supabase
      const coachData = Array.isArray(data.coach) ? data.coach[0] : data.coach

      return {
        id: data.id,
        coachId: data.coach_id,
        coach: coachData ? {
          id: coachData.id,
          displayName: coachData.display_name,
          avatarUrl: coachData.avatar_url,
          email: coachData.email,
        } : null,
        status: data.status,
        createdAt: data.created_at,
      } as CoachRelationship
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// Dashboard Data Hook
// ============================================================================

export function useAthleteDashboard(athleteId?: string) {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return useQuery({
    queryKey: ['athlete-dashboard', athleteId],
    queryFn: async () => {
      // Fetch all dashboard data in parallel with correct table/column names
      const [
        recentSessions,
        todayNutrition,
        recentCheckIns,
        weightLogs,
        sleepRecords,
        personalBests,
      ] = await Promise.all([
        // Recent training sessions (last 7 days)
        supabase
          .from('training_sessions')
          .select('*')
          .eq('user_id', athleteId!)
          .gte('date', weekAgo)
          .order('date', { ascending: false }),
        // Today's nutrition summary
        supabase
          .from('nutrition_daily_summaries')
          .select('*')
          .eq('user_id', athleteId!)
          .eq('date', today)
          .maybeSingle(),
        // Recent check-ins
        supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', athleteId!)
          .is('deleted_at', null)
          .order('date', { ascending: false })
          .limit(5),
        // Weight logs (last 30 days)
        supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', athleteId!)
          .is('deleted_at', null)
          .gte('day', monthAgo)
          .order('day', { ascending: false }),
        // Sleep records (last 7 days)
        supabase
          .from('sleep_records')
          .select('*')
          .eq('user_id', athleteId!)
          .gte('date', weekAgo)
          .order('date', { ascending: false }),
        // Personal bests - exercise_library_items table doesn't exist
        supabase
          .from('personal_bests')
          .select('*')
          .eq('user_id', athleteId!)
          .or('is_soft_deleted.is.null,is_soft_deleted.eq.false')
          .order('achieved_at', { ascending: false })
          .limit(3),
      ])

      // Check for errors
      if (recentSessions.error) console.error('Error fetching sessions:', recentSessions.error)
      if (todayNutrition.error) console.error('Error fetching nutrition:', todayNutrition.error)
      if (recentCheckIns.error) console.error('Error fetching check-ins:', recentCheckIns.error)
      if (weightLogs.error) console.error('Error fetching weight logs:', weightLogs.error)
      if (sleepRecords.error) console.error('Error fetching sleep records:', sleepRecords.error)
      if (personalBests.error) console.error('Error fetching personal bests:', personalBests.error)

      // Calculate weekly stats
      const workoutsThisWeek = recentSessions.data?.length || 0

      // Calculate avg sleep from sleep_records (total_minutes / 60)
      const avgSleepHours = sleepRecords.data?.length
        ? sleepRecords.data.reduce((sum, s) => sum + ((s.total_minutes || 0) / 60), 0) / sleepRecords.data.length
        : 0

      // Get today's macros from nutrition_daily_summaries
      const todayMacros = todayNutrition.data ? {
        calories: todayNutrition.data.actual_calories || 0,
        protein: todayNutrition.data.actual_protein || 0,
        carbs: todayNutrition.data.actual_carbs || 0,
        fat: todayNutrition.data.actual_fat || 0,
        targetCalories: todayNutrition.data.target_calories || 0,
        targetProtein: todayNutrition.data.target_protein || 0,
      } : { calories: 0, protein: 0, carbs: 0, fat: 0, targetCalories: 0, targetProtein: 0 }

      // Get latest and oldest weight for progress (round to 1 decimal place)
      const latestWeightRaw = weightLogs.data?.[0]?.value_kg
      const oldestWeightRaw = weightLogs.data?.length ? weightLogs.data[weightLogs.data.length - 1]?.value_kg : null
      const latestWeight = latestWeightRaw ? Math.round(latestWeightRaw * 10) / 10 : null
      const oldestWeight = oldestWeightRaw ? Math.round(oldestWeightRaw * 10) / 10 : null
      const weightChange = latestWeight && oldestWeight ? Math.round((latestWeight - oldestWeight) * 10) / 10 : null

      // Get most recent check-in
      const lastCheckIn = recentCheckIns.data?.[0]

      // Calculate readiness score from sleep_score or sleep hours
      const latestSleepScore = sleepRecords.data?.[0]?.sleep_score
      const latestSleepHours = (sleepRecords.data?.[0]?.total_minutes || 0) / 60
      const readinessScore = Math.round(latestSleepScore || Math.min((latestSleepHours / 8) * 100, 100))

      return {
        readinessScore,
        weeklyStats: {
          workoutsCompleted: workoutsThisWeek,
          workoutsPlanned: 0,
          averageSleep: Math.round(avgSleepHours * 10) / 10,
        },
        todayMacros,
        lastCheckIn: lastCheckIn ? {
          id: lastCheckIn.id,
          date: lastCheckIn.date,
          status: lastCheckIn.was_sent_to_coach ? 'submitted' : 'pending',
          weight: lastCheckIn.weight,
          sleepHours: lastCheckIn.sleep_hours,
        } : null,
        progressHighlights: {
          latestWeight,
          weightChange,
          personalBests: (personalBests.data || []).map((pb: { id: string; pb_type: string | null; weight: number | null; reps: number | null; achieved_at: string | null }) => ({
            id: pb.id,
            exerciseName: pb.pb_type || 'Personal Best',
            weight: pb.weight,
            reps: pb.reps,
            achievedAt: pb.achieved_at,
          })),
        },
        hasData: {
          sessions: (recentSessions.data?.length || 0) > 0,
          nutrition: !!todayNutrition.data,
          checkIns: (recentCheckIns.data?.length || 0) > 0,
          weight: (weightLogs.data?.length || 0) > 0,
          sleep: (sleepRecords.data?.length || 0) > 0,
        },
      }
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// Weekly Schedule Hook
// ============================================================================

export function useWeeklySchedule(athleteId?: string) {
  return useQuery({
    queryKey: ['weekly-schedule', athleteId],
    queryFn: async () => {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday

      const startDate = startOfWeek.toISOString().split('T')[0]
      const endDate = endOfWeek.toISOString().split('T')[0]

      // Get sessions for this week
      const { data: sessions, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', athleteId!)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching weekly schedule:', error)
        return []
      }

      // Build weekly schedule
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const todayIndex = (today.getDay() + 6) % 7 // Convert to Monday = 0

      return days.map((day, index) => {
        const dayDate = new Date(startOfWeek)
        dayDate.setDate(startOfWeek.getDate() + index)
        const dateStr = dayDate.toISOString().split('T')[0]

        const session = sessions?.find(s => s.date === dateStr)

        let status: 'completed' | 'current' | 'upcoming' | 'rest' = 'rest'
        if (session) {
          if (session.status === 'completed') {
            status = 'completed'
          } else if (index === todayIndex) {
            status = 'current'
          } else if (index > todayIndex) {
            status = 'upcoming'
          } else {
            status = 'completed'
          }
        } else if (index === todayIndex) {
          status = 'rest'
        }

        const durationMins = session?.duration_seconds ? Math.round(session.duration_seconds / 60) : null

        return {
          day,
          date: dateStr,
          name: session?.notes || 'Rest',
          status,
          duration: durationMins ? `${durationMins} min` : '-',
          session,
        }
      })
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// HealthKit Data Hooks (Re-exported)
// ============================================================================

export {
  useTodaysReadiness,
  useSleepData,
  useRecoveryData,
  useHealthKitWorkouts,
  useHealthKitWeightTrends,
  useStrainRecovery,
  useWeeklyActivity,
} from './use-healthkit'

// ============================================================================
// Exercise Library Hooks
// ============================================================================

// Note: Exercise library functionality is coming soon.
// The database currently stores exercises within training programmes (training_day_id)
// but doesn't have a global exercise library table yet.

export interface ExerciseLibraryItem {
  id: string
  name: string
  muscleGroup: string
  secondaryMuscles: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'compound' | 'isolation'
  description: string
  instructions: string[]
  tips: string[]
  videoUrl?: string
  imageUrl?: string
  isFavourite?: boolean
}

export function useExerciseLibrary(_athleteId?: string) {
  // Exercise library is coming soon - return empty array for now
  // When a global exercise library table is added, this will query it
  return useQuery({
    queryKey: ['exercise-library'],
    queryFn: async () => {
      // Return empty array - exercise library feature is coming soon
      return [] as ExerciseLibraryItem[]
    },
  })
}

export function useToggleExerciseFavourite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_data: {
      athleteId: string
      exerciseId: string
      isFavourite: boolean
    }) => {
      // Exercise favourites feature is coming soon
      // When implemented, this will update the user's exercise favourites
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-library'] })
    },
  })
}
