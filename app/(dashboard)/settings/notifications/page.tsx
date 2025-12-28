'use client'

import { useState } from 'react'
import { Save, Loader2, Mail, Bell, MessageSquare, ClipboardCheck, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationSetting {
  id: string
  title: string
  description: string
  icon: React.ElementType
  email: boolean
  push: boolean
  inApp: boolean
}

const initialSettings: NotificationSetting[] = [
  {
    id: 'check_ins',
    title: 'Check-in Submissions',
    description: 'When a client submits their weekly check-in',
    icon: ClipboardCheck,
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: 'messages',
    title: 'New Messages',
    description: 'When you receive a message from a client',
    icon: MessageSquare,
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: 'client_activity',
    title: 'Client Activity',
    description: 'When clients accept invitations or become inactive',
    icon: Users,
    email: true,
    push: false,
    inApp: true,
  },
  {
    id: 'reminders',
    title: 'Reminders',
    description: 'Programme end dates and upcoming renewals',
    icon: Bell,
    email: true,
    push: false,
    inApp: true,
  },
]

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2',
        checked ? 'bg-amber-500' : 'bg-muted',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState(initialSettings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailDigest, setEmailDigest] = useState<'realtime' | 'daily' | 'weekly'>('realtime')

  const updateSetting = (
    id: string,
    channel: 'email' | 'push' | 'inApp',
    value: boolean
  ) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, [channel]: value } : setting
      )
    )
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Email digest frequency */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Mail className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Email Digest</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              How often would you like to receive email summaries?
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { value: 'realtime', label: 'Real-time' },
                { value: 'daily', label: 'Daily digest' },
                { value: 'weekly', label: 'Weekly digest' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setEmailDigest(option.value as typeof emailDigest)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    emailDigest === option.value
                      ? 'bg-foreground text-background'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification channels by type */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold">Notification Types</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how you want to be notified for each type of activity
          </p>
        </div>

        {/* Header row */}
        <div className="hidden border-b border-border px-6 py-3 md:flex">
          <div className="flex-1" />
          <div className="flex gap-12">
            <span className="w-16 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </span>
            <span className="w-16 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Push
            </span>
            <span className="w-16 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              In-app
            </span>
          </div>
        </div>

        {/* Settings rows */}
        <div className="divide-y divide-border">
          {settings.map((setting) => {
            const Icon = setting.icon
            return (
              <div
                key={setting.id}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center"
              >
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{setting.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="grid grid-cols-3 gap-4 md:hidden">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <Toggle
                      checked={setting.email}
                      onChange={(v) => updateSetting(setting.id, 'email', v)}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">Push</span>
                    <Toggle
                      checked={setting.push}
                      onChange={(v) => updateSetting(setting.id, 'push', v)}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">In-app</span>
                    <Toggle
                      checked={setting.inApp}
                      onChange={(v) => updateSetting(setting.id, 'inApp', v)}
                    />
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden gap-12 md:flex">
                  <div className="flex w-16 justify-center">
                    <Toggle
                      checked={setting.email}
                      onChange={(v) => updateSetting(setting.id, 'email', v)}
                    />
                  </div>
                  <div className="flex w-16 justify-center">
                    <Toggle
                      checked={setting.push}
                      onChange={(v) => updateSetting(setting.id, 'push', v)}
                    />
                  </div>
                  <div className="flex w-16 justify-center">
                    <Toggle
                      checked={setting.inApp}
                      onChange={(v) => updateSetting(setting.id, 'inApp', v)}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          {isSubmitting ? (
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
