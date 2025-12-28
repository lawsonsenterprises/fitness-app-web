import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ROUTES } from '@/lib/constants'

async function handleCallback(request: Request) {
  const { origin } = new URL(request.url)

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
  } else {
    // Standard OAuth callback via GET
    const { searchParams } = new URL(request.url)
    code = searchParams.get('code')
    error = searchParams.get('error')
    errorDescription = searchParams.get('error_description')
    next = searchParams.get('next') ?? ROUTES.DASHBOARD
  }

  // Handle OAuth errors (e.g., user cancelled Apple sign in)
  if (error) {
    console.error('OAuth callback error:', error, errorDescription)
    const errorType = error === 'access_denied' ? 'auth_cancelled' : 'apple_auth_error'
    return NextResponse.redirect(`${origin}/login?error=${errorType}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (!sessionError && data?.session) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Session exchange error:', sessionError)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

export async function GET(request: Request) {
  return handleCallback(request)
}

export async function POST(request: Request) {
  return handleCallback(request)
}
