'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'relative w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-2xl shadow-black/5',
        // Subtle inner glow
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/5 before:to-transparent',
        className
      )}
    >
      {/* Amber accent line at top */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      <div className="relative">{children}</div>
    </div>
  )
}

interface AuthCardHeaderProps {
  title: string
  description?: string
}

export function AuthCardHeader({ title, description }: AuthCardHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

interface AuthCardFooterProps {
  children: ReactNode
}

export function AuthCardFooter({ children }: AuthCardFooterProps) {
  return (
    <div className="mt-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}
