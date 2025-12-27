'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { useSupabase } from './use-supabase'
import { ROUTES } from '@/lib/constants'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
}

/**
 * Authentication hook for managing user sessions
 * Provides sign in, sign up, sign out, and password reset functionality
 */
export function useAuth(): UseAuthReturn {
  const supabase = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error) {
        router.push(ROUTES.DASHBOARD)
        router.refresh()
      }

      return { error: error as Error | null }
    },
    [supabase.auth, router]
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: Record<string, unknown>
    ) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      return { error: error as Error | null }
    },
    [supabase.auth]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push(ROUTES.LOGIN)
    router.refresh()
  }, [supabase.auth, router])

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      })

      return { error: error as Error | null }
    },
    [supabase.auth]
  )

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
