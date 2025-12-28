'use client'

import { cn } from '@/lib/utils'
import type { ClientStatus, SubscriptionStatus } from '@/types'

interface ClientStatusBadgeProps {
  status: ClientStatus
  className?: string
}

const statusConfig: Record<
  ClientStatus,
  { label: string; className: string; dotClass: string }
> = {
  active: {
    label: 'Active',
    className:
      'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className:
      'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  paused: {
    label: 'Paused',
    className:
      'bg-orange-500/10 text-orange-600 ring-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400',
    dotClass: 'bg-orange-500',
  },
  ended: {
    label: 'Ended',
    className:
      'bg-zinc-500/10 text-zinc-500 ring-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-400',
    dotClass: 'bg-zinc-400',
  },
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-all',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}

interface SubscriptionBadgeProps {
  status?: SubscriptionStatus
  className?: string
}

const subscriptionConfig: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  active: {
    label: 'Subscribed',
    className: 'bg-foreground/5 text-foreground/70 ring-foreground/10',
  },
  trial: {
    label: 'Trial',
    className: 'bg-blue-500/10 text-blue-600 ring-blue-500/20',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-500/10 text-red-600 ring-red-500/20',
  },
  expired: {
    label: 'Expired',
    className: 'bg-zinc-500/10 text-zinc-500 ring-zinc-500/20',
  },
  none: {
    label: 'None',
    className: 'bg-zinc-500/10 text-zinc-500 ring-zinc-500/20',
  },
}

export function SubscriptionBadge({ status, className }: SubscriptionBadgeProps) {
  if (!status || status === 'none') return null

  const config = subscriptionConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
