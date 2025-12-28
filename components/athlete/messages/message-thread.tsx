'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  ArrowDown,
  Loader2,
  MessageCircle,
} from 'lucide-react'
import { MessageBubble } from './message-bubble'
import { MessageInput, type Attachment } from './message-input'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'

interface Message {
  id: string
  content: string
  timestamp: Date
  senderId: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

interface Participant {
  id: string
  name: string
  avatar?: string
  isOnline?: boolean
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
  participant: Participant
  onSendMessage: (content: string, attachments?: Attachment[]) => void
  onLoadMore?: () => void
  isLoading?: boolean
  hasMore?: boolean
  typingIndicator?: boolean
}

function DateDivider({ date }: { date: Date }) {
  const getDateLabel = () => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'd MMMM yyyy')
  }

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">
        {getDateLabel()}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function TypingIndicator({ participant }: { participant: Participant }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4"
    >
      {participant.avatar ? (
        <div className="relative h-6 w-6">
          <Image
            src={participant.avatar}
            alt={participant.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
      ) : (
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-white">
            {participant.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1.5">
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
        />
      </div>
    </motion.div>
  )
}

export function MessageThread({
  messages,
  currentUserId,
  participant,
  onSendMessage,
  onLoadMore,
  isLoading = false,
  hasMore = false,
  typingIndicator = false,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)

  // Scroll to bottom on new messages (if already near bottom)
  useEffect(() => {
    if (isNearBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isNearBottom])

  // Handle scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      setIsNearBottom(distanceFromBottom < 100)
      setShowScrollButton(distanceFromBottom > 300)

      // Load more when near top
      if (scrollTop < 100 && hasMore && !isLoading && onLoadMore) {
        onLoadMore()
      }
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce<{
    date: Date
    messages: Message[]
  }[]>((groups, message) => {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && isSameDay(lastGroup.date, message.timestamp)) {
      lastGroup.messages.push(message)
    } else {
      groups.push({ date: message.timestamp, messages: [message] })
    }
    return groups
  }, [])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="font-semibold text-lg">Start a conversation</h3>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Send a message to {participant.name} to get started
          </p>
        </div>
        <MessageInput
          onSend={onSendMessage}
          placeholder={`Message ${participant.name}...`}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="shrink-0 border-b border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {participant.avatar ? (
              <div className="relative h-10 w-10">
                <Image
                  src={participant.avatar}
                  alt={participant.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {participant.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{participant.name}</h3>
            <p className="text-xs text-muted-foreground">
              {participant.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {/* Load more indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Messages grouped by date */}
        {groupedMessages.map((group) => (
          <div key={group.date.toISOString()}>
            <DateDivider date={group.date} />
            <div className="space-y-2">
              {group.messages.map((message, messageIndex) => {
                const isOwn = message.senderId === currentUserId
                const prevMessage = group.messages[messageIndex - 1]
                const showAvatar =
                  !isOwn &&
                  (!prevMessage || prevMessage.senderId !== message.senderId)

                return (
                  <MessageBubble
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    timestamp={message.timestamp}
                    isOwn={isOwn}
                    status={message.status}
                    senderName={isOwn ? undefined : participant.name}
                    senderAvatar={isOwn ? undefined : participant.avatar}
                    showAvatar={showAvatar}
                  />
                )
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {typingIndicator && <TypingIndicator participant={participant} />}
        </AnimatePresence>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 h-10 w-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Message input */}
      <MessageInput
        onSend={onSendMessage}
        placeholder={`Message ${participant.name}...`}
      />
    </div>
  )
}

export type { Message, Participant, MessageThreadProps }
