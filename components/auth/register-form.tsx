'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/hooks/use-auth'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export function RegisterForm() {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
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

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true)
    setError(null)

    const { error } = await signUp(data.email, data.password, {
      first_name: data.firstName,
      last_name: data.lastName,
    })

    if (error) {
      setError(error.message || 'An error occurred. Please try again.')
      setIsLoading(false)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <Check className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to{' '}
          <span className="font-medium text-foreground">
            {form.getValues('email')}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive the email?{' '}
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Name fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium">First name</Label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="James"
                      autoComplete="given-name"
                      disabled={isLoading}
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
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium">Last name</Label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Smith"
                      autoComplete="family-name"
                      disabled={isLoading}
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
          </div>

          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium">Email address</Label>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
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

          {/* Password field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium">Password</Label>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={isLoading}
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
                    disabled={isLoading}
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

          {/* Terms */}
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link
              href="/terms"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              'group relative h-12 w-full overflow-hidden rounded-lg bg-foreground font-medium text-background',
              'transition-all hover:bg-foreground/90'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-4 text-muted-foreground">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Login link */}
      <Link
        href="/login"
        className={cn(
          'flex h-12 w-full items-center justify-center rounded-lg border border-border font-medium',
          'transition-all hover:border-foreground/20 hover:bg-muted'
        )}
      >
        Sign in
      </Link>
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
