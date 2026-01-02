'use client'

import { useState } from 'react'
import {
  Bell,
  Smartphone,
  Clock,
  Save,
  Loader2,
  ClipboardCheck,
  MessageSquare,
  Dumbbell,
  UtensilsCrossed,
  Trophy,
  Calendar,
  Mail,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NotificationSetting {
  id: string
  label: string
  description: string
  icon: React.ElementType
  push: boolean
  email: boolean
}

export default function NotificationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailDigest, setEmailDigest] = useState('weekly')
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true)
  const [quietHoursStart, setQuietHoursStart] = useState('22:00')
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00')
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'check-in-reminders',
      label: 'Check-in reminders',
      description: 'Get reminded when check-ins are due',
      icon: ClipboardCheck,
      push: true,
      email: true,
    },
    {
      id: 'coach-messages',
      label: 'Coach messages',
      description: 'Notifications for new messages from your coach',
      icon: MessageSquare,
      push: true,
      email: true,
    },
    {
      id: 'programme-updates',
      label: 'Programme updates',
      description: 'When your training programme is updated',
      icon: Dumbbell,
      push: true,
      email: false,
    },
    {
      id: 'meal-plan-updates',
      label: 'Meal plan updates',
      description: 'When your meal plan is modified',
      icon: UtensilsCrossed,
      push: true,
      email: false,
    },
    {
      id: 'pr-achievements',
      label: 'PR achievements',
      description: 'Celebrate when you hit new personal records',
      icon: Trophy,
      push: true,
      email: false,
    },
    {
      id: 'blood-work-reminders',
      label: 'Blood work reminders',
      description: 'Reminders for scheduled blood tests',
      icon: Calendar,
      push: true,
      email: true,
    },
  ])

  const toggleNotification = (id: string, type: 'push' | 'email') => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, [type]: !n[type] } : n
      )
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
        {/* Notification Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notification Types</h2>
                <p className="text-sm text-muted-foreground">Choose which notifications you want to receive</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr,80px,80px] gap-4 p-4 bg-muted/50">
              <div className="text-sm font-medium text-muted-foreground">Notification</div>
              <div className="text-center">
                <Smartphone className="h-4 w-4 mx-auto text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Push</span>
              </div>
              <div className="text-center">
                <Mail className="h-4 w-4 mx-auto text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Email</span>
              </div>
            </div>

            {notifications.map((notification) => (
              <div key={notification.id} className="grid grid-cols-[1fr,80px,80px] gap-4 p-4 items-center">
                <div className="flex items-center gap-3">
                  <notification.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{notification.label}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => toggleNotification(notification.id, 'push')}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                      notification.push ? 'bg-amber-500' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                        notification.push ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => toggleNotification(notification.id, 'email')}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                      notification.email ? 'bg-amber-500' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                        notification.email ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Email Digest */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Email Digest</h2>
              <p className="text-sm text-muted-foreground">How often to receive email summaries</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['daily', 'weekly', 'never'].map((option) => (
              <button
                key={option}
                onClick={() => setEmailDigest(option)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                  emailDigest === option
                    ? 'bg-foreground text-background'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quiet Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Quiet Hours</h2>
                <p className="text-sm text-muted-foreground">Pause notifications during set times</p>
              </div>
            </div>

            <button
              onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                quietHoursEnabled ? 'bg-indigo-500' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                  quietHoursEnabled ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>

          {quietHoursEnabled && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
                />
              </div>
              <span className="text-muted-foreground mt-6">to</span>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
    </div>
  )
}
