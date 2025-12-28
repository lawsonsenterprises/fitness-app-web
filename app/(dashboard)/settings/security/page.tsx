'use client'

import { useState } from 'react'
import { Key, Shield, Smartphone, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

// Mock session data
const recentSessions = [
  {
    id: '1',
    device: 'Chrome on macOS',
    location: 'London, UK',
    lastActive: '2024-12-27T10:30:00Z',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'London, UK',
    lastActive: '2024-12-26T18:15:00Z',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Firefox on Windows',
    location: 'Manchester, UK',
    lastActive: '2024-12-24T09:00:00Z',
    isCurrent: false,
  },
]

export default function SecuritySettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = handleSubmit(async (formData) => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual password update API call
      console.log('Updating password:', formData.newPassword ? '[provided]' : '[empty]')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Password updated successfully')
      reset()
    } catch {
      toast.error('Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // TODO: Replace with actual session revocation API call
      console.log('Revoking session:', sessionId)
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Session revoked')
    } catch {
      toast.error('Failed to revoke session')
    }
  }

  return (
    <div className="space-y-8">
      {/* Change password */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Key className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Change Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Current Password
            </label>
            <Input
              {...register('currentPassword')}
              type="password"
              className={cn(errors.currentPassword && 'border-red-500')}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">New Password</label>
            <Input
              {...register('newPassword')}
              type="password"
              className={cn(errors.newPassword && 'border-red-500')}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm New Password
            </label>
            <Input
              {...register('confirmPassword')}
              type="password"
              className={cn(errors.confirmPassword && 'border-red-500')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword.message}
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
        </div>

        <div className="divide-y divide-border">
          {recentSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{session.device}</p>
                  {session.isCurrent && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.location} •{' '}
                  {new Date(session.lastActive).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-red-600 hover:bg-red-500/10 hover:text-red-600"
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
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
