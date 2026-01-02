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

    // Generate a new invite link - this will send a new email
    const { error: inviteError } = await adminClient.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (inviteError) {
      return { success: false, error: inviteError.message }
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
