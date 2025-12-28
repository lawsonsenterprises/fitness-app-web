'use client'

import Link from 'next/link'
import {
  ClipboardCheck,
  MessageSquare,
  UserCheck,
  AlertCircle,
  Clock,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onClick?: () => void
}

const typeConfig = {
  check_in_submitted: {
    icon: ClipboardCheck,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  message_received: {
    icon: MessageSquare,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  client_accepted: {
    icon: UserCheck,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  client_inactive: {
    icon: AlertCircle,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const config = typeConfig[notification.type as keyof typeof typeConfig] || {
    icon: Clock,
    iconColor: 'text-muted-foreground',
    bgColor: 'bg-muted',
  }

  const Icon = config.icon

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    onClick?.()
  }

  return (
    <Link
      href={notification.linkUrl || '#'}
      onClick={handleClick}
      className={cn(
        'group flex gap-3 px-4 py-3 transition-colors',
        'hover:bg-muted/50',
        !notification.isRead && 'bg-amber-500/5'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          config.bgColor
        )}
      >
        <Icon className={cn('h-5 w-5', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-snug',
              !notification.isRead ? 'font-medium' : 'text-muted-foreground'
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          )}
        </div>
        {notification.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {notification.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/70">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>
    </Link>
  )
}
