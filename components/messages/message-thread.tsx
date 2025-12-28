'use client'

import { useRef, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'
import { TypingIndicator } from './typing-indicator'
import { useMessages, useSendMessage, useMarkMessagesRead } from '@/hooks/use-messages'
import type { Message } from '@/types'

interface MessageThreadProps {
  clientId: string
  clientName?: string
}

const EMPTY_MESSAGES: Message[] = []

export function MessageThread({ clientId, clientName }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messagesData, isLoading } = useMessages({ clientId })
  const sendMessage = useSendMessage()
  const markRead = useMarkMessagesRead()

  // Memoize the messages array to prevent reference changes
  const messages = useMemo(
    () => messagesData?.data ?? EMPTY_MESSAGES,
    [messagesData?.data]
  )

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    }, {} as Record<string, Message[]>)
  }, [messages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark unread client messages as read
  useEffect(() => {
    const unreadClientMessages = messages.filter(
      (msg) => msg.senderType === 'client' && !msg.readAt
    )
    if (unreadClientMessages.length > 0) {
      markRead.mutate({
        clientId,
        messageIds: unreadClientMessages.map((m) => m.id),
      })
    }
  }, [messages, clientId, markRead])

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage.mutateAsync({ clientId, content })
    } catch {
      toast.error('Failed to send message', {
        description: 'Please try again.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[500px] flex-col rounded-xl border border-border bg-card">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-300px)] min-h-[500px] flex-col rounded-xl border border-border bg-card">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start the conversation by sending a message below
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="mb-4 flex items-center justify-center">
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {date}
                </span>
              </div>

              {/* Messages for this date */}
              <div className="space-y-3">
                {dateMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCoach={message.senderType === 'coach'}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        <TypingIndicator isTyping={false} name={clientName} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput
        onSend={handleSendMessage}
        isSending={sendMessage.isPending}
      />
    </div>
  )
}
