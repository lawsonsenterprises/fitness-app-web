'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthProviderState {
  isOAuth: boolean
  provider: string | null
  isLoading: boolean
  isEmailPassword: boolean
}

/**
 * Hook to detect whether the current user signed in with OAuth or email/password
 *
 * Usage:
 * ```tsx
 * const { isOAuth, provider, isEmailPassword, isLoading } = useAuthProvider()
 *
 * if (isLoading) return <Spinner />
 * if (isOAuth) return <p>You sign in with {provider}</p>
 * if (isEmailPassword) return <PasswordChangeForm />
 * ```
 */
export function useAuthProvider(): AuthProviderState {
  const [state, setState] = useState<AuthProviderState>({
    isOAuth: false,
    provider: null,
    isLoading: true,
    isEmailPassword: false,
  })

  useEffect(() => {
    const checkAuthProvider = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setState({
            isOAuth: false,
            provider: null,
            isLoading: false,
            isEmailPassword: false,
          })
          return
        }

        // Check identities array for OAuth providers
        const identities = user.identities || []
        const oauthIdentity = identities.find(id => id.provider !== 'email')

        if (oauthIdentity) {
          setState({
            isOAuth: true,
            provider: oauthIdentity.provider,
            isLoading: false,
            isEmailPassword: false,
          })
        } else {
          setState({
            isOAuth: false,
            provider: null,
            isLoading: false,
            isEmailPassword: true,
          })
        }
      } catch (error) {
        console.error('Error checking auth provider:', error)
        setState({
          isOAuth: false,
          provider: null,
          isLoading: false,
          isEmailPassword: false,
        })
      }
    }

    checkAuthProvider()
  }, [])

  return state
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: string | null): string {
  if (!provider) return 'Unknown'

  const displayNames: Record<string, string> = {
    apple: 'Apple',
    google: 'Google',
    github: 'GitHub',
    twitter: 'Twitter',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    email: 'Email',
  }

  return displayNames[provider] || provider.charAt(0).toUpperCase() + provider.slice(1)
}
