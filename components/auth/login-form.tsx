'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'

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
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    setError(null)

    const { error } = await signIn(data.email, data.password)

    if (error) {
      setError('Invalid email or password. Please try again.')
      setIsLoading(false)
    }
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
          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email address
                </Label>
                <FormControl>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className={cn(
                      'h-12 rounded-lg border-border bg-background px-4 transition-all',
                      'placeholder:text-muted-foreground/60',
                      'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20',
                      'disabled:opacity-50'
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
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                  <Link
                    href="/reset-password"
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className={cn(
                        'h-12 rounded-lg border-border bg-background px-4 pr-12 transition-all',
                        'placeholder:text-muted-foreground/60',
                        'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20',
                        'disabled:opacity-50'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
              </FormItem>
            )}
          />

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              'group relative h-12 w-full overflow-hidden rounded-lg bg-foreground font-medium text-background',
              'transition-all hover:bg-foreground/90',
              'disabled:opacity-50'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
            {/* Shimmer effect */}
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
            New to Synced Momentum?
          </span>
        </div>
      </div>

      {/* Register link */}
      <Link
        href="/register"
        className={cn(
          'flex h-12 w-full items-center justify-center rounded-lg border border-border font-medium',
          'transition-all hover:border-foreground/20 hover:bg-muted'
        )}
      >
        Create an account
      </Link>
    </div>
  )
}
