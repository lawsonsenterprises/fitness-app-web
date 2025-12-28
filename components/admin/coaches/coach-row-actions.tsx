'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHorizontal,
  Eye,
  UserCog,
  Shield,
  ShieldOff,
  Mail,
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
}

export function CoachRowActions({
  coach,
  onView,
  onSuspend,
  onActivate,
  onImpersonate,
  onEmail,
}: CoachRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-border bg-card shadow-lg py-1"
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
        )}
      </AnimatePresence>
    </div>
  )
}

export type { CoachRowActionsProps }
