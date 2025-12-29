'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import type { CoachAnalytics } from '@/types'

// Note: coach_clients table doesn't exist in the current schema
// These hooks return placeholder data until proper coach-client relationships are implemented

export function useAnalytics() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async (): Promise<CoachAnalytics> => {
      if (!user?.id) throw new Error('No user')

      // coach_clients table doesn't exist - return empty analytics
      // TODO: Implement when coach_clients table is added to schema
      console.warn('Coach analytics: coach_clients table not available')

      return {
        totalActiveClients: 0,
        totalSessionsThisWeek: 0,
        totalMealsLoggedThisWeek: 0,
        avgTrainingAdherence: 0,
        avgNutritionAdherence: 0,
        checkInSubmissionRate: 0,
        atRiskClients: [],
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

      // coach_clients table doesn't exist - return empty stats
      // TODO: Implement when coach_clients table is added to schema
      console.warn('Dashboard stats: coach_clients table not available')

      return {
        newClientsThisMonth: 0,
        newClientsLastMonth: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        checkInsAwaitingReview: 0,
        unreadMessages: 0,
        clientGrowthRate: 0,
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

      // coach_clients table doesn't exist - return empty activity for last 7 days
      // TODO: Implement when coach_clients table is added to schema
      console.warn('Client activity: coach_clients table not available')

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

      // coach_clients table doesn't exist - return empty adherence
      // TODO: Implement when coach_clients table is added to schema
      console.warn('Client adherence: coach_clients table not available')

      return []
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}
