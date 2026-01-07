'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Client, ClientStatus, CoachClientRow, PaginatedResponse } from '@/types'

const supabase = createClient()

// Convert storage path to API route URL
function getAvatarApiUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null
  // Strip 'avatars/' prefix if present since the API route adds it
  const path = avatarPath.startsWith('avatars/') ? avatarPath.slice(8) : avatarPath
  return `/api/avatar/${path}`
}

// Transform database row to Client interface
function transformCoachClient(row: CoachClientRow): Client {
  return {
    id: row.id,
    coachId: row.coach_id,
    clientId: row.client_id,
    displayName: row.client?.display_name ?? null,
    email: row.client?.contact_email ?? null,
    avatarUrl: getAvatarApiUrl(row.client?.avatar_url),
    status: row.status ?? 'pending',
    checkInFrequency: row.check_in_frequency,
    nextCheckInDue: row.next_check_in_due,
    notes: row.notes,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

interface UseClientsOptions {
  status?: ClientStatus | 'all'
  search?: string
  page?: number
  pageSize?: number
}

async function fetchClients(
  options: UseClientsOptions = {}
): Promise<PaginatedResponse<Client>> {
  const { status = 'all', search, page = 1, pageSize = 20 } = options

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Build query
  let query = supabase
    .from('coach_clients')
    .select(`
      *,
      client:profiles!client_id (
        id,
        display_name,
        avatar_url,
        contact_email,
        roles
      )
    `, { count: 'exact' })
    .eq('coach_id', user.id)

  // Filter by status
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Search by client name or email
  if (search) {
    query = query.or(`client.display_name.ilike.%${search}%,client.contact_email.ilike.%${search}%`)
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to).order('created_at', { ascending: false })

  const { data, error, count } = await query

  console.log('useClients query result:', { data, error, count, userId: user.id })

  if (error) {
    console.error('Error fetching clients:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Transform clients - use avatar_url directly (signed URLs handled elsewhere)
  const clientsWithAvatars = (data || []).map((row) => {
    console.log('Raw row from Supabase:', JSON.stringify(row, null, 2))
    const typedRow = row as CoachClientRow
    const transformed = transformCoachClient(typedRow)
    console.log('Transformed client:', { id: transformed.id, clientId: transformed.clientId })
    return transformed
  })

  const total = count || 0

  return {
    data: clientsWithAvatars,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export function useClients(options: UseClientsOptions = {}) {
  return useQuery({
    queryKey: ['clients', options],
    queryFn: () => fetchClients(options),
    staleTime: 30 * 1000,
  })
}

// Hook for fetching a single client
async function fetchClient(clientRelationshipId: string): Promise<Client | null> {
  console.log('fetchClient called with:', clientRelationshipId)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return null
  }

  console.log('Fetching client for coach:', user.id)

  const { data, error } = await supabase
    .from('coach_clients')
    .select(`
      *,
      client:profiles!client_id (
        id,
        display_name,
        avatar_url,
        contact_email,
        roles
      )
    `)
    .eq('id', clientRelationshipId)
    .eq('coach_id', user.id)
    .single()

  console.log('fetchClient result:', { data, error, clientRelationshipId })

  if (error) {
    console.error('Error fetching client:', error)
    return null
  }

  if (!data) {
    console.error('No data returned for client:', clientRelationshipId)
    return null
  }

  const typedData = data as CoachClientRow
  return transformCoachClient(typedData)
}

export function useClient(clientRelationshipId: string) {
  return useQuery({
    queryKey: ['client', clientRelationshipId],
    queryFn: () => fetchClient(clientRelationshipId),
    enabled: !!clientRelationshipId,
  })
}

// Hook for fetching client by their profile ID (client_id)
async function fetchClientByProfileId(profileId: string): Promise<Client | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return null
  }

  const { data, error } = await supabase
    .from('coach_clients')
    .select(`
      *,
      client:profiles!client_id (
        id,
        display_name,
        avatar_url,
        contact_email,
        roles
      )
    `)
    .eq('client_id', profileId)
    .eq('coach_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No row found - client relationship doesn't exist
      return null
    }
    console.error('Error fetching client by profile:', error)
    return null
  }

  const typedData = data as CoachClientRow
  return transformCoachClient(typedData)
}

export function useClientByProfileId(profileId: string) {
  return useQuery({
    queryKey: ['client', 'profile', profileId],
    queryFn: () => fetchClientByProfileId(profileId),
    enabled: !!profileId,
  })
}

// Hook for inviting a client (creating coach_clients record)
interface InviteClientData {
  clientId: string // The profile ID of the client to invite
  notes?: string
  checkInFrequency?: number
}

async function inviteClient(data: InviteClientData): Promise<Client> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Check if relationship already exists
  const { data: existing } = await supabase
    .from('coach_clients')
    .select('id')
    .eq('coach_id', user.id)
    .eq('client_id', data.clientId)
    .single()

  if (existing) {
    throw new Error('Client relationship already exists')
  }

  // Create new coach-client relationship
  const { data: newRelationship, error } = await supabase
    .from('coach_clients')
    .insert({
      coach_id: user.id,
      client_id: data.clientId,
      status: 'pending',
      notes: data.notes,
      check_in_frequency: data.checkInFrequency ?? 7,
    })
    .select(`
      *,
      client:profiles!client_id (
        id,
        display_name,
        avatar_url,
        contact_email,
        roles
      )
    `)
    .single()

  if (error) {
    console.error('Error inviting client:', error)
    throw new Error('Failed to create client relationship')
  }

  const typedData = newRelationship as CoachClientRow
  return transformCoachClient(typedData)
}

export function useInviteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inviteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

// Hook for updating client relationship status
interface UpdateClientStatusData {
  clientRelationshipId: string
  status: ClientStatus
  notes?: string
}

async function updateClientStatus(data: UpdateClientStatusData): Promise<Client> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const updateData: Record<string, unknown> = {
    status: data.status,
  }

  // Set ended_at when completing or cancelling
  if (data.status === 'completed' || data.status === 'cancelled') {
    updateData.ended_at = new Date().toISOString()
  }

  // Set started_at when activating (if not already set)
  if (data.status === 'active') {
    updateData.started_at = new Date().toISOString()
  }

  if (data.notes !== undefined) {
    updateData.notes = data.notes
  }

  const { data: updated, error } = await supabase
    .from('coach_clients')
    .update(updateData)
    .eq('id', data.clientRelationshipId)
    .eq('coach_id', user.id)
    .select(`
      *,
      client:profiles!client_id (
        id,
        display_name,
        avatar_url,
        contact_email,
        roles
      )
    `)
    .single()

  if (error) {
    console.error('Error updating client status:', error)
    throw new Error('Failed to update client status')
  }

  const typedData = updated as CoachClientRow
  return transformCoachClient(typedData)
}

export function useUpdateClientStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateClientStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientRelationshipId] })
    },
  })
}

// Hook for updating client notes/settings
interface UpdateClientData {
  clientRelationshipId: string
  notes?: string
  checkInFrequency?: number
  nextCheckInDue?: string
}

async function updateClient(data: UpdateClientData): Promise<Client> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const updateData: Record<string, unknown> = {}

  if (data.notes !== undefined) {
    updateData.notes = data.notes
  }
  if (data.checkInFrequency !== undefined) {
    updateData.check_in_frequency = data.checkInFrequency
  }
  if (data.nextCheckInDue !== undefined) {
    updateData.next_check_in_due = data.nextCheckInDue
  }

  const { data: updated, error } = await supabase
    .from('coach_clients')
    .update(updateData)
    .eq('id', data.clientRelationshipId)
    .eq('coach_id', user.id)
    .select(`
      *,
      client:profiles!client_id (
        id,
        display_name,
        avatar_url,
        contact_email,
        roles
      )
    `)
    .single()

  if (error) {
    console.error('Error updating client:', error)
    throw new Error('Failed to update client')
  }

  const typedData = updated as CoachClientRow
  return transformCoachClient(typedData)
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientRelationshipId] })
    },
  })
}

// Hook for removing/ending a client relationship
async function removeClient(clientRelationshipId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Soft delete by setting status to cancelled and ended_at
  const { error } = await supabase
    .from('coach_clients')
    .update({
      status: 'cancelled',
      ended_at: new Date().toISOString(),
    })
    .eq('id', clientRelationshipId)
    .eq('coach_id', user.id)

  if (error) {
    console.error('Error removing client:', error)
    throw new Error('Failed to remove client')
  }
}

export function useRemoveClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

// Hook for getting client IDs (useful for other queries)
export async function getCoachClientIds(): Promise<string[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', user.id)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching client IDs:', error)
    return []
  }

  return (data || []).map(row => row.client_id)
}

// Hook for inviting a new client (not yet signed up)
interface InviteNewClientData {
  email: string
  name: string
  message?: string
}

export function useInviteNewClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, name, message }: InviteNewClientData) => {
      const { inviteClient } = await import('@/app/actions/invite-client')
      const result = await inviteClient(email, name, message)

      if (!result.success) {
        throw new Error(result.error || 'Failed to invite client')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['pending-client-invites'] })
    },
  })
}
