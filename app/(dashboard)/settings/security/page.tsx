'use client'

import { useState } from 'react'
import { Key, Shield, Smartphone, Clock, AlertTriangle, Loader2, Apple, Check, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useAuthProvider, getProviderDisplayName } from '@/hooks/use-auth-provider'

// Schema for changing password (requires current password)
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, 'Password must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Schema for adding password (OAuth-only users, no current password needed)
const addPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, 'Password must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
type AddPasswordFormData = z.infer<typeof addPasswordSchema>

export default function SecuritySettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isRevokingSession, setIsRevokingSession] = useState<string | null>(null)
  const supabase = createClient()
  const { isOAuthOnly, provider, isLoading: isAuthLoading, isEmailPassword, hasBothMethods, providers } = useAuthProvider()

  // Form for changing password (email/password users)
  const changePasswordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  // Form for adding password (OAuth-only users)
  const addPasswordForm = useForm<AddPasswordFormData>({
    resolver: zodResolver(addPasswordSchema),
  })

  const onChangePassword = changePasswordForm.handleSubmit(async (formData) => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('User not found')
      }

      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        setIsSubmitting(false)
        return
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      })

      if (updateError) throw updateError

      toast.success('Password updated successfully')
      changePasswordForm.reset()
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Failed to update password', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  const onAddPassword = addPasswordForm.handleSubmit(async (formData) => {
    setIsSubmitting(true)
    try {
      // For OAuth users, we can directly set a password without verifying current
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      })

      if (updateError) throw updateError

      toast.success('Password added successfully', {
        description: 'You can now sign in with either Apple or email/password.',
      })
      addPasswordForm.reset()

      // Reload the page to refresh auth state
      window.location.reload()
    } catch (error) {
      console.error('Add password error:', error)
      toast.error('Failed to add password', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevokingSession(sessionId)
    try {
      // Sign out from other sessions by signing out globally then signing back in
      // Note: Supabase doesn't have per-session revocation, so we sign out all other sessions
      await supabase.auth.signOut({ scope: 'others' })
      toast.success('Other sessions have been signed out')
    } catch (error) {
      console.error('Session revocation error:', error)
      toast.error('Failed to revoke session')
    } finally {
      setIsRevokingSession(null)
    }
  }


  return (
    <div className="space-y-8">
      {/* Sign-in Methods */}
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
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Plus className="h-4 w-4" />
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
          /* OAuth-Only User - Add Password Form */
          <>
            <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-sm text-muted-foreground">
                You currently sign in with <strong>{getProviderDisplayName(provider)}</strong>.
                Adding a password gives you a backup way to access your account if you ever
                can&apos;t use {getProviderDisplayName(provider)}.
              </p>
            </div>

            <form onSubmit={onAddPassword} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Password</label>
                <Input
                  {...addPasswordForm.register('newPassword')}
                  type="password"
                  placeholder="Create a strong password"
                  className={cn(addPasswordForm.formState.errors.newPassword && 'border-red-500')}
                />
                {addPasswordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {addPasswordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  {...addPasswordForm.register('confirmPassword')}
                  type="password"
                  placeholder="Confirm your password"
                  className={cn(addPasswordForm.formState.errors.confirmPassword && 'border-red-500')}
                />
                {addPasswordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {addPasswordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">
                  Password requirements:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• At least 8 characters</li>
                  <li>• At least one uppercase letter</li>
                  <li>• At least one lowercase letter</li>
                  <li>• At least one number</li>
                  <li>• At least one special character (!@#$%^&*)</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-foreground text-background hover:bg-foreground/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Password
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          /* Email/Password User (or Both) - Change Password Form */
          <form onSubmit={onChangePassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Current Password
              </label>
              <Input
                {...changePasswordForm.register('currentPassword')}
                type="password"
                className={cn(changePasswordForm.formState.errors.currentPassword && 'border-red-500')}
              />
              {changePasswordForm.formState.errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {changePasswordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">New Password</label>
              <Input
                {...changePasswordForm.register('newPassword')}
                type="password"
                className={cn(changePasswordForm.formState.errors.newPassword && 'border-red-500')}
              />
              {changePasswordForm.formState.errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {changePasswordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                {...changePasswordForm.register('confirmPassword')}
                type="password"
                className={cn(changePasswordForm.formState.errors.confirmPassword && 'border-red-500')}
              />
              {changePasswordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {changePasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                Password requirements:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• At least 8 characters</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one lowercase letter</li>
                <li>• At least one number</li>
                <li>• At least one special character (!@#$%^&*)</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
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
              onClick={() => handleRevokeSession('others')}
              disabled={isRevokingSession !== null}
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

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
            <Button
              variant="outline"
              className="mt-4 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
