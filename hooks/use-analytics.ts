'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import type { CoachAnalytics, Client } from '@/types'

const supabase = createClient()

export function useAnalytics() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async (): Promise<CoachAnalytics> => {
      if (!user?.id) throw new Error('No user')

      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]

      // Fetch real clients
      const { data: clients, error: clientsError } = await supabase
        .from('coach_clients')
        .select('*, profiles!coach_clients_client_id_fkey(*)')
        .eq('coach_id', user.id)
        .eq('status', 'active')

      if (clientsError) throw clientsError

      const totalActiveClients = clients?.length || 0

      // Get client IDs for further queries
      const clientIds = clients?.map(c => c.client_id) || []

      // Fetch training sessions this week
      const { data: sessions } = await supabase
        .from('training_sessions')
        .select('id')
        .in('user_id', clientIds.length > 0 ? clientIds : [''])
        .gte('date', weekAgoStr)

      const totalSessionsThisWeek = sessions?.length || 0

      // Fetch check-ins this week
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('id')
        .in('user_id', clientIds.length > 0 ? clientIds : [''])
        .is('deleted_at', null)
        .gte('date', weekAgoStr)

      // Calculate adherence (simplified - would need programme data for real calculation)
      const avgTrainingAdherence = totalActiveClients > 0 && totalSessionsThisWeek > 0
        ? Math.min((totalSessionsThisWeek / (totalActiveClients * 4)) * 100, 100) // Assume 4 sessions/week target
        : 0

      // Check-in submission rate (assuming weekly check-ins expected)
      const checkInSubmissionRate = totalActiveClients > 0
        ? Math.min((checkIns?.length || 0) / totalActiveClients * 100, 100)
        : 0

      // Find at-risk clients (inactive for 7+ days)
      const atRiskClients: Client[] = (clients || [])
        .filter(c => {
          const profile = c.profiles
          if (!profile?.last_active_at) return true
          const lastActive = new Date(profile.last_active_at)
          const daysSinceActive = (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceActive > 7
        })
        .map(c => ({
          id: c.client_id,
          coachId: c.coach_id,
          firstName: c.profiles?.first_name || 'Unknown',
          lastName: c.profiles?.last_name || '',
          email: c.profiles?.email || '',
          status: 'paused' as const, // 'paused' for at-risk/inactive clients
          subscriptionStatus: 'active' as const,
          lastActiveAt: c.profiles?.last_active_at || undefined,
          sessionsThisWeek: 0,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }))

      return {
        totalActiveClients,
        totalSessionsThisWeek,
        totalMealsLoggedThisWeek: 0, // Would need nutrition_meals table query
        avgTrainingAdherence,
        avgNutritionAdherence: 0,
        checkInSubmissionRate,
        atRiskClients,
        clientLoginData: [],
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

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Clients this month
      const { data: clientsThisMonth } = await supabase
        .from('coach_clients')
        .select('id')
        .eq('coach_id', user.id)
        .gte('created_at', startOfMonth.toISOString())

      // Clients last month
      const { data: clientsLastMonth } = await supabase
        .from('coach_clients')
        .select('id')
        .eq('coach_id', user.id)
        .gte('created_at', startOfLastMonth.toISOString())
        .lt('created_at', startOfMonth.toISOString())

      const newClientsThisMonth = clientsThisMonth?.length || 0
      const newClientsLastMonth = clientsLastMonth?.length || 0
      const clientGrowthRate = newClientsLastMonth > 0
        ? ((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100
        : newClientsThisMonth > 0 ? 100 : 0

      // Get all active client IDs
      const { data: activeClients } = await supabase
        .from('coach_clients')
        .select('client_id')
        .eq('coach_id', user.id)
        .eq('status', 'active')

      const clientIds = activeClients?.map(c => c.client_id) || []

      // Pending check-ins (submitted but not reviewed by coach)
      const { data: pendingCheckIns } = await supabase
        .from('check_ins')
        .select('id')
        .in('user_id', clientIds.length > 0 ? clientIds : [''])
        .is('deleted_at', null)
        .eq('was_sent_to_coach', true)

      // This is simplified - would need a reviewed flag or coach feedback to know which are actually awaiting review

      return {
        newClientsThisMonth,
        newClientsLastMonth,
        revenueThisMonth: 0, // Would need subscription/payment data
        revenueLastMonth: 0,
        checkInsAwaitingReview: pendingCheckIns?.length || 0,
        unreadMessages: 0, // Would need messages table
        clientGrowthRate: Math.round(clientGrowthRate * 10) / 10,
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

      // Get client IDs
      const { data: clients } = await supabase
        .from('coach_clients')
        .select('client_id')
        .eq('coach_id', user.id)
        .eq('status', 'active')

      const clientIds = clients?.map(c => c.client_id) || []
      if (clientIds.length === 0) {
        // Return empty data for last 7 days
        const data: ClientActivity[] = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          data.push({
            date: date.toLocaleDateString('en-GB', { weekday: 'short' }),
            trainingSessions: 0,
            mealsLogged: 0,
            checkIns: 0,
          })
        }
        return data
      }

      const data: ClientActivity[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' })

        // Training sessions for this day
        const { data: sessions } = await supabase
          .from('training_sessions')
          .select('id')
          .in('user_id', clientIds)
          .eq('date', dateStr)

        // Check-ins for this day
        const { data: checkIns } = await supabase
          .from('check_ins')
          .select('id')
          .in('user_id', clientIds)
          .is('deleted_at', null)
          .eq('date', dateStr)

        data.push({
          date: dayName,
          trainingSessions: sessions?.length || 0,
          mealsLogged: 0, // Would need nutrition_meals query
          checkIns: checkIns?.length || 0,
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

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]

      // Get all active clients with their profiles
      const { data: clients } = await supabase
        .from('coach_clients')
        .select('client_id, profiles!coach_clients_client_id_fkey(first_name, last_name)')
        .eq('coach_id', user.id)
        .eq('status', 'active')

      if (!clients || clients.length === 0) return []

      const clientAdherence: ClientAdherence[] = []

      for (const client of clients) {
        // Supabase returns an array or object depending on join type
        const profileData = client.profiles
        const profile = Array.isArray(profileData) ? profileData[0] : profileData

        // Get training sessions this week
        const { data: sessions } = await supabase
          .from('training_sessions')
          .select('id')
          .eq('user_id', client.client_id)
          .gte('date', weekAgoStr)

        // Simplified adherence calculation (assume 4 sessions/week target)
        const trainingAdherence = Math.min(Math.round(((sessions?.length || 0) / 4) * 100), 100)

        // For now, use training adherence as overall (would need nutrition data for full calculation)
        const overallScore = trainingAdherence

        clientAdherence.push({
          clientId: client.client_id,
          clientName: `${profile?.first_name || 'Unknown'} ${profile?.last_name || ''}`.trim(),
          trainingAdherence,
          nutritionAdherence: 0,
          overallScore,
        })
      }

      // Sort by overall score descending
      return clientAdherence
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 5) // Top 5
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}
