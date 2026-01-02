'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface PromoteToSuperAdminResult {
  success: boolean
  error?: string
}

export async function promoteToSuperAdmin(userId: string): Promise<PromoteToSuperAdminResult> {
  try {
    // First verify the current user is a super admin
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if current user is super admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile?.roles?.includes('super_admin')) {
      return { success: false, error: 'Unauthorized - only super admins can promote to super admin' }
    }

    // Prevent self-promotion (already super admin anyway)
    if (userId === currentUser.id) {
      return { success: false, error: 'You are already a super admin' }
    }

    // Use admin client to bypass RLS
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

    // Must be an admin to be promoted to super admin
    if (!currentRoles.includes('admin')) {
      return { success: false, error: 'User must be an admin first' }
    }

    if (currentRoles.includes('super_admin')) {
      return { success: false, error: 'User is already a super admin' }
    }

    const newRoles = [...currentRoles, 'super_admin']

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
    console.error('Error promoting to super admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
