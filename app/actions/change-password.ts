'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validatePasswordStrength } from '@/lib/password-utils'

interface ChangePasswordResult {
  success: boolean
  error?: string
}

/**
 * Change password for the currently authenticated user
 * Also clears the force_password_change flag if set
 */
export async function changePassword(newPassword: string): Promise<ChangePasswordResult> {
  try {
    // Validate password strength
    const validation = validatePasswordStrength(newPassword)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('. '),
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      }
    }

    // Clear the force_password_change flag using admin client
    // (can't modify user_metadata directly with regular client in all cases)
    const adminClient = createAdminClient()

    const existingMetadata = user.user_metadata || {}
    const { force_password_change, ...restMetadata } = existingMetadata

    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...restMetadata,
        force_password_change: false,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Check if current user needs to change password
 */
export async function checkForcePasswordChange(): Promise<{ forceChange: boolean }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { forceChange: false }
    }

    return {
      forceChange: user.user_metadata?.force_password_change === true,
    }
  } catch {
    return { forceChange: false }
  }
}
