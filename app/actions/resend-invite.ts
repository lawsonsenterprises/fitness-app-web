'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface ResendInviteResult {
  success: boolean
  error?: string
}

export async function resendInvite(userId: string): Promise<ResendInviteResult> {
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

    // Use admin client to get user details and resend invite
    const adminClient = createAdminClient()

    // Get the user to find their email
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)

    if (userError || !userData?.user) {
      return { success: false, error: 'User not found' }
    }

    const email = userData.user.email
    if (!email) {
      return { success: false, error: 'User has no email address' }
    }

    // Check if user has already confirmed their email
    if (userData.user.email_confirmed_at) {
      return { success: false, error: 'User has already confirmed their email' }
    }

    // Get display name from profile BEFORE deleting the user
    const { data: profileData } = await adminClient
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    const displayName = profileData?.display_name || email.split('@')[0]

    // Delete the old user and re-invite them
    // This is necessary because inviteUserByEmail won't work for existing users
    // and generateLink doesn't send an email
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      return { success: false, error: `Failed to reset user: ${deleteError.message}` }
    }

    // Re-invite the user - this actually sends the email
    const { data: newUser, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        display_name: displayName,
        full_name: displayName,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    })

    if (inviteError) {
      return { success: false, error: inviteError.message }
    }

    // Re-create the profile with admin role
    if (newUser?.user) {
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
        console.error('Failed to create profile:', profileError)
        // Don't fail the whole operation - user can still accept invite
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error resending invite:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
