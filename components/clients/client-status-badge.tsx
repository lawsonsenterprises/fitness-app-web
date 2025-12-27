import { cn } from '@/lib/utils'
import type { ClientStatus } from '@/types'

interface ClientStatusBadgeProps {
  status: ClientStatus
  className?: string
}

const statusConfig: Record<
  ClientStatus,
  { label: string; className: string }
> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  archived: {
    label: 'Archived',
    className: 'bg-muted text-muted-foreground',
  },
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'active' && 'bg-emerald-500',
          status === 'pending' && 'bg-amber-500 animate-pulse',
          (status === 'inactive' || status === 'archived') && 'bg-muted-foreground'
        )}
      />
      {config.label}
    </span>
  )
}
