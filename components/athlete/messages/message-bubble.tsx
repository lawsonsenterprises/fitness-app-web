'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Check, CheckCheck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface MessageBubbleProps {
  id: string
  content: string
  timestamp: Date
  isOwn: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  senderName?: string
  senderAvatar?: string
  showAvatar?: boolean
}

export function MessageBubble({
  content,
  timestamp,
  isOwn,
  status = 'sent',
  senderName,
  senderAvatar,
  showAvatar = true,
}: MessageBubbleProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-2 max-w-[80%]',
        isOwn ? 'ml-auto flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="shrink-0">
          {senderAvatar ? (
            <div className="relative h-8 w-8">
              <Image
                src={senderAvatar}
                alt={senderName || 'User'}
                fill
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {senderName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5',
          isOwn
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        {/* Sender name for group chats */}
        {!isOwn && senderName && (
          <p className="text-xs font-medium text-blue-600 mb-1">{senderName}</p>
        )}

        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>

        {/* Timestamp and status */}
        <div
          className={cn(
            'flex items-center gap-1.5 mt-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isOwn ? 'text-blue-200' : 'text-muted-foreground'
            )}
          >
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </motion.div>
  )
}

export type { MessageBubbleProps }
