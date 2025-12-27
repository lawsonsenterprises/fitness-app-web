import { RegisterForm } from '@/components/auth/register-form'
import { AuthCard, AuthCardHeader } from '@/components/auth/auth-card'

export const metadata = {
  title: 'Create Account - Synced Momentum',
  description: 'Create your Synced Momentum coach account',
}

export default function RegisterPage() {
  return (
    <AuthCard>
      <AuthCardHeader
        title="Create your account"
        description="Start your 14-day free trial. No credit card required."
      />
      <RegisterForm />
    </AuthCard>
  )
}
