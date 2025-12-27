import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface DashboardWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function DashboardWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: DashboardWidgetProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/10 hover:shadow-lg',
        className
      )}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/5 transition-transform duration-500 group-hover:scale-150" />

      {/* Icon */}
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-foreground" />
      </div>

      {/* Content */}
      <div className="relative">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight">{value}</span>
          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

interface WidgetGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
}

export function WidgetGrid({ children, columns = 4 }: WidgetGridProps) {
  const colClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4 lg:gap-6', colClasses[columns])}>
      {children}
    </div>
  )
}
