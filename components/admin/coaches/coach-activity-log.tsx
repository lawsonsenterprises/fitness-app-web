'use client'

import { motion } from 'framer-motion'
import {
  LogIn,
  MessageSquare,
  FileText,
  Users,
  Settings,
  CreditCard,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday } from 'date-fns'

type ActivityType =
  | 'login'
  | 'message_sent'
  | 'programme_created'
  | 'programme_updated'
  | 'client_added'
  | 'client_removed'
  | 'check_in_reviewed'
  | 'settings_updated'
  | 'subscription_changed'

interface ActivityItem {
  id: string
  type: ActivityType
  description: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface CoachActivityLogProps {
  activities: ActivityItem[]
  maxItems?: number
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  login: { icon: LogIn, color: 'text-blue-500' },
  message_sent: { icon: MessageSquare, color: 'text-violet-500' },
  programme_created: { icon: FileText, color: 'text-emerald-500' },
  programme_updated: { icon: FileText, color: 'text-cyan-500' },
  client_added: { icon: Users, color: 'text-emerald-500' },
  client_removed: { icon: Users, color: 'text-rose-500' },
  check_in_reviewed: { icon: Activity, color: 'text-orange-500' },
  settings_updated: { icon: Settings, color: 'text-slate-500' },
  subscription_changed: { icon: CreditCard, color: 'text-amber-500' },
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'd MMMM yyyy')
}

function groupByDate(activities: ActivityItem[]): Record<string, ActivityItem[]> {
  return activities.reduce((groups, activity) => {
    const dateKey = format(activity.timestamp, 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(activity)
    return groups
  }, {} as Record<string, ActivityItem[]>)
}

export function CoachActivityLog({
  activities,
  maxItems = 50,
}: CoachActivityLogProps) {
  const displayedActivities = activities.slice(0, maxItems)
  const groupedActivities = groupByDate(displayedActivities)
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => b.localeCompare(a))

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Activity className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No activity recorded</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Activity Log</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {activities.length} events recorded
        </p>
      </div>

      <div className="p-4 space-y-6">
        {sortedDates.map((dateKey) => {
          const dateActivities = groupedActivities[dateKey]
          const date = new Date(dateKey)

          return (
            <div key={dateKey}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {getDateLabel(date)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Activities for this date */}
              <div className="space-y-2">
                {dateActivities.map((activity, index) => {
                  const config = activityConfig[activity.type]
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        'shrink-0 p-1.5 rounded-lg',
                        config.color.replace('text-', 'bg-').replace('500', '500/10')
                      )}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(activity.timestamp, 'HH:mm')}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {activities.length > maxItems && (
        <div className="p-4 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Showing {maxItems} of {activities.length} events
          </p>
        </div>
      )}
    </div>
  )
}

export type { ActivityItem, ActivityType, CoachActivityLogProps }
