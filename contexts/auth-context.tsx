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
import { useRouter, usePathname } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants'
import { type UserRole, getDefaultRole, ROLE_ROUTES } from '@/lib/roles'

// Determine active role from current URL path
function getRoleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith('/athlete')) return 'athlete'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/clients') ||
      pathname.startsWith('/programmes') || pathname.startsWith('/check-ins') ||
      pathname.startsWith('/meal-plans') || pathname.startsWith('/settings') ||
      pathname.startsWith('/notifications')) return 'coach'
  return null
}

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

// Helper to get initial role from localStorage (runs synchronously)
function getInitialActiveRole(): UserRole {
  if (typeof window === 'undefined') return 'coach' // SSR default
  const saved = localStorage.getItem('activeRole') as UserRole | null
  if (saved && ['athlete', 'coach', 'admin'].includes(saved)) {
    return saved
  }
  return 'coach' // Default to coach if nothing saved
}

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<UserRole[]>(['athlete', 'coach', 'admin'])
  const [activeRole, setActiveRoleState] = useState<UserRole>(getInitialActiveRole)

  // Fetch user roles from profile
  const fetchRoles = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', userId)
        .single()

      const userRoles = (profile?.roles && Array.isArray(profile.roles) && profile.roles.length > 0)
        ? (profile.roles as UserRole[])
        : ['athlete', 'coach', 'admin'] as UserRole[]

      setRoles(userRoles)
      // Note: activeRole is now set by the pathname sync useEffect
      // This ensures the UI always matches the current URL
    } catch (error) {
      console.error('Error fetching user roles:', error)
      // Default to all roles on error
      setRoles(['athlete', 'coach', 'admin'])
    }
  }, [supabase])

  const setActiveRole = useCallback((role: UserRole) => {
    if (roles.includes(role)) {
      setActiveRoleState(role)
      localStorage.setItem('activeRole', role)
      // Use hard navigation to ensure proper route change
      window.location.href = ROLE_ROUTES[role]
    }
  }, [roles])

  // CRITICAL: Sync activeRole with current URL pathname
  // This ensures the RoleSwitcher always reflects where the user actually is
  useEffect(() => {
    const roleFromPath = getRoleFromPathname(pathname)
    if (roleFromPath && roleFromPath !== activeRole) {
      setActiveRoleState(roleFromPath)
      localStorage.setItem('activeRole', roleFromPath)
    }
  }, [pathname, activeRole])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        if (currentSession?.user?.id) {
          await fetchRoles(currentSession.user.id)
        }
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
        if (newSession?.user?.id) {
          await fetchRoles(newSession.user.id)
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear state but don't redirect - signOut() handles redirect via window.location.href
        setRoles(['athlete'])
        setActiveRoleState('coach')
        localStorage.removeItem('activeRole')
      } else if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password/update')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router, fetchRoles])

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
    [supabase.auth, supabase, router]
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
