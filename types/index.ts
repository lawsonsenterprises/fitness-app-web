// Shared TypeScript types for the Synced Momentum Coach Platform

import type { User } from '@supabase/supabase-js'

// Re-export database types when generated
export * from './database.types'

// User types
export interface CoachProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  businessName?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  profile: CoachProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Client types (athletes the coach manages)
export interface Client {
  id: string
  coachId: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  status: ClientStatus
  createdAt: string
  updatedAt: string
}

export type ClientStatus = 'active' | 'inactive' | 'pending' | 'archived'

// Dashboard types
export interface DashboardStats {
  totalClients: number
  activeClients: number
  pendingCheckIns: number
  upcomingProgrammes: number
}

// Navigation types
export interface NavItem {
  label: string
  href: string
  icon: string
}
