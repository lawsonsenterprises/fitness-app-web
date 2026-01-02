'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, Pause, Play, UserX, Trash2, Key } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ClientStatusBadge } from '@/components/clients/client-status-badge'
import { ResetPasswordModal } from '@/components/admin/shared/reset-password-modal'
import { useClient, useUpdateClientStatus, useRemoveClient } from '@/hooks/use-clients'
import { getClientDisplayName } from '@/types'

export default function ClientSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)
  const updateStatus = useUpdateClientStatus()
  const removeClient = useRemoveClient()

  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)

  if (!client) return null

  const handlePause = async () => {
    try {
      await updateStatus.mutateAsync({
        clientRelationshipId: clientId,
        status: 'paused',
      })
      toast.success('Client relationship paused')
    } catch {
      toast.error('Failed to pause relationship')
    }
  }

  const handleResume = async () => {
    try {
      await updateStatus.mutateAsync({
        clientRelationshipId: clientId,
        status: 'active',
      })
      toast.success('Client relationship resumed')
    } catch {
      toast.error('Failed to resume relationship')
    }
  }

  const handleEnd = async () => {
    try {
      await updateStatus.mutateAsync({
        clientRelationshipId: clientId,
        status: 'completed',
      })
      toast.success('Client relationship ended')
      setShowEndConfirm(false)
    } catch {
      toast.error('Failed to end relationship')
    }
  }

  const handleRemove = async () => {
    try {
      await removeClient.mutateAsync(clientId)
      toast.success('Client removed')
      router.push('/clients')
    } catch {
      toast.error('Failed to remove client')
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Client Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Client Information</h3>
        <dl className="space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="text-sm font-medium">{client.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd>
              <ClientStatusBadge status={client.status} />
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Check-in Frequency</dt>
            <dd className="text-sm font-medium">
              {client.checkInFrequency ? `Every ${client.checkInFrequency} days` : 'Not set'}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Member Since</dt>
            <dd className="text-sm font-medium">
              {new Date(client.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
        </dl>
      </div>

      {/* Relationship Management */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Relationship Management</h3>

        <div className="space-y-4">
          {/* Pause/Resume */}
          {client.status === 'active' && (
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Pause Relationship</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily pause the coaching relationship. The client will still have access
                    but won&apos;t receive new programmes.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handlePause} className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              </div>
            </div>
          )}

          {client.status === 'paused' && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Relationship Paused</p>
                  <p className="text-sm text-muted-foreground">
                    This relationship is currently paused. Resume to continue coaching.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResume}
                  className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              </div>
            </div>
          )}

          {/* End Relationship */}
          {client.status !== 'completed' && client.status !== 'cancelled' && (
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">End Relationship</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently end the coaching relationship. This cannot be undone.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEndConfirm(true)}
                  className="gap-2 text-orange-600 hover:bg-orange-500/10 hover:border-orange-500/50"
                >
                  <UserX className="h-4 w-4" />
                  End
                </Button>
              </div>
            </div>
          )}

          {(client.status === 'completed' || client.status === 'cancelled') && (
            <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/5 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserX className="h-4 w-4" />
                <p className="text-sm">This relationship has ended.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Security */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Account Security</h3>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">Reset Password</p>
              <p className="text-sm text-muted-foreground">
                Generate a new password or set a custom one for this client.
                Only available for email/password accounts.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetPasswordModal(true)}
              className="gap-2"
            >
              <Key className="h-4 w-4" />
              Reset Password
            </Button>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        user={{
          id: client.clientId,
          name: getClientDisplayName(client),
          email: client.email || '',
        }}
      />

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Danger Zone</h3>
        </div>

        <div className="rounded-lg border border-red-500/20 bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">Remove Client</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove this client and all their data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveConfirm(true)}
              className="gap-2 border-red-500/50 text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEndConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 text-orange-600">
              <UserX className="h-5 w-5" />
              <h3 className="font-semibold">End Relationship</h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to end your coaching relationship with{' '}
              <span className="font-medium text-foreground">
                {getClientDisplayName(client)}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEndConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleEnd}
              >
                End Relationship
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRemoveConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-red-500/20 bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold">Remove Client</h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to permanently remove{' '}
              <span className="font-medium text-foreground">
                {getClientDisplayName(client)}
              </span>
              ? All their data will be deleted and this action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRemoveConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleRemove}
              >
                Remove Client
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
