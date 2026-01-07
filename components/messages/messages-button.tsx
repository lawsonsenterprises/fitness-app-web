'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useUnreadCount } from '@/hooks/use-messages'

export function MessagesButton() {
  const pathname = usePathname()
  const { data: unreadData } = useUnreadCount()

  const unreadCount = unreadData?.total || 0

  // Determine messages path based on current route
  const getMessagesPath = () => {
    if (pathname.startsWith('/athlete')) return '/athlete/messages'
    if (pathname.startsWith('/admin')) return '/admin/messages'
    return '/messages'
  }

  const isActive = pathname.includes('/messages')

  return (
    <Link
      href={getMessagesPath()}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground',
        isActive && 'bg-muted text-foreground'
      )}
      aria-label="Messages"
    >
      <Mail className="h-5 w-5" />
      {/* Unread badge */}
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center',
            'rounded-full bg-amber-500 text-[10px] font-bold text-white',
            'animate-in zoom-in-50 duration-200'
          )}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
