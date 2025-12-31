'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Notification, PaginatedResponse } from '@/types'

// TODO: Implement notifications table in Supabase
// Currently no notifications system exists in the database

interface UseNotificationsOptions {
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}

async function fetchNotifications(
  options: UseNotificationsOptions = {}
): Promise<PaginatedResponse<Notification>> {
  // No notifications table exists - return empty
  console.warn('Notifications feature not implemented - no notifications table in database')
  return {
    data: [],
    total: 0,
    page: options.page || 1,
    pageSize: options.pageSize || 20,
    totalPages: 0,
  }
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  return useQuery({
    queryKey: ['notifications', options],
    queryFn: () => fetchNotifications(options),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// Hook for unread count
async function fetchUnreadCount(): Promise<number> {
  // No notifications table exists - return 0
  return 0
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
async function markAsRead(_notificationId: string): Promise<void> {
  console.warn('Mark notification as read not implemented - no notifications table in database')
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
  console.warn('Mark all notifications as read not implemented - no notifications table in database')
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
