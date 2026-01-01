import { CheckCircle2, Clock, Flag, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CheckInReviewStatus } from '@/types'

interface CheckInStatusBadgeProps {
  status: CheckInReviewStatus | null | undefined
  size?: 'sm' | 'md'
}

const statusConfig: Record<CheckInReviewStatus, {
  label: string
  icon: typeof CheckCircle2
  className: string
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  reviewed: {
    label: 'Reviewed',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  flagged: {
    label: 'Flagged',
    icon: Flag,
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'bg-muted text-muted-foreground border-border',
  },
}

const defaultConfig = {
  label: 'Unknown',
  icon: Clock,
  className: 'bg-muted text-muted-foreground border-border',
}

export function CheckInStatusBadge({ status, size = 'md' }: CheckInStatusBadgeProps) {
  const config = status ? statusConfig[status] ?? defaultConfig : defaultConfig
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {config.label}
    </span>
  )
}
