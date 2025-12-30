'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { useAuth } from '@/contexts/auth-context'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const { user } = useAuth()
  const [searchFocused, setSearchFocused] = useState(false)

  // Get user initials for avatar
  const initials = user?.user_metadata?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:h-20 lg:px-8">
      {/* Left section */}
      <div className="flex items-center gap-4">
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
  )
}
