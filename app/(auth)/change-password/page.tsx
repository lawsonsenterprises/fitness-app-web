'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Eye, EyeOff, Check, X, AlertTriangle, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { validatePasswordStrength, getPasswordStrengthPercent } from '@/lib/password-utils'
import { changePassword } from '@/app/actions/change-password'
import { createClient } from '@/lib/supabase/client'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const passwordValidation = validatePasswordStrength(newPassword)
  const strengthPercent = getPasswordStrengthPercent(newPassword)
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0

  const canSubmit = passwordValidation.valid && passwordsMatch && !isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) return

    setIsLoading(true)

    try {
      const result = await changePassword(newPassword)

      if (result.success) {
        toast.success('Password changed successfully')
        // Redirect to dashboard after successful change
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.error('Failed to change password', {
          description: result.error,
        })
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Change Your Password</h1>
          <p className="mt-2 text-muted-foreground">
            Your password must be changed before you can continue.
          </p>
        </div>

        {/* Warning */}
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              An administrator has requested you change your password. Please create a new secure password to continue using the platform.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={cn(
                  'h-12 rounded-lg border-border bg-background pr-10',
                  'focus:border-foreground/50 focus:ring-2 focus:ring-foreground/20'
                )}
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
                placeholder="Confirm new password"
                className={cn(
                  'h-12 rounded-lg border-border bg-background pr-10',
                  'focus:border-foreground/50 focus:ring-2 focus:ring-foreground/20',
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Change Password'
            )}
          </Button>
        </form>

        {/* Logout Option */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out instead
          </button>
        </div>
      </div>
    </div>
  )
}
