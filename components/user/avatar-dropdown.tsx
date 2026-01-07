'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Settings, LogOut, Crown, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

export function AvatarDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, displayName, signOut, activeRole } = useAuth()
  const pathname = usePathname()

  // Get user initials from displayName (which is profiles.first_name from auth context)
  const initials = displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() || 'U'

  // Get display name for menu
  const name = displayName ||
    user?.email?.split('@')[0] ||
    'User'

  // Determine base path for settings based on current route
  const getSettingsPath = () => {
    if (pathname.startsWith('/athlete')) return '/athlete/settings'
    if (pathname.startsWith('/admin')) return '/admin/settings'
    return '/settings'
  }

  const getProfilePath = () => {
    if (pathname.startsWith('/athlete')) return '/athlete/settings'
    if (pathname.startsWith('/admin')) return '/admin/settings'
    return '/settings'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
  }

  // Get subscription tier label
  const getSubscriptionLabel = () => {
    // TODO: Fetch actual subscription tier from database
    // For now, show role-based label
    if (activeRole === 'admin') return 'Admin'
    if (activeRole === 'coach') return 'Pro' // Default for coaches
    return 'Free' // Default for athletes
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg pl-1 pr-2 py-1 transition-all',
          'hover:bg-muted',
          isOpen && 'bg-muted'
        )}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-sm font-medium text-background">
          {initials}
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown panel */}
          <div
            className={cn(
              'fixed right-4 top-16 z-50 md:absolute md:right-0 md:top-full md:mt-2',
              'w-64 rounded-xl border border-border bg-card shadow-2xl',
              'animate-in fade-in-0 slide-in-from-top-2 duration-200'
            )}
          >
            {/* User info header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-lg font-medium text-background">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              {/* Subscription tier badge */}
              <div className="mt-3 flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  activeRole === 'admin'
                    ? 'bg-purple-500/10 text-purple-600'
                    : activeRole === 'coach'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Crown className="h-3 w-3" />
                  {getSubscriptionLabel()}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              <Link
                href={getProfilePath()}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-muted-foreground transition-colors',
                  'hover:bg-muted hover:text-foreground'
                )}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>

              <Link
                href={getSettingsPath()}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-muted-foreground transition-colors',
                  'hover:bg-muted hover:text-foreground'
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <div className="my-2 border-t border-border" />

              <button
                onClick={handleSignOut}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-muted-foreground transition-colors',
                  'hover:bg-destructive/10 hover:text-destructive'
                )}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
