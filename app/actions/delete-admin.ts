'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface DeleteAdminResult {
  success: boolean
  error?: string
}

/**
 * Permanently delete an admin user from the system
 * Only for admin-only users who have no other roles
 */
export async function deleteAdmin(userId: string): Promise<DeleteAdminResult> {
  try {
    // First verify the current user is an admin
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return { success: false, error: 'You cannot delete your own account' }
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

    // Use admin client to get target user info and delete
    const adminClient = createAdminClient()

    // Get the target user's roles to verify they're admin-only
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

    // Prevent deleting super admins
    if (currentRoles.includes('super_admin')) {
      return { success: false, error: 'Super admins cannot be deleted' }
    }

    // Delete the profile first (due to foreign key constraints)
    const { error: profileDeleteError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileDeleteError) {
      return { success: false, error: `Failed to delete profile: ${profileDeleteError.message}` }
    }

    // Delete the auth user
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      return { success: false, error: `Failed to delete user: ${authDeleteError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
