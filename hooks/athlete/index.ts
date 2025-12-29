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
        .eq('athlete_id', athleteId!)
        .order('created_at', { ascending: false })

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
        .eq('athlete_id', athleteId!)
        .order('session_date', { ascending: false })
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
        .from('personal_records')
        .select('*')
        .eq('athlete_id', athleteId!)
        .order('achieved_at', { ascending: false })

      if (error) throw error
      return data
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
        .eq('athlete_id', athleteId!)
        .gte('logged_date', startDate.toISOString().split('T')[0])
        .order('logged_date', { ascending: true })

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

      const [sleepData, hrvData] = await Promise.all([
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('athlete_id', athleteId!)
          .gte('logged_date', weekAgo)
          .lte('logged_date', today),
        supabase
          .from('hrv_logs')
          .select('*')
          .eq('athlete_id', athleteId!)
          .gte('logged_date', weekAgo)
          .lte('logged_date', today),
      ])

      // Calculate composite score (simplified)
      const avgSleep = sleepData.data?.reduce((acc, log) => acc + (log.hours || 0), 0) || 0
      const avgHrv = hrvData.data?.reduce((acc, log) => acc + (log.hrv || 0), 0) || 0

      const sleepScore = Math.min((avgSleep / 7 / 8) * 100, 100) * 0.3
      const hrvScore = Math.min((avgHrv / 7 / 60) * 100, 100) * 0.3
      const complianceScore = 75 * 0.2 // Mock
      const strainScore = 70 * 0.2 // Mock

      return {
        score: Math.round(sleepScore + hrvScore + complianceScore + strainScore),
        breakdown: {
          sleep: sleepScore / 0.3,
          hrv: hrvScore / 0.3,
          compliance: complianceScore / 0.2,
          strain: strainScore / 0.2,
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
      // Fetch all dashboard data in parallel
      const [
        currentProgramme,
        recentSessions,
        todayMeals,
        weekMeals,
        recentCheckIns,
        weightLogs,
        sleepLogs,
        personalRecords,
      ] = await Promise.all([
        // Current active programme
        supabase
          .from('client_programmes')
          .select('*, programme_templates(*)')
          .eq('client_id', athleteId!)
          .eq('status', 'active')
          .maybeSingle(),
        // Recent training sessions (last 7 days)
        supabase
          .from('training_sessions')
          .select('*')
          .eq('athlete_id', athleteId!)
          .gte('session_date', weekAgo)
          .order('session_date', { ascending: false }),
        // Today's meals
        supabase
          .from('meal_logs')
          .select('*')
          .eq('athlete_id', athleteId!)
          .eq('logged_date', today),
        // This week's meals (for calorie total)
        supabase
          .from('meal_logs')
          .select('*')
          .eq('athlete_id', athleteId!)
          .gte('logged_date', weekAgo),
        // Recent check-ins
        supabase
          .from('check_ins')
          .select('*')
          .eq('athlete_id', athleteId!)
          .order('created_at', { ascending: false })
          .limit(5),
        // Weight logs (last 30 days)
        supabase
          .from('weight_logs')
          .select('*')
          .eq('athlete_id', athleteId!)
          .gte('logged_date', monthAgo)
          .order('logged_date', { ascending: false }),
        // Sleep logs (last 7 days)
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('athlete_id', athleteId!)
          .gte('logged_date', weekAgo)
          .order('logged_date', { ascending: false }),
        // Personal records
        supabase
          .from('personal_records')
          .select('*')
          .eq('athlete_id', athleteId!)
          .order('achieved_at', { ascending: false })
          .limit(3),
      ])

      // Calculate weekly stats
      const workoutsThisWeek = recentSessions.data?.length || 0
      const totalCaloriesBurned = recentSessions.data?.reduce((sum, s) => sum + (s.calories_burned || 0), 0) || 0
      const avgSleep = sleepLogs.data?.length
        ? sleepLogs.data.reduce((sum, s) => sum + (s.hours || 0), 0) / sleepLogs.data.length
        : 0

      // Calculate today's macros
      const todayMacros = todayMeals.data?.reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          protein: acc.protein + (meal.protein || 0),
          carbs: acc.carbs + (meal.carbs || 0),
          fat: acc.fat + (meal.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ) || { calories: 0, protein: 0, carbs: 0, fat: 0 }

      // Get latest and oldest weight for progress
      const latestWeight = weightLogs.data?.[0]?.weight_kg
      const oldestWeight = weightLogs.data?.[weightLogs.data.length - 1]?.weight_kg
      const weightChange = latestWeight && oldestWeight ? latestWeight - oldestWeight : null

      // Get most recent check-in
      const lastCheckIn = recentCheckIns.data?.[0]

      // Calculate readiness score (simplified)
      const latestSleep = sleepLogs.data?.[0]?.hours || 0
      const readinessScore = Math.min(Math.round((latestSleep / 8) * 100), 100)

      return {
        readinessScore,
        currentProgramme: currentProgramme.data,
        weeklyStats: {
          workoutsCompleted: workoutsThisWeek,
          workoutsPlanned: currentProgramme.data?.programme_templates?.sessions_per_week || 0,
          caloriesBurned: totalCaloriesBurned,
          averageSleep: Math.round(avgSleep * 10) / 10,
        },
        todayMacros,
        lastCheckIn: lastCheckIn ? {
          id: lastCheckIn.id,
          date: lastCheckIn.created_at,
          status: lastCheckIn.status,
          coachFeedback: lastCheckIn.coach_feedback,
        } : null,
        progressHighlights: {
          latestWeight,
          weightChange,
          personalRecords: personalRecords.data || [],
        },
        hasData: {
          programme: !!currentProgramme.data,
          sessions: (recentSessions.data?.length || 0) > 0,
          meals: (todayMeals.data?.length || 0) > 0,
          checkIns: (recentCheckIns.data?.length || 0) > 0,
          weight: (weightLogs.data?.length || 0) > 0,
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
        .eq('athlete_id', athleteId!)
        .gte('session_date', startDate)
        .lte('session_date', endDate)
        .order('session_date', { ascending: true })

      if (error) throw error

      // Build weekly schedule
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const todayIndex = (today.getDay() + 6) % 7 // Convert to Monday = 0

      return days.map((day, index) => {
        const dayDate = new Date(startOfWeek)
        dayDate.setDate(startOfWeek.getDate() + index)
        const dateStr = dayDate.toISOString().split('T')[0]

        const session = sessions?.find(s => s.session_date === dateStr)

        let status: 'completed' | 'current' | 'upcoming' | 'rest' = 'rest'
        if (session) {
          if (session.completed) {
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

        return {
          day,
          date: dateStr,
          name: session?.name || 'Rest',
          status,
          duration: session?.duration_minutes ? `${session.duration_minutes} min` : '-',
          session,
        }
      })
    },
    enabled: !!athleteId,
  })
}
