'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, Search, Users, Loader2 } from 'lucide-react'

import { TopBar } from '@/components/dashboard/top-bar'
import { Input } from '@/components/ui/input'
import { useClients } from '@/hooks/use-clients'
import { useUnreadCount } from '@/hooks/use-messages'
import { getClientDisplayName, getClientInitials } from '@/types'
import { cn } from '@/lib/utils'

export default function MessagesPage() {
  const [search, setSearch] = useState('')
  const { data: clientsData, isLoading } = useClients({ status: 'active' })
  const { data: unreadData } = useUnreadCount()

  const clients = clientsData?.data || []
  const unreadByConversation = unreadData?.byConversation || {}

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!search) return clients
    const searchLower = search.toLowerCase()
    return clients.filter((client) => {
      const name = getClientDisplayName(client).toLowerCase()
      const email = client.email?.toLowerCase() || ''
      return name.includes(searchLower) || email.includes(searchLower)
    })
  }, [clients, search])

  // Sort by unread count (those with unread first)
  // Note: client.id is the coach_clients.id (relationship ID)
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      const aUnread = unreadByConversation[a.id] || 0
      const bUnread = unreadByConversation[b.id] || 0
      return bUnread - aUnread
    })
  }, [filteredClients, unreadByConversation])

  return (
    <div className="min-h-screen">
      <TopBar title="Messages" />

      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Direct message your clients
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className={cn(
              'h-11 rounded-lg border-border bg-background pl-10',
              'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
            )}
          />
        </div>

        {/* Clients list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sortedClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">
              {search ? 'No clients found' : 'No active clients'}
            </h3>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              {search
                ? 'Try a different search term'
                : "Add clients to start messaging them"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedClients.map((client) => {
              const displayName = getClientDisplayName(client)
              const initials = getClientInitials(client)
              // client.id is coach_clients.id (the relationship ID used for messaging)
              const unreadCount = unreadByConversation[client.id] || 0

              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.clientId}/messages`}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all',
                    'hover:border-amber-500/30 hover:shadow-md',
                    unreadCount > 0 && 'border-amber-500/20 bg-amber-500/5'
                  )}
                >
                  {client.avatarUrl ? (
                    <Image
                      src={client.avatarUrl}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-medium">
                      {initials || '?'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {client.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
