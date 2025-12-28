'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Bell,
  Save,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformConfig {
  general: {
    platformName: string
    supportEmail: string
    websiteUrl: string
    timezone: string
  }
  billing: {
    stripeMode: 'test' | 'live'
    currency: string
    trialDays: number
    allowCancellation: boolean
  }
  notifications: {
    emailEnabled: boolean
    pushEnabled: boolean
    slackWebhookUrl?: string
    alertThreshold: number
  }
  limits: {
    maxClientsPerCoach: number
    maxProgrammesPerCoach: number
    fileUploadMaxMb: number
    bloodWorkFileMaxMb: number
  }
}

interface PlatformConfigFormProps {
  config: PlatformConfig
  onSave: (config: PlatformConfig) => Promise<void>
}

export function PlatformConfigForm({
  config: initialConfig,
  onSave,
}: PlatformConfigFormProps) {
  const [config, setConfig] = useState<PlatformConfig>(initialConfig)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('general')

  const updateConfig = <S extends keyof PlatformConfig, K extends keyof PlatformConfig[S]>(
    section: S,
    key: K,
    value: PlatformConfig[S][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setIsSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(config)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save config:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const sections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'limits', label: 'Limits', icon: Settings },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === section.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* General section */}
      {activeSection === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h3 className="font-semibold">General Settings</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                value={config.general.platformName}
                onChange={(e) => updateConfig('general', 'platformName', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={config.general.supportEmail}
                onChange={(e) => updateConfig('general', 'supportEmail', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                value={config.general.websiteUrl}
                onChange={(e) => updateConfig('general', 'websiteUrl', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Timezone
              </label>
              <select
                value={config.general.timezone}
                onChange={(e) => updateConfig('general', 'timezone', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Billing section */}
      {activeSection === 'billing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h3 className="font-semibold">Billing Settings</h3>

          {/* Stripe mode warning */}
          {config.billing.stripeMode === 'live' && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-600">
                <p className="font-medium">Live Mode Active</p>
                <p>Real payments are being processed. Changes affect billing immediately.</p>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Stripe Mode
              </label>
              <select
                value={config.billing.stripeMode}
                onChange={(e) => updateConfig('billing', 'stripeMode', e.target.value as 'test' | 'live')}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="test">Test Mode</option>
                <option value="live">Live Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Default Currency
              </label>
              <select
                value={config.billing.currency}
                onChange={(e) => updateConfig('billing', 'currency', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="gbp">GBP (£)</option>
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Trial Period (days)
              </label>
              <input
                type="number"
                min={0}
                max={90}
                value={config.billing.trialDays}
                onChange={(e) => updateConfig('billing', 'trialDays', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allowCancellation"
                checked={config.billing.allowCancellation}
                onChange={(e) => updateConfig('billing', 'allowCancellation', e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="allowCancellation" className="text-sm">
                Allow self-service cancellation
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications section */}
      {activeSection === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h3 className="font-semibold">Notification Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Email Notifications</span>
              <button
                type="button"
                onClick={() => updateConfig('notifications', 'emailEnabled', !config.notifications.emailEnabled)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  config.notifications.emailEnabled ? 'bg-emerald-500' : 'bg-muted'
                )}
              >
                <motion.span
                  animate={{ x: config.notifications.emailEnabled ? 20 : 2 }}
                  className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Push Notifications</span>
              <button
                type="button"
                onClick={() => updateConfig('notifications', 'pushEnabled', !config.notifications.pushEnabled)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  config.notifications.pushEnabled ? 'bg-emerald-500' : 'bg-muted'
                )}
              >
                <motion.span
                  animate={{ x: config.notifications.pushEnabled ? 20 : 2 }}
                  className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Slack Webhook URL
              </label>
              <input
                type="url"
                value={config.notifications.slackWebhookUrl || ''}
                onChange={(e) => updateConfig('notifications', 'slackWebhookUrl', e.target.value || undefined)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Alert Threshold (errors per minute)
              </label>
              <input
                type="number"
                min={1}
                value={config.notifications.alertThreshold}
                onChange={(e) => updateConfig('notifications', 'alertThreshold', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Limits section */}
      {activeSection === 'limits' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h3 className="font-semibold">Platform Limits</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Max Clients per Coach
              </label>
              <input
                type="number"
                min={1}
                value={config.limits.maxClientsPerCoach}
                onChange={(e) => updateConfig('limits', 'maxClientsPerCoach', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Max Programmes per Coach
              </label>
              <input
                type="number"
                min={1}
                value={config.limits.maxProgrammesPerCoach}
                onChange={(e) => updateConfig('limits', 'maxProgrammesPerCoach', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                File Upload Max Size (MB)
              </label>
              <input
                type="number"
                min={1}
                value={config.limits.fileUploadMaxMb}
                onChange={(e) => updateConfig('limits', 'fileUploadMaxMb', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Blood Work File Max Size (MB)
              </label>
              <input
                type="number"
                min={1}
                value={config.limits.bloodWorkFileMaxMb}
                onChange={(e) => updateConfig('limits', 'bloodWorkFileMaxMb', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

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
            Save Configuration
          </>
        )}
      </motion.button>
    </form>
  )
}

export type { PlatformConfig, PlatformConfigFormProps }
