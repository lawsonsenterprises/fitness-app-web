import { UpdatePasswordForm } from '@/components/auth/update-password-form'
import { AuthCard } from '@/components/auth/auth-card'

export const metadata = {
  title: 'Update Password - Synced Momentum',
  description: 'Create your new password',
}

export default function UpdatePasswordPage() {
  return (
    <AuthCard>
      <UpdatePasswordForm />
    </AuthCard>
  )
}
