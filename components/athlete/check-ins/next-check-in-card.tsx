'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns'
import {
  ClipboardCheck,
  Clock,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Bell,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NextCheckInCardProps {
  dueDate: Date
  frequency: 'daily' | 'weekly' | 'fortnightly' | 'monthly'
  lastCheckInDate?: Date
  streak?: number
  href?: string
}

export function NextCheckInCard({
  dueDate,
  frequency,
  lastCheckInDate,
  streak = 0,
  href = '/athlete/check-ins/new',
}: NextCheckInCardProps) {
  const now = new Date()
  const daysUntil = differenceInDays(dueDate, now)
  const hoursUntil = differenceInHours(dueDate, now)
  const isOverdue = dueDate < now
  const isDueSoon = daysUntil <= 1 && !isOverdue

  const getStatusConfig = () => {
    if (isOverdue) {
      return {
        color: 'text-rose-600',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30',
        icon: AlertTriangle,
        label: 'Overdue',
        message: `Was due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
      }
    }
    if (isDueSoon) {
      return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        icon: Bell,
        label: 'Due Soon',
        message: hoursUntil <= 0 ? 'Due now!' : `Due in ${hoursUntil} hours`,
      }
    }
    return {
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      icon: Clock,
      label: 'Upcoming',
      message: `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  const frequencyLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    fortnightly: 'Fortnightly',
    monthly: 'Monthly',
  }

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
      <div className={cn('p-4', config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              config.bgColor.replace('/10', '/20')
            )}>
              <ClipboardCheck className={cn('h-6 w-6', config.color)} />
            </div>
            <div>
              <h3 className="font-semibold">Check-In</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className={cn('flex items-center gap-1', config.color)}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {config.label}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{frequencyLabels[frequency]}</span>
              </div>
            </div>
          </div>

          {/* Streak badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1">
              <span className="text-lg">🔥</span>
              <span className="font-semibold text-amber-600">{streak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={cn('text-2xl font-bold', config.color)}>
              {config.message}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              {dueDate.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>

        {/* Last check-in info */}
        {lastCheckInDate && (
          <p className="text-sm text-muted-foreground mb-4">
            Last check-in: {formatDistanceToNow(lastCheckInDate, { addSuffix: true })}
          </p>
        )}

        {/* CTA Button */}
        <Link
          href={href}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors',
            isOverdue || isDueSoon
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-foreground text-background hover:bg-foreground/90'
          )}
        >
          Start Check-In
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  )
}
