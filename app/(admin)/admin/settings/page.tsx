'use client'

import { useState } from 'react'
import {
  Settings,
  Shield,
  Zap,
  Save,
  Loader2,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TopBar } from '@/components/dashboard/top-bar'

// Platform feature flags - these would ideally come from a database table
// For now they're stored locally as no feature_flags table exists
const defaultFeatureFlags = [
  {
    id: 'blood_work',
    name: 'Blood Work Analysis',
    description: 'Allow athletes to upload and track blood work results',
    enabled: true,
    category: 'features',
  },
  {
    id: 'ai_insights',
    name: 'AI-Powered Insights',
    description: 'Enable AI analysis of check-ins and progress',
    enabled: false,
    category: 'features',
  },
  {
    id: 'video_calls',
    name: 'Video Consultations',
    description: 'Enable video calling between coaches and athletes',
    enabled: false,
    category: 'features',
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    description: 'Allow users to switch to dark theme',
    enabled: true,
    category: 'ui',
  },
  {
    id: 'beta_features',
    name: 'Beta Features',
    description: 'Show beta features to opted-in users',
    enabled: true,
    category: 'experimental',
  },
  {
    id: 'maintenance_mode',
    name: 'Maintenance Mode',
    description: 'Put the platform in maintenance mode',
    enabled: false,
    category: 'system',
  },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'security'>('general')
  const [featureFlags, setFeatureFlags] = useState(defaultFeatureFlags)
  const [isSaving, setIsSaving] = useState(false)

  const toggleFeature = (id: string) => {
    setFeatureFlags(flags =>
      flags.map(flag =>
        flag.id === id ? { ...flag, enabled: !flag.enabled } : flag
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Note: Currently saving to local state only
      // TODO: Implement platform_settings table in database
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Settings saved locally')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'features', label: 'Feature Flags', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <>
      <TopBar title="Settings" />
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Platform configuration and feature flags
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-600">
              Settings are currently stored locally. Database persistence will be added in a future update.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-foreground text-background'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Platform Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Name</label>
                  <Input defaultValue="Synced Momentum" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <Input defaultValue="support@syncedmomentum.com" type="email" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Platform Description</label>
                  <textarea
                    defaultValue="The premier coaching platform for fitness professionals"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Trial Settings</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Trial Duration (days)</label>
                  <Input type="number" defaultValue="14" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Trial Athletes</label>
                  <Input type="number" defaultValue="5" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              <div className="space-y-4">
                {[
                  { label: 'New coach signups', description: 'Get notified when a new coach registers', enabled: true },
                  { label: 'Subscription changes', description: 'Alerts for upgrades, downgrades, and cancellations', enabled: true },
                  { label: 'Weekly reports', description: 'Receive weekly platform analytics summary', enabled: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <button
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                        item.enabled ? 'bg-green-500' : 'bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                          item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Feature Flags */}
        {activeTab === 'features' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Warning Banner */}
            <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-600">
                  Feature flags affect all users on the platform. Changes take effect immediately.
                </p>
              </div>
            </div>

            {/* Feature Flags by Category */}
            {['features', 'ui', 'experimental', 'system'].map((category) => {
              const categoryFlags = featureFlags.filter(f => f.category === category)
              if (categoryFlags.length === 0) return null

              return (
                <div key={category} className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4 capitalize">{category}</h2>
                  <div className="space-y-4">
                    {categoryFlags.map((flag) => (
                      <div
                        key={flag.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{flag.name}</p>
                            {flag.category === 'experimental' && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                                Beta
                              </span>
                            )}
                            {flag.category === 'system' && (
                              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
                                Critical
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{flag.description}</p>
                        </div>
                        <button
                          onClick={() => toggleFeature(flag.id)}
                          className={cn(
                            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                            flag.enabled ? 'bg-green-500' : 'bg-muted'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                              flag.enabled ? 'translate-x-5' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Authentication</h2>
              <div className="space-y-4">
                {[
                  { label: 'Two-Factor Authentication', description: 'Require 2FA for all admin accounts', enabled: true },
                  { label: 'Session Timeout', description: 'Auto-logout after 30 minutes of inactivity', enabled: true },
                  { label: 'IP Whitelisting', description: 'Restrict admin access to specific IPs', enabled: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <button
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                        item.enabled ? 'bg-green-500' : 'bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                          item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Data & Privacy</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data Retention (days)</label>
                  <Input type="number" defaultValue="365" />
                  <p className="text-xs text-muted-foreground mt-1">
                    How long to retain user data after account deletion
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Backup Frequency</label>
                  <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm">
                    <option>Every 6 hours</option>
                    <option>Every 12 hours</option>
                    <option>Daily</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                These actions are irreversible. Proceed with caution.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600">
                  Clear Cache
                </Button>
                <Button variant="outline" className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600">
                  Reset Feature Flags
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
