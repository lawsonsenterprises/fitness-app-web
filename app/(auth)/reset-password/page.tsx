import Link from 'next/link'
import { PasswordResetForm } from '@/components/auth/password-reset-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Reset Password - Synced Momentum',
  description: 'Reset your Synced Momentum account password',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Logo */}
        <Link
          href="/"
          className="group mb-12 inline-flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-foreground">
            <div className="absolute -left-1 top-1/2 h-3 w-6 -translate-y-1/2 skew-x-[-20deg] bg-amber-500 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute -right-1 top-1/2 h-3 w-6 -translate-y-1/2 skew-x-[-20deg] bg-background transition-transform duration-300 group-hover:-translate-x-1" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Synced<span className="text-amber-500">.</span>
          </span>
        </Link>

        {/* Form */}
        <PasswordResetForm />
      </div>
    </div>
  )
}
