'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingSelectorProps {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function RatingSelector({
  value,
  onChange,
  disabled = false,
  size = 'md',
}: RatingSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={cn(
            'transition-all duration-150',
            disabled
              ? 'cursor-default opacity-70'
              : 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            className={cn(
              sizes[size],
              star <= value
                ? 'fill-amber-500 text-amber-500'
                : 'text-muted-foreground hover:text-amber-400'
            )}
          />
        </button>
      ))}
    </div>
  )
}

interface RatingDisplayProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
}

export function RatingDisplay({ value, size = 'md' }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizes[size],
            star <= value
              ? 'fill-amber-500 text-amber-500'
              : 'text-muted'
          )}
        />
      ))}
    </div>
  )
}
