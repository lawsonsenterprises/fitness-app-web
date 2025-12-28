'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client, ClientStatus, PaginatedResponse } from '@/types'

// Mock data - will be replaced with Supabase queries
const mockClients: Client[] = [
  {
    id: '1',
    coachId: 'coach-1',
    firstName: 'Emma',
    lastName: 'Thompson',
    email: 'emma.thompson@example.com',
    status: 'active',
    subscriptionStatus: 'active',
    lastActiveAt: '2024-12-27T10:30:00Z',
    sessionsThisWeek: 4,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-27T10:30:00Z',
  },
  {
    id: '2',
    coachId: 'coach-1',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@example.com',
    status: 'active',
    subscriptionStatus: 'active',
    lastActiveAt: '2024-12-26T18:45:00Z',
    sessionsThisWeek: 3,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-12-26T18:45:00Z',
  },
  {
    id: '3',
    coachId: 'coach-1',
    firstName: 'Sophie',
    lastName: 'Brown',
    email: 'sophie.brown@example.com',
    status: 'pending',
    subscriptionStatus: 'trial',
    createdAt: '2024-12-25T10:00:00Z',
    updatedAt: '2024-12-25T10:00:00Z',
  },
  {
    id: '4',
    coachId: 'coach-1',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    status: 'active',
    subscriptionStatus: 'active',
    lastActiveAt: '2024-12-27T08:15:00Z',
    sessionsThisWeek: 5,
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-12-27T08:15:00Z',
  },
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
  {
    id: '6',
    coachId: 'coach-1',
    firstName: 'William',
    lastName: 'Anderson',
    email: 'william.anderson@example.com',
    status: 'active',
    subscriptionStatus: 'active',
    lastActiveAt: '2024-12-27T07:00:00Z',
    sessionsThisWeek: 6,
    createdAt: '2024-05-12T10:00:00Z',
    updatedAt: '2024-12-27T07:00:00Z',
  },
  {
    id: '7',
    coachId: 'coach-1',
    firstName: 'Isabella',
    lastName: 'Taylor',
    email: 'isabella.taylor@example.com',
    status: 'ended',
    subscriptionStatus: 'cancelled',
    lastActiveAt: '2024-11-30T16:00:00Z',
    sessionsThisWeek: 0,
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '8',
    coachId: 'coach-1',
    firstName: 'Alexander',
    lastName: 'Lee',
    email: 'alexander.lee@example.com',
    status: 'active',
    subscriptionStatus: 'active',
    lastActiveAt: '2024-12-26T20:30:00Z',
    sessionsThisWeek: 4,
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-12-26T20:30:00Z',
  },
]

interface UseClientsOptions {
  status?: ClientStatus | 'all'
  search?: string
  page?: number
  pageSize?: number
}

async function fetchClients(
  options: UseClientsOptions = {}
): Promise<PaginatedResponse<Client>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const { status = 'all', search = '', page = 1, pageSize = 20 } = options

  let filtered = [...mockClients]

  // Filter by status
  if (status !== 'all') {
    filtered = filtered.filter((client) => client.status === status)
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(
      (client) =>
        client.firstName.toLowerCase().includes(searchLower) ||
        client.lastName.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower)
    )
  }

  // Sort by most recent activity
  filtered.sort((a, b) => {
    const dateA = new Date(a.lastActiveAt || a.createdAt).getTime()
    const dateB = new Date(b.lastActiveAt || b.createdAt).getTime()
    return dateB - dateA
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

export function useClients(options: UseClientsOptions = {}) {
  return useQuery({
    queryKey: ['clients', options],
    queryFn: () => fetchClients(options),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook for fetching a single client
async function fetchClient(clientId: string): Promise<Client | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockClients.find((c) => c.id === clientId) || null
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
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate creating a new pending client
  const newClient: Client = {
    id: `${mockClients.length + 1}`,
    coachId: 'coach-1',
    firstName: '',
    lastName: '',
    email: data.email,
    status: 'pending',
    subscriptionStatus: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockClients.push(newClient)
  return newClient
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
  await new Promise((resolve) => setTimeout(resolve, 500))

  const client = mockClients.find((c) => c.id === data.clientId)
  if (!client) {
    throw new Error('Client not found')
  }

  client.status = data.status
  client.updatedAt = new Date().toISOString()

  return client
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
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockClients.findIndex((c) => c.id === clientId)
  if (index !== -1) {
    mockClients.splice(index, 1)
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
