'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook to access the Supabase client in client components
 * Creates a memoised instance to prevent unnecessary re-creation
 */
export function useSupabase() {
  const supabase = useMemo(() => createClient(), [])
  return supabase
}
