import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const avatarPath = path.join('/')

    if (!avatarPath) {
      return new NextResponse('Missing path', { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient.storage
      .from('avatars')
      .createSignedUrl(avatarPath, 3600)

    if (error || !data?.signedUrl) {
      console.error('Error creating signed URL:', error)
      return new NextResponse('Failed to generate URL', { status: 500 })
    }

    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl)
  } catch (err) {
    console.error('Avatar API error:', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}
