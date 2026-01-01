'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, CoachMessageRow, PaginatedResponse } from '@/types'

const supabase = createClient()

// Transform database row to Message interface
function transformMessage(row: CoachMessageRow): Message {
  return {
    id: row.id,
    coachClientId: row.coach_client_id,
    senderId: row.sender_id,
    content: row.content,
    type: row.type ?? 'text',
    isRead: row.is_read ?? false,
    readAt: row.read_at,
    replyToId: row.reply_to_id,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sender: row.sender ? {
      id: row.sender.id,
      displayName: row.sender.display_name,
      avatarUrl: row.sender.avatar_url,
    } : undefined,
  }
}

interface UseMessagesOptions {
  coachClientId: string // The coach_clients.id for this conversation
  pageSize?: number
}

async function fetchMessages(
  options: UseMessagesOptions,
  page: number = 1
): Promise<PaginatedResponse<Message>> {
  const { coachClientId, pageSize = 50 } = options

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('coach_messages')
    .select(`
      *,
      sender:profiles!sender_id (
        id,
        display_name,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('coach_client_id', coachClientId)
    .or(`is_deleted_by_sender.is.null,is_deleted_by_sender.eq.false`)
    .or(`is_deleted_by_recipient.is.null,is_deleted_by_recipient.eq.false`)
    .order('created_at', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('Error fetching messages:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const messages = (data || []).map(row => transformMessage(row as CoachMessageRow))
  const total = count || 0

  return {
    data: messages,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export function useMessages(options: UseMessagesOptions) {
  return useQuery({
    queryKey: ['messages', options.coachClientId],
    queryFn: () => fetchMessages(options),
    enabled: !!options.coachClientId,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000, // Poll for new messages
  })
}

// Hook for infinite scroll messages
export function useInfiniteMessages(options: UseMessagesOptions) {
  return useInfiniteQuery({
    queryKey: ['messages', 'infinite', options.coachClientId],
    queryFn: ({ pageParam = 1 }) => fetchMessages(options, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    enabled: !!options.coachClientId,
    staleTime: 10 * 1000,
  })
}

// Hook for sending a message
interface SendMessageData {
  coachClientId: string
  content: string
  type?: Message['type']
  replyToId?: string
  metadata?: Record<string, unknown>
}

async function sendMessage(data: SendMessageData): Promise<Message> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data: newMessage, error } = await supabase
    .from('coach_messages')
    .insert({
      coach_client_id: data.coachClientId,
      sender_id: user.id,
      content: data.content,
      type: data.type || 'text',
      reply_to_id: data.replyToId,
      metadata: data.metadata,
      is_read: false,
    })
    .select(`
      *,
      sender:profiles!sender_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Error sending message:', error)
    throw new Error('Failed to send message')
  }

  return transformMessage(newMessage as CoachMessageRow)
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (message) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ queryKey: ['messages', message.coachClientId] })
      queryClient.invalidateQueries({ queryKey: ['messages', 'infinite', message.coachClientId] })
      // Update unread count
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    },
  })
}

// Hook for marking messages as read
interface MarkReadData {
  coachClientId: string
  messageIds?: string[] // If not provided, mark all unread as read
}

async function markMessagesRead(data: MarkReadData): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  let query = supabase
    .from('coach_messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('coach_client_id', data.coachClientId)
    .neq('sender_id', user.id) // Only mark messages we didn't send
    .eq('is_read', false)

  if (data.messageIds && data.messageIds.length > 0) {
    query = query.in('id', data.messageIds)
  }

  const { error } = await query

  if (error) {
    console.error('Error marking messages read:', error)
    throw new Error('Failed to mark messages as read')
  }
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markMessagesRead,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.coachClientId] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    },
  })
}

// Hook for getting unread message count
interface UnreadCount {
  total: number
  byConversation: Record<string, number> // coachClientId -> count
}

async function fetchUnreadCount(): Promise<UnreadCount> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { total: 0, byConversation: {} }
  }

  // Get all coach_clients relationships for this user
  const { data: relationships, error: relError } = await supabase
    .from('coach_clients')
    .select('id')
    .or(`coach_id.eq.${user.id},client_id.eq.${user.id}`)
    .eq('status', 'active')

  if (relError || !relationships) {
    console.error('Error fetching relationships:', relError)
    return { total: 0, byConversation: {} }
  }

  const relationshipIds = relationships.map(r => r.id)

  if (relationshipIds.length === 0) {
    return { total: 0, byConversation: {} }
  }

  // Get unread messages grouped by conversation
  const { data: unreadMessages, error } = await supabase
    .from('coach_messages')
    .select('id, coach_client_id')
    .in('coach_client_id', relationshipIds)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return { total: 0, byConversation: {} }
  }

  const byConversation: Record<string, number> = {}
  let total = 0

  for (const msg of unreadMessages || []) {
    byConversation[msg.coach_client_id] = (byConversation[msg.coach_client_id] || 0) + 1
    total++
  }

  return { total, byConversation }
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })
}

// Hook for realtime message subscription
export function useMessageSubscription(coachClientId: string) {
  const queryClient = useQueryClient()

  const handleNewMessage = useCallback((payload: { new: CoachMessageRow }) => {
    // Get the sender info
    const fetchSenderAndUpdate = async () => {
      const { data: sender } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', payload.new.sender_id)
        .single()

      const message = transformMessage({
        ...payload.new,
        sender: sender || undefined,
      })

      // Add to cache optimistically
      queryClient.setQueryData<PaginatedResponse<Message>>(
        ['messages', coachClientId],
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: [...old.data, message],
            total: old.total + 1,
          }
        }
      )

      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    }

    fetchSenderAndUpdate()
  }, [queryClient, coachClientId])

  useEffect(() => {
    if (!coachClientId) return

    const channel = supabase
      .channel(`messages:${coachClientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coach_messages',
          filter: `coach_client_id=eq.${coachClientId}`,
        },
        handleNewMessage
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [coachClientId, handleNewMessage])
}

// Hook for deleting a message (soft delete)
async function deleteMessage(messageId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Get the message to check if user is sender
  const { data: message, error: fetchError } = await supabase
    .from('coach_messages')
    .select('sender_id, coach_client_id')
    .eq('id', messageId)
    .single()

  if (fetchError || !message) {
    throw new Error('Message not found')
  }

  const isSender = message.sender_id === user.id
  const updateField = isSender ? 'is_deleted_by_sender' : 'is_deleted_by_recipient'

  const { error } = await supabase
    .from('coach_messages')
    .update({ [updateField]: true })
    .eq('id', messageId)

  if (error) {
    console.error('Error deleting message:', error)
    throw new Error('Failed to delete message')
  }
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      // Invalidate all message queries
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}
