'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CheckIn, CheckInRow, CheckInReviewStatus, PaginatedResponse } from '@/types'

// Transform database row to frontend type
function transformCheckIn(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    checkInType: row.check_in_type,
    weight: row.weight,
    weightTimestamp: row.weight_timestamp,
    sleepHours: row.sleep_hours,
    sleepQuality: row.sleep_quality,
    stepsAverage: row.steps_average,
    stepsTotal: row.steps_total,
    muscleGroupTrained: row.muscle_group_trained,
    sessionQuality: row.session_quality,
    notes: row.notes,
    photoData: row.photo_data,
    videoRecorded: row.video_recorded ?? false,
    coachFeedback: row.coach_feedback,
    coachRating: row.coach_rating,
    reviewStatus: row.review_status ?? 'pending',
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    isFlagged: row.is_flagged ?? false,
    flagReason: row.flag_reason,
    requiresFollowUp: row.requires_follow_up ?? false,
    followUpCompletedAt: row.follow_up_completed_at,
    wasSentToCoach: row.was_sent_to_coach ?? false,
    sentAt: row.sent_at,
    snoozedAt: row.snoozed_at,
    snoozedUntil: row.snoozed_until,
    snoozeCount: row.snooze_count,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
    deletedAt: row.deleted_at,
    client: row.client
      ? {
          id: row.client.id,
          displayName: row.client.display_name,
          avatarUrl: row.client.avatar_url,
          contactEmail: row.client.contact_email,
        }
      : undefined,
  }
}

interface UseCheckInsOptions {
  status?: CheckInReviewStatus | 'all'
  clientId?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: 'date' | 'createdAt' | 'weight'
  sortOrder?: 'asc' | 'desc'
}

async function fetchCheckIns(
  options: UseCheckInsOptions = {}
): Promise<PaginatedResponse<CheckIn>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
  }

  const {
    status,
    clientId,
    search,
    page = 1,
    pageSize = 20,
    sortBy = 'date',
    sortOrder = 'desc',
  } = options

  // First, get all client IDs for this coach
  const { data: coachClients } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', user.id)
    .eq('status', 'active')

  const clientIds = coachClients?.map((c) => c.client_id) ?? []

  if (clientIds.length === 0) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Build query for check-ins from coach's clients
  let query = supabase
    .from('check_ins')
    .select(
      `
      *,
      client:profiles!check_ins_user_id_fkey(
        id,
        display_name,
        avatar_url,
        contact_email
      )
    `,
      { count: 'exact' }
    )
    .in('user_id', clientIds)
    .is('deleted_at', null)
    .eq('was_sent_to_coach', true) // Only show check-ins sent to coach

  // Filter by specific client
  if (clientId) {
    query = query.eq('user_id', clientId)
  }

  // Filter by review status
  if (status && status !== 'all') {
    query = query.eq('review_status', status)
  }

  // Search by notes or client name (basic search)
  if (search) {
    query = query.or(`notes.ilike.%${search}%`)
  }

  // Sorting
  const sortColumn = sortBy === 'createdAt' ? 'created_at' : sortBy
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching check-ins:', error)
    throw new Error(error.message)
  }

  const checkIns = (data as CheckInRow[])?.map(transformCheckIn) ?? []
  const total = count ?? 0

  return {
    data: checkIns,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Verify this check-in belongs to one of the coach's clients
  const { data: coachClients } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', user.id)

  const clientIds = coachClients?.map((c) => c.client_id) ?? []

  const { data, error } = await supabase
    .from('check_ins')
    .select(
      `
      *,
      client:profiles!check_ins_user_id_fkey(
        id,
        display_name,
        avatar_url,
        contact_email
      )
    `
    )
    .eq('id', checkInId)
    .in('user_id', clientIds)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    return null
  }

  return transformCheckIn(data as CheckInRow)
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
  rating?: number
}

async function reviewCheckIn(data: ReviewCheckInData): Promise<CheckIn> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { checkInId, feedback, rating } = data

  const { data: updated, error } = await supabase
    .from('check_ins')
    .update({
      coach_feedback: feedback,
      coach_rating: rating ?? null,
      review_status: 'reviewed',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', checkInId)
    .select(
      `
      *,
      client:profiles!check_ins_user_id_fkey(
        id,
        display_name,
        avatar_url,
        contact_email
      )
    `
    )
    .single()

  if (error) {
    console.error('Error reviewing check-in:', error)
    throw new Error(error.message)
  }

  return transformCheckIn(updated as CheckInRow)
}

export function useReviewCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewCheckIn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] })
      queryClient.invalidateQueries({ queryKey: ['checkIn', variables.checkInId] })
      queryClient.invalidateQueries({ queryKey: ['checkInStats'] })
    },
  })
}

// Hook for flagging a check-in
interface FlagCheckInData {
  checkInId: string
  reason: string
}

async function flagCheckIn(data: FlagCheckInData): Promise<CheckIn> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { checkInId, reason } = data

  const { data: updated, error } = await supabase
    .from('check_ins')
    .update({
      is_flagged: true,
      flag_reason: reason,
      review_status: 'flagged',
      reviewed_by: user.id,
    })
    .eq('id', checkInId)
    .select(
      `
      *,
      client:profiles!check_ins_user_id_fkey(
        id,
        display_name,
        avatar_url,
        contact_email
      )
    `
    )
    .single()

  if (error) {
    console.error('Error flagging check-in:', error)
    throw new Error(error.message)
  }

  return transformCheckIn(updated as CheckInRow)
}

export function useFlagCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: flagCheckIn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] })
      queryClient.invalidateQueries({ queryKey: ['checkIn', variables.checkInId] })
      queryClient.invalidateQueries({ queryKey: ['checkInStats'] })
    },
  })
}

// Hook for archiving a check-in
async function archiveCheckIn(checkInId: string): Promise<CheckIn> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: updated, error } = await supabase
    .from('check_ins')
    .update({
      review_status: 'archived',
    })
    .eq('id', checkInId)
    .select(
      `
      *,
      client:profiles!check_ins_user_id_fkey(
        id,
        display_name,
        avatar_url,
        contact_email
      )
    `
    )
    .single()

  if (error) {
    console.error('Error archiving check-in:', error)
    throw new Error(error.message)
  }

  return transformCheckIn(updated as CheckInRow)
}

export function useArchiveCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: archiveCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] })
      queryClient.invalidateQueries({ queryKey: ['checkInStats'] })
    },
  })
}

// Hook for marking follow-up complete
async function completeFollowUp(checkInId: string): Promise<CheckIn> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: updated, error } = await supabase
    .from('check_ins')
    .update({
      follow_up_completed_at: new Date().toISOString(),
    })
    .eq('id', checkInId)
    .select(
      `
      *,
      client:profiles!check_ins_user_id_fkey(
        id,
        display_name,
        avatar_url,
        contact_email
      )
    `
    )
    .single()

  if (error) {
    console.error('Error completing follow-up:', error)
    throw new Error(error.message)
  }

  return transformCheckIn(updated as CheckInRow)
}

export function useCompleteFollowUp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeFollowUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] })
    },
  })
}

// Hook for getting check-in statistics
interface CheckInStats {
  total: number
  pending: number
  reviewed: number
  flagged: number
  requiresFollowUp: number
  averageRating: number
}

async function fetchCheckInStats(): Promise<CheckInStats> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      total: 0,
      pending: 0,
      reviewed: 0,
      flagged: 0,
      requiresFollowUp: 0,
      averageRating: 0,
    }
  }

  // Get all client IDs for this coach
  const { data: coachClients } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', user.id)
    .eq('status', 'active')

  const clientIds = coachClients?.map((c) => c.client_id) ?? []

  if (clientIds.length === 0) {
    return {
      total: 0,
      pending: 0,
      reviewed: 0,
      flagged: 0,
      requiresFollowUp: 0,
      averageRating: 0,
    }
  }

  // Get counts by status
  const { data: checkIns, error } = await supabase
    .from('check_ins')
    .select('review_status, coach_rating, requires_follow_up, follow_up_completed_at')
    .in('user_id', clientIds)
    .is('deleted_at', null)
    .eq('was_sent_to_coach', true)

  if (error) {
    console.error('Error fetching check-in stats:', error)
    return {
      total: 0,
      pending: 0,
      reviewed: 0,
      flagged: 0,
      requiresFollowUp: 0,
      averageRating: 0,
    }
  }

  const stats = {
    total: checkIns?.length ?? 0,
    pending: checkIns?.filter((c) => c.review_status === 'pending').length ?? 0,
    reviewed: checkIns?.filter((c) => c.review_status === 'reviewed').length ?? 0,
    flagged: checkIns?.filter((c) => c.review_status === 'flagged').length ?? 0,
    requiresFollowUp:
      checkIns?.filter((c) => c.requires_follow_up && !c.follow_up_completed_at).length ?? 0,
    averageRating: 0,
  }

  // Calculate average rating from reviewed check-ins
  const ratings = checkIns?.filter((c) => c.coach_rating != null).map((c) => c.coach_rating!) ?? []
  if (ratings.length > 0) {
    stats.averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  }

  return stats
}

export function useCheckInStats() {
  return useQuery({
    queryKey: ['checkInStats'],
    queryFn: fetchCheckInStats,
    staleTime: 60 * 1000,
  })
}

// Hook for getting check-ins for a specific client
export function useClientCheckIns(clientId: string, options: Omit<UseCheckInsOptions, 'clientId'> = {}) {
  return useCheckIns({ ...options, clientId })
}
