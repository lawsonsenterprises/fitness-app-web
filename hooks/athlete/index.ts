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
        .from('blood_tests')
        .select('*')
        .eq('athlete_id', athleteId!)
        .order('test_date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!athleteId,
  })
}

export function useBloodTest(testId: string) {
  return useQuery({
    queryKey: ['blood-test', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_tests')
        .select('*, blood_test_markers(*)')
        .eq('id', testId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!testId,
  })
}

export function useBloodMarkerTrends(athleteId: string, markerIds: string[]) {
  return useQuery({
    queryKey: ['blood-marker-trends', athleteId, markerIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_test_markers')
        .select('*, blood_tests!inner(test_date)')
        .in('marker_id', markerIds)
        .eq('blood_tests.athlete_id', athleteId)
        .order('blood_tests.test_date', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!athleteId && markerIds.length > 0,
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

      if (error) throw error
      return data
    },
    enabled: !!athleteId,
  })
}

export function useCheckIn(checkInId: string) {
  return useQuery({
    queryKey: ['check-in', checkInId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*, check_in_photos(*)')
        .eq('id', checkInId)
        .single()

      if (error) throw error
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
      const { data, error } = await supabase
        .from('client_programmes')
        .select('*, programme_templates(*)')
        .eq('client_id', athleteId!)
        .eq('status', 'active')
        .single()

      if (error) throw error
      return data
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

      if (error) throw error
      return data
    },
    enabled: !!athleteId,
  })
}

export function usePersonalRecords(athleteId?: string) {
  return useQuery({
    queryKey: ['personal-records', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_bests')
        .select('*, exercises(name)')
        .eq('user_id', athleteId!)
        .is('is_soft_deleted', false)
        .order('achieved_at', { ascending: false })

      if (error) throw error
      return (data || []).map(pb => ({
        id: pb.id,
        exercise_name: pb.exercises?.name || 'Unknown Exercise',
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
      const { data, error } = await supabase
        .from('client_meal_plans')
        .select('*, meal_plans(*)')
        .eq('client_id', athleteId!)
        .eq('status', 'active')
        .single()

      if (error) throw error
      return data
    },
    enabled: !!athleteId,
  })
}

export function useDailyMacros(athleteId?: string, date?: string) {
  return useQuery({
    queryKey: ['daily-macros', athleteId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('athlete_id', athleteId!)
        .eq('logged_date', date!)

      if (error) throw error

      // Aggregate macros
      const totals = data.reduce(
        (acc, log) => ({
          calories: acc.calories + (log.calories || 0),
          protein: acc.protein + (log.protein || 0),
          carbs: acc.carbs + (log.carbs || 0),
          fat: acc.fat + (log.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )

      return { logs: data, totals }
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

      if (error) throw error
      return data
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
      // Fetch recent data to calculate readiness
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [sleepData] = await Promise.all([
        supabase
          .from('sleep_records')
          .select('*')
          .eq('user_id', athleteId!)
          .gte('date', weekAgo)
          .lte('date', today),
      ])

      // Calculate composite score from sleep data (simplified)
      const avgSleepMins = sleepData.data?.reduce((acc, log) => acc + (log.total_minutes || 0), 0) || 0
      const avgSleepHours = avgSleepMins / 60 / (sleepData.data?.length || 1)
      const avgSleepScore = sleepData.data?.reduce((acc, log) => acc + (log.sleep_score || 0), 0) || 0

      // Use sleep_score if available, otherwise derive from hours
      const sleepScore = avgSleepScore > 0
        ? avgSleepScore / (sleepData.data?.length || 1) * 0.5
        : Math.min((avgSleepHours / 8) * 100, 100) * 0.5
      const complianceScore = 75 * 0.25 // Placeholder
      const strainScore = 70 * 0.25 // Placeholder

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
// Messages Hooks
// ============================================================================

export function useCoachMessages(athleteId?: string) {
  return useQuery({
    queryKey: ['coach-messages', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*)')
        .or(`sender_id.eq.${athleteId},recipient_id.eq.${athleteId}`)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!athleteId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageData: { recipientId: string; content: string; senderId: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: messageData.senderId,
          recipient_id: messageData.recipientId,
          content: messageData.content,
        })
        .select()
        .single()

      if (error) throw error
      return data
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
      // Fetch all dashboard data in parallel using correct table/column names
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
        // Personal bests
        supabase
          .from('personal_bests')
          .select('*, exercises(name)')
          .eq('user_id', athleteId!)
          .is('is_soft_deleted', false)
          .order('achieved_at', { ascending: false })
          .limit(3),
      ])

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

      // Get latest and oldest weight for progress
      const latestWeight = weightLogs.data?.[0]?.value_kg
      const oldestWeight = weightLogs.data?.length ? weightLogs.data[weightLogs.data.length - 1]?.value_kg : null
      const weightChange = latestWeight && oldestWeight ? latestWeight - oldestWeight : null

      // Get most recent check-in
      const lastCheckIn = recentCheckIns.data?.[0]

      // Calculate readiness score from sleep_score or sleep hours
      const latestSleepScore = sleepRecords.data?.[0]?.sleep_score
      const latestSleepHours = (sleepRecords.data?.[0]?.total_minutes || 0) / 60
      const readinessScore = latestSleepScore || Math.min(Math.round((latestSleepHours / 8) * 100), 100)

      return {
        readinessScore,
        weeklyStats: {
          workoutsCompleted: workoutsThisWeek,
          workoutsPlanned: 0, // Would need programme data
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
            exerciseName: pb.exercises?.name || 'Unknown Exercise',
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

      // Get sessions for this week using correct column names
      const { data: sessions, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', athleteId!)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) throw error

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
            status = 'completed' // Past days without completion marked as completed
          }
        } else if (index === todayIndex) {
          status = 'rest'
        }

        // Calculate duration from duration_seconds
        const durationMins = session?.duration_seconds ? Math.round(session.duration_seconds / 60) : null

        return {
          day,
          date: dateStr,
          name: session?.notes || 'Rest', // training_sessions doesn't have a name field, using notes
          status,
          duration: durationMins ? `${durationMins} min` : '-',
          session,
        }
      })
    },
    enabled: !!athleteId,
  })
}
