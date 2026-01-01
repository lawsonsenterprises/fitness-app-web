import { cn } from '@/lib/utils'
import type { MealPlanGoal } from '@/types'

interface MealPlanGoalBadgeProps {
  goal: MealPlanGoal | null | undefined
  size?: 'sm' | 'md'
}

const goalConfig: Record<MealPlanGoal, { label: string; className: string }> = {
  weight_loss: {
    label: 'Weight Loss',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  muscle_gain: {
    label: 'Muscle Gain',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  },
  performance: {
    label: 'Performance',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  health: {
    label: 'Health',
    className: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  },
  custom: {
    label: 'Custom',
    className: 'bg-muted text-muted-foreground border-border',
  },
}

const defaultConfig = {
  label: 'Custom',
  className: 'bg-muted text-muted-foreground border-border',
}

export function MealPlanGoalBadge({ goal, size = 'md' }: MealPlanGoalBadgeProps) {
  const config = goal ? goalConfig[goal] ?? defaultConfig : defaultConfig

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

// Alias for backwards compatibility
export function MealPlanTypeBadge({ goal, size }: { goal: MealPlanGoal | null | undefined; size?: 'sm' | 'md' }) {
  return <MealPlanGoalBadge goal={goal} size={size} />
}
