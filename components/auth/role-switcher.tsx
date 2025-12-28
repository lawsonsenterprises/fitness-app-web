'use client'

import { useState } from 'react'
import { Dumbbell, ClipboardList, Shield, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/roles'
import { useAuth } from '@/contexts/auth-context'

const ROLE_ICONS = {
  athlete: Dumbbell,
  coach: ClipboardList,
  admin: Shield,
} as const

interface RoleSwitcherProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function RoleSwitcher({ className, variant = 'default' }: RoleSwitcherProps) {
  const { roles, activeRole, setActiveRole } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Don't render if user only has one role
  if (roles.length <= 1) {
    return null
  }

  const ActiveIcon = ROLE_ICONS[activeRole]

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg transition-colors',
          variant === 'default'
            ? 'px-3 py-2 bg-muted/50 hover:bg-muted'
            : 'px-2 py-1.5 hover:bg-muted/50',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/20'
        )}
      >
        <ActiveIcon className={cn(
          'text-amber-600',
          variant === 'default' ? 'h-4 w-4' : 'h-3.5 w-3.5'
        )} />
        <span className={cn(
          'font-medium',
          variant === 'default' ? 'text-sm' : 'text-xs'
        )}>
          {ROLE_LABELS[activeRole]}
        </span>
        <ChevronDown className={cn(
          'text-muted-foreground transition-transform',
          variant === 'default' ? 'h-4 w-4' : 'h-3 w-3',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-48 rounded-lg border border-border bg-card shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}>
            <div className="p-1">
              {roles.map((role) => {
                const Icon = ROLE_ICONS[role]
                const isActive = role === activeRole

                return (
                  <button
                    key={role}
                    onClick={() => {
                      setActiveRole(role)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                      'text-sm transition-colors',
                      isActive
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left font-medium">
                      {ROLE_LABELS[role]}
                    </span>
                    {isActive && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-border p-2">
              <p className="text-xs text-muted-foreground text-center">
                Switch between your roles
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
