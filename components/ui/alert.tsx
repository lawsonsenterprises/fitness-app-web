import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/5',
        success:
          'border-emerald-500/50 text-emerald-700 dark:text-emerald-400 [&>svg]:text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20',
        warning:
          'border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600 bg-amber-50 dark:bg-amber-950/20',
        info: 'border-blue-500/50 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-600 bg-blue-50 dark:bg-blue-950/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const alertIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
}

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & { showIcon?: boolean }
>(({ className, variant = 'default', showIcon = true, children, ...props }, ref) => {
  const Icon = alertIcons[variant || 'default']

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      {children}
    </div>
  )
})
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
