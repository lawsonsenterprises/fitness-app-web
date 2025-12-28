'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  MessageSquare,
  Dumbbell,
  Utensils,
  Calendar,
  TrendingUp,
  Droplet,
  Trophy,
  Save,
  Loader2,
  Check,
  Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationChannel {
  push: boolean
  email: boolean
}

interface NotificationPreferences {
  coachMessages: NotificationChannel
  checkInReminders: NotificationChannel
  workoutReminders: NotificationChannel
  mealReminders: NotificationChannel
  progressUpdates: NotificationChannel
  bloodWorkResults: NotificationChannel
  achievementAlerts: NotificationChannel
  waterReminders: NotificationChannel
  weeklyDigest: boolean
  quietHoursEnabled: boolean
  quietHoursStart?: string // e.g., "22:00"
  quietHoursEnd?: string // e.g., "07:00"
}

interface NotificationPreferencesProps {
  initialData: NotificationPreferences
  onSave: (data: NotificationPreferences) => Promise<void>
}

interface NotificationToggleProps {
  label: string
  description: string
  icon: typeof Bell
  iconColor: string
  pushEnabled: boolean
  emailEnabled: boolean
  onPushChange: (enabled: boolean) => void
  onEmailChange: (enabled: boolean) => void
}

function NotificationToggle({
  label,
  description,
  icon: Icon,
  iconColor,
  pushEnabled,
  emailEnabled,
  onPushChange,
  onEmailChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
      <div className={cn('shrink-0 p-2 rounded-lg', iconColor.replace('text-', 'bg-').replace('500', '500/10'))}>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {/* Push toggle */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onPushChange(!pushEnabled)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              pushEnabled ? 'bg-blue-500' : 'bg-muted'
            )}
          >
            <motion.span
              animate={{ x: pushEnabled ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
            />
          </button>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Smartphone className="h-3 w-3" />
            Push
          </span>
        </div>

        {/* Email toggle */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onEmailChange(!emailEnabled)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              emailEnabled ? 'bg-blue-500' : 'bg-muted'
            )}
          >
            <motion.span
              animate={{ x: emailEnabled ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
            />
          </button>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Mail className="h-3 w-3" />
            Email
          </span>
        </div>
      </div>
    </div>
  )
}

function SimpleToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
      <div>
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors shrink-0',
          enabled ? 'bg-blue-500' : 'bg-muted'
        )}
      >
        <motion.span
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
        />
      </button>
    </div>
  )
}

export function NotificationPreferences({
  initialData,
  onSave,
}: NotificationPreferencesProps) {
  const [formData, setFormData] = useState<NotificationPreferences>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const updateChannel = (
    key: keyof NotificationPreferences,
    channel: 'push' | 'email',
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] as NotificationChannel),
        [channel]: value,
      },
    }))
    setIsSaved(false)
  }

  const updateField = <K extends keyof NotificationPreferences>(
    field: K,
    value: NotificationPreferences[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      await onSave(formData)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const notificationTypes = [
    {
      key: 'coachMessages' as const,
      label: 'Coach Messages',
      description: 'Get notified when your coach sends you a message',
      icon: MessageSquare,
      iconColor: 'text-blue-500',
    },
    {
      key: 'checkInReminders' as const,
      label: 'Check-in Reminders',
      description: 'Reminders when your check-in is due',
      icon: Calendar,
      iconColor: 'text-violet-500',
    },
    {
      key: 'workoutReminders' as const,
      label: 'Workout Reminders',
      description: 'Daily reminders for scheduled workouts',
      icon: Dumbbell,
      iconColor: 'text-orange-500',
    },
    {
      key: 'mealReminders' as const,
      label: 'Meal Reminders',
      description: 'Reminders to log your meals',
      icon: Utensils,
      iconColor: 'text-emerald-500',
    },
    {
      key: 'progressUpdates' as const,
      label: 'Progress Updates',
      description: 'Weekly progress summaries and insights',
      icon: TrendingUp,
      iconColor: 'text-cyan-500',
    },
    {
      key: 'bloodWorkResults' as const,
      label: 'Blood Work Results',
      description: 'Notifications when blood work analysis is ready',
      icon: Droplet,
      iconColor: 'text-rose-500',
    },
    {
      key: 'achievementAlerts' as const,
      label: 'Achievements',
      description: 'Celebrate PRs and milestones',
      icon: Trophy,
      iconColor: 'text-amber-500',
    },
    {
      key: 'waterReminders' as const,
      label: 'Water Reminders',
      description: 'Hourly hydration reminders',
      icon: Droplet,
      iconColor: 'text-sky-500',
    },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Notification types */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Notification Types</h3>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> Push
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email
            </span>
          </div>
        </div>

        {notificationTypes.map((type) => (
          <NotificationToggle
            key={type.key}
            label={type.label}
            description={type.description}
            icon={type.icon}
            iconColor={type.iconColor}
            pushEnabled={(formData[type.key] as NotificationChannel).push}
            emailEnabled={(formData[type.key] as NotificationChannel).email}
            onPushChange={(v) => updateChannel(type.key, 'push', v)}
            onEmailChange={(v) => updateChannel(type.key, 'email', v)}
          />
        ))}
      </div>

      {/* Weekly digest */}
      <div className="space-y-3">
        <h3 className="font-semibold">Digest</h3>
        <SimpleToggle
          label="Weekly Digest"
          description="Receive a weekly summary of your progress via email"
          enabled={formData.weeklyDigest}
          onChange={(v) => updateField('weeklyDigest', v)}
        />
      </div>

      {/* Quiet hours */}
      <div className="space-y-3">
        <h3 className="font-semibold">Quiet Hours</h3>
        <SimpleToggle
          label="Enable Quiet Hours"
          description="Pause push notifications during specified hours"
          enabled={formData.quietHoursEnabled}
          onChange={(v) => updateField('quietHoursEnabled', v)}
        />

        {formData.quietHoursEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-4 pl-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1.5">Start</label>
              <input
                type="time"
                value={formData.quietHoursStart || '22:00'}
                onChange={(e) => updateField('quietHoursStart', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">End</label>
              <input
                type="time"
                value={formData.quietHoursEnd || '07:00'}
                onChange={(e) => updateField('quietHoursEnd', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors',
          isSaved
            ? 'bg-emerald-500 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : isSaved ? (
          <>
            <Check className="h-4 w-4" />
            Saved!
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Preferences
          </>
        )}
      </motion.button>
    </form>
  )
}

export type { NotificationPreferences as NotificationPreferencesData, NotificationPreferencesProps, NotificationChannel }
