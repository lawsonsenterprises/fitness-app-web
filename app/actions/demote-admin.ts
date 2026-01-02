'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface DemoteAdminResult {
  success: boolean
  error?: string
}

export async function demoteAdmin(userId: string): Promise<DemoteAdminResult> {
  try {
    // First verify the current user is an admin
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Prevent self-demotion
    if (userId === currentUser.id) {
      return { success: false, error: 'You cannot remove your own admin access' }
    }

    // Check if current user is admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile?.roles?.includes('admin')) {
      return { success: false, error: 'Unauthorized - admin access required' }
    }

    // Use admin client to bypass RLS and update the target user's roles
    const adminClient = createAdminClient()

    // Get the target user's current roles
    const { data: targetProfile, error: fetchError } = await adminClient
      .from('profiles')
      .select('roles, display_name, contact_email')
      .eq('id', userId)
      .single()

    if (fetchError) {
      return { success: false, error: 'User not found' }
    }

    const currentRoles = targetProfile?.roles || []

    if (!currentRoles.includes('admin')) {
      return { success: false, error: 'User is not an admin' }
    }

    // Prevent demoting super admins
    if (currentRoles.includes('super_admin')) {
      return { success: false, error: 'Super admins cannot be demoted' }
    }

    const newRoles = currentRoles.filter((role: string) => role !== 'admin')

    // Ensure user has at least athlete role
    if (newRoles.length === 0) {
      newRoles.push('athlete')
    }

    // Update the roles
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ roles: newRoles, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: `Failed to update roles: ${updateError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error demoting admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
