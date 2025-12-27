import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sign In - Synced Momentum',
  description: 'Sign in to your Synced Momentum coach account',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="group mb-12 inline-flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-foreground">
              <div className="absolute -left-1 top-1/2 h-3 w-6 -translate-y-1/2 skew-x-[-20deg] bg-amber-500 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute -right-1 top-1/2 h-3 w-6 -translate-y-1/2 skew-x-[-20deg] bg-background transition-transform duration-300 group-hover:-translate-x-1" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Synced<span className="text-amber-500">.</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your coaching dashboard
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>

      {/* Right side - Feature highlight */}
      <div className="relative hidden overflow-hidden bg-foreground lg:flex lg:w-1/2">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent" />

        {/* Diagonal lines pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="diagonals"
                patternUnits="userSpaceOnUse"
                width="40"
                height="40"
              >
                <path
                  d="M-10,10 l20,-20 M0,40 l40,-40 M30,50 l20,-20"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonals)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-center p-16 xl:p-24">
          <div className="mb-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Trusted by 1,000+ coaches
            </div>
            <h2 className="mb-4 text-4xl font-semibold tracking-tight text-white xl:text-5xl">
              Your coaching,
              <br />
              <span className="text-amber-500">elevated</span>.
            </h2>
            <p className="max-w-md text-lg text-white/70">
              Manage clients, track progress, and deliver exceptional results
              with the platform built for serious coaches.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
            <div>
              <div className="text-3xl font-semibold text-white">98%</div>
              <div className="mt-1 text-sm text-white/50">Client retention</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">10k+</div>
              <div className="mt-1 text-sm text-white/50">Active clients</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">4.9★</div>
              <div className="mt-1 text-sm text-white/50">Coach rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
