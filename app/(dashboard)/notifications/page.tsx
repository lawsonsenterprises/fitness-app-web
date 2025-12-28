'use client'

import { useState } from 'react'
import { Bell, Check, Filter, ChevronDown } from 'lucide-react'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { NotificationItem } from '@/components/notifications/notification-item'
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

const filterOptions = [
  { value: 'all', label: 'All Notifications' },
  { value: 'unread', label: 'Unread Only' },
]

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const { data: notificationsData, isLoading } = useNotifications({
    unreadOnly: filter === 'unread',
  })
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const notifications = notificationsData?.data || []
  const currentFilter = filterOptions.find((f) => f.value === filter) || filterOptions[0]

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Notifications" />

      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">
              Stay updated on client activity and check-ins
            </p>
            {unreadCount > 0 && (
              <p className="mt-2 text-sm">
                You have{' '}
                <span className="font-semibold text-amber-600">
                  {unreadCount} unread
                </span>{' '}
                notification{unreadCount === 1 ? '' : 's'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Filter dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="h-10 min-w-[160px] justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {currentFilter.label}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    showFilterDropdown && 'rotate-180'
                  )}
                />
              </Button>

              {showFilterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFilterDropdown(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilter(option.value as 'all' | 'unread')
                          setShowFilterDropdown(false)
                        }}
                        className={cn(
                          'flex w-full items-center px-3 py-2 text-sm hover:bg-muted',
                          filter === option.value && 'bg-muted'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <div className="rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 p-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
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
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {filter === 'unread'
                  ? "You're all caught up! Check back later for new updates."
                  : "When you receive notifications about client activity, they'll appear here."}
              </p>
              {filter === 'unread' && (
                <Button
                  variant="outline"
                  onClick={() => setFilter('all')}
                  className="mt-4"
                >
                  View all notifications
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination info */}
        {notificationsData && notificationsData.total > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing {notifications.length} of {notificationsData.total} notifications
          </div>
        )}
      </div>
    </div>
  )
}
