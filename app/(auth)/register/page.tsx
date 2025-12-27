import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Create Account - Synced Momentum',
  description: 'Create your Synced Momentum coach account',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Feature highlight */}
      <div className="relative hidden overflow-hidden bg-foreground lg:flex lg:w-1/2">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/20" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                patternUnits="userSpaceOnUse"
                width="60"
                height="60"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-center p-16 xl:p-24">
          <h2 className="mb-6 text-4xl font-semibold tracking-tight text-white xl:text-5xl">
            Join the coaches
            <br />
            who <span className="text-amber-500">demand more</span>.
          </h2>
          <p className="mb-12 max-w-md text-lg text-white/70">
            Everything you need to scale your coaching business, manage clients
            effortlessly, and deliver world-class results.
          </p>

          {/* Feature list */}
          <div className="space-y-6">
            <FeatureItem
              title="Client Management"
              description="Organise all your clients in one powerful dashboard"
            />
            <FeatureItem
              title="Programme Builder"
              description="Create bespoke training programmes in minutes"
            />
            <FeatureItem
              title="Progress Tracking"
              description="Visualise client progress with detailed analytics"
            />
            <FeatureItem
              title="Check-in System"
              description="Streamlined weekly check-ins that clients love"
            />
          </div>
        </div>
      </div>

      {/* Right side - Form */}
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
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          {/* Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

function FeatureItem({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
        <div className="h-2 w-2 rounded-full bg-amber-500" />
      </div>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-sm text-white/50">{description}</p>
      </div>
    </div>
  )
}
