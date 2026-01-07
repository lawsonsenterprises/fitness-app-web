'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface ApplyPendingInviteResult {
  success: boolean
  applied: boolean
  roles?: string[]
  error?: string
}

/**
 * Checks if there's a pending invite for the given email and applies
 * the intended roles to the OAuth user's profile.
 *
 * This handles the case where an admin invites someone by email, but
 * the invitee signs in with Apple (OAuth) instead of using the invite link.
 */
export async function applyPendingInvite(
  oauthUserId: string,
  email: string
): Promise<ApplyPendingInviteResult> {
  try {
    if (!email) {
      return { success: true, applied: false }
    }

    const adminClient = createAdminClient()

    // Find pending invite users with this email (unconfirmed email = pending invite)
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users for pending invite check:', listError)
      return { success: false, applied: false, error: listError.message }
    }

    // Find a pending invite user with the same email but different ID
    const pendingInviteUser = usersData?.users?.find(user =>
      user.email?.toLowerCase() === email.toLowerCase() &&
      user.id !== oauthUserId &&
      !user.email_confirmed_at // Unconfirmed = pending invite
    )

    if (!pendingInviteUser) {
      // No pending invite found - this is normal for most OAuth signups
      return { success: true, applied: false }
    }

    console.log(`Found pending invite for ${email}, applying to OAuth user ${oauthUserId}`)

    // Get the roles from the pending invite user's profile
    const { data: pendingProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('roles, display_name')
      .eq('id', pendingInviteUser.id)
      .single()

    if (profileError || !pendingProfile) {
      console.error('Error fetching pending invite profile:', profileError)
      return { success: false, applied: false, error: 'Failed to fetch pending invite profile' }
    }

    const pendingRoles = pendingProfile.roles || []

    if (pendingRoles.length === 0) {
      // No special roles to transfer
      return { success: true, applied: false }
    }

    // Get the OAuth user's current profile
    const { data: oauthProfile } = await adminClient
      .from('profiles')
      .select('roles, display_name')
      .eq('id', oauthUserId)
      .single()

    const currentRoles = oauthProfile?.roles || ['athlete']

    // Merge roles - add any roles from pending invite that aren't already present
    const mergedRoles = [...new Set([...currentRoles, ...pendingRoles])]

    // Update the OAuth user's profile with the merged roles
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        roles: mergedRoles,
        // Also copy display_name if the OAuth profile doesn't have one
        ...((!oauthProfile?.display_name && pendingProfile.display_name)
          ? { display_name: pendingProfile.display_name }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', oauthUserId)

    if (updateError) {
      console.error('Error updating OAuth user profile:', updateError)
      return { success: false, applied: false, error: updateError.message }
    }

    // Delete the pending invite user's profile first (due to FK constraints)
    const { error: deleteProfileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', pendingInviteUser.id)

    if (deleteProfileError) {
      console.error('Error deleting pending invite profile:', deleteProfileError)
      // Don't fail - the roles were already applied
    }

    // Delete the pending invite user from auth
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      pendingInviteUser.id
    )

    if (deleteUserError) {
      console.error('Error deleting pending invite auth user:', deleteUserError)
      // Don't fail - the roles were already applied
    }

    console.log(`Successfully applied pending invite roles [${pendingRoles.join(', ')}] to OAuth user ${oauthUserId}`)

    return {
      success: true,
      applied: true,
      roles: mergedRoles
    }
  } catch (error) {
    console.error('Error applying pending invite:', error)
    return {
      success: false,
      applied: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

/**
 * Applies any pending client invites for a newly signed up athlete.
 * Creates coach_clients relationships for any coaches who invited this email.
 */
export async function applyPendingClientInvites(
  userId: string,
  email: string
): Promise<{ success: boolean; coachesLinked: number }> {
  try {
    if (!email) {
      return { success: true, coachesLinked: 0 }
    }

    const adminClient = createAdminClient()

    // Find any pending client invites for this email
    const { data: pendingInvites, error: fetchError } = await adminClient
      .from('pending_client_invites')
      .select('id, coach_id, name')
      .eq('email', email.toLowerCase())

    if (fetchError) {
      console.error('Error fetching pending client invites:', fetchError)
      return { success: false, coachesLinked: 0 }
    }

    if (!pendingInvites || pendingInvites.length === 0) {
      return { success: true, coachesLinked: 0 }
    }

    console.log(`Found ${pendingInvites.length} pending client invite(s) for ${email}`)

    let coachesLinked = 0

    for (const invite of pendingInvites) {
      // Create coach-client relationship
      const { error: insertError } = await adminClient
        .from('coach_clients')
        .insert({
          coach_id: invite.coach_id,
          client_id: userId,
          status: 'pending',
          check_in_frequency: 7,
        })

      if (insertError) {
        console.error(`Error creating coach-client relationship for coach ${invite.coach_id}:`, insertError)
        continue
      }

      // Delete the pending invite
      await adminClient
        .from('pending_client_invites')
        .delete()
        .eq('id', invite.id)

      coachesLinked++
    }

    console.log(`Successfully linked ${coachesLinked} coach(es) to new athlete ${userId}`)

    return { success: true, coachesLinked }
  } catch (error) {
    console.error('Error applying pending client invites:', error)
    return { success: false, coachesLinked: 0 }
  }
}
