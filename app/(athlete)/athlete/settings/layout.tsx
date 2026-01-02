'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Bell, Shield, Target, HelpCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

const settingsNav = [
  {
    name: 'Profile',
    href: '/athlete/settings',
    icon: User,
    description: 'Your personal information',
  },
  {
    name: 'Goals & Targets',
    href: '/athlete/settings/goals',
    icon: Target,
    description: 'Fitness goals and macro targets',
  },
  {
    name: 'Notifications',
    href: '/athlete/settings/notifications',
    icon: Bell,
    description: 'Manage how you receive updates',
  },
  {
    name: 'Security',
    href: '/athlete/settings/security',
    icon: Shield,
    description: 'Password and security settings',
  },
  {
    name: 'Help',
    href: '/athlete/settings/help',
    icon: HelpCircle,
    description: 'Support and documentation',
  },
]

export default function AthleteSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Settings navigation */}
        <nav className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-border bg-card p-2">
            {settingsNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-amber-400' : 'text-muted-foreground'
                    )}
                  />
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        !isActive && 'text-foreground'
                      )}
                    >
                      {item.name}
                    </p>
                    <p
                      className={cn(
                        'text-xs truncate',
                        isActive ? 'text-background/70' : 'text-muted-foreground'
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Settings content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
