'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  MessageCircle,
  MoreVertical,
  Loader2,
  Check,
  CheckCheck,
  UserCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useCoachRelationship } from '@/hooks/athlete'
import {
  useMessages,
  useSendMessage,
  useMarkMessagesRead,
  useMessageSubscription,
} from '@/hooks/use-messages'

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get the athlete's coach relationship
  const { data: coachRelationship, isLoading: relationshipLoading } = useCoachRelationship(user?.id)

  // Get messages for this conversation
  const {
    data: messagesData,
    isLoading: messagesLoading,
  } = useMessages({
    coachClientId: coachRelationship?.id || '',
  })

  // Subscribe to realtime messages
  useMessageSubscription(coachRelationship?.id || '')

  // Send message mutation
  const sendMessageMutation = useSendMessage()

  // Mark messages as read
  const markReadMutation = useMarkMessagesRead()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesData?.data])

  // Mark messages as read when viewing
  useEffect(() => {
    if (coachRelationship?.id && messagesData?.data?.length) {
      const unreadMessages = messagesData.data.filter(
        m => !m.isRead && m.senderId !== user?.id
      )
      if (unreadMessages.length > 0) {
        markReadMutation.mutate({
          coachClientId: coachRelationship.id,
          messageIds: unreadMessages.map(m => m.id),
        })
      }
    }
  }, [coachRelationship?.id, messagesData?.data, user?.id, markReadMutation])

  const handleSend = async () => {
    if (!message.trim() || !coachRelationship?.id) return

    try {
      await sendMessageMutation.mutateAsync({
        coachClientId: coachRelationship.id,
        content: message.trim(),
        type: 'text',
      })
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Show loading state
  if (authLoading || relationshipLoading) {
    return (
      <div className="h-[calc(100vh-80px)] lg:h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // No coach assigned
  if (!coachRelationship) {
    return (
      <div className="h-[calc(100vh-80px)] lg:h-screen flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">No Coach Assigned</h2>
              <p className="text-xs text-muted-foreground">Connect with a coach to start messaging</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No Coach Connected</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You need to be connected with a coach to use messaging. Contact support if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const coach = coachRelationship.coach
  const coachName = coach?.displayName || 'Your Coach'
  const coachInitial = coachName.charAt(0).toUpperCase()
  const messages = messagesData?.data || []

  return (
    <div className="h-[calc(100vh-80px)] lg:h-screen flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {coach?.avatarUrl ? (
            <img
              src={coach.avatarUrl}
              alt={coachName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
              {coachInitial}
            </div>
          )}
          <div>
            <h2 className="font-semibold">{coachName}</h2>
            <p className="text-xs text-muted-foreground">Coach</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Start the Conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Send a message to {coachName} to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === user?.id
              const senderName = msg.sender?.displayName || (isOwnMessage ? 'You' : coachName)

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* Avatar */}
                  {!isOwnMessage && (
                    msg.sender?.avatarUrl ? (
                      <img
                        src={msg.sender.avatarUrl}
                        alt={senderName}
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-bold shrink-0">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2',
                      isOwnMessage
                        ? 'bg-amber-500 text-white rounded-tr-md'
                        : 'bg-muted rounded-tl-md'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1 text-xs',
                        isOwnMessage ? 'text-amber-100 justify-end' : 'text-muted-foreground'
                      )}
                    >
                      <span>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                      {isOwnMessage && (
                        msg.isRead ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" disabled>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0" disabled>
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="icon"
            className="shrink-0 bg-amber-500 hover:bg-amber-600"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
