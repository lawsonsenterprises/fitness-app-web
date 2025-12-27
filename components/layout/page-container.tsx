import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Whether to include header spacing (for pages with fixed header) */
  withHeaderOffset?: boolean
  /** Maximum width variant */
  size?: 'default' | 'narrow' | 'wide' | 'full'
  /** Background style */
  background?: 'default' | 'muted' | 'gradient'
}

const sizeClasses = {
  default: 'max-w-6xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
}

export function PageContainer({
  children,
  className,
  withHeaderOffset = true,
  size = 'default',
  background = 'default',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'relative min-h-screen',
        background === 'muted' && 'bg-muted/30',
        background === 'gradient' && 'bg-gradient-to-b from-muted/50 to-background'
      )}
    >
      {/* Subtle grid pattern overlay for depth */}
      {background === 'gradient' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      )}

      <div
        className={cn(
          'container relative mx-auto px-4 lg:px-8',
          sizeClasses[size],
          withHeaderOffset && 'pt-20 lg:pt-24',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Section component for dividing page content
 * Provides consistent vertical rhythm and optional decorative elements
 */
interface SectionProps {
  children: React.ReactNode
  className?: string
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  /** Add a top border with accent */
  withAccent?: boolean
}

const paddingClasses = {
  sm: 'py-8 lg:py-12',
  md: 'py-12 lg:py-16',
  lg: 'py-16 lg:py-24',
  xl: 'py-24 lg:py-32',
}

export function Section({
  children,
  className,
  padding = 'lg',
  withAccent = false,
}: SectionProps) {
  return (
    <section
      className={cn(
        'relative',
        paddingClasses[padding],
        withAccent && 'border-t border-border',
        className
      )}
    >
      {withAccent && (
        <div className="absolute left-0 top-0 h-px w-24 bg-gradient-to-r from-amber-500 to-transparent" />
      )}
      {children}
    </section>
  )
}

/**
 * Decorative element for visual interest
 * Can be positioned in corners of sections
 */
interface DecorativeAccentProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}

export function DecorativeAccent({
  position = 'top-right',
  className,
}: DecorativeAccentProps) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute h-32 w-32 opacity-50',
        positionClasses[position],
        className
      )}
      aria-hidden="true"
    >
      {/* Diagonal lines suggesting momentum */}
      <svg
        viewBox="0 0 128 128"
        fill="none"
        className="h-full w-full text-amber-500/20"
      >
        <line
          x1="0"
          y1="128"
          x2="128"
          y2="0"
          stroke="currentColor"
          strokeWidth="1"
        />
        <line
          x1="32"
          y1="128"
          x2="128"
          y2="32"
          stroke="currentColor"
          strokeWidth="1"
        />
        <line
          x1="64"
          y1="128"
          x2="128"
          y2="64"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}
