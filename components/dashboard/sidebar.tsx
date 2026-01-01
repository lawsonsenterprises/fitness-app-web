'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Dumbbell,
  UtensilsCrossed,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  CreditCard,
  BarChart3,
  HeadphonesIcon,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { ROUTES } from '@/lib/constants'
import { RoleSwitcher } from '@/components/auth/role-switcher'
import { useUnreadCount } from '@/hooks/use-messages'

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, showBadge: false },
  { name: 'Clients', href: ROUTES.CLIENTS, icon: Users, showBadge: false },
  { name: 'Check-ins', href: ROUTES.CHECK_INS, icon: ClipboardCheck, showBadge: false },
  { name: 'Programmes', href: ROUTES.PROGRAMMES, icon: Dumbbell, showBadge: false },
  { name: 'Meal Plans', href: ROUTES.MEAL_PLANS, icon: UtensilsCrossed, showBadge: false },
  { name: 'Messages', href: ROUTES.MESSAGES, icon: MessageCircle, showBadge: true },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Admin', href: ROUTES.ADMIN, icon: Shield },
  { name: 'Users', href: ROUTES.ADMIN_USERS, icon: Users },
  { name: 'Subscriptions', href: ROUTES.ADMIN_SUBSCRIPTIONS, icon: CreditCard },
  { name: 'Analytics', href: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
  { name: 'Support', href: ROUTES.ADMIN_SUPPORT, icon: HeadphonesIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, user, roles } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const { data: unreadData } = useUnreadCount()

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Coach'
  const unreadCount = unreadData?.total || 0
  const isAdmin = roles.includes('admin')

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-background transition-all duration-300 lg:flex',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-border px-4">
          <Link
            href={ROUTES.DASHBOARD}
            className={cn(
              'group flex items-center gap-3',
              collapsed && 'justify-center'
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            {!collapsed && (
              <span className="font-semibold tracking-tight">
                Synced<span className="text-amber-500">.</span>
              </span>
            )}
          </Link>
        </div>

        {/* Role Switcher */}
        {!collapsed && (
          <div className="border-b border-border p-3">
            <RoleSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const showBadge = item.showBadge && unreadCount > 0
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="relative">
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-colors',
                          isActive
                            ? 'text-amber-500'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      {showBadge && collapsed && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <span className="flex flex-1 items-center justify-between">
                        {item.name}
                        {showBadge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Secondary navigation */}
          <div className="mt-6 border-t border-border pt-6">
            <ul className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Admin navigation - only visible to admins */}
          {isAdmin && (
            <div className="mt-6 border-t border-border pt-6">
              {!collapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </p>
              )}
              <ul className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'text-muted-foreground hover:bg-red-500/5 hover:text-red-600 dark:hover:text-red-400',
                          collapsed && 'justify-center px-2'
                        )}
                        title={collapsed ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0 transition-colors',
                            isActive
                              ? 'text-red-500'
                              : 'text-muted-foreground group-hover:text-red-500'
                          )}
                        />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          {/* User info */}
          {!collapsed && (
            <div className="mb-3 rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">Coach</p>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* Sign out */}
          <button
            onClick={() => signOut()}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const showBadge = item.showBadge && unreadCount > 0
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      isActive && 'text-amber-500'
                    )}
                  />
                  {showBadge && (
                    <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
