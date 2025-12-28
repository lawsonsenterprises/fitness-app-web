'use client'

import { Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isCoach: boolean
}

export function MessageBubble({ message, isCoach }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex',
        isCoach ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2.5',
          isCoach
            ? 'bg-amber-500 text-white'
            : 'bg-muted'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-xs',
            isCoach ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isCoach && (
            message.readAt ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )
          )}
        </div>
      </div>
    </div>
  )
}
