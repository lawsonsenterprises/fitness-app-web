'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare,
  User,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoachFeedback {
  id: string
  coachName: string
  coachAvatar?: string
  date: Date
  message: string
  sentiment?: 'positive' | 'neutral' | 'needs-attention'
  actionItems?: string[]
  goalsUpdate?: {
    current: string
    next: string
  }
}

interface CoachFeedbackDisplayProps {
  feedback: CoachFeedback
}

const sentimentConfig = {
  positive: {
    icon: ThumbsUp,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    label: 'Great progress!',
  },
  neutral: {
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'Feedback',
  },
  'needs-attention': {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: 'Needs attention',
  },
}

export function CoachFeedbackDisplay({ feedback }: CoachFeedbackDisplayProps) {
  const config = sentimentConfig[feedback.sentiment || 'neutral']
  const SentimentIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border overflow-hidden',
        config.borderColor
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center justify-between p-4', config.bgColor)}>
        <div className="flex items-center gap-3">
          {feedback.coachAvatar ? (
            <img
              src={feedback.coachAvatar}
              alt={feedback.coachName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-semibold">{feedback.coachName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(feedback.date, { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1',
          config.bgColor.replace('/10', '/20')
        )}>
          <SentimentIcon className={cn('h-4 w-4', config.color)} />
          <span className={cn('text-xs font-medium', config.color)}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Message */}
      <div className="p-4 bg-card">
        <p className="text-foreground whitespace-pre-wrap">{feedback.message}</p>
      </div>

      {/* Action items */}
      {feedback.actionItems && feedback.actionItems.length > 0 && (
        <div className="border-t border-border p-4 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600">Action Items</span>
          </div>
          <ul className="space-y-2">
            {feedback.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-medium text-amber-600">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Goals update */}
      {feedback.goalsUpdate && (
        <div className="border-t border-border p-4 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">Goals Update</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Focus</p>
              <p className="text-sm font-medium">{feedback.goalsUpdate.current}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Next Milestone</p>
              <p className="text-sm font-medium">{feedback.goalsUpdate.next}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export type { CoachFeedback }
