'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  ClipboardCheck,
  TrendingUp,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  Droplets,
  Library,
  Calendar,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { RoleSwitcher } from '@/components/auth/role-switcher'

interface NavigationItem {
  name: string
  href?: string
  icon: any
  items?: { name: string; href: string; icon: any }[]
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/athlete', icon: LayoutDashboard },
  {
    name: 'Training',
    icon: Dumbbell,
    items: [
      { name: 'Overview', href: '/athlete/training', icon: Dumbbell },
      { name: 'Programmes', href: '/athlete/training/programmes', icon: Calendar },
      { name: 'Exercise Library', href: '/athlete/training/exercises', icon: Library },
    ],
  },
  { name: 'Nutrition', href: '/athlete/nutrition', icon: UtensilsCrossed },
  { name: 'Blood Work', href: '/athlete/blood-work', icon: Droplets },
  { name: 'Check-ins', href: '/athlete/check-ins', icon: ClipboardCheck },
  { name: 'Progress', href: '/athlete/progress', icon: TrendingUp },
  { name: 'Recovery', href: '/athlete/recovery', icon: Heart },
  { name: 'Messages', href: '/athlete/messages', icon: MessageSquare },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/athlete/settings', icon: Settings },
]

export function AthleteSidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['Training']))

  const rawName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Athlete'
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1)

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemName)) {
        newSet.delete(itemName)
      } else {
        newSet.add(itemName)
      }
      return newSet
    })
  }

  // Auto-expand parent item if user is on a child route
  const isItemActive = (item: NavigationItem) => {
    if (item.href) {
      return pathname === item.href || (item.href !== '/athlete' && pathname.startsWith(item.href))
    }
    if (item.items) {
      return item.items.some((subItem) => {
        // Exact match
        if (pathname === subItem.href) return true

        // Child route check
        if (pathname.startsWith(subItem.href + '/')) {
          // Ensure no sibling is a better match
          const siblings = item.items!.filter(s => s.href !== subItem.href)
          const siblingMatches = siblings.some(s =>
            pathname === s.href || pathname.startsWith(s.href + '/')
          )
          return !siblingMatches
        }

        return false
      })
    }
    return false
  }

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
            href="/athlete"
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
              const isActive = isItemActive(item)
              const isExpanded = expandedItems.has(item.name)
              const hasSubItems = item.items && item.items.length > 0

              return (
                <li key={item.name}>
                  {hasSubItems ? (
                    // Parent item with sub-items
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-foreground/10 text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          collapsed && 'justify-center px-2'
                        )}
                        title={collapsed ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0 transition-colors',
                            isActive
                              ? 'text-amber-500'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.name}</span>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          </>
                        )}
                      </button>
                      {/* Sub-items */}
                      {!collapsed && isExpanded && (
                        <ul className="mt-1 space-y-1 pl-4">
                          {item.items!.map((subItem) => {
                            // Check if this sub-item is active
                            const isSubActive = (() => {
                              // Exact match
                              if (pathname === subItem.href) return true

                              // Child route check (e.g., /programmes/[id])
                              if (pathname.startsWith(subItem.href + '/')) {
                                // Ensure no sibling is a better match
                                const siblings = item.items!.filter(s => s.href !== subItem.href)
                                const siblingMatches = siblings.some(s =>
                                  pathname === s.href || pathname.startsWith(s.href + '/')
                                )
                                return !siblingMatches
                              }

                              return false
                            })()
                            return (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                    isSubActive
                                      ? 'bg-foreground text-background'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  )}
                                >
                                  <subItem.icon
                                    className={cn(
                                      'h-4 w-4 shrink-0 transition-colors',
                                      isSubActive
                                        ? 'text-amber-500'
                                        : 'text-muted-foreground group-hover:text-foreground'
                                    )}
                                  />
                                  <span>{subItem.name}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Regular item without sub-items
                    <Link
                      href={item.href!}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-colors',
                          isActive
                            ? 'text-amber-500'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Secondary navigation */}
          <div className="mt-6 border-t border-border pt-6">
            <ul className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
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
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          {/* User info */}
          {!collapsed && (
            <div className="mb-3 rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">Athlete</p>
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
          {navigation.slice(0, 5).map((item) => {
            // For mobile, use first sub-item href if item has sub-items
            const href = item.items ? item.items[0].href : item.href!
            const isActive = isItemActive(item)
            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    isActive && 'text-amber-500'
                  )}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
