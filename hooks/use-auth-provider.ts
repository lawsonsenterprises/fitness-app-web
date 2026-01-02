'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthProviderState {
  isOAuth: boolean
  isOAuthOnly: boolean
  provider: string | null
  isLoading: boolean
  isEmailPassword: boolean
  hasBothMethods: boolean
  providers: string[]
}

/**
 * Hook to detect the current user's authentication methods
 *
 * Usage:
 * ```tsx
 * const { isOAuthOnly, isEmailPassword, hasBothMethods, providers, isLoading } = useAuthProvider()
 *
 * if (isLoading) return <Spinner />
 * if (isOAuthOnly) return <AddPasswordForm />
 * if (isEmailPassword || hasBothMethods) return <ChangePasswordForm />
 * ```
 */
export function useAuthProvider(): AuthProviderState {
  const [state, setState] = useState<AuthProviderState>({
    isOAuth: false,
    isOAuthOnly: false,
    provider: null,
    isLoading: true,
    isEmailPassword: false,
    hasBothMethods: false,
    providers: [],
  })

  useEffect(() => {
    const checkAuthProvider = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setState({
            isOAuth: false,
            isOAuthOnly: false,
            provider: null,
            isLoading: false,
            isEmailPassword: false,
            hasBothMethods: false,
            providers: [],
          })
          return
        }

        // Check identities array for all providers
        const identities = user.identities || []

        const oauthIdentities = identities.filter(id => id.provider !== 'email')
        const emailIdentity = identities.find(id => id.provider === 'email')

        // Check for password set via user_metadata flag (for OAuth users who added a password)
        const hasPasswordFromMetadata = user.user_metadata?.has_password === true

        const hasOAuth = oauthIdentities.length > 0
        const hasEmail = !!emailIdentity || hasPasswordFromMetadata

        // Build providers list including password if set
        const providers = identities.map(id => id.provider)
        if (hasPasswordFromMetadata && !providers.includes('email')) {
          providers.push('email')
        }

        setState({
          isOAuth: hasOAuth,
          isOAuthOnly: hasOAuth && !hasEmail,
          provider: oauthIdentities[0]?.provider || null,
          isLoading: false,
          isEmailPassword: hasEmail,
          hasBothMethods: hasOAuth && hasEmail,
          providers,
        })
      } catch (error) {
        console.error('Error checking auth provider:', error)
        setState({
          isOAuth: false,
          isOAuthOnly: false,
          provider: null,
          isLoading: false,
          isEmailPassword: false,
          hasBothMethods: false,
          providers: [],
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
