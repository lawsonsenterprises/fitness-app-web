import { cn } from '@/lib/utils'
import type { MealPlanType } from '@/types'

interface MealPlanTypeBadgeProps {
  type: MealPlanType
  size?: 'sm' | 'md'
}

const typeConfig: Record<MealPlanType, { label: string; className: string }> = {
  cutting: {
    label: 'Cutting',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  bulking: {
    label: 'Bulking',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  },
  contest_prep: {
    label: 'Contest Prep',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
}

export function MealPlanTypeBadge({ type, size = 'md' }: MealPlanTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.maintenance

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      {config.label}
    </span>
  )
}
