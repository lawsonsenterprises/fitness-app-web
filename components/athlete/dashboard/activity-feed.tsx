'use client'

import { motion } from 'framer-motion'
import {
  Dumbbell,
  UtensilsCrossed,
  ClipboardCheck,
  Scale,
  MessageSquare,
  Trophy,
  Heart,
  Droplets,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

type ActivityType =
  | 'workout'
  | 'meal'
  | 'check-in'
  | 'weight'
  | 'message'
  | 'pr'
  | 'recovery'
  | 'blood-work'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface ActivityFeedProps {
  activities: Activity[]
  isLoading?: boolean
  maxItems?: number
}

const activityConfig: Record<
  ActivityType,
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  workout: {
    icon: Dumbbell,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  meal: {
    icon: UtensilsCrossed,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  'check-in': {
    icon: ClipboardCheck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  weight: {
    icon: Scale,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  message: {
    icon: MessageSquare,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
  pr: {
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  recovery: {
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
  'blood-work': {
    icon: Droplets,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
}

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const config = activityConfig[activity.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
      className="group relative flex items-start gap-3 py-3"
    >
      {/* Timeline line */}
      {index < 4 && (
        <div className="absolute left-5 top-12 h-full w-px bg-border" />
      )}

      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          config.bgColor,
          'ring-4 ring-background'
        )}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
      </motion.div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-medium leading-tight">{activity.title}</p>
        {activity.description && (
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
            {activity.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
        </p>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-0 -mx-2 rounded-lg bg-muted/50 opacity-0 transition-opacity group-hover:opacity-100" style={{ zIndex: -1 }} />
    </motion.div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function ActivityFeed({
  activities,
  isLoading = false,
  maxItems = 5,
}: ActivityFeedProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      </motion.div>
    )
  }

  const displayedActivities = activities.slice(0, maxItems)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Recent Activity
      </h3>

      {displayedActivities.length > 0 ? (
        <div className="relative">
          {displayedActivities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No recent activity</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Start logging workouts and meals to see your activity here
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Export activity type for use in other components
export type { Activity, ActivityType }
