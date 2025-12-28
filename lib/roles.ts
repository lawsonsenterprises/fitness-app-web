// Role-based access control utilities
export type UserRole = 'athlete' | 'coach' | 'admin'

export const ROLE_LABELS: Record<UserRole, string> = {
  athlete: 'Athlete',
  coach: 'Coach',
  admin: 'Admin',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  athlete: 'View your training, nutrition, and progress',
  coach: 'Manage clients, programmes, and check-ins',
  admin: 'Platform administration and analytics',
}

export const ROLE_ICONS: Record<UserRole, string> = {
  athlete: 'dumbbell',
  coach: 'clipboard',
  admin: 'shield',
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  athlete: '/athlete',
  coach: '/dashboard',
  admin: '/admin',
}

export function hasRole(userRoles: UserRole[] | null | undefined, role: UserRole): boolean {
  return userRoles?.includes(role) ?? false
}

export function hasAnyRole(userRoles: UserRole[] | null | undefined, roles: UserRole[]): boolean {
  return roles.some(role => hasRole(userRoles, role))
}

export function getAvailableRoles(userRoles: UserRole[] | null | undefined): UserRole[] {
  return userRoles ?? ['athlete']
}

export function getDefaultRole(userRoles: UserRole[] | null | undefined): UserRole {
  // Priority: coach > admin > athlete
  if (hasRole(userRoles, 'coach')) return 'coach'
  if (hasRole(userRoles, 'admin')) return 'admin'
  return 'athlete'
}

export function canAccessRoute(userRoles: UserRole[] | null | undefined, pathname: string): boolean {
  if (pathname.startsWith('/athlete')) {
    return hasRole(userRoles, 'athlete') || hasRole(userRoles, 'coach') // Coaches can view athlete interface
  }
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/clients') || pathname.startsWith('/programmes') || pathname.startsWith('/check-ins') || pathname.startsWith('/messages') || pathname.startsWith('/settings')) {
    return hasRole(userRoles, 'coach')
  }
  if (pathname.startsWith('/admin')) {
    return hasRole(userRoles, 'admin')
  }
  return true
}
