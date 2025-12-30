'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  Menu,
  X,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Dumbbell,
  UtensilsCrossed,
  Settings,
  LogOut,
  TrendingUp,
  Heart,
  MessageSquare,
  Droplets,
  UserCircle,
  CreditCard,
  BarChart3,
  Zap,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { useAuth } from '@/contexts/auth-context'
import { RoleSwitcher } from '@/components/auth/role-switcher'
import { ROUTES } from '@/lib/constants'

// Navigation items per role
const coachNavigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Clients', href: ROUTES.CLIENTS, icon: Users },
  { name: 'Check-ins', href: ROUTES.CHECK_INS, icon: ClipboardCheck },
  { name: 'Programmes', href: ROUTES.PROGRAMMES, icon: Dumbbell },
  { name: 'Meal Plans', href: ROUTES.MEAL_PLANS, icon: UtensilsCrossed },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const athleteNavigation = [
  { name: 'Dashboard', href: '/athlete', icon: LayoutDashboard },
  { name: 'Training', href: '/athlete/training', icon: Dumbbell },
  { name: 'Nutrition', href: '/athlete/nutrition', icon: UtensilsCrossed },
  { name: 'Blood Work', href: '/athlete/blood-work', icon: Droplets },
  { name: 'Check-ins', href: '/athlete/check-ins', icon: ClipboardCheck },
  { name: 'Progress', href: '/athlete/progress', icon: TrendingUp },
  { name: 'Recovery', href: '/athlete/recovery', icon: Heart },
  { name: 'Messages', href: '/athlete/messages', icon: MessageSquare },
  { name: 'Settings', href: '/athlete/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Coaches', href: '/admin/coaches', icon: Users },
  { name: 'Athletes', href: '/admin/athletes', icon: UserCircle },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const { user, signOut, activeRole } = useAuth()
  const pathname = usePathname()
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Determine navigation based on current path
  const getNavigation = () => {
    if (pathname.startsWith('/athlete')) return athleteNavigation
    if (pathname.startsWith('/admin')) return adminNavigation
    return coachNavigation
  }

  const navigation = getNavigation()

  // Get user initials for avatar
  const initials = user?.user_metadata?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() || 'U'

  const isActive = (href: string) => {
    if (href === '/athlete' || href === '/admin' || href === ROUTES.DASHBOARD) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:h-20 lg:px-8">
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
          <div className="fixed inset-y-0 left-0 z-[60] w-72 border-r border-border bg-background shadow-lg lg:hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <span className="font-semibold">Synced.</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Role Switcher */}
            <div className="p-4 border-b border-border">
              <RoleSwitcher />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                          active
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            active ? 'text-amber-500' : ''
                          )}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* User section */}
            <div className="border-t border-border p-4">
              <div className="rounded-lg bg-muted/50 px-3 py-2 mb-3">
                <p className="text-sm font-medium">
                  {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
