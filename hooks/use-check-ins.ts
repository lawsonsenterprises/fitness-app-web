'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CheckIn, PaginatedResponse, CheckInStatus } from '@/types'

// Mock check-in data
const mockCheckIns: CheckIn[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Emma Thompson',
    clientEmail: 'emma.thompson@example.com',
    coachId: 'coach-1',
    weekStartDate: '2024-12-23',
    submittedAt: '2024-12-27T09:30:00Z',
    weight: 81.3,
    weightUnit: 'kg',
    previousWeight: 81.8,
    weightChange: -0.5,
    dailySteps: [9200, 10500, 8800, 9100, 10200, 9800, 8900],
    averageSteps: 9500,
    stepsTarget: 10000,
    sleepHours: 7.5,
    sleepQuality: 'good',
    waterIntake: 3.2,
    waterUnit: 'litres',
    supplementsTaken: ['Vitamin D', 'Omega-3', 'Creatine', 'Multivitamin'],
    supplementsTotal: 4,
    supplementCompliance: 95,
    notes: 'Feeling great this week. Energy levels are high and training is going well. Hit a new PR on bench press!',
    status: 'pending',
    createdAt: '2024-12-27T09:30:00Z',
    updatedAt: '2024-12-27T09:30:00Z',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'James Wilson',
    clientEmail: 'james.wilson@example.com',
    coachId: 'coach-1',
    weekStartDate: '2024-12-23',
    submittedAt: '2024-12-27T08:15:00Z',
    weight: 92.1,
    weightUnit: 'kg',
    previousWeight: 92.5,
    weightChange: -0.4,
    dailySteps: [8500, 9000, 7800, 8200, 9100, 8800, 8500],
    averageSteps: 8557,
    stepsTarget: 8000,
    sleepHours: 6.8,
    sleepQuality: 'fair',
    waterIntake: 2.8,
    waterUnit: 'litres',
    supplementsTaken: ['Vitamin D', 'Protein'],
    supplementsTotal: 3,
    supplementCompliance: 67,
    notes: 'Struggled with sleep this week due to work stress. Training still felt solid though.',
    status: 'pending',
    createdAt: '2024-12-27T08:15:00Z',
    updatedAt: '2024-12-27T08:15:00Z',
  },
  {
    id: '3',
    clientId: '4',
    clientName: 'Michael Chen',
    clientEmail: 'michael.chen@example.com',
    coachId: 'coach-1',
    weekStartDate: '2024-12-23',
    submittedAt: '2024-12-26T22:00:00Z',
    weight: 75.2,
    weightUnit: 'kg',
    previousWeight: 75.0,
    weightChange: 0.2,
    dailySteps: [12500, 11800, 13200, 12100, 11500, 14000, 13500],
    averageSteps: 12657,
    stepsTarget: 12000,
    sleepHours: 8.2,
    sleepQuality: 'excellent',
    waterIntake: 4.0,
    waterUnit: 'litres',
    supplementsTaken: ['Vitamin D', 'Omega-3', 'Creatine', 'Multivitamin', 'Magnesium'],
    supplementsTotal: 5,
    supplementCompliance: 100,
    notes: 'Outstanding week! All targets hit. Feeling the best I have in months.',
    coachFeedback: 'Phenomenal work Michael! Your consistency is paying off. Keep this momentum going into the new year.',
    coachRating: 5,
    reviewedAt: '2024-12-27T06:00:00Z',
    status: 'reviewed',
    createdAt: '2024-12-26T22:00:00Z',
    updatedAt: '2024-12-27T06:00:00Z',
  },
  {
    id: '4',
    clientId: '6',
    clientName: 'William Anderson',
    clientEmail: 'william.anderson@example.com',
    coachId: 'coach-1',
    weekStartDate: '2024-12-16',
    submittedAt: '2024-12-20T18:30:00Z',
    weight: 88.5,
    weightUnit: 'kg',
    previousWeight: 89.2,
    weightChange: -0.7,
    dailySteps: [10200, 9800, 10500, 11000, 9500, 10800, 10200],
    averageSteps: 10286,
    stepsTarget: 10000,
    sleepHours: 7.0,
    sleepQuality: 'good',
    waterIntake: 3.5,
    waterUnit: 'litres',
    supplementsTaken: ['Vitamin D', 'Omega-3', 'Protein'],
    supplementsTotal: 4,
    supplementCompliance: 75,
    notes: 'Good week overall. Missed one training session due to a family commitment but made it up.',
    coachFeedback: 'Good effort William. The weight is trending in the right direction. Focus on supplement consistency next week.',
    coachRating: 4,
    reviewedAt: '2024-12-21T09:00:00Z',
    status: 'reviewed',
    createdAt: '2024-12-20T18:30:00Z',
    updatedAt: '2024-12-21T09:00:00Z',
  },
  {
    id: '5',
    clientId: '8',
    clientName: 'Alexander Lee',
    clientEmail: 'alexander.lee@example.com',
    coachId: 'coach-1',
    weekStartDate: '2024-12-23',
    submittedAt: '2024-12-26T20:45:00Z',
    weight: 78.8,
    weightUnit: 'kg',
    previousWeight: 78.5,
    weightChange: 0.3,
    dailySteps: [7500, 8200, 6800, 7100, 8500, 9000, 7800],
    averageSteps: 7843,
    stepsTarget: 8000,
    sleepHours: 7.8,
    sleepQuality: 'good',
    waterIntake: 3.0,
    waterUnit: 'litres',
    supplementsTaken: ['Vitamin D', 'Creatine', 'Multivitamin', 'Zinc'],
    supplementsTotal: 4,
    supplementCompliance: 100,
    notes: 'Solid week. Slightly under on steps but energy was high in training sessions.',
    status: 'pending',
    createdAt: '2024-12-26T20:45:00Z',
    updatedAt: '2024-12-26T20:45:00Z',
  },
]

interface UseCheckInsOptions {
  status?: CheckInStatus | 'all'
  clientId?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: 'submittedAt' | 'clientName' | 'weightChange'
  sortOrder?: 'asc' | 'desc'
}

async function fetchCheckIns(
  options: UseCheckInsOptions = {}
): Promise<PaginatedResponse<CheckIn>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  const {
    status = 'all',
    clientId,
    search = '',
    page = 1,
    pageSize = 20,
    sortBy = 'submittedAt',
    sortOrder = 'desc',
  } = options

  let filtered = [...mockCheckIns]

  // Filter by status
  if (status !== 'all') {
    filtered = filtered.filter((checkIn) => checkIn.status === status)
  }

  // Filter by client
  if (clientId) {
    filtered = filtered.filter((checkIn) => checkIn.clientId === clientId)
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(
      (checkIn) =>
        checkIn.clientName?.toLowerCase().includes(searchLower) ||
        checkIn.clientEmail?.toLowerCase().includes(searchLower)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'submittedAt':
        comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        break
      case 'clientName':
        comparison = (a.clientName || '').localeCompare(b.clientName || '')
        break
      case 'weightChange':
        comparison = (a.weightChange || 0) - (b.weightChange || 0)
        break
    }
    return sortOrder === 'desc' ? -comparison : comparison
  })

  // Paginate
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export function useCheckIns(options: UseCheckInsOptions = {}) {
  return useQuery({
    queryKey: ['checkIns', options],
    queryFn: () => fetchCheckIns(options),
    staleTime: 30 * 1000,
  })
}

// Hook for fetching a single check-in
async function fetchCheckIn(checkInId: string): Promise<CheckIn | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockCheckIns.find((c) => c.id === checkInId) || null
}

export function useCheckIn(checkInId: string) {
  return useQuery({
    queryKey: ['checkIn', checkInId],
    queryFn: () => fetchCheckIn(checkInId),
    enabled: !!checkInId,
  })
}

// Hook for reviewing a check-in
interface ReviewCheckInData {
  checkInId: string
  feedback: string
  rating: number
}

async function reviewCheckIn(data: ReviewCheckInData): Promise<CheckIn> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const checkIn = mockCheckIns.find((c) => c.id === data.checkInId)
  if (!checkIn) {
    throw new Error('Check-in not found')
  }

  checkIn.coachFeedback = data.feedback
  checkIn.coachRating = data.rating
  checkIn.status = 'reviewed'
  checkIn.reviewedAt = new Date().toISOString()
  checkIn.updatedAt = new Date().toISOString()

  return checkIn
}

export function useReviewCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewCheckIn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] })
      queryClient.invalidateQueries({ queryKey: ['checkIn', variables.checkInId] })
    },
  })
}

// Hook for getting check-in statistics
interface CheckInStats {
  total: number
  pending: number
  reviewed: number
  averageRating: number
}

async function fetchCheckInStats(): Promise<CheckInStats> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const pending = mockCheckIns.filter((c) => c.status === 'pending').length
  const reviewed = mockCheckIns.filter((c) => c.status === 'reviewed').length
  const withRatings = mockCheckIns.filter((c) => c.coachRating !== undefined)
  const averageRating = withRatings.length
    ? withRatings.reduce((sum, c) => sum + (c.coachRating || 0), 0) / withRatings.length
    : 0

  return {
    total: mockCheckIns.length,
    pending,
    reviewed,
    averageRating,
  }
}

export function useCheckInStats() {
  return useQuery({
    queryKey: ['checkInStats'],
    queryFn: fetchCheckInStats,
    staleTime: 60 * 1000,
  })
}
