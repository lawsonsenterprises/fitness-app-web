'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CheckIn, PaginatedResponse, CheckInStatus } from '@/types'

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
  // TODO: Implement real Supabase query when schema is aligned
  // The check_ins table exists but schema differs from frontend types
  console.warn('Check-ins feature not fully implemented - schema alignment needed')

  const { page = 1, pageSize = 20 } = options

  return {
    data: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
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
  // TODO: Implement real Supabase query when schema is aligned
  console.warn('Check-ins feature not fully implemented - schema alignment needed')
  return null
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
  // TODO: Implement real Supabase mutation when schema is aligned
  console.warn('Check-ins feature not fully implemented - schema alignment needed')
  throw new Error('Check-ins feature not implemented')
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
  // TODO: Implement real Supabase query when schema is aligned
  console.warn('Check-ins feature not fully implemented - schema alignment needed')

  return {
    total: 0,
    pending: 0,
    reviewed: 0,
    averageRating: 0,
  }
}

export function useCheckInStats() {
  return useQuery({
    queryKey: ['checkInStats'],
    queryFn: fetchCheckInStats,
    staleTime: 60 * 1000,
  })
}
