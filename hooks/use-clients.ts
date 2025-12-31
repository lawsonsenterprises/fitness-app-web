'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Client, ClientStatus, PaginatedResponse } from '@/types'

const supabase = createClient()

// TODO: Implement coach_clients table in Supabase
// Currently no coach-client relationship exists in the database

interface UseClientsOptions {
  status?: ClientStatus | 'all'
  search?: string
  page?: number
  pageSize?: number
}

async function fetchClients(
  options: UseClientsOptions = {}
): Promise<PaginatedResponse<Client>> {
  // No clients table exists - return empty
  console.warn('Clients feature not implemented - no coach_clients table in database')
  return {
    data: [],
    total: 0,
    page: options.page || 1,
    pageSize: options.pageSize || 20,
    totalPages: 0,
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
async function fetchClient(clientId: string): Promise<Client | null> {
  // No clients table exists - return null
  console.warn('Client fetch not implemented - no coach_clients table in database')
  return null
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: () => fetchClient(clientId),
    enabled: !!clientId,
  })
}

// Hook for inviting a client
interface InviteClientData {
  email: string
  customMessage?: string
}

async function inviteClient(data: InviteClientData): Promise<Client> {
  // Not implemented
  throw new Error('Client invitation not implemented - no coach_clients table in database')
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
  clientId: string
  status: ClientStatus
  reason?: string
}

async function updateClientStatus(
  data: UpdateClientStatusData
): Promise<Client> {
  // Not implemented
  throw new Error('Client status update not implemented - no coach_clients table in database')
}

export function useUpdateClientStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateClientStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] })
    },
  })
}

// Hook for removing a client
async function removeClient(clientId: string): Promise<void> {
  // Not implemented
  throw new Error('Client removal not implemented - no coach_clients table in database')
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
