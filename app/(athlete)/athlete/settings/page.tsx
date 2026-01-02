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
  Key,
  Shield,
  Smartphone,
  Clock,
  AlertTriangle,
  Apple,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { useAuthProvider, getProviderDisplayName } from '@/hooks/use-auth-provider'
import { validatePasswordStrength, getPasswordStrengthPercent } from '@/lib/password-utils'
import { changePassword } from '@/app/actions/change-password'

export default function AthleteSettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile')
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

  // Security tab state
  const { isOAuth, isOAuthOnly, provider, isLoading: isAuthLoading, hasBothMethods, providers } = useAuthProvider()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isRevokingSession, setIsRevokingSession] = useState(false)

  const passwordValidation = validatePasswordStrength(newPassword)
  const strengthPercent = getPasswordStrengthPercent(newPassword)
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0

  const supabase = createClient()

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

  const handleChangePassword = async () => {
    if (!currentPassword || !passwordValidation.valid || !passwordsMatch) return

    setIsChangingPassword(true)
    try {
      // Verify current password first
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) {
        toast.error('User not found')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        return
      }

      // Change password using server action
      const result = await changePassword(newPassword)

      if (result.success) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error('Failed to change password', {
          description: result.error,
        })
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleRevokeSession = async () => {
    setIsRevokingSession(true)
    try {
      await supabase.auth.signOut({ scope: 'others' })
      toast.success('Other sessions have been signed out')
    } catch {
      toast.error('Failed to revoke sessions')
    } finally {
      setIsRevokingSession(false)
    }
  }

  const canChangePassword = currentPassword && passwordValidation.valid && passwordsMatch && !isChangingPassword

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Target },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Key },
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

      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Sign-in Methods - Show for OAuth users */}
          {!isAuthLoading && (isOAuthOnly || hasBothMethods) && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Sign-in Methods</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ways you can access your account
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {providers.includes('apple') && (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Apple className="h-5 w-5" />
                      <span className="font-medium">Apple</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-emerald-600">
                      <Check className="h-4 w-4" />
                      Connected
                    </span>
                  </div>
                )}
                {providers.includes('email') ? (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5" />
                      <span className="font-medium">Email & Password</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-emerald-600">
                      <Check className="h-4 w-4" />
                      Connected
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-muted-foreground">Email & Password</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Not set up
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add/Change Password */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Key className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {isOAuthOnly ? 'Add Password' : 'Change Password'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isOAuthOnly
                    ? 'Add a password to sign in with email as an alternative to Apple'
                    : 'Update your password to keep your account secure'}
                </p>
              </div>
            </div>

            {isAuthLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isOAuthOnly ? (
              /* OAuth-Only User - Can Add Password */
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    You currently sign in with <strong>{getProviderDisplayName(provider)}</strong>.
                    Adding a password gives you a backup way to access your account.
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-3">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          strengthPercent <= 25 && 'bg-red-500',
                          strengthPercent > 25 && strengthPercent <= 50 && 'bg-orange-500',
                          strengthPercent > 50 && strengthPercent <= 75 && 'bg-yellow-500',
                          strengthPercent > 75 && 'bg-emerald-500'
                        )}
                        style={{ width: `${strengthPercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.minLength ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        8+ characters
                      </div>
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.hasUppercase ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Uppercase letter
                      </div>
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.hasLowercase ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Lowercase letter
                      </div>
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.hasNumber ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Number
                      </div>
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.hasSpecialChar ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.hasSpecialChar ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Special character
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={cn(
                        'pr-10',
                        confirmPassword && !passwordsMatch && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <Button
                  onClick={async () => {
                    if (!passwordValidation.valid || !passwordsMatch) return
                    setIsChangingPassword(true)
                    try {
                      // Set password and mark that user has a password in metadata
                      const { error: updateError } = await supabase.auth.updateUser({
                        password: newPassword,
                        data: { has_password: true }
                      })

                      if (updateError) {
                        toast.error('Failed to add password', { description: updateError.message })
                        return
                      }

                      toast.success('Password added successfully', {
                        description: 'You can now sign in with either Apple or email/password.',
                      })
                      setNewPassword('')
                      setConfirmPassword('')
                      window.location.reload()
                    } catch {
                      toast.error('An error occurred')
                    } finally {
                      setIsChangingPassword(false)
                    }
                  }}
                  disabled={!passwordValidation.valid || !passwordsMatch || isChangingPassword}
                  className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Password'
                  )}
                </Button>
              </div>
            ) : (
              /* Email/Password User - Show Form */
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-3">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          strengthPercent <= 25 && 'bg-red-500',
                          strengthPercent > 25 && strengthPercent <= 50 && 'bg-orange-500',
                          strengthPercent > 50 && strengthPercent <= 75 && 'bg-yellow-500',
                          strengthPercent > 75 && 'bg-emerald-500'
                        )}
                        style={{ width: `${strengthPercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.minLength ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        8+ characters
                      </div>
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.hasUppercase ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Uppercase letter
                      </div>
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.hasLowercase ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Lowercase letter
                      </div>
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.hasNumber ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Number
                      </div>
                      <div className={cn('flex items-center gap-1.5', passwordValidation.checks.hasSpecialChar ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {passwordValidation.checks.hasSpecialChar ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Special character
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        'pr-10',
                        confirmPassword && !passwordsMatch && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={!canChangePassword}
                  className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Two-factor authentication */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Smartphone className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                  <div className="mt-3">
                    {twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                        <Shield className="h-3.5 w-3.5" />
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Not enabled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>

          {/* Active sessions */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Active Sessions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage devices where you&apos;re logged in
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeSession}
                  disabled={isRevokingSession}
                  className="text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
                >
                  {isRevokingSession ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    'Sign out other sessions'
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Current Session</p>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This device • {new Date().toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
