'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface InviteClientResult {
  success: boolean
  error?: string
}

export async function inviteClient(
  email: string,
  name: string,
  message?: string
): Promise<InviteClientResult> {
  try {
    // Verify the current user is a coach
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if current user is a coach
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles, display_name')
      .eq('id', currentUser.id)
      .single()

    if (!profile?.roles?.includes('coach')) {
      return { success: false, error: 'Unauthorized - only coaches can invite clients' }
    }

    const coachName = profile.display_name || 'Your coach'

    // Use admin client for operations
    const adminClient = createAdminClient()

    // Check if user already exists with this email
    const { data: existingProfiles } = await adminClient
      .from('profiles')
      .select('id, roles')
      .or(`email.eq.${email},contact_email.eq.${email}`)

    if (existingProfiles && existingProfiles.length > 0) {
      const existingProfile = existingProfiles[0]

      // Check if already a client of this coach
      const { data: existingRelation } = await adminClient
        .from('coach_clients')
        .select('id')
        .eq('coach_id', currentUser.id)
        .eq('client_id', existingProfile.id)
        .single()

      if (existingRelation) {
        return { success: false, error: 'This person is already your client' }
      }

      // If they exist and are an athlete, add them directly
      if (existingProfile.roles?.includes('athlete')) {
        const { error: insertError } = await adminClient
          .from('coach_clients')
          .insert({
            coach_id: currentUser.id,
            client_id: existingProfile.id,
            status: 'pending',
            check_in_frequency: 7,
          })

        if (insertError) {
          return { success: false, error: insertError.message }
        }

        return { success: true }
      }
    }

    // Check if there's already a pending invite
    const { data: existingInvite } = await adminClient
      .from('pending_client_invites')
      .select('id')
      .eq('coach_id', currentUser.id)
      .eq('email', email.toLowerCase())
      .single()

    if (existingInvite) {
      return { success: false, error: 'You have already sent an invite to this email' }
    }

    // Create pending invite
    const { error: insertError } = await adminClient
      .from('pending_client_invites')
      .insert({
        coach_id: currentUser.id,
        email: email.toLowerCase(),
        name: name,
        message: message,
      })

    if (insertError) {
      console.error('Error creating pending invite:', insertError)
      return { success: false, error: insertError.message }
    }

    // Send invitation email
    const appStoreUrl = 'https://apps.apple.com/app/synced-momentum/id123456789' // TODO: Update with real URL
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.syncedmomentum' // TODO: Update with real URL

    try {
      await resend.emails.send({
        from: 'Synced Momentum <noreply@syncedmomentum.com>',
        to: email,
        subject: `${coachName} has invited you to Synced Momentum`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f59e0b; margin: 0;">Synced Momentum</h1>
            </div>

            <h2 style="color: #1f2937;">Hi ${name},</h2>

            <p>${coachName} has invited you to join them on Synced Momentum as their client.</p>

            ${message ? `<p style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-style: italic;">"${message}"</p>` : ''}

            <p>With Synced Momentum, you'll be able to:</p>
            <ul>
              <li>Receive personalised training programmes</li>
              <li>Track your workouts and progress</li>
              <li>Get custom meal plans</li>
              <li>Communicate directly with your coach</li>
              <li>Submit check-ins and receive feedback</li>
            </ul>

            <p><strong>Download the app to get started:</strong></p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appStoreUrl}" style="display: inline-block; margin: 10px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">
                Download on App Store
              </a>
              <a href="${playStoreUrl}" style="display: inline-block; margin: 10px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">
                Get it on Google Play
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Sign up using this email address (${email}) and you'll automatically be connected to ${coachName}.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This invitation was sent by ${coachName} via Synced Momentum.<br>
              If you didn't expect this email, you can safely ignore it.
            </p>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the whole operation if email fails - invite is still stored
    }

    return { success: true }
  } catch (error) {
    console.error('Error inviting client:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
