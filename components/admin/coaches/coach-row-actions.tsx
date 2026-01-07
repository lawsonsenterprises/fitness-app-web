'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHorizontal,
  Eye,
  UserCog,
  Shield,
  ShieldOff,
  Mail,
  Key,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Coach {
  id: string
  name: string
  status: 'active' | 'suspended' | 'pending'
}

interface CoachRowActionsProps {
  coach: Coach
  onView: () => void
  onSuspend: () => void
  onActivate: () => void
  onImpersonate: () => void
  onEmail: () => void
  onResetPassword: () => void
}

export function CoachRowActions({
  coach,
  onView,
  onSuspend,
  onActivate,
  onImpersonate,
  onEmail,
  onResetPassword,
}: CoachRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 192, // 192px = w-48
      })
    }
    setIsOpen(!isOpen)
  }

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: onView,
      color: 'text-foreground',
    },
    {
      label: 'Impersonate',
      icon: UserCog,
      onClick: onImpersonate,
      color: 'text-violet-600',
    },
    {
      label: 'Send Email',
      icon: Mail,
      onClick: onEmail,
      color: 'text-blue-600',
    },
    {
      label: 'Reset Password',
      icon: Key,
      onClick: onResetPassword,
      color: 'text-amber-600',
    },
    coach.status === 'suspended'
      ? {
          label: 'Activate',
          icon: Shield,
          onClick: onActivate,
          color: 'text-emerald-600',
        }
      : {
          label: 'Suspend',
          icon: ShieldOff,
          onClick: onSuspend,
          color: 'text-rose-600',
        },
  ]

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'p-2 rounded-lg transition-colors',
          isOpen ? 'bg-muted' : 'hover:bg-muted'
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 w-48 rounded-xl border border-border bg-card shadow-lg py-1"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleAction(action.onClick)}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-left',
                  action.color
                )}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </button>
            ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export type { CoachRowActionsProps }
