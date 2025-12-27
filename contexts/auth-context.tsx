'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    metadata?: { firstName: string; lastName: string }
  ) => Promise<{ error: Error | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setIsLoading(false)

      // Handle specific auth events
      if (event === 'SIGNED_IN') {
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        router.push(ROUTES.LOGIN)
        router.refresh()
      } else if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password/update')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!error) {
          router.push(ROUTES.DASHBOARD)
        }

        return { error: error as Error | null }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase.auth, router]
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: { firstName: string; lastName: string }
    ) => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: metadata?.firstName,
              last_name: metadata?.lastName,
              full_name: metadata
                ? `${metadata.firstName} ${metadata.lastName}`
                : undefined,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        // Check if email confirmation is required
        const needsConfirmation = !data.session && !error

        return { error: error as Error | null, needsConfirmation }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase.auth]
  )

  const signOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
    } finally {
      setIsLoading(false)
    }
  }, [supabase.auth])

  const resetPassword = useCallback(
    async (email: string) => {
      setIsLoading(true)
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password/update`,
        })

        return { error: error as Error | null }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase.auth]
  )

  const updatePassword = useCallback(
    async (password: string) => {
      setIsLoading(true)
      try {
        const { error } = await supabase.auth.updateUser({ password })

        if (!error) {
          router.push(ROUTES.DASHBOARD)
        }

        return { error: error as Error | null }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase.auth, router]
  )

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [user, session, isLoading, signIn, signUp, signOut, resetPassword, updatePassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
