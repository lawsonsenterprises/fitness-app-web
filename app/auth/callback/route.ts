import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ROUTES } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? ROUTES.DASHBOARD

  // Handle OAuth errors (e.g., user cancelled Apple sign in)
  if (error) {
    console.error('OAuth callback error:', error, errorDescription)
    const errorType = error === 'access_denied' ? 'auth_cancelled' : 'apple_auth_error'
    return NextResponse.redirect(`${origin}/login?error=${errorType}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (!sessionError) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Session exchange error:', sessionError)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
