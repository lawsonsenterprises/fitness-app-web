'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface PendingInvite {
  userId: string
  email: string
  invitedAt: string
}

interface GetPendingInvitesResult {
  success: boolean
  error?: string
  pendingInvites?: PendingInvite[]
}

export async function getPendingInvites(): Promise<GetPendingInvitesResult> {
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

    // Use admin client to list all users
    const adminClient = createAdminClient()
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      return { success: false, error: listError.message }
    }

    // Filter to users who haven't confirmed their email yet
    const pendingInvites: PendingInvite[] = (usersData?.users || [])
      .filter(user => !user.email_confirmed_at && user.email)
      .map(user => ({
        userId: user.id,
        email: user.email!,
        invitedAt: user.created_at,
      }))

    return { success: true, pendingInvites }
  } catch (error) {
    console.error('Error getting pending invites:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
