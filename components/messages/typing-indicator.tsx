'use client'

import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  isTyping: boolean
  name?: string
}

export function TypingIndicator({ isTyping, name }: TypingIndicatorProps) {
  if (!isTyping) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span
          className={cn(
            'h-2 w-2 animate-bounce rounded-full bg-muted-foreground',
            '[animation-delay:0ms]'
          )}
        />
        <span
          className={cn(
            'h-2 w-2 animate-bounce rounded-full bg-muted-foreground',
            '[animation-delay:150ms]'
          )}
        />
        <span
          className={cn(
            'h-2 w-2 animate-bounce rounded-full bg-muted-foreground',
            '[animation-delay:300ms]'
          )}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {name ? `${name} is typing...` : 'typing...'}
      </span>
    </div>
  )
}
