'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface InviteAdminResult {
  success: boolean
  error?: string
  userId?: string
}

export async function inviteAdmin(
  email: string,
  displayName: string
): Promise<InviteAdminResult> {
  try {
    // First verify the current user is an admin
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', currentUser.id)
      .single()

    if (!profile?.roles?.includes('admin')) {
      return { success: false, error: 'Unauthorized - admin access required' }
    }

    // Use admin client for user creation
    const adminClient = createAdminClient()

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    if (existingUser) {
      // User exists - just add admin role to their profile
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('roles')
        .eq('id', existingUser.id)
        .single()

      const currentRoles = existingProfile?.roles || []
      if (currentRoles.includes('admin')) {
        return { success: false, error: 'User is already an admin' }
      }

      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ roles: [...currentRoles, 'admin'] })
        .eq('id', existingUser.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      return { success: true, userId: existingUser.id }
    }

    // Create new user with invite
    const { data: newUser, error: createError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        display_name: displayName,
        full_name: displayName,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    })

    if (createError) {
      return { success: false, error: createError.message }
    }

    if (!newUser?.user) {
      return { success: false, error: 'Failed to create user' }
    }

    // Create profile with admin role
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        display_name: displayName,
        contact_email: email,
        roles: ['admin'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      // Try to clean up the created user
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return { success: false, error: profileError.message }
    }

    return { success: true, userId: newUser.user.id }
  } catch (error) {
    console.error('Error inviting admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
