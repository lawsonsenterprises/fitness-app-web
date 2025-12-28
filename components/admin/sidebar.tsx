'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCircle,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { RoleSwitcher } from '@/components/auth/role-switcher'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Coaches', href: '/admin/coaches', icon: Users },
  { name: 'Athletes', href: '/admin/athletes', icon: UserCircle },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut, user, roles } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin'

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
            href="/admin"
            className={cn(
              'group flex items-center gap-3',
              collapsed && 'justify-center'
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-semibold tracking-tight">
                Admin<span className="text-red-500">.</span>
              </span>
            )}
          </Link>
        </div>

        {/* Role Switcher (if multi-role) */}
        {roles.length > 1 && !collapsed && (
          <div className="border-b border-border p-3">
            <RoleSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-white'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
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
            <div className="mb-3 rounded-lg bg-red-500/10 px-3 py-2">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
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
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                  isActive
                    ? 'text-red-600'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
