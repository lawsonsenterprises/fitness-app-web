'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface SearchAthleteResult {
  success: boolean
  error?: string
  profile?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    email: string | null
  }
}

export async function searchAthleteByEmail(email: string): Promise<SearchAthleteResult> {
  try {
    // First verify the current user is a coach
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if current user is a coach
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', currentUser.id)
      .single()

    if (!profile?.roles?.includes('coach')) {
      return { success: false, error: 'Unauthorized - only coaches can search for athletes' }
    }

    // Use admin client to bypass RLS and search for the athlete
    const adminClient = createAdminClient()

    // Search for profile by email (check both email and contact_email fields)
    const { data: profiles, error: searchError } = await adminClient
      .from('profiles')
      .select('id, display_name, avatar_url, email, contact_email, roles')
      .or(`email.eq.${email},contact_email.eq.${email}`)

    if (searchError) {
      console.error('Search error:', searchError)
      return { success: false, error: 'Failed to search for user' }
    }

    if (!profiles || profiles.length === 0) {
      return { success: false, error: 'No user found with this email. They need to sign up first.' }
    }

    const foundProfile = profiles[0]

    // Check if user has athlete role
    if (!foundProfile.roles?.includes('athlete')) {
      return { success: false, error: 'This user is not registered as an athlete.' }
    }

    // Check if already a client of this coach
    const { data: existingRelation } = await adminClient
      .from('coach_clients')
      .select('id, status')
      .eq('coach_id', currentUser.id)
      .eq('client_id', foundProfile.id)
      .single()

    if (existingRelation) {
      if (existingRelation.status === 'active' || existingRelation.status === 'paused') {
        return { success: false, error: 'This athlete is already your client.' }
      }
    }

    return {
      success: true,
      profile: {
        id: foundProfile.id,
        display_name: foundProfile.display_name,
        avatar_url: foundProfile.avatar_url,
        email: foundProfile.contact_email || foundProfile.email,
      },
    }
  } catch (error) {
    console.error('Error searching for athlete:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
