import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ROUTES } from '@/lib/constants'

async function handleCallback(request: Request) {
  const { origin } = new URL(request.url)

  console.log('=== AUTH CALLBACK DEBUG ===')
  console.log('Request method:', request.method)
  console.log('Request URL:', request.url)
  console.log('Origin:', origin)

  // Handle both GET (query params) and POST (form data) requests
  let code: string | null = null
  let error: string | null = null
  let errorDescription: string | null = null
  let next: string = ROUTES.DASHBOARD

  if (request.method === 'POST') {
    // Apple sends callback as POST with form data
    const formData = await request.formData()
    code = formData.get('code') as string | null
    error = formData.get('error') as string | null
    errorDescription = formData.get('error_description') as string | null
    console.log('POST form data - code exists:', !!code, 'error:', error)
  } else {
    // Standard OAuth callback via GET
    const { searchParams } = new URL(request.url)
    code = searchParams.get('code')
    error = searchParams.get('error')
    errorDescription = searchParams.get('error_description')
    next = searchParams.get('next') ?? ROUTES.DASHBOARD
    console.log('GET params - code exists:', !!code, 'error:', error, 'next:', next)
  }

  // Handle OAuth errors (e.g., user cancelled Apple sign in)
  if (error) {
    console.error('OAuth callback error:', error, errorDescription)
    const errorType = error === 'access_denied' ? 'auth_cancelled' : 'apple_auth_error'
    return NextResponse.redirect(`${origin}/login?error=${errorType}`)
  }

  if (code) {
    console.log('Exchanging code for session...')
    const supabase = await createClient()
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    console.log('Exchange result - session exists:', !!data?.session, 'user exists:', !!data?.user)
    if (sessionError) {
      console.error('Session exchange error:', sessionError.message, sessionError)
    }

    if (!sessionError && data?.session) {
      console.log('Session established, redirecting to:', `${origin}${next}`)
      const redirectUrl = `${origin}${next}`
      const response = NextResponse.redirect(redirectUrl)
      console.log('Redirect response created')
      return response
    }

    console.error('Session exchange failed:', sessionError)
  } else {
    console.log('No code received in callback')
  }

  // Return the user to an error page with instructions
  console.log('Redirecting to login with error')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

export async function GET(request: Request) {
  return handleCallback(request)
}

export async function POST(request: Request) {
  return handleCallback(request)
}
