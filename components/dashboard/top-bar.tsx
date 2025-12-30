'use client'

import { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { useAuth } from '@/contexts/auth-context'
import { RoleSwitcher } from '@/components/auth/role-switcher'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const { user } = useAuth()
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Get user initials for avatar
  const initials = user?.user_metadata?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:h-20 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Page title */}
          {title && (
            <h1 className="text-lg font-semibold tracking-tight lg:text-xl">
              {title}
            </h1>
          )}
        </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className={cn(
            'relative hidden transition-all duration-200 md:block',
            searchFocused ? 'w-80' : 'w-64'
          )}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients, programmes..."
            className={cn(
              'h-10 rounded-lg border-border bg-muted/50 pl-10 pr-4 text-sm transition-all',
              'placeholder:text-muted-foreground/60',
              'focus:border-amber-500/50 focus:bg-background focus:ring-2 focus:ring-amber-500/20'
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User avatar */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90">
          {initials}
        </button>
      </div>
    </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background p-4 shadow-lg lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Role Switcher */}
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Switch Role
              </p>
              <RoleSwitcher />
            </div>

            {/* User info */}
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-sm font-medium">
                {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
