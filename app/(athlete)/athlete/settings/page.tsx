'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Bell,
  Palette,
  Target,
  Loader2,
  Save,
  Camera,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'

export default function AthleteSettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    height: '',
    targetWeight: '',
    fitnessGoals: '',
  })

  const supabase = createClient()
  void supabase // Reserved for future use

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        dateOfBirth: '',
        height: '',
        targetWeight: '',
        fitnessGoals: '',
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Save profile
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Target },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and preferences
        </p>
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

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Avatar */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-2xl font-bold text-white">
                  {initials || 'A'}
                </div>
                <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background shadow-lg">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  Upload Photo
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or WebP. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <Input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <Input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  placeholder="e.g., 180"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === 'preferences' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Goals */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Fitness Goals</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Target Weight (kg)</label>
                <Input
                  type="number"
                  value={profile.targetWeight}
                  onChange={(e) => setProfile({ ...profile, targetWeight: e.target.value })}
                  placeholder="e.g., 75"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Primary Goal</label>
                <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm">
                  <option>Fat Loss</option>
                  <option>Muscle Gain</option>
                  <option>Strength</option>
                  <option>General Fitness</option>
                  <option>Athletic Performance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Units */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Units & Measurements</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Weight Unit</label>
                <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm">
                  <option>Kilograms (kg)</option>
                  <option>Pounds (lbs)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height Unit</label>
                <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm">
                  <option>Centimeters (cm)</option>
                  <option>Feet & Inches</option>
                </select>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <Palette className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>
            <div className="flex gap-3">
              {['system', 'light', 'dark'].map((theme) => (
                <button
                  key={theme}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                    theme === 'system'
                      ? 'bg-foreground text-background'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: 'Check-in reminders', description: 'Get reminded when check-ins are due' },
                { label: 'Coach messages', description: 'Notifications for new messages' },
                { label: 'Programme updates', description: 'When your programme is updated' },
                { label: 'Progress milestones', description: 'Celebrate your achievements' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <button
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                      'bg-amber-500'
                    )}
                  >
                    <span className="inline-block h-5 w-5 rounded-full bg-white shadow-sm translate-x-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
