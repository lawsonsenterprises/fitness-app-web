'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Message, PaginatedResponse } from '@/types'

// TODO: Implement messages table in Supabase
// Currently no messaging system exists in the database

interface UseMessagesOptions {
  clientId: string
  page?: number
  pageSize?: number
}

async function fetchMessages(
  options: UseMessagesOptions
): Promise<PaginatedResponse<Message>> {
  // No messages table exists - return empty
  console.warn('Messages feature not implemented - no messages table in database')
  return {
    data: [],
    total: 0,
    page: options.page || 1,
    pageSize: options.pageSize || 50,
    totalPages: 0,
  }
}

export function useMessages(options: UseMessagesOptions) {
  return useQuery({
    queryKey: ['messages', options.clientId, options.page],
    queryFn: () => fetchMessages(options),
    enabled: !!options.clientId,
    staleTime: 10 * 1000,
  })
}

// Hook for sending a message
interface SendMessageData {
  clientId: string
  content: string
}

async function sendMessage(_data: SendMessageData): Promise<Message> {
  throw new Error('Message sending not implemented - no messages table in database')
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.clientId] })
    },
  })
}

// Hook for marking messages as read
interface MarkReadData {
  clientId: string
  messageIds: string[]
}

async function markMessagesRead(_data: MarkReadData): Promise<void> {
  console.warn('Mark messages read not implemented - no messages table in database')
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markMessagesRead,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.clientId] })
    },
  })
}

// Hook for getting unread message count
interface UnreadCount {
  total: number
  byClient: Record<string, number>
}

async function fetchUnreadCount(): Promise<UnreadCount> {
  // No messages table exists - return zero
  return { total: 0, byClient: {} }
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })
}
