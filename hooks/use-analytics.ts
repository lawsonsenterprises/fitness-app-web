'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import type { CoachAnalytics, Client } from '@/types'

export function useAnalytics() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async (): Promise<CoachAnalytics> => {
      if (!user?.id) throw new Error('No user')

      const supabase = createClient()

      // Get active clients
      const { data: clientsData } = await supabase
        .from('coach_clients')
        .select(`
          id,
          client_id,
          status,
          client:profiles!coach_clients_client_id_fkey(
            id,
            display_name,
            avatar_url,
            contact_email
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'active')

      const activeClients = clientsData?.length ?? 0
      const clientIds = clientsData?.map((c) => c.client_id) ?? []

      // Get pending check-ins count
      let pendingCheckIns = 0
      if (clientIds.length > 0) {
        const { count } = await supabase
          .from('check_ins')
          .select('id', { count: 'exact', head: true })
          .in('user_id', clientIds)
          .eq('review_status', 'pending')
          .eq('was_sent_to_coach', true)
          .is('deleted_at', null)

        pendingCheckIns = count ?? 0
      }

      // Get unread messages count
      let unreadMessages = 0
      const { data: coachClientIds } = await supabase
        .from('coach_clients')
        .select('id')
        .eq('coach_id', user.id)

      if (coachClientIds && coachClientIds.length > 0) {
        const ids = coachClientIds.map((c) => c.id)
        const { count } = await supabase
          .from('coach_messages')
          .select('id', { count: 'exact', head: true })
          .in('coach_client_id', ids)
          .neq('sender_id', user.id)
          .eq('is_read', false)

        unreadMessages = count ?? 0
      }

      // Calculate check-in submission rate (last 7 days)
      let checkInSubmissionRate = 0
      if (clientIds.length > 0) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { count: recentCheckIns } = await supabase
          .from('check_ins')
          .select('id', { count: 'exact', head: true })
          .in('user_id', clientIds)
          .eq('was_sent_to_coach', true)
          .gte('created_at', sevenDaysAgo.toISOString())

        // Assume each client should submit 1 check-in per week
        checkInSubmissionRate = activeClients > 0
          ? Math.round(((recentCheckIns ?? 0) / activeClients) * 100)
          : 0
      }

      // Get at-risk clients (no check-in in last 14 days)
      const atRiskClients: Client[] = []
      if (clientsData && clientsData.length > 0) {
        const fourteenDaysAgo = new Date()
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

        // Get last check-in for each client
        for (const clientRow of clientsData) {
          const { data: lastCheckIn } = await supabase
            .from('check_ins')
            .select('id, created_at')
            .eq('user_id', clientRow.client_id)
            .eq('was_sent_to_coach', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          // If no check-in or last check-in is older than 14 days
          if (!lastCheckIn || new Date(lastCheckIn.created_at) < fourteenDaysAgo) {
            const clientData = Array.isArray(clientRow.client) ? clientRow.client[0] : clientRow.client
            if (clientData) {
              atRiskClients.push({
                id: clientRow.client_id,
                displayName: clientData.display_name,
                avatarUrl: clientData.avatar_url,
                email: clientData.contact_email || '',
                status: clientRow.status,
              } as Client)
            }
          }
        }
      }

      // Get training sessions this week
      let totalSessionsThisWeek = 0
      if (clientIds.length > 0) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { count: sessionsCount } = await supabase
          .from('training_sessions')
          .select('id', { count: 'exact', head: true })
          .in('user_id', clientIds)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])

        totalSessionsThisWeek = sessionsCount ?? 0
      }

      // Get nutrition daily summaries this week
      let totalMealsLoggedThisWeek = 0
      if (clientIds.length > 0) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { count: nutritionCount } = await supabase
          .from('nutrition_daily_summaries')
          .select('id', { count: 'exact', head: true })
          .in('user_id', clientIds)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])

        totalMealsLoggedThisWeek = nutritionCount ?? 0
      }

      // Calculate training adherence (sessions completed vs expected)
      // Assume 4 sessions per week expected per client
      const expectedSessions = activeClients * 4
      const avgTrainingAdherence = expectedSessions > 0
        ? Math.min(Math.round((totalSessionsThisWeek / expectedSessions) * 100), 100)
        : 0

      // Calculate nutrition adherence (days logged vs 7 days per client)
      const expectedNutritionDays = activeClients * 7
      const avgNutritionAdherence = expectedNutritionDays > 0
        ? Math.min(Math.round((totalMealsLoggedThisWeek / expectedNutritionDays) * 100), 100)
        : 0

      // Get daily check-in data for chart (last 7 days)
      const clientLoginData: { date: string; count: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayStart = date.toISOString().split('T')[0]
        const dayEnd = new Date(date)
        dayEnd.setDate(dayEnd.getDate() + 1)

        let count = 0
        if (clientIds.length > 0) {
          const { count: checkInCount } = await supabase
            .from('check_ins')
            .select('id', { count: 'exact', head: true })
            .in('user_id', clientIds)
            .eq('was_sent_to_coach', true)
            .gte('created_at', dayStart)
            .lt('created_at', dayEnd.toISOString().split('T')[0])

          count = checkInCount ?? 0
        }

        clientLoginData.push({
          date: date.toLocaleDateString('en-GB', { weekday: 'short' }),
          count,
        })
      }

      return {
        totalActiveClients: activeClients,
        totalSessionsThisWeek,
        totalMealsLoggedThisWeek,
        avgTrainingAdherence,
        avgNutritionAdherence,
        checkInSubmissionRate,
        atRiskClients,
        clientLoginData,
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

interface DashboardStats {
  newClientsThisMonth: number
  newClientsLastMonth: number
  revenueThisMonth: number
  revenueLastMonth: number
  checkInsAwaitingReview: number
  unreadMessages: number
  clientGrowthRate: number
}

export function useDashboardStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('No user')

      const supabase = createClient()

      // Get dates for this month and last month
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Get new clients this month
      const { count: newClientsThisMonth } = await supabase
        .from('coach_clients')
        .select('id', { count: 'exact', head: true })
        .eq('coach_id', user.id)
        .gte('created_at', thisMonthStart.toISOString())

      // Get new clients last month
      const { count: newClientsLastMonth } = await supabase
        .from('coach_clients')
        .select('id', { count: 'exact', head: true })
        .eq('coach_id', user.id)
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString())

      // Get client IDs for check-in stats
      const { data: coachClients } = await supabase
        .from('coach_clients')
        .select('id, client_id')
        .eq('coach_id', user.id)
        .eq('status', 'active')

      const clientIds = coachClients?.map((c) => c.client_id) ?? []
      const coachClientIds = coachClients?.map((c) => c.id) ?? []

      // Get pending check-ins
      let checkInsAwaitingReview = 0
      if (clientIds.length > 0) {
        const { count } = await supabase
          .from('check_ins')
          .select('id', { count: 'exact', head: true })
          .in('user_id', clientIds)
          .eq('review_status', 'pending')
          .eq('was_sent_to_coach', true)
          .is('deleted_at', null)

        checkInsAwaitingReview = count ?? 0
      }

      // Get unread messages
      let unreadMessages = 0
      if (coachClientIds.length > 0) {
        const { count } = await supabase
          .from('coach_messages')
          .select('id', { count: 'exact', head: true })
          .in('coach_client_id', coachClientIds)
          .neq('sender_id', user.id)
          .eq('is_read', false)

        unreadMessages = count ?? 0
      }

      // Calculate client growth rate
      const thisMonthCount = newClientsThisMonth ?? 0
      const lastMonthCount = newClientsLastMonth ?? 0
      const clientGrowthRate = lastMonthCount > 0
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : thisMonthCount > 0
        ? 100
        : 0

      // Get revenue data from subscriptions
      let revenueThisMonth = 0
      let revenueLastMonth = 0

      // Query subscriptions for revenue
      const { data: subscriptionsThisMonth } = await supabase
        .from('subscriptions')
        .select('price_amount')
        .eq('coach_id', user.id)
        .eq('status', 'active')
        .gte('created_at', thisMonthStart.toISOString())

      if (subscriptionsThisMonth) {
        revenueThisMonth = subscriptionsThisMonth.reduce((sum, sub) => sum + (sub.price_amount || 0), 0)
      }

      const { data: subscriptionsLastMonth } = await supabase
        .from('subscriptions')
        .select('price_amount')
        .eq('coach_id', user.id)
        .eq('status', 'active')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString())

      if (subscriptionsLastMonth) {
        revenueLastMonth = subscriptionsLastMonth.reduce((sum, sub) => sum + (sub.price_amount || 0), 0)
      }

      return {
        newClientsThisMonth: thisMonthCount,
        newClientsLastMonth: lastMonthCount,
        revenueThisMonth,
        revenueLastMonth,
        checkInsAwaitingReview,
        unreadMessages,
        clientGrowthRate,
      }
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  })
}

interface ClientActivity {
  date: string
  trainingSessions: number
  mealsLogged: number
  checkIns: number
}

export function useClientActivity() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['clientActivity', user?.id],
    queryFn: async (): Promise<ClientActivity[]> => {
      if (!user?.id) throw new Error('No user')

      const supabase = createClient()

      // Get client IDs
      const { data: coachClients } = await supabase
        .from('coach_clients')
        .select('client_id')
        .eq('coach_id', user.id)
        .eq('status', 'active')

      const clientIds = coachClients?.map((c) => c.client_id) ?? []

      // Build data for last 7 days
      const data: ClientActivity[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

        let checkIns = 0
        if (clientIds.length > 0) {
          const { count } = await supabase
            .from('check_ins')
            .select('id', { count: 'exact', head: true })
            .in('user_id', clientIds)
            .gte('created_at', dayStart.toISOString())
            .lt('created_at', dayEnd.toISOString())

          checkIns = count ?? 0
        }

        // Get training sessions for this day
        let trainingSessions = 0
        if (clientIds.length > 0) {
          const { count: sessionsCount } = await supabase
            .from('training_sessions')
            .select('id', { count: 'exact', head: true })
            .in('user_id', clientIds)
            .gte('date', dayStart.toISOString().split('T')[0])
            .lt('date', dayEnd.toISOString().split('T')[0])

          trainingSessions = sessionsCount ?? 0
        }

        // Get nutrition logs for this day
        let mealsLogged = 0
        if (clientIds.length > 0) {
          const { count: nutritionCount } = await supabase
            .from('nutrition_daily_summaries')
            .select('id', { count: 'exact', head: true })
            .in('user_id', clientIds)
            .eq('date', dayStart.toISOString().split('T')[0])

          mealsLogged = nutritionCount ?? 0
        }

        data.push({
          date: date.toLocaleDateString('en-GB', { weekday: 'short' }),
          trainingSessions,
          mealsLogged,
          checkIns,
        })
      }

      return data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}

interface ClientAdherence {
  clientId: string
  clientName: string
  trainingAdherence: number
  nutritionAdherence: number
  overallScore: number
}

export function useClientAdherence() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['clientAdherence', user?.id],
    queryFn: async (): Promise<ClientAdherence[]> => {
      if (!user?.id) throw new Error('No user')

      const supabase = createClient()

      // Get all active clients
      const { data: coachClients } = await supabase
        .from('coach_clients')
        .select(`
          client_id,
          client:profiles!coach_clients_client_id_fkey(
            id,
            display_name,
            contact_email
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'active')

      if (!coachClients || coachClients.length === 0) {
        return []
      }

      // Calculate adherence for each client
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

      const adherenceData: ClientAdherence[] = await Promise.all(
        coachClients.map(async (c) => {
          const clientData = c.client
          const client = Array.isArray(clientData) ? clientData[0] : clientData

          // Get training sessions in last 7 days
          const { count: sessionsCount } = await supabase
            .from('training_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', c.client_id)
            .gte('date', sevenDaysAgoStr)

          // Get nutrition logs in last 7 days
          const { count: nutritionCount } = await supabase
            .from('nutrition_daily_summaries')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', c.client_id)
            .gte('date', sevenDaysAgoStr)

          // Calculate adherence (assuming 4 sessions/week expected, 7 days of nutrition)
          const trainingAdherence = Math.min(Math.round(((sessionsCount ?? 0) / 4) * 100), 100)
          const nutritionAdherence = Math.min(Math.round(((nutritionCount ?? 0) / 7) * 100), 100)
          const overallScore = Math.round((trainingAdherence + nutritionAdherence) / 2)

          return {
            clientId: c.client_id,
            clientName: client?.display_name || client?.contact_email || 'Unknown Client',
            trainingAdherence,
            nutritionAdherence,
            overallScore,
          }
        })
      )

      return adherenceData
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}
