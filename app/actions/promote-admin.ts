'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface PromoteAdminResult {
  success: boolean
  error?: string
}

export async function promoteAdmin(userId: string): Promise<PromoteAdminResult> {
  try {
    // First verify the current user is an admin
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if current user is admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile?.roles?.includes('super_admin')) {
      return { success: false, error: 'Unauthorized - only super admins can promote users to admin' }
    }

    // Use admin client to bypass RLS and update the target user's roles
    const adminClient = createAdminClient()

    // Get the target user's current roles
    const { data: targetProfile, error: fetchError } = await adminClient
      .from('profiles')
      .select('roles, display_name, contact_email')
      .eq('id', userId)
      .single()

    if (fetchError || !targetProfile) {
      return { success: false, error: 'User not found' }
    }

    const currentRoles = targetProfile.roles || []

    if (currentRoles.includes('admin')) {
      return { success: false, error: 'User is already an admin' }
    }

    const newRoles = [...currentRoles, 'admin']

    // Update the roles and verify
    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .update({ roles: newRoles, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('roles')
      .single()

    if (updateError) {
      return { success: false, error: `Failed to update roles: ${updateError.message}` }
    }

    // Verify the update actually applied
    if (!updatedProfile?.roles?.includes('admin')) {
      console.error('Admin role promotion failed silently for user:', userId)
      return { success: false, error: 'Failed to update user roles. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error promoting admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
