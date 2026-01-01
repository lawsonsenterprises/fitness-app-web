'use client'

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  onTyping?: () => void
  isSending?: boolean
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  onTyping,
  isSending = false,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [message])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    onTyping?.()
  }

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return

    const content = message.trim()
    setMessage('')
    await onSend(content)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Cmd/Ctrl + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border p-4">
      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled || isSending}
          className={cn(
            'flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm',
            'placeholder:text-muted-foreground',
            'focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
            'disabled:opacity-50'
          )}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending || disabled}
          className="h-auto bg-amber-500 px-4 text-white hover:bg-amber-600"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Press <kbd className="rounded bg-muted px-1">Cmd</kbd> +{' '}
        <kbd className="rounded bg-muted px-1">Enter</kbd> to send
      </p>
    </div>
  )
}
