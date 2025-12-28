'use client'

import { motion } from 'framer-motion'
import {
  UserPlus,
  LogIn,
  CreditCard,
  AlertTriangle,
  Shield,
  Settings,
  MessageSquare,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

type EventType =
  | 'user_signup'
  | 'user_login'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'coach_suspended'
  | 'coach_activated'
  | 'settings_updated'
  | 'alert'
  | 'message'

interface ActivityEvent {
  id: string
  type: EventType
  title: string
  description?: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
    role?: 'coach' | 'athlete' | 'admin'
  }
  metadata?: Record<string, unknown>
}

interface ActivityFeedProps {
  events: ActivityEvent[]
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

const eventConfig: Record<EventType, { icon: LucideIcon; color: string; bg: string }> = {
  user_signup: { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  user_login: { icon: LogIn, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  subscription_created: { icon: CreditCard, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  subscription_cancelled: { icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  coach_suspended: { icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  coach_activated: { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  settings_updated: { icon: Settings, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  alert: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  message: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
}

function ActivityItem({ event, index }: { event: ActivityEvent; index: number }) {
  const config = eventConfig[event.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      {/* Icon */}
      <div className={cn('shrink-0 p-2 rounded-lg', config.bg)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{event.title}</p>
          {event.user && (
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded capitalize',
              event.user.role === 'admin' ? 'bg-rose-500/10 text-rose-600' :
              event.user.role === 'coach' ? 'bg-blue-500/10 text-blue-600' :
              'bg-emerald-500/10 text-emerald-600'
            )}>
              {event.user.role}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {event.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
        </p>
      </div>

      {/* User avatar if present */}
      {event.user && (
        <div className="shrink-0">
          {event.user.avatar ? (
            <img
              src={event.user.avatar}
              alt={event.user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {event.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export function ActivityFeed({
  events,
  maxItems = 10,
  showViewAll = true,
  onViewAll,
}: ActivityFeedProps) {
  const displayedEvents = events.slice(0, maxItems)

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <Activity className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-sm">No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Activity</h3>
        {events.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {events.length} events
          </span>
        )}
      </div>

      <div className="space-y-1">
        {displayedEvents.map((event, index) => (
          <ActivityItem key={event.id} event={event} index={index} />
        ))}
      </div>

      {showViewAll && events.length > maxItems && (
        <motion.button
          onClick={onViewAll}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all {events.length} events
        </motion.button>
      )}
    </div>
  )
}

export type { ActivityEvent, ActivityFeedProps, EventType }
