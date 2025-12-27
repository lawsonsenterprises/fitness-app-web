import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { AuthCard, AuthCardHeader } from '@/components/auth/auth-card'

export const metadata = {
  title: 'Sign In - Synced Momentum',
  description: 'Sign in to your Synced Momentum coach account',
}

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthCardHeader
        title="Welcome back"
        description="Sign in to access your coaching dashboard"
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
