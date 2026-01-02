'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Key, Shuffle, Eye, EyeOff, Copy, Check, AlertTriangle, CheckCircle2, Apple } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useResetUserPassword, useCheckUserAuthMethod } from '@/hooks/admin'
import { validatePasswordStrength, generateSecurePassword, getPasswordStrengthPercent } from '@/lib/password-utils'

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    name: string
    email: string
  }
}

type ModeType = 'generate' | 'custom'

export function ResetPasswordModal({ isOpen, onClose, user }: ResetPasswordModalProps) {
  const [mode, setMode] = useState<ModeType>('generate')
  const [customPassword, setCustomPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forceChange, setForceChange] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [finalPassword, setFinalPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [isOAuth, setIsOAuth] = useState(false)
  const [oauthProvider, setOauthProvider] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const resetPassword = useResetUserPassword()
  const checkAuthMethod = useCheckUserAuthMethod()

  // Check if user is OAuth when modal opens
  useEffect(() => {
    if (isOpen && user.id) {
      setCheckingAuth(true)
      checkAuthMethod.mutateAsync(user.id)
        .then((result) => {
          setIsOAuth(result.isOAuth)
          setOauthProvider(result.provider || null)
        })
        .catch(() => {
          // Default to allowing password reset on error
          setIsOAuth(false)
        })
        .finally(() => {
          setCheckingAuth(false)
        })
    }
  }, [isOpen, user.id])

  const handleGeneratePassword = () => {
    const password = generateSecurePassword(16)
    setGeneratedPassword(password)
  }

  const handleReset = async () => {
    const password = mode === 'generate' ? generatedPassword : customPassword

    if (mode === 'custom') {
      const validation = validatePasswordStrength(password)
      if (!validation.valid) {
        toast.error('Invalid password', {
          description: validation.errors[0],
        })
        return
      }
    }

    if (mode === 'generate' && !generatedPassword) {
      toast.error('Please generate a password first')
      return
    }

    try {
      const result = await resetPassword.mutateAsync({
        userId: user.id,
        password: mode === 'custom' ? password : undefined,
        forceChange,
      })

      setFinalPassword(result.password || password)
      setShowSuccess(true)
      toast.success('Password reset successfully')
    } catch (error) {
      toast.error('Failed to reset password', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalPassword)
      setCopied(true)
      toast.success('Password copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy password')
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state after animation
    setTimeout(() => {
      setMode('generate')
      setCustomPassword('')
      setGeneratedPassword('')
      setShowSuccess(false)
      setFinalPassword('')
      setCopied(false)
      setForceChange(true)
      setShowPassword(false)
    }, 300)
  }

  const passwordValidation = validatePasswordStrength(customPassword)
  const strengthPercent = getPasswordStrengthPercent(customPassword)

  const isLoading = resetPassword.isPending || checkingAuth

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-over panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <p className="text-sm text-muted-foreground">
                {user.name} ({user.email})
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {checkingAuth ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">Checking account type...</p>
              </div>
            ) : isOAuth ? (
              /* OAuth User - Cannot Reset */
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                  <Apple className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Password Reset Unavailable</h3>
                <p className="text-center text-sm text-muted-foreground max-w-sm">
                  This user signs in with <strong>{oauthProvider || 'a third-party provider'}</strong>.
                  Password reset is only available for email/password accounts.
                </p>
                <Button
                  onClick={handleClose}
                  className="mt-6"
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            ) : showSuccess ? (
              /* Success State */
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Password Reset!</h3>
                <p className="text-center text-sm text-muted-foreground mb-6">
                  The new password for {user.name} is shown below.
                  {forceChange && ' They will be required to change it on next login.'}
                </p>

                {/* Password display */}
                <div className="w-full rounded-xl border border-border bg-muted/30 p-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    New Password
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-background px-3 py-2 font-mono text-sm">
                      {finalPassword}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Make sure to share this password securely with the user.
                      This password will not be shown again.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleClose}
                  className="mt-6 w-full"
                >
                  Done
                </Button>
              </div>
            ) : (
              /* Reset Form */
              <div className="space-y-6">
                {/* Mode Selection */}
                <div className="flex gap-2 rounded-lg border border-border p-1">
                  <button
                    onClick={() => setMode('generate')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      mode === 'generate'
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Shuffle className="h-4 w-4" />
                    Generate Random
                  </button>
                  <button
                    onClick={() => setMode('custom')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      mode === 'custom'
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Key className="h-4 w-4" />
                    Set Custom
                  </button>
                </div>

                {mode === 'generate' ? (
                  /* Generate Random Mode */
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Generated Password
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={generatedPassword}
                            readOnly
                            placeholder="Click generate to create password"
                            className={cn(
                              'h-12 rounded-lg border-border bg-background font-mono',
                              'focus:border-foreground/50 focus:ring-2 focus:ring-foreground/20'
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGeneratePassword}
                          className="h-12 px-4"
                        >
                          <Shuffle className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Generates a secure 16-character password
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Custom Password Mode */
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Custom Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={customPassword}
                          onChange={(e) => setCustomPassword(e.target.value)}
                          placeholder="Enter custom password"
                          className={cn(
                            'h-12 rounded-lg border-border bg-background pr-10',
                            'focus:border-foreground/50 focus:ring-2 focus:ring-foreground/20'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {customPassword && (
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
                  </div>
                )}

                {/* Force Change Option */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceChange}
                      onChange={(e) => setForceChange(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                    />
                    <div>
                      <p className="font-medium text-sm">Require password change on next login</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        The user will be forced to set a new password before accessing the app
                      </p>
                    </div>
                  </label>
                </div>

                {/* Warning */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-medium text-amber-600 text-sm">
                        This will reset the user&apos;s password
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The current password will be invalidated immediately. Make sure to communicate the new password to the user securely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!showSuccess && !isOAuth && !checkingAuth && (
            <div className="border-t border-border px-6 py-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  disabled={
                    isLoading ||
                    (mode === 'generate' && !generatedPassword) ||
                    (mode === 'custom' && !passwordValidation.valid)
                  }
                  className={cn(
                    'flex-1 bg-red-600 text-white hover:bg-red-700',
                    'disabled:opacity-50'
                  )}
                >
                  {resetPassword.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
