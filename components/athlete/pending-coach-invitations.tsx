'use client'

import { Check, X, Loader2, UserCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  usePendingCoachInvitations,
  useAcceptCoachInvitation,
  useDeclineCoachInvitation,
} from '@/hooks/athlete'
import { useAuth } from '@/contexts/auth-context'

export function PendingCoachInvitations() {
  const { user } = useAuth()
  const { data: invitations = [], isLoading } = usePendingCoachInvitations(user?.id)
  const acceptMutation = useAcceptCoachInvitation()
  const declineMutation = useDeclineCoachInvitation()

  const handleAccept = async (invitationId: string, coachName: string | null | undefined) => {
    try {
      await acceptMutation.mutateAsync(invitationId)
      toast.success('Invitation accepted', {
        description: `You are now connected with ${coachName || 'your coach'}.`,
      })
    } catch (error) {
      toast.error('Failed to accept invitation', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleDecline = async (invitationId: string) => {
    try {
      await declineMutation.mutateAsync(invitationId)
      toast.success('Invitation declined')
    } catch (error) {
      toast.error('Failed to decline invitation', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isLoading || invitations.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <div className="flex items-center gap-3">
            {invitation.coach?.avatarUrl ? (
              <img
                src={invitation.coach.avatarUrl}
                alt={invitation.coach.displayName || 'Coach'}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <UserCircle className="h-6 w-6 text-amber-600" />
              </div>
            )}
            <div>
              <p className="font-medium">
                {invitation.coach?.displayName || 'A coach'} wants to work with you
              </p>
              <p className="text-sm text-muted-foreground">
                Accept to start receiving programmes and guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDecline(invitation.id)}
              disabled={declineMutation.isPending || acceptMutation.isPending}
              className="gap-1"
            >
              {declineMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => handleAccept(invitation.id, invitation.coach?.displayName)}
              disabled={acceptMutation.isPending || declineMutation.isPending}
              className="gap-1 bg-amber-600 text-white hover:bg-amber-700"
            >
              {acceptMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
