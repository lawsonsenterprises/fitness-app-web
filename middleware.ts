import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants'

// Routes that require authentication (coach routes)
const coachRoutes = [
  '/dashboard',
  '/clients',
  '/check-ins',
  '/programmes',
  '/meal-plans',
  '/settings',
  '/notifications',
]

// Athlete routes
const athleteRoutes = ['/athlete']

// Admin routes
const adminRoutes = ['/admin']

// Routes only accessible when NOT authenticated
const authRoutes = ['/login', '/register', '/reset-password']

// Routes accessible when authenticated (but not redirected away from)
const selectRoleRoute = '/select-role'

// Route for forced password change
const forceChangePasswordRoute = '/change-password'

export async function middleware(request: NextRequest) {
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

  const { pathname } = request.nextUrl

  // Check route types
  const isCoachRoute = coachRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAthleteRoute = athleteRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isProtectedRoute = isCoachRoute || isAthleteRoute || isAdminRoute

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(ROUTES.LOGIN, request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check for forced password change BEFORE any other authenticated redirects
  // Allow: change-password page, logout API, static assets
  if (user && user.user_metadata?.force_password_change === true) {
    const isChangePasswordPage = pathname === forceChangePasswordRoute
    const isLogoutRoute = pathname === '/api/auth/signout'

    if (!isChangePasswordPage && !isLogoutRoute && !pathname.startsWith('/_next')) {
      return NextResponse.redirect(new URL(forceChangePasswordRoute, request.url))
    }
  }

  // Redirect authenticated users from auth routes to dashboard
  // But allow access to select-role page and change-password page
  if (isAuthRoute && user && pathname !== selectRoleRoute && pathname !== forceChangePasswordRoute) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url))
  }

  // Require authentication for select-role page
  if (pathname === selectRoleRoute && !user) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
  }

  // Role-based access control for authenticated users
  if (user && isProtectedRoute) {
    // Fetch user roles from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single()

    const roles: string[] = profile?.roles || ['athlete']

    // Protect admin routes - must have admin role
    if (isAdminRoute && !roles.includes('admin')) {
      // Redirect to coach dashboard if coach, else athlete
      if (roles.includes('coach')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/athlete', request.url))
    }

    // Protect coach routes - must have coach or admin role
    if (isCoachRoute && !roles.includes('coach') && !roles.includes('admin')) {
      return NextResponse.redirect(new URL('/athlete', request.url))
    }

    // Athlete routes - accessible by athlete, coach (for preview), or admin
    if (isAthleteRoute && !roles.includes('athlete') && !roles.includes('coach') && !roles.includes('admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
