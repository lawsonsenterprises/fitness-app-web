'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Message, PaginatedResponse } from '@/types'

// Mock message data
const mockMessagesByClient: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      conversationId: 'conv-1',
      senderId: 'client-1',
      senderType: 'client',
      recipientId: 'coach-1',
      recipientType: 'coach',
      content: 'Hey Coach! Just finished my workout. Feeling great after that push session.',
      createdAt: '2024-12-27T14:30:00Z',
      readAt: '2024-12-27T14:35:00Z',
    },
    {
      id: '2',
      conversationId: 'conv-1',
      senderId: 'coach-1',
      senderType: 'coach',
      recipientId: 'client-1',
      recipientType: 'client',
      content: 'Excellent work! How did the bench press feel today? Did you manage to hit the rep target?',
      createdAt: '2024-12-27T14:36:00Z',
      readAt: '2024-12-27T14:40:00Z',
    },
    {
      id: '3',
      conversationId: 'conv-1',
      senderId: 'client-1',
      senderType: 'client',
      recipientId: 'coach-1',
      recipientType: 'coach',
      content: 'Yes! Actually hit 8 reps on the last set instead of the target 6. The deload week really helped.',
      createdAt: '2024-12-27T14:42:00Z',
      readAt: '2024-12-27T14:45:00Z',
    },
    {
      id: '4',
      conversationId: 'conv-1',
      senderId: 'coach-1',
      senderType: 'coach',
      recipientId: 'client-1',
      recipientType: 'client',
      content: "That's fantastic progress! We might need to bump up the weight next week. How's your recovery feeling?",
      createdAt: '2024-12-27T14:48:00Z',
      readAt: '2024-12-27T14:50:00Z',
    },
    {
      id: '5',
      conversationId: 'conv-1',
      senderId: 'client-1',
      senderType: 'client',
      recipientId: 'coach-1',
      recipientType: 'coach',
      content: "Recovery has been solid. Sleep is on point and I'm hitting my protein targets. Ready to push harder!",
      createdAt: '2024-12-27T14:52:00Z',
      readAt: null,
    },
  ],
  '2': [
    {
      id: '6',
      conversationId: 'conv-2',
      senderId: 'client-2',
      senderType: 'client',
      recipientId: 'coach-1',
      recipientType: 'coach',
      content: 'Morning Coach! Quick question about my macros for today.',
      createdAt: '2024-12-27T08:00:00Z',
      readAt: '2024-12-27T08:15:00Z',
    },
    {
      id: '7',
      conversationId: 'conv-2',
      senderId: 'coach-1',
      senderType: 'coach',
      recipientId: 'client-2',
      recipientType: 'client',
      content: "Morning James! What's the question?",
      createdAt: '2024-12-27T08:16:00Z',
      readAt: '2024-12-27T08:20:00Z',
    },
    {
      id: '8',
      conversationId: 'conv-2',
      senderId: 'client-2',
      senderType: 'client',
      recipientId: 'coach-1',
      recipientType: 'coach',
      content: "I've got a work dinner tonight. Any tips for staying on track?",
      createdAt: '2024-12-27T08:22:00Z',
      readAt: null,
    },
  ],
}

interface UseMessagesOptions {
  clientId: string
  page?: number
  pageSize?: number
}

async function fetchMessages(
  options: UseMessagesOptions
): Promise<PaginatedResponse<Message>> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { clientId, page = 1, pageSize = 50 } = options
  const messages = mockMessagesByClient[clientId] || []

  const total = messages.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const data = messages.slice(start, start + pageSize)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
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

async function sendMessage(data: SendMessageData): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversationId: `conv-${data.clientId}`,
    senderId: 'coach-1',
    senderType: 'coach',
    recipientId: data.clientId,
    recipientType: 'client',
    content: data.content,
    createdAt: new Date().toISOString(),
    readAt: null,
  }

  // Add to mock data
  if (!mockMessagesByClient[data.clientId]) {
    mockMessagesByClient[data.clientId] = []
  }
  mockMessagesByClient[data.clientId].push(newMessage)

  return newMessage
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

async function markMessagesRead(data: MarkReadData): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const messages = mockMessagesByClient[data.clientId] || []
  const now = new Date().toISOString()

  messages.forEach((msg) => {
    if (data.messageIds.includes(msg.id) && !msg.readAt) {
      msg.readAt = now
    }
  })
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
  await new Promise((resolve) => setTimeout(resolve, 100))

  const byClient: Record<string, number> = {}
  let total = 0

  Object.entries(mockMessagesByClient).forEach(([clientId, messages]) => {
    const unread = messages.filter(
      (msg) => msg.senderType === 'client' && !msg.readAt
    ).length
    if (unread > 0) {
      byClient[clientId] = unread
      total += unread
    }
  })

  return { total, byClient }
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })
}
