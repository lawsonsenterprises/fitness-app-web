'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RatingSelector } from './rating-selector'
import { cn } from '@/lib/utils'

interface CoachFeedbackEditorProps {
  initialFeedback?: string
  initialRating?: number
  onSubmit: (feedback: string, rating: number) => Promise<void>
  isSubmitting?: boolean
}

export function CoachFeedbackEditor({
  initialFeedback = '',
  initialRating = 0,
  onSubmit,
  isSubmitting = false,
}: CoachFeedbackEditorProps) {
  const [feedback, setFeedback] = useState(initialFeedback)
  const [rating, setRating] = useState(initialRating)
  const [hasChanges, setHasChanges] = useState(false)

  const handleFeedbackChange = (value: string) => {
    setFeedback(value)
    setHasChanges(true)
  }

  const handleRatingChange = (value: number) => {
    setRating(value)
    setHasChanges(true)
  }

  const handleSubmit = async () => {
    if (!feedback.trim() || rating === 0) return
    await onSubmit(feedback.trim(), rating)
    setHasChanges(false)
  }

  const canSubmit = feedback.trim().length > 0 && rating > 0 && !isSubmitting

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Your Feedback</label>
          <span className="text-xs text-muted-foreground">
            {feedback.length}/1000
          </span>
        </div>
        <textarea
          value={feedback}
          onChange={(e) => handleFeedbackChange(e.target.value)}
          placeholder="Provide constructive feedback on this week's check-in..."
          rows={4}
          maxLength={1000}
          disabled={isSubmitting}
          className={cn(
            'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm',
            'placeholder:text-muted-foreground/60',
            'focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
            'disabled:opacity-50',
            'resize-none'
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="mb-2 block text-sm font-medium">Rating</label>
          <RatingSelector
            value={rating}
            onChange={handleRatingChange}
            disabled={isSubmitting}
            size="lg"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'group relative overflow-hidden bg-foreground text-background',
            'hover:bg-foreground/90'
          )}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {hasChanges ? 'Submit Review' : 'Mark as Reviewed'}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </Button>
      </div>
    </div>
  )
}
