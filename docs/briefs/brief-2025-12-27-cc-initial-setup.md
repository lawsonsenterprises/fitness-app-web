# Brief for Claude Code: Initial Next.js Setup - Synced Momentum Coach Platform

**Date:** 2025-12-27  
**Project:** Synced Momentum Coach Platform (Web)  
**Repository:** lawsonsenterprises/fitness-app-web  
**Location:** /Users/andrewlawson/Development/Apps/web/fitness-app-web/  
**Current Branch:** feat/initial-nextjs-setup

---

## Context

You are setting up the **Synced Momentum** coach platform - a premium web application for fitness coaches to manage their clients. This is a companion to the iOS athlete app (already built).

**Quality Standard:** Apple++ (Apple's premium design excellence without compromises)  
**App Name:** Synced Momentum  
**Domains:** syncedmomentum.com (primary), syncedmomentum.co.uk, syncedmomentum.app

---

## Current State

✅ Git repository initialized  
✅ Feature branch created: `feat/initial-nextjs-setup`  
✅ `.env.local` file created with Supabase credentials (DO NOT modify or commit this)  
✅ `frontend-design` skill available for your use

---

## Your Task: Complete Next.js 14 Foundation Setup

Set up a **production-ready** Next.js 14 application with all the infrastructure needed for the coach platform.

### Required Technology Stack

**Core Framework:**
- Next.js 14+ with **App Router** (NOT Pages Router)
- TypeScript with **strict mode** enabled
- Node.js LTS (latest)

**Styling & UI:**
- Tailwind CSS (latest)
- shadcn/ui components
- PostCSS
- Responsive design (mobile-first)
- Dark mode support (optional but nice)

**Backend Integration:**
- Supabase client (`@supabase/supabase-js`)
- Supabase SSR helpers (`@supabase/ssr`)
- TypeScript types for Supabase (to be generated later)

**State Management:**
- React Query v5 (TanStack Query) for server state
- Zustand for UI state (if needed)

**Forms & Validation:**
- React Hook Form
- Zod for schema validation

**Code Quality:**
- ESLint (Next.js config + custom rules)
- Prettier (with Tailwind plugin)
- TypeScript strict mode
- Import sorting

**Development Tools:**
- VS Code settings and extensions recommendations
- Git hooks (optional - pre-commit for linting)

---

## Project Structure

Create this **exact** folder structure:

```
/Users/andrewlawson/Development/Apps/web/fitness-app-web/
├── .env.local                    # Already exists - DO NOT MODIFY
├── .env.example                  # YOU CREATE - Template without secrets
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Already exists
├── .prettierrc                  # Prettier configuration
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
├── postcss.config.js            # PostCSS config (for Tailwind)
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── README.md                    # Already exists
├── middleware.ts                # Root middleware for auth
│
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home/landing page
│   ├── globals.css              # Global styles (Tailwind imports)
│   ├── providers.tsx            # React Query provider
│   │
│   ├── (auth)/                  # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/             # Dashboard route group (protected)
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── clients/
│   │   │   └── page.tsx
│   │   ├── check-ins/
│   │   │   └── page.tsx
│   │   ├── programmes/
│   │   │   └── page.tsx
│   │   └── meal-plans/
│   │       └── page.tsx
│   │
│   └── api/                     # API routes (if needed)
│       └── health/
│           └── route.ts         # Health check endpoint
│
├── components/                  # React components
│   ├── ui/                      # shadcn/ui components (auto-generated)
│   │   └── (empty for now - will be populated by shadcn CLI)
│   │
│   ├── auth/                    # Authentication components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── password-reset-form.tsx
│   │
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── sidebar.tsx
│   │   ├── top-bar.tsx
│   │   └── dashboard-widget.tsx
│   │
│   ├── clients/                 # Client management components
│   │   ├── clients-table.tsx
│   │   └── client-status-badge.tsx
│   │
│   └── layout/                  # Layout components
│       ├── header.tsx
│       ├── footer.tsx
│       └── page-container.tsx
│
├── lib/                         # Utility functions and configurations
│   ├── supabase/                # Supabase client and utilities
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client (cookies)
│   │   └── middleware.ts        # Middleware client
│   │
│   ├── utils.ts                 # General utility functions (cn, etc.)
│   ├── validations.ts           # Zod schemas for forms
│   └── constants.ts             # App constants
│
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   └── use-supabase.ts          # Supabase client hook
│
├── types/                       # TypeScript type definitions
│   ├── database.types.ts        # Supabase types (placeholder for now)
│   └── index.ts                 # Shared types
│
├── styles/                      # Additional styles (if needed)
│   └── (empty for now)
│
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│       └── .gitkeep
│
└── docs/                        # Documentation
    └── briefs/
        └── brief-2025-12-27-cc-initial-setup.md  # This file
```

---

## Detailed Requirements

### 1. Next.js Configuration

**`next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project.supabase.co'], // Update with actual Supabase project URL
  },
}

module.exports = nextConfig
```

### 2. TypeScript Configuration

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Tailwind CSS Configuration

**`tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

**`postcss.config.js`:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 4. ESLint Configuration

**`.eslintrc.json`:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 5. Prettier Configuration

**`.prettierrc`:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 6. Supabase Client Setup

**`lib/supabase/client.ts`** (Browser):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** (Server with cookies):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**`lib/supabase/middleware.ts`** (Middleware):
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

### 7. Root Middleware

**`middleware.ts`** (in root):
```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 8. Environment Variables

**`.env.example`** (CREATE THIS - template for others):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Synced Momentum"
```

**DO NOT create or modify `.env.local`** - it already exists with real credentials.

### 9. shadcn/ui Setup

Initialize shadcn/ui:
```bash
npx shadcn-ui@latest init
```

Configuration options:
- TypeScript: Yes
- Style: Default
- Base colour: Slate (or neutral)
- CSS variables: Yes
- Tailwind config: tailwind.config.ts
- Components path: components/ui
- Utils path: lib/utils.ts

### 10. React Query Setup

**`app/providers.tsx`:**
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Wrap in root layout.

### 11. Root Layout

**`app/layout.tsx`:**
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Synced Momentum - Coach Platform',
  description: 'Premium coaching platform for fitness professionals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 12. Global Styles

**`app/globals.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 13. Initial Pages

**`app/page.tsx`** (Landing/Home):
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Synced Momentum</h1>
        <p className="text-xl mb-8">Premium Coach Platform</p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
```

**`app/(auth)/login/page.tsx`:**
```typescript
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Login to Synced Momentum</h1>
        <LoginForm />
      </div>
    </div>
  )
}
```

**`app/(dashboard)/dashboard/page.tsx`:**
```typescript
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p>Welcome to Synced Momentum Coach Platform</p>
    </div>
  )
}
```

### 14. Utility Functions

**`lib/utils.ts`:**
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 15. Package.json Scripts

Ensure these scripts exist:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## Dependencies to Install

### Core Dependencies
```bash
npm install next@latest react@latest react-dom@latest
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install zustand
npm install clsx tailwind-merge
npm install lucide-react
npm install date-fns
```

### Dev Dependencies
```bash
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint eslint-config-next
npm install -D prettier prettier-plugin-tailwindcss
npm install -D tailwindcss-animate
```

---

## Important Notes

### British English
- Use British spellings throughout: colour, organise, realise, analyse
- Comments in code should use British English
- User-facing text should use British English

### Apple++ Quality Standards
- **Use the frontend-design skill** to ensure premium design
- No generic templates - everything should feel polished and distinctive
- Proper spacing, typography, and visual hierarchy
- Smooth transitions and interactions
- Professional error handling
- Loading states for async operations

### Code Quality
- All files must have proper TypeScript types (no `any` unless absolutely necessary)
- Proper error handling with try/catch
- Descriptive variable and function names
- Comments for complex logic
- Consistent code formatting

### Accessibility
- Semantic HTML
- Proper ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

### Git
- DO NOT commit `.env.local`
- DO commit `.env.example`
- Ensure `.gitignore` is properly configured

---

## Testing the Setup

After completing the setup, verify:

1. **TypeScript compiles without errors:**
   ```bash
   npm run type-check
   ```

2. **Linting passes:**
   ```bash
   npm run lint
   ```

3. **Dev server starts:**
   ```bash
   npm run dev
   ```

4. **App loads at http://localhost:3000:**
   - Home page renders
   - No console errors
   - Styling looks correct

5. **Supabase connection works:**
   - Create a simple test component that calls Supabase
   - Verify no authentication errors in console

---

## Deliverables

When complete, the project should have:

✅ Next.js 14 with App Router configured  
✅ TypeScript in strict mode  
✅ Tailwind CSS working with premium styling  
✅ shadcn/ui initialized  
✅ Supabase clients (browser, server, middleware) configured  
✅ React Query set up  
✅ ESLint and Prettier configured  
✅ Proper folder structure as specified  
✅ Initial pages created (home, login, dashboard)  
✅ Environment variable template (`.env.example`)  
✅ All dependencies installed  
✅ Dev server runs without errors  
✅ TypeScript compiles without errors  
✅ Professional, polished UI (using frontend-design skill)  

---

## Quality Check Before Finishing

Before you report completion, verify:
- [ ] All files created as per structure above
- [ ] TypeScript strict mode enabled and compiling
- [ ] Tailwind CSS working with custom config
- [ ] shadcn/ui initialized
- [ ] Supabase clients working (test with a simple query)
- [ ] React Query provider wrapping app
- [ ] Dev server runs without errors
- [ ] Premium UI design (not generic templates)
- [ ] British English used throughout
- [ ] `.env.example` created (not `.env.local`)
- [ ] All dependencies installed

**Let's build something extraordinary! 🚀**
