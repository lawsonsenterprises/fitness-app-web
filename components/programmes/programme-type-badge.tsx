import { cn } from '@/lib/utils'
import type { ProgrammeType, ProgrammeDifficulty } from '@/types'

interface ProgrammeTypeBadgeProps {
  type: ProgrammeType | null | undefined
  size?: 'sm' | 'md'
}

const typeConfig: Record<ProgrammeType, { label: string; className: string }> = {
  strength: {
    label: 'Strength',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  hypertrophy: {
    label: 'Hypertrophy',
    className: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  },
  endurance: {
    label: 'Endurance',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  },
  weight_loss: {
    label: 'Weight Loss',
    className: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  },
  sport_specific: {
    label: 'Sport Specific',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  rehabilitation: {
    label: 'Rehabilitation',
    className: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  },
  general_fitness: {
    label: 'General Fitness',
    className: 'bg-muted text-muted-foreground border-border',
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

export function ProgrammeTypeBadge({ type, size = 'md' }: ProgrammeTypeBadgeProps) {
  const config = type ? typeConfig[type] ?? defaultConfig : defaultConfig

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
  difficulty: ProgrammeDifficulty | null | undefined
  size?: 'sm' | 'md'
}

const difficultyConfig: Record<ProgrammeDifficulty, { dots: number; label: string }> = {
  beginner: { dots: 1, label: 'Beginner' },
  intermediate: { dots: 2, label: 'Intermediate' },
  advanced: { dots: 3, label: 'Advanced' },
  elite: { dots: 4, label: 'Elite' },
}

const defaultDifficultyConfig = { dots: 0, label: 'Unknown' }

export function DifficultyBadge({ difficulty, size = 'md' }: DifficultyBadgeProps) {
  const config = difficulty ? difficultyConfig[difficulty] ?? defaultDifficultyConfig : defaultDifficultyConfig

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((dot) => (
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
