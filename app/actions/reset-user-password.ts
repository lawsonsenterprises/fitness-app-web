'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateSecurePassword, validatePasswordStrength } from '@/lib/password-utils'

interface ResetPasswordResult {
  success: boolean
  error?: string
  password?: string
  isOAuth?: boolean
}

interface ResetPasswordOptions {
  userId: string
  password?: string // If not provided, generates random password
  forceChange?: boolean // Default true - require password change on next login
}

/**
 * Check if a user is an OAuth user (Apple, Google, etc.)
 */
async function isOAuthUser(adminClient: ReturnType<typeof createAdminClient>, userId: string): Promise<{ isOAuth: boolean; provider?: string }> {
  const { data: userData, error } = await adminClient.auth.admin.getUserById(userId)

  if (error || !userData?.user) {
    return { isOAuth: false }
  }

  const identities = userData.user.identities || []
  const oauthIdentity = identities.find(id => id.provider !== 'email')

  return {
    isOAuth: !!oauthIdentity,
    provider: oauthIdentity?.provider,
  }
}

/**
 * Reset a user's password (admin or coach for their clients)
 * - For email/password users only (not OAuth)
 * - Can generate random password or set custom
 * - Optionally force password change on next login
 * - Admins can reset any user's password
 * - Coaches can only reset their own clients' passwords
 */
export async function resetUserPassword(options: ResetPasswordOptions): Promise<ResetPasswordResult> {
  const { userId, password: customPassword, forceChange = true } = options

  try {
    // Verify current user is authenticated
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check current user's roles
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', currentUser.id)
      .single()

    const roles = currentProfile?.roles || []
    const isAdmin = roles.includes('admin')
    const isCoach = roles.includes('coach')

    if (!isAdmin && !isCoach) {
      return { success: false, error: 'Unauthorized - admin or coach access required' }
    }

    // If coach (not admin), verify they are the coach of this client
    if (!isAdmin && isCoach) {
      const { data: relationship } = await supabase
        .from('coach_clients')
        .select('id')
        .eq('coach_id', currentUser.id)
        .eq('client_id', userId)
        .is('ended_at', null)
        .single()

      if (!relationship) {
        return { success: false, error: 'Unauthorized - you can only reset passwords for your own clients' }
      }
    }

    // Use admin client for user operations
    const adminClient = createAdminClient()

    // Check if target user is OAuth
    const { isOAuth, provider } = await isOAuthUser(adminClient, userId)

    if (isOAuth) {
      return {
        success: false,
        error: `Cannot reset password for ${provider || 'OAuth'} users. They sign in with ${provider || 'a third-party provider'}.`,
        isOAuth: true,
      }
    }

    // Validate or generate password
    let newPassword: string

    if (customPassword) {
      const validation = validatePasswordStrength(customPassword)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join('. '),
        }
      }
      newPassword = customPassword
    } else {
      newPassword = generateSecurePassword(16)
    }

    // Update user password
    const updateData: { password: string; user_metadata?: Record<string, unknown> } = {
      password: newPassword,
    }

    // Set force password change flag if requested
    if (forceChange) {
      // Get existing metadata first
      const { data: userData } = await adminClient.auth.admin.getUserById(userId)
      const existingMetadata = userData?.user?.user_metadata || {}

      updateData.user_metadata = {
        ...existingMetadata,
        force_password_change: true,
      }
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, updateData)

    if (updateError) {
      console.error('Error resetting password:', updateError)
      return {
        success: false,
        error: `Failed to reset password: ${updateError.message}`,
      }
    }

    return {
      success: true,
      password: newPassword,
    }
  } catch (error) {
    console.error('Error in resetUserPassword:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Check if a user is an OAuth user (for UI display)
 * Admins can check any user, coaches can check their own clients
 */
export async function checkUserAuthMethod(userId: string): Promise<{ success: boolean; isOAuth: boolean; provider?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, isOAuth: false, error: 'Not authenticated' }
    }

    // Check current user's roles
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', currentUser.id)
      .single()

    const roles = currentProfile?.roles || []
    const isAdmin = roles.includes('admin')
    const isCoach = roles.includes('coach')

    if (!isAdmin && !isCoach) {
      return { success: false, isOAuth: false, error: 'Unauthorized' }
    }

    // If coach (not admin), verify they are the coach of this client
    if (!isAdmin && isCoach) {
      const { data: relationship } = await supabase
        .from('coach_clients')
        .select('id')
        .eq('coach_id', currentUser.id)
        .eq('client_id', userId)
        .is('ended_at', null)
        .single()

      if (!relationship) {
        return { success: false, isOAuth: false, error: 'Unauthorized - not your client' }
      }
    }

    const adminClient = createAdminClient()
    const { isOAuth, provider } = await isOAuthUser(adminClient, userId)

    return {
      success: true,
      isOAuth,
      provider,
    }
  } catch (error) {
    console.error('Error checking auth method:', error)
    return {
      success: false,
      isOAuth: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
