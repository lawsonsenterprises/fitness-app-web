'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  Scale,
  Dumbbell,
  Utensils,
  MessageSquare,
  FileText,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

type AthleteActivityType =
  | 'check_in'
  | 'weight_logged'
  | 'workout_completed'
  | 'meal_logged'
  | 'message_sent'
  | 'programme_started'
  | 'goal_achieved'

interface AthleteActivityItem {
  id: string
  type: AthleteActivityType
  description: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface AthleteActivityProps {
  activities: AthleteActivityItem[]
  maxItems?: number
}

const activityConfig: Record<AthleteActivityType, { icon: LucideIcon; color: string }> = {
  check_in: { icon: Activity, color: 'text-blue-500' },
  weight_logged: { icon: Scale, color: 'text-violet-500' },
  workout_completed: { icon: Dumbbell, color: 'text-orange-500' },
  meal_logged: { icon: Utensils, color: 'text-emerald-500' },
  message_sent: { icon: MessageSquare, color: 'text-cyan-500' },
  programme_started: { icon: FileText, color: 'text-indigo-500' },
  goal_achieved: { icon: Target, color: 'text-amber-500' },
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'd MMMM yyyy')
}

function groupByDate(activities: AthleteActivityItem[]): Record<string, AthleteActivityItem[]> {
  return activities.reduce((groups, activity) => {
    const dateKey = format(activity.timestamp, 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(activity)
    return groups
  }, {} as Record<string, AthleteActivityItem[]>)
}

export function AthleteActivity({
  activities,
  maxItems = 30,
}: AthleteActivityProps) {
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
        <h3 className="font-semibold">Activity History</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {activities.length} activities recorded
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
                <span className="text-xs text-muted-foreground">
                  {dateActivities.length} events
                </span>
              </div>

              {/* Activities for this date */}
              <div className="space-y-2 relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

                {dateActivities.map((activity, index) => {
                  const config = activityConfig[activity.type]
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-start gap-3 relative"
                    >
                      <div className={cn(
                        'shrink-0 p-1.5 rounded-full z-10 bg-card',
                        config.color.replace('text-', 'bg-').replace('500', '500/10')
                      )}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
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
            Showing {maxItems} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  )
}

export type { AthleteActivityItem, AthleteActivityType, AthleteActivityProps }
