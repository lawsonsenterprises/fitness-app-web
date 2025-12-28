'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AppleSignInButtonProps {
  mode?: 'signin' | 'signup'
  className?: string
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

export function AppleSignInButton({
  mode = 'signin',
  className,
}: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAppleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            // Request email and name from Apple
            scope: 'name email',
          },
        },
      })

      if (oauthError) {
        console.error('Apple OAuth error:', oauthError)
        setError('Unable to connect to Apple. Please try again.')
        setIsLoading(false)
      }
      // If successful, the user will be redirected to Apple
    } catch (err) {
      console.error('Apple sign in error:', err)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const buttonText = mode === 'signup' ? 'Sign up with Apple' : 'Continue with Apple'

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAppleSignIn}
        disabled={isLoading}
        aria-label={buttonText}
        className={cn(
          // Base styles - Apple HIG compliant
          'group relative flex h-12 w-full items-center justify-center gap-3 rounded-lg',
          'bg-black text-white font-medium text-[15px]',
          // Transitions
          'transition-all duration-200 ease-out',
          // Hover state
          'hover:bg-[#1d1d1f]',
          // Active/pressed state
          'active:scale-[0.98] active:bg-[#333336]',
          // Focus state for accessibility
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          // Disabled state
          'disabled:pointer-events-none disabled:opacity-60',
          className
        )}
      >
        {/* Subtle shine effect on hover */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300',
            'bg-gradient-to-r from-transparent via-white/5 to-transparent',
            'group-hover:opacity-100'
          )}
        />

        {/* Content */}
        <div className="relative flex items-center justify-center gap-3">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <AppleIcon className="h-5 w-5" />
              <span>{buttonText}</span>
            </>
          )}
        </div>
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-center text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Divider component for use between email form and social auth
export function AuthDivider({ text = 'or' }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-4 text-muted-foreground tracking-wider">
          {text}
        </span>
      </div>
    </div>
  )
}
