// Application constants

export const APP_NAME = 'Synced Momentum'
export const APP_DESCRIPTION = 'Premium coaching platform for fitness professionals'

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  CHECK_INS: '/check-ins',
  PROGRAMMES: '/programmes',
  MEAL_PLANS: '/meal-plans',
} as const

// Navigation items for dashboard sidebar
export const DASHBOARD_NAV = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Clients', href: ROUTES.CLIENTS, icon: 'Users' },
  { label: 'Check-ins', href: ROUTES.CHECK_INS, icon: 'ClipboardCheck' },
  { label: 'Programmes', href: ROUTES.PROGRAMMES, icon: 'Dumbbell' },
  { label: 'Meal Plans', href: ROUTES.MEAL_PLANS, icon: 'UtensilsCrossed' },
] as const
