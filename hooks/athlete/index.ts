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
