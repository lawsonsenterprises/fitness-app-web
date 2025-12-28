'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Paperclip,
  ImageIcon,
  Smile,
  Check,
  CheckCheck,
  Clock,
  ChevronDown,
  Phone,
  Video,
  Info,
} from 'lucide-react'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read'
  attachments?: {
    id: string
    type: 'image' | 'file'
    url: string
    name: string
    size?: number
  }[]
}

interface Participant {
  id: string
  name: string
  avatar?: string
  role: 'coach' | 'athlete' | 'admin'
  isOnline?: boolean
  lastSeen?: Date
}

interface MessageThreadProps {
  messages: Message[]
  participants: Participant[]
  currentUserId: string
  onSendMessage: (content: string, attachments?: File[]) => void
  onLoadMore?: () => void
  hasMoreMessages?: boolean
  isLoading?: boolean
  showHeader?: boolean
  showTypingIndicator?: boolean
  typingUsers?: string[]
  className?: string
}

export function MessageThread({
  messages,
  participants,
  currentUserId,
  onSendMessage,
  onLoadMore,
  hasMoreMessages = false,
  isLoading = false,
  showHeader = true,
  showTypingIndicator = false,
  typingUsers = [],
  className,
}: MessageThreadProps) {
  const [inputValue, setInputValue] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const otherParticipant = participants.find((p) => p.id !== currentUserId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAtBottom])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100
    setIsAtBottom(isBottom)

    // Load more when scrolling to top
    if (target.scrollTop === 0 && hasMoreMessages && onLoadMore) {
      onLoadMore()
    }
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    onSendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsAtBottom(true)
  }

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'EEEE, d MMMM')
  }

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
  }

  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = format(message.timestamp, 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className={cn('flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden', className)}>
      {/* Header */}
      {showHeader && otherParticipant && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium overflow-hidden">
                {otherParticipant.avatar ? (
                  <Image
                    src={otherParticipant.avatar}
                    alt={otherParticipant.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  otherParticipant.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                )}
              </div>
              {otherParticipant.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
              )}
            </div>
            <div>
              <p className="font-semibold">{otherParticipant.name}</p>
              <p className="text-xs text-muted-foreground">
                {otherParticipant.isOnline
                  ? 'Online'
                  : otherParticipant.lastSeen
                    ? `Last seen ${formatDistanceToNow(otherParticipant.lastSeen, { addSuffix: true })}`
                    : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Video className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Info className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Load more button */}
        {hasMoreMessages && (
          <div className="flex justify-center">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {/* Messages grouped by date */}
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">
                {formatMessageDate(new Date(date))}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {dateMessages.map((message, idx) => {
                const isOwn = message.senderId === currentUserId
                const sender = participants.find((p) => p.id === message.senderId)
                const showAvatar =
                  !isOwn &&
                  (idx === 0 || dateMessages[idx - 1]?.senderId !== message.senderId)

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-2', isOwn ? 'justify-end' : 'justify-start')}
                  >
                    {/* Avatar (for other's messages) */}
                    {!isOwn && (
                      <div className="w-8 shrink-0">
                        {showAvatar && sender && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-medium">
                            {sender.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2.5',
                        isOwn
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      )}
                    >
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id}>
                              {attachment.type === 'image' ? (
                                <Image
                                  src={attachment.url}
                                  alt={attachment.name}
                                  width={300}
                                  height={200}
                                  className="rounded-lg max-w-full h-auto"
                                />
                              ) : (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/10">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm truncate">{attachment.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* Time and status */}
                      <div
                        className={cn(
                          'flex items-center gap-1.5 mt-1',
                          isOwn ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <span
                          className={cn(
                            'text-[10px]',
                            isOwn ? 'text-white/70' : 'text-muted-foreground'
                          )}
                        >
                          {format(message.timestamp, 'HH:mm')}
                        </span>
                        {isOwn && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {showTypingIndicator && typingUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <div className="flex gap-1">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                />
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                />
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 p-2 rounded-full bg-foreground text-background shadow-lg hover:bg-foreground/90 transition-colors"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-end gap-2">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 resize-none transition-colors"
              style={{ maxHeight: 120 }}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              'p-2.5 rounded-xl transition-colors shrink-0',
              inputValue.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export type { Message, Participant, MessageThreadProps }
