'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

const supabase = createClient()

interface UseTypingIndicatorOptions {
  coachClientId: string
  debounceMs?: number
}

interface TypingState {
  userId: string
  userName?: string
  isTyping: boolean
}

export function useTypingIndicator({ coachClientId, debounceMs = 3000 }: UseTypingIndicatorOptions) {
  const { user } = useAuth()
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingState>>(new Map())
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingBroadcast = useRef<number>(0)

  // Broadcast typing status
  const broadcastTyping = useCallback(async () => {
    if (!user?.id || !coachClientId) return

    const now = Date.now()
    // Throttle broadcasts to once per second
    if (now - lastTypingBroadcast.current < 1000) return
    lastTypingBroadcast.current = now

    const channel = supabase.channel(`typing:${coachClientId}`)
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user.id,
        userName: user.user_metadata?.first_name || user.email?.split('@')[0],
        isTyping: true,
      },
    })
  }, [user?.id, user?.email, user?.user_metadata?.first_name, coachClientId])

  // Handle user typing - call this when input changes
  const handleTyping = useCallback(() => {
    broadcastTyping()

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(async () => {
      if (!user?.id || !coachClientId) return
      const channel = supabase.channel(`typing:${coachClientId}`)
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: user.id,
          userName: user.user_metadata?.first_name || user.email?.split('@')[0],
          isTyping: false,
        },
      })
    }, debounceMs)
  }, [broadcastTyping, debounceMs, user?.id, user?.email, user?.user_metadata?.first_name, coachClientId])

  // Subscribe to typing events
  useEffect(() => {
    if (!coachClientId || !user?.id) return

    const channel = supabase
      .channel(`typing:${coachClientId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, userName, isTyping } = payload.payload as TypingState

        // Ignore our own typing events
        if (userId === user.id) return

        setTypingUsers((prev) => {
          const next = new Map(prev)
          if (isTyping) {
            next.set(userId, { userId, userName, isTyping: true })
          } else {
            next.delete(userId)
          }
          return next
        })
      })
      .subscribe()

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      supabase.removeChannel(channel)
    }
  }, [coachClientId, user?.id])

  // Get the first typing user (for display)
  const typingUser = Array.from(typingUsers.values())[0]

  return {
    handleTyping,
    isOtherUserTyping: typingUsers.size > 0,
    typingUserName: typingUser?.userName,
  }
}
