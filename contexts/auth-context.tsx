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
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants'
import { type UserRole, getDefaultRole, ROLE_ROUTES } from '@/lib/roles'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  roles: UserRole[]
  activeRole: UserRole
  setActiveRole: (role: UserRole) => void
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

// SSR-safe default - localStorage is read in useEffect after mount
const SSR_DEFAULT_ROLE: UserRole = 'coach'

// Create client once outside component - singleton pattern
const supabase = createClient()

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<UserRole[]>(['athlete', 'coach', 'admin'])
  const [activeRole, setActiveRoleState] = useState<UserRole>(SSR_DEFAULT_ROLE)
  const [hasMounted, setHasMounted] = useState(false)

  // Fetch user roles from profile
  const fetchRoles = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', userId)
        .single()

      console.log('[AUTH] fetchRoles - profile data:', profile)

      const userRoles = (profile?.roles && Array.isArray(profile.roles) && profile.roles.length > 0)
        ? (profile.roles as UserRole[])
        : ['athlete', 'coach', 'admin'] as UserRole[]

      console.log('[AUTH] fetchRoles - setting roles:', userRoles)
      setRoles(userRoles)

      // Set active role from localStorage or default
      const savedRole = localStorage.getItem('activeRole') as UserRole | null
      console.log('[AUTH] fetchRoles - savedRole from localStorage:', savedRole)
      if (savedRole && userRoles.includes(savedRole)) {
        console.log('[AUTH] fetchRoles - using saved role:', savedRole)
        setActiveRoleState(savedRole)
      } else {
        const defaultRole = getDefaultRole(userRoles)
        console.log('[AUTH] fetchRoles - using default role:', defaultRole)
        setActiveRoleState(defaultRole)
        localStorage.setItem('activeRole', defaultRole)
      }
    } catch (error) {
      console.error('Error fetching user roles:', error)
      // Default to all roles on error
      setRoles(['athlete', 'coach', 'admin'])
    }
  }, [])

  const setActiveRole = useCallback((role: UserRole) => {
    console.log('[AUTH] setActiveRole called:', { role, roles, includes: roles.includes(role) })
    if (roles.includes(role)) {
      setActiveRoleState(role)
      localStorage.setItem('activeRole', role)
      // Use hard navigation to ensure proper route change
      console.log('[AUTH] Navigating to:', ROLE_ROUTES[role])
      window.location.href = ROLE_ROUTES[role]
    } else {
      console.warn('[AUTH] Role not in user roles, navigation blocked:', { role, roles })
    }
  }, [roles])

  // Read localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setHasMounted(true)
    const savedRole = localStorage.getItem('activeRole') as UserRole | null
    if (savedRole && ['athlete', 'coach', 'admin'].includes(savedRole)) {
      console.log('[AUTH] Mount - restoring role from localStorage:', savedRole)
      setActiveRoleState(savedRole)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('[AUTH] getSession - starting')
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()
        console.log('[AUTH] getSession - got session:', !!currentSession)
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        if (currentSession?.user?.id) {
          console.log('[AUTH] getSession - fetching roles for user:', currentSession.user.id)
          await fetchRoles(currentSession.user.id)
          console.log('[AUTH] getSession - fetchRoles complete')
        }
      } catch (error) {
        console.error('[AUTH] getSession - error:', error)
      } finally {
        console.log('[AUTH] getSession - setting isLoading to false')
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
        if (newSession?.user?.id) {
          await fetchRoles(newSession.user.id)
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear state but don't redirect - signOut() handles redirect via window.location.href
        setRoles(['athlete'])
        setActiveRoleState('coach')
        localStorage.removeItem('activeRole')
      } else if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password/update'
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchRoles])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!error && data.user) {
          // Fetch user roles to determine redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('roles')
            .eq('id', data.user.id)
            .single()

          const userRoles = (profile?.roles as UserRole[]) || ['athlete', 'coach', 'admin']
          setRoles(userRoles)

          // Always show role selector on login - use hard navigation
          window.location.href = '/select-role'
        }

        return { error: error as Error | null }
      } finally {
        setIsLoading(false)
      }
    },
    []
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
    []
  )

  const signOut = useCallback(async () => {
    setIsLoading(true)
    try {
      // Clear local state FIRST
      setUser(null)
      setSession(null)
      setRoles(['athlete'])
      setActiveRoleState('coach')
      localStorage.removeItem('activeRole')

      // Sign out from Supabase with global scope to clear all sessions
      await supabase.auth.signOut({ scope: 'global' })

      // Force a hard navigation to clear any cached state
      window.location.href = ROUTES.LOGIN
    } catch {
      // Still redirect even on error
      window.location.href = ROUTES.LOGIN
    } finally {
      setIsLoading(false)
    }
  }, [])

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
    []
  )

  const updatePassword = useCallback(
    async (password: string) => {
      setIsLoading(true)
      try {
        const { error } = await supabase.auth.updateUser({ password })

        if (!error) {
          window.location.href = ROUTES.DASHBOARD
        }

        return { error: error as Error | null }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      roles,
      activeRole,
      setActiveRole,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [user, session, isLoading, roles, activeRole, setActiveRole, signIn, signUp, signOut, resetPassword, updatePassword]
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
