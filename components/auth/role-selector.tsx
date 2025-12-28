'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, ClipboardList, Shield, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type UserRole, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_ROUTES } from '@/lib/roles'
import { useAuth } from '@/contexts/auth-context'

const ROLE_ICONS = {
  athlete: Dumbbell,
  coach: ClipboardList,
  admin: Shield,
} as const

interface RoleSelectorProps {
  className?: string
}

export function RoleSelector({ className }: RoleSelectorProps) {
  const { roles, setActiveRole } = useAuth()
  const router = useRouter()
  const [isSelecting, setIsSelecting] = useState<UserRole | null>(null)

  const handleSelectRole = async (role: UserRole) => {
    setIsSelecting(role)
    try {
      setActiveRole(role)
      router.push(ROLE_ROUTES[role])
    } finally {
      setIsSelecting(null)
    }
  }

  if (roles.length <= 1) {
    return null
  }

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Choose your view</h2>
        <p className="text-muted-foreground mt-2">
          You have access to multiple roles. Select one to continue.
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => {
          const Icon = ROLE_ICONS[role]
          const isLoading = isSelecting === role

          return (
            <button
              key={role}
              onClick={() => handleSelectRole(role)}
              disabled={isSelecting !== null}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card',
                'transition-all duration-200',
                'hover:border-amber-500/50 hover:bg-amber-500/5',
                'focus:outline-none focus:ring-2 focus:ring-amber-500/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'group'
              )}
            >
              <div className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                'bg-gradient-to-br from-amber-500/20 to-amber-600/10',
                'group-hover:from-amber-500/30 group-hover:to-amber-600/20',
                'transition-all duration-200'
              )}>
                <Icon className="h-6 w-6 text-amber-600" />
              </div>

              <div className="flex-1 text-left">
                <h3 className="font-semibold">{ROLE_LABELS[role]}</h3>
                <p className="text-sm text-muted-foreground">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>

              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
