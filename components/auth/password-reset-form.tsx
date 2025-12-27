'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowRight, ArrowLeft, Mail } from 'lucide-react'

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
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export function PasswordResetForm() {
  const { resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: ResetPasswordFormData) {
    setIsLoading(true)
    setError(null)

    const { error } = await resetPassword(data.email)

    if (error) {
      setError('Unable to send reset email. Please try again.')
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <Mail className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Check your inbox</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          We&apos;ve sent a password reset link to{' '}
          <span className="font-medium text-foreground">
            {form.getValues('email')}
          </span>
        </p>
        <p className="mb-8 text-xs text-muted-foreground">
          The link will expire in 24 hours. If you don&apos;t see the email,
          check your spam folder.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setSuccess(false)
              form.reset()
            }}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-lg border border-border font-medium',
              'transition-all hover:border-foreground/20 hover:bg-muted'
            )}
          >
            Try a different email
          </button>
          <Link
            href="/login"
            className={cn(
              'flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-foreground font-medium text-background',
              'transition-all hover:bg-foreground/90'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Back link */}
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                <span>Send reset link</span>
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
