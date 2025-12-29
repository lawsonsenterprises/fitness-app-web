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
      // personal_bests has exercise_library_item_id, not a direct FK to exercises
      // Query without the join for now
      const { data, error } = await supabase
        .from('personal_bests')
        .select('*')
        .eq('user_id', athleteId!)
        .is('is_soft_deleted', false)
        .order('achieved_at', { ascending: false })

      if (error) {
        console.error('Error fetching personal records:', error)
        return []
      }
      return (data || []).map(pb => ({
        id: pb.id,
        exercise_name: pb.exercise_name || 'Unknown Exercise',
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
// Messages Hooks (disabled until messages table exists)
// ============================================================================

export function useCoachMessages(athleteId?: string) {
  return useQuery({
    queryKey: ['coach-messages', athleteId],
    queryFn: async () => {
      // messages table doesn't exist - return empty array
      console.warn('Messages table not implemented')
      return []
    },
    enabled: !!athleteId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_messageData: { recipientId: string; content: string; senderId: string }) => {
      // messages table doesn't exist
      console.warn('Messages table not implemented')
      throw new Error('Messages feature not available')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-messages'] })
    },
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
        // Personal bests (no FK join - exercise_name is on the table)
        supabase
          .from('personal_bests')
          .select('*')
          .eq('user_id', athleteId!)
          .is('is_soft_deleted', false)
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
          personalBests: (personalBests.data || []).map(pb => ({
            id: pb.id,
            exerciseName: pb.exercise_name || 'Unknown Exercise',
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
