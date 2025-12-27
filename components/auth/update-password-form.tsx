'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowRight, Eye, EyeOff, Check, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/contexts/auth-context'
import { newPasswordSchema, type NewPasswordFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export function UpdatePasswordForm() {
  const { updatePassword, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = form.watch('password')

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  }

  const formLoading = isLoading || authLoading

  async function onSubmit(data: NewPasswordFormData) {
    setIsLoading(true)
    setError(null)

    const { error: updateError } = await updatePassword(data.password)

    if (updateError) {
      setError(updateError.message || 'Unable to update password. Please try again.')
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <ShieldCheck className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Password updated</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Your password has been successfully updated. You&apos;ll be redirected
          to the dashboard shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Create new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below to complete the reset process.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Password field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium">New password</Label>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={formLoading}
                      className={cn(
                        'h-12 rounded-lg border-border bg-background px-4 pr-12',
                        'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />

                {/* Password strength indicators */}
                {password.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <PasswordCheck
                      valid={passwordChecks.length}
                      label="8+ characters"
                    />
                    <PasswordCheck
                      valid={passwordChecks.uppercase}
                      label="Uppercase letter"
                    />
                    <PasswordCheck
                      valid={passwordChecks.lowercase}
                      label="Lowercase letter"
                    />
                    <PasswordCheck
                      valid={passwordChecks.number}
                      label="Number"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Confirm password field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium">Confirm password</Label>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={formLoading}
                    className={cn(
                      'h-12 rounded-lg border-border bg-background px-4',
                      'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Submit button */}
          <Button
            type="submit"
            disabled={formLoading}
            className={cn(
              'group relative h-12 w-full overflow-hidden rounded-lg bg-foreground font-medium text-background',
              'transition-all hover:bg-foreground/90'
            )}
          >
            {formLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Update password</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Button>
        </form>
      </Form>
    </div>
  )
}

function PasswordCheck({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 transition-colors',
        valid ? 'text-amber-500' : 'text-muted-foreground'
      )}
    >
      <div
        className={cn(
          'flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-all',
          valid
            ? 'border-amber-500 bg-amber-500'
            : 'border-muted-foreground/30'
        )}
      >
        {valid && <Check className="h-2 w-2 text-background" />}
      </div>
      <span>{label}</span>
    </div>
  )
}
