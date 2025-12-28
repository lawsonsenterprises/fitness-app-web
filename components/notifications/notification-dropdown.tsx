'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationItem } from './notification-item'
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/use-notifications'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notificationsData, isLoading } = useNotifications({ pageSize: 5 })
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const notifications = notificationsData?.data || []

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors',
          'hover:bg-muted hover:text-foreground',
          isOpen && 'bg-muted text-foreground'
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {/* Notification badge */}
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
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown panel */}
          <div
            className={cn(
              'fixed inset-x-4 top-16 z-50 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-96',
              'rounded-2xl border border-border bg-card shadow-2xl',
              'animate-in fade-in-0 slide-in-from-top-2 duration-200'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsRead.isPending}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 rounded-lg p-3"
                    >
                      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    No new notifications
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border p-2">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
                    'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  )}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
