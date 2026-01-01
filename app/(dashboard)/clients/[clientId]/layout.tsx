'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  ClipboardCheck,
  Heart,
  MessageSquare,
  Settings,
} from 'lucide-react'

import { TopBar } from '@/components/dashboard/top-bar'
import { ClientStatusBadge } from '@/components/clients/client-status-badge'
import { useClient } from '@/hooks/use-clients'
import { cn } from '@/lib/utils'
import { getClientDisplayName, getClientInitials } from '@/types'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '' },
  { id: 'training', label: 'Training', icon: Dumbbell, href: '/training' },
  { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed, href: '/nutrition' },
  { id: 'check-ins', label: 'Check-Ins', icon: ClipboardCheck, href: '/check-ins' },
  { id: 'health', label: 'Health', icon: Heart, href: '/health' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/messages' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
]

export default function ClientDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const clientId = params.clientId as string

  const { data: client, isLoading } = useClient(clientId)

  // Determine active tab from pathname
  const activeTab = tabs.find((tab) => {
    if (tab.href === '') {
      return pathname === `/clients/${clientId}` || pathname === `/clients/${clientId}/overview`
    }
    return pathname === `/clients/${clientId}${tab.href}`
  }) || tabs[0]

  return (
    <div className="min-h-screen">
      <TopBar title="Client Details" />

      <div className="border-b border-border bg-card/50">
        <div className="px-4 py-4 lg:px-8">
          {/* Back button and client header */}
          <div className="mb-4">
            <Link
              href="/clients"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Link>
          </div>

          {/* Client info header */}
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-60 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : client ? (
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-lg font-semibold text-background ring-4 ring-background">
                {getClientInitials(client)}
              </div>

              {/* Name and details */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">
                    {getClientDisplayName(client)}
                  </h1>
                  <ClientStatusBadge status={client.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {client.email} · Joined{' '}
                  {new Date(client.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">Client not found</div>
          )}

          {/* Tab navigation */}
          <div className="mt-6 -mb-px flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab.id
              const TabIcon = tab.icon
              const href = tab.href === ''
                ? `/clients/${clientId}`
                : `/clients/${clientId}${tab.href}`

              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'border-amber-500 text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-4 lg:p-8">{children}</div>
    </div>
  )
}
