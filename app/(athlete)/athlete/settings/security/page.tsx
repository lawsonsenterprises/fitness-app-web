'use client'

import { useState } from 'react'
import {
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
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useAuthProvider, getProviderDisplayName } from '@/hooks/use-auth-provider'
import { validatePasswordStrength, getPasswordStrengthPercent } from '@/lib/password-utils'
import { changePassword } from '@/app/actions/change-password'

export default function AthleteSecuritySettingsPage() {
  const { isOAuthOnly, provider, isLoading: isAuthLoading, hasBothMethods, providers } = useAuthProvider()
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

  const handleChangePassword = async () => {
    if (!currentPassword || !passwordValidation.valid || !passwordsMatch) return

    setIsChangingPassword(true)
    try {
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

  return (
    <div className="space-y-6">
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
    </div>
  )
}
