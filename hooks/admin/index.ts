import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ============================================================================
// Platform Stats Hooks
// ============================================================================

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [coaches, athletes, subscriptions] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, created_at, last_sign_in_at', { count: 'exact' })
          .contains('roles', ['coach']),
        supabase
          .from('profiles')
          .select('id, created_at, last_sign_in_at', { count: 'exact' })
          .contains('roles', ['athlete']),
        supabase
          .from('subscriptions')
          .select('*', { count: 'exact' })
          .eq('status', 'active'),
      ])

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      return {
        totalCoaches: coaches.count || 0,
        activeCoaches: coaches.data?.filter(c =>
          c.last_sign_in_at && new Date(c.last_sign_in_at) > sevenDaysAgo
        ).length || 0,
        totalAthletes: athletes.count || 0,
        activeAthletes: athletes.data?.filter(a =>
          a.last_sign_in_at && new Date(a.last_sign_in_at) > sevenDaysAgo
        ).length || 0,
        activeSubscriptions: subscriptions.count || 0,
        mrr: (subscriptions.data || []).reduce((sum, sub) => sum + (sub.amount || 0), 0),
      }
    },
  })
}

// ============================================================================
// Coaches Management Hooks
// ============================================================================

export function useAllCoaches(options?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { status, search, page = 1, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['all-coaches', status, search, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, subscriptions(*)', { count: 'exact' })
        .contains('roles', ['coach'])
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { coaches: data, total: count }
    },
  })
}

export function useCoachDetail(coachId: string) {
  return useQuery({
    queryKey: ['coach-detail', coachId],
    queryFn: async () => {
      const [profile, clients, subscription] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', coachId)
          .single(),
        supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('coach_id', coachId),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', coachId)
          .eq('status', 'active')
          .single(),
      ])

      if (profile.error) throw profile.error

      return {
        ...profile.data,
        clients: clients.data || [],
        clientCount: clients.count || 0,
        subscription: subscription.data,
      }
    },
    enabled: !!coachId,
  })
}

export function useSuspendCoach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ coachId, reason }: { coachId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', suspension_reason: reason })
        .eq('id', coachId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-coaches'] })
      queryClient.invalidateQueries({ queryKey: ['coach-detail'] })
    },
  })
}

export function useActivateCoach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (coachId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active', suspension_reason: null })
        .eq('id', coachId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-coaches'] })
      queryClient.invalidateQueries({ queryKey: ['coach-detail'] })
    },
  })
}

// ============================================================================
// Athletes Management Hooks
// ============================================================================

export function useAllAthletes(options?: {
  coachId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { coachId, status, search, page = 1, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['all-athletes', coachId, status, search, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, clients!inner(coach_id, status)', { count: 'exact' })
        .contains('roles', ['athlete'])
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (coachId) {
        query = query.eq('clients.coach_id', coachId)
      }

      if (status) {
        query = query.eq('clients.status', status)
      }

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { athletes: data, total: count }
    },
  })
}

export function useAthleteDetail(athleteId: string) {
  return useQuery({
    queryKey: ['athlete-detail', athleteId],
    queryFn: async () => {
      const [profile, clientData, checkIns, weightLogs] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', athleteId)
          .single(),
        supabase
          .from('clients')
          .select('*, coach:profiles!coach_id(*)')
          .eq('athlete_id', athleteId)
          .single(),
        supabase
          .from('check_ins')
          .select('*', { count: 'exact' })
          .eq('athlete_id', athleteId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('weight_logs')
          .select('*')
          .eq('athlete_id', athleteId)
          .order('logged_date', { ascending: false })
          .limit(30),
      ])

      if (profile.error) throw profile.error

      return {
        ...profile.data,
        clientInfo: clientData.data,
        coach: clientData.data?.coach,
        recentCheckIns: checkIns.data || [],
        checkInCount: checkIns.count || 0,
        weightHistory: weightLogs.data || [],
      }
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// Subscriptions Hooks
// ============================================================================

export function useSubscriptions(options?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { status, search, page = 1, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['subscriptions', status, search, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select('*, user:profiles!user_id(*)', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      if (search) {
        // Search by user name or email
        query = query.or(`user.first_name.ilike.%${search}%,user.last_name.ilike.%${search}%,user.email.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { subscriptions: data, total: count }
    },
  })
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [active, cancelled, mrr] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('*', { count: 'exact' })
          .eq('status', 'active'),
        supabase
          .from('subscriptions')
          .select('*', { count: 'exact' })
          .eq('status', 'cancelled')
          .gte('cancelled_at', thirtyDaysAgo),
        supabase
          .from('subscriptions')
          .select('amount')
          .eq('status', 'active'),
      ])

      const totalMrr = (mrr.data || []).reduce((sum, sub) => sum + (sub.amount || 0), 0)
      const totalActive = active.count || 0
      const totalCancelled = cancelled.count || 0
      const churnRate = totalActive > 0 ? (totalCancelled / totalActive) * 100 : 0

      return {
        activeSubscriptions: totalActive,
        cancelledLast30Days: totalCancelled,
        churnRate: churnRate.toFixed(1),
        mrr: totalMrr,
      }
    },
  })
}

// ============================================================================
// Analytics Hooks
// ============================================================================

export function usePlatformAnalytics(days = 90) {
  return useQuery({
    queryKey: ['platform-analytics', days],
    queryFn: async () => {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      // Get daily active users over time
      const { data: signIns } = await supabase
        .from('profiles')
        .select('last_sign_in_at')
        .gte('last_sign_in_at', startDate)

      // Group by day
      const dailyActiveUsers = new Map<string, number>()
      signIns?.forEach(profile => {
        if (profile.last_sign_in_at) {
          const day = profile.last_sign_in_at.split('T')[0]
          dailyActiveUsers.set(day, (dailyActiveUsers.get(day) || 0) + 1)
        }
      })

      const dauData = Array.from(dailyActiveUsers.entries())
        .map(([date, count]) => ({ date, dau: count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        dauData,
        avgDau: dauData.length > 0 ? Math.round(dauData.reduce((sum, d) => sum + d.dau, 0) / dauData.length) : 0,
      }
    },
  })
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

export function useRealtimeAdminAlerts(onAlert: (alert: Record<string, unknown>) => void) {
  // Subscribe to new signups, failed payments, etc.
  return useQuery({
    queryKey: ['realtime-admin-alerts'],
    queryFn: () => {
      const channel = supabase
        .channel('admin-alerts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
          onAlert({ type: 'new_signup', data: payload.new })
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscriptions' }, (payload) => {
          onAlert({ type: 'new_subscription', data: payload.new })
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    },
    staleTime: Infinity,
  })
}
