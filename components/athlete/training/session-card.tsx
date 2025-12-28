'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Play, Clock, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  id: string
  dayName: string
  sessionName: string
  exerciseCount: number
  status: 'not-started' | 'in-progress' | 'completed'
  duration?: number
  totalVolume?: number
  onClick?: () => void
  delay?: number
}

const statusConfig = {
  'not-started': {
    icon: Circle,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-border',
    badge: 'Not Started',
    badgeColor: 'bg-muted text-muted-foreground',
  },
  'in-progress': {
    icon: Play,
    color: 'text-amber-500',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/30',
    badge: 'In Progress',
    badgeColor: 'bg-amber-500/10 text-amber-600',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/30',
    badge: 'Completed',
    badgeColor: 'bg-emerald-500/10 text-emerald-600',
  },
}

export function SessionCard({
  dayName,
  sessionName,
  exerciseCount,
  status,
  duration,
  totalVolume,
  onClick,
  delay = 0,
}: SessionCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-all',
        config.bg,
        config.border,
        'hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              status === 'completed' && 'bg-emerald-500/20',
              status === 'in-progress' && 'bg-amber-500/20',
              status === 'not-started' && 'bg-muted'
            )}
          >
            <StatusIcon className={cn('h-5 w-5', config.color)} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {dayName}
            </p>
            <p className="font-semibold">{sessionName}</p>
          </div>
        </div>

        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config.badgeColor)}>
          {config.badge}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Dumbbell className="h-3 w-3" />
          {exerciseCount} exercises
        </span>
        {status === 'completed' && duration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration} min
          </span>
        )}
        {status === 'completed' && totalVolume && (
          <span>{totalVolume.toLocaleString()} kg</span>
        )}
      </div>
    </motion.button>
  )
}
