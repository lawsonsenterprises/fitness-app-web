import { CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CheckInStatus } from '@/types'

interface CheckInStatusBadgeProps {
  status: CheckInStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<CheckInStatus, {
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
}

export function CheckInStatusBadge({ status, size = 'md' }: CheckInStatusBadgeProps) {
  const config = statusConfig[status]
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
