'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, ClipboardList, Shield, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { type UserRole, ROLE_ROUTES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/roles'
import { cn } from '@/lib/utils'

const roleConfig: Record<UserRole, {
  icon: typeof Dumbbell
  gradient: string
  bgGlow: string
  borderColor: string
  iconBg: string
}> = {
  athlete: {
    icon: Dumbbell,
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
    iconBg: 'bg-amber-500/10',
  },
  coach: {
    icon: ClipboardList,
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
    iconBg: 'bg-emerald-500/10',
  },
  admin: {
    icon: Shield,
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'bg-violet-500/20',
    borderColor: 'border-violet-500/30 hover:border-violet-500/60',
    iconBg: 'bg-violet-500/10',
  },
}

export default function SelectRolePage() {
  const { user, roles, setActiveRole, isLoading } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // No longer auto-redirect for single role - always show selector

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role)
    setIsTransitioning(true)

    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 400))

    setActiveRole(role)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  const firstName = user?.user_metadata?.first_name || 'there'

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-violet-500/5 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-foreground to-foreground/80"
          >
            <Sparkles className="h-8 w-8 text-background" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-3xl font-bold tracking-tight md:text-4xl"
          >
            Welcome back, {firstName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground"
          >
            Choose how you&apos;d like to use Synced Momentum today
          </motion.p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <AnimatePresence mode="wait">
            {roles.map((role, index) => {
              const config = roleConfig[role]
              const Icon = config.icon
              const isSelected = selectedRole === role

              return (
                <motion.button
                  key={role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isTransitioning && !isSelected ? 0.3 : 1,
                    y: 0,
                    scale: isSelected ? 1.02 : 1,
                  }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => handleRoleSelect(role)}
                  disabled={isTransitioning}
                  className={cn(
                    'group relative flex flex-col items-center rounded-2xl border-2 bg-card p-8 text-center transition-all duration-300',
                    config.borderColor,
                    isSelected && 'border-foreground shadow-xl',
                    !isTransitioning && 'hover:scale-[1.02] hover:shadow-lg'
                  )}
                >
                  {/* Glow effect */}
                  <div className={cn(
                    'absolute -inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300',
                    config.bgGlow,
                    'group-hover:opacity-100',
                    isSelected && 'opacity-100'
                  )} />

                  {/* Icon */}
                  <div className={cn(
                    'relative mb-4 flex h-16 w-16 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                    config.iconBg
                  )}>
                    <Icon className={cn(
                      'h-8 w-8 bg-gradient-to-br bg-clip-text',
                      config.gradient,
                      'text-transparent'
                    )} style={{
                      background: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }} />
                    <Icon className={cn(
                      'absolute h-8 w-8',
                      role === 'athlete' && 'text-amber-500',
                      role === 'coach' && 'text-emerald-500',
                      role === 'admin' && 'text-violet-500',
                    )} />
                  </div>

                  {/* Text */}
                  <h3 className="relative mb-2 text-lg font-semibold">
                    {ROLE_LABELS[role]}
                  </h3>
                  <p className="relative mb-4 text-sm text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>

                  {/* Arrow */}
                  <div className={cn(
                    'relative flex items-center gap-1 text-sm font-medium transition-all duration-300',
                    role === 'athlete' && 'text-amber-500',
                    role === 'coach' && 'text-emerald-500',
                    role === 'admin' && 'text-violet-500',
                    'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                  )}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="selected"
                      className="absolute inset-0 rounded-2xl border-2 border-foreground"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          You can switch roles anytime from the menu
        </motion.p>
      </motion.div>
    </div>
  )
}
