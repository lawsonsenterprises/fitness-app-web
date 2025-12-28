import { cn } from '@/lib/utils'
import type { Programme } from '@/types'

interface ProgrammeTypeBadgeProps {
  type: Programme['type']
  size?: 'sm' | 'md'
}

const typeConfig: Record<Programme['type'], { label: string; className: string }> = {
  hypertrophy: {
    label: 'Hypertrophy',
    className: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  },
  strength: {
    label: 'Strength',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  powerlifting: {
    label: 'Powerlifting',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  conditioning: {
    label: 'Conditioning',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  },
  mobility: {
    label: 'Mobility',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  custom: {
    label: 'Custom',
    className: 'bg-muted text-muted-foreground border-border',
  },
}

export function ProgrammeTypeBadge({ type, size = 'md' }: ProgrammeTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.custom

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium capitalize',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      {config.label}
    </span>
  )
}

interface DifficultyBadgeProps {
  difficulty: Programme['difficulty']
  size?: 'sm' | 'md'
}

export function DifficultyBadge({ difficulty, size = 'md' }: DifficultyBadgeProps) {
  const difficultyConfig: Record<Programme['difficulty'], { dots: number; label: string }> = {
    beginner: { dots: 1, label: 'Beginner' },
    intermediate: { dots: 2, label: 'Intermediate' },
    advanced: { dots: 3, label: 'Advanced' },
  }

  const config = difficultyConfig[difficulty]

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={cn(
              'rounded-full',
              size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
              dot <= config.dots
                ? 'bg-amber-500'
                : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className={cn(
        'text-muted-foreground capitalize',
        size === 'sm' ? 'text-xs' : 'text-xs'
      )}>
        {config.label}
      </span>
    </div>
  )
}
