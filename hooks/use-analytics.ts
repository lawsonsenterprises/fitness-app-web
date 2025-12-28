'use client'

import { useQuery } from '@tanstack/react-query'
import type { CoachAnalytics, Client } from '@/types'

// Mock at-risk clients
const mockAtRiskClients: Client[] = [
  {
    id: '5',
    coachId: 'coach-1',
    firstName: 'Olivia',
    lastName: 'Martinez',
    email: 'olivia.martinez@example.com',
    status: 'paused',
    subscriptionStatus: 'active',
    lastActiveAt: '2024-12-15T14:20:00Z',
    sessionsThisWeek: 0,
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
]

// Mock analytics data
async function fetchAnalytics(): Promise<CoachAnalytics> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Generate login data for the last 30 days
  const clientLoginData: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    clientLoginData.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 12) + 3,
    })
  }

  return {
    totalActiveClients: 18,
    totalSessionsThisWeek: 87,
    totalMealsLoggedThisWeek: 156,
    avgTrainingAdherence: 84.5,
    avgNutritionAdherence: 78.2,
    checkInSubmissionRate: 92.3,
    atRiskClients: mockAtRiskClients,
    clientLoginData,
  }
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  })
}

// Extended analytics for dashboard widgets
interface DashboardStats {
  newClientsThisMonth: number
  newClientsLastMonth: number
  revenueThisMonth: number
  revenueLastMonth: number
  checkInsAwaitingReview: number
  unreadMessages: number
  clientGrowthRate: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    newClientsThisMonth: 5,
    newClientsLastMonth: 3,
    revenueThisMonth: 4500,
    revenueLastMonth: 3800,
    checkInsAwaitingReview: 3,
    unreadMessages: 8,
    clientGrowthRate: 66.7,
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 60 * 1000,
  })
}

// Client activity over time
interface ClientActivity {
  date: string
  trainingSessions: number
  mealsLogged: number
  checkIns: number
}

async function fetchClientActivity(): Promise<ClientActivity[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const data: ClientActivity[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' })
    data.push({
      date: dayName,
      trainingSessions: Math.floor(Math.random() * 15) + 5,
      mealsLogged: Math.floor(Math.random() * 40) + 20,
      checkIns: i === 0 ? Math.floor(Math.random() * 5) + 2 : 0,
    })
  }

  return data
}

export function useClientActivity() {
  return useQuery({
    queryKey: ['clientActivity'],
    queryFn: fetchClientActivity,
    staleTime: 5 * 60 * 1000,
  })
}

// Adherence breakdown by client
interface ClientAdherence {
  clientId: string
  clientName: string
  trainingAdherence: number
  nutritionAdherence: number
  overallScore: number
}

async function fetchClientAdherence(): Promise<ClientAdherence[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  return [
    { clientId: '4', clientName: 'Michael Chen', trainingAdherence: 98, nutritionAdherence: 95, overallScore: 96.5 },
    { clientId: '6', clientName: 'William Anderson', trainingAdherence: 95, nutritionAdherence: 88, overallScore: 91.5 },
    { clientId: '1', clientName: 'Emma Thompson', trainingAdherence: 92, nutritionAdherence: 85, overallScore: 88.5 },
    { clientId: '8', clientName: 'Alexander Lee', trainingAdherence: 88, nutritionAdherence: 82, overallScore: 85 },
    { clientId: '2', clientName: 'James Wilson', trainingAdherence: 75, nutritionAdherence: 70, overallScore: 72.5 },
  ]
}

export function useClientAdherence() {
  return useQuery({
    queryKey: ['clientAdherence'],
    queryFn: fetchClientAdherence,
    staleTime: 5 * 60 * 1000,
  })
}
