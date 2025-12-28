import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/clients',
  '/check-ins',
  '/programmes',
  '/meal-plans',
  '/settings',
]

// Routes only accessible when NOT authenticated
const authRoutes = ['/login', '/register', '/reset-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Debug logging for auth-related routes
  const isAuthRelated = pathname.includes('login') || pathname.includes('auth') || pathname.includes('dashboard')
  if (isAuthRelated) {
    console.log('=== MIDDLEWARE DEBUG ===')
    console.log('Pathname:', pathname)
    console.log('Cookies:', request.cookies.getAll().map(c => c.name))
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          if (isAuthRelated) {
            console.log('Setting cookies:', cookiesToSet.map(c => c.name))
          }
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isAuthRelated) {
    console.log('User from getUser:', user ? `${user.id} (${user.email})` : 'null')
  }

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isAuthRelated) {
    console.log('isProtectedRoute:', isProtectedRoute, 'isAuthRoute:', isAuthRoute)
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    if (isAuthRelated) {
      console.log('Redirecting to login - no user for protected route')
    }
    const redirectUrl = new URL(ROUTES.LOGIN, request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && user) {
    if (isAuthRelated) {
      console.log('Redirecting to dashboard - user exists on auth route')
    }
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url))
  }

  if (isAuthRelated) {
    console.log('Middleware completed, returning response')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
