import { PasswordResetForm } from '@/components/auth/password-reset-form'
import { AuthCard } from '@/components/auth/auth-card'

export const metadata = {
  title: 'Reset Password - Synced Momentum',
  description: 'Reset your Synced Momentum account password',
}

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <PasswordResetForm />
    </AuthCard>
  )
}
