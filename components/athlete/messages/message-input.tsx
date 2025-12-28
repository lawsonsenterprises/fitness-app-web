'use client'

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Paperclip,
  X,
  FileText,
} from 'lucide-react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'

interface Attachment {
  id: string
  name: string
  type: 'image' | 'file'
  preview?: string
  size: number
}

interface MessageInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

export function MessageInput({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  maxLength = 2000,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      setMessage(e.target.value)
      adjustTextareaHeight()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if ((trimmedMessage || attachments.length > 0) && !disabled) {
      onSend(trimmedMessage, attachments.length > 0 ? attachments : undefined)
      setMessage('')
      setAttachments([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments: Attachment[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined,
      size: file.size,
    }))
    setAttachments([...attachments, ...newAttachments])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const canSend = (message.trim() || attachments.length > 0) && !disabled

  return (
    <div className="border-t border-border bg-card p-4">
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                {attachment.type === 'image' && attachment.preview ? (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                    <NextImage
                      src={attachment.preview}
                      alt={attachment.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="max-w-32">
                      <p className="text-xs font-medium truncate">
                        {attachment.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border bg-background transition-colors',
          isFocused ? 'border-blue-500' : 'border-border'
        )}
      >
        {/* Attachment button */}
        <div className="flex items-center pl-2 pb-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        {/* Character count and send */}
        <div className="flex items-center gap-1 pr-2 pb-2.5">
          {message.length > maxLength * 0.8 && (
            <span
              className={cn(
                'text-xs',
                message.length >= maxLength
                  ? 'text-rose-500'
                  : 'text-muted-foreground'
              )}
            >
              {message.length}/{maxLength}
            </span>
          )}

          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'p-2 rounded-full transition-colors',
              canSend
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Typing hint */}
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}

export type { MessageInputProps, Attachment }
