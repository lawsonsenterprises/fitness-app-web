'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Notification, PaginatedResponse } from '@/types'

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    coachId: 'coach-1',
    type: 'check_in_submitted',
    title: 'New check-in from Emma Thompson',
    description: 'Emma has submitted her weekly check-in for review.',
    linkUrl: '/check-ins/1',
    isRead: false,
    createdAt: '2024-12-27T09:30:00Z',
  },
  {
    id: '2',
    coachId: 'coach-1',
    type: 'message_received',
    title: 'New message from James Wilson',
    description: 'James sent you a message about his nutrition plan.',
    linkUrl: '/clients/2/messages',
    isRead: false,
    createdAt: '2024-12-27T08:15:00Z',
  },
  {
    id: '3',
    coachId: 'coach-1',
    type: 'check_in_submitted',
    title: 'New check-in from Alexander Lee',
    description: 'Alexander has submitted his weekly check-in for review.',
    linkUrl: '/check-ins/5',
    isRead: false,
    createdAt: '2024-12-26T20:45:00Z',
  },
  {
    id: '4',
    coachId: 'coach-1',
    type: 'client_inactive',
    title: 'Olivia Martinez is inactive',
    description: 'Olivia has not logged in for 12 days.',
    linkUrl: '/clients/5',
    isRead: true,
    createdAt: '2024-12-25T10:00:00Z',
  },
  {
    id: '5',
    coachId: 'coach-1',
    type: 'client_accepted',
    title: 'Sophie Brown accepted your invitation',
    description: 'Sophie has joined as a new client.',
    linkUrl: '/clients/3',
    isRead: true,
    createdAt: '2024-12-24T14:30:00Z',
  },
]

interface UseNotificationsOptions {
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}

async function fetchNotifications(
  options: UseNotificationsOptions = {}
): Promise<PaginatedResponse<Notification>> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { unreadOnly = false, page = 1, pageSize = 20 } = options

  let filtered = [...mockNotifications]

  if (unreadOnly) {
    filtered = filtered.filter((n) => !n.isRead)
  }

  // Sort by newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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

export function useNotifications(options: UseNotificationsOptions = {}) {
  return useQuery({
    queryKey: ['notifications', options],
    queryFn: () => fetchNotifications(options),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refresh every minute
  })
}

// Hook for unread count
async function fetchUnreadCount(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockNotifications.filter((n) => !n.isRead).length
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notificationsUnreadCount'],
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })
}

// Hook for marking notification as read
async function markAsRead(notificationId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const notification = mockNotifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.isRead = true
  }
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] })
    },
  })
}

// Hook for marking all as read
async function markAllAsRead(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  mockNotifications.forEach((n) => {
    n.isRead = true
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] })
    },
  })
}
