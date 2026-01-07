'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle2, Mail, UserPlus, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useInviteCoach } from '@/hooks/admin'

interface AddCoachDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCoachDialog({ isOpen, onClose }: AddCoachDialogProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const inviteCoach = useInviteCoach()

  const handleInvite = async () => {
    if (!inviteEmail || !firstName) return

    try {
      await inviteCoach.mutateAsync({ email: inviteEmail, firstName, lastName })
      setSuccessMessage(`An invite has been sent to ${inviteEmail}. They will have coach access once they accept.`)
      setShowSuccess(true)
      toast.success('Coach invited', {
        description: `Invite sent to ${inviteEmail}`,
      })
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      toast.error('Failed to invite coach', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleClose = () => {
    onClose()
    setShowSuccess(false)
    setSuccessMessage('')
    setInviteEmail('')
    setFirstName('')
    setLastName('')
  }

  const isLoading = inviteCoach.isPending

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-over panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Add Coach</h2>
              <p className="text-sm text-muted-foreground">
                Invite a new coach to the platform
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Invite Sent!</h3>
                <p className="text-center text-sm text-muted-foreground">
                  {successMessage}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Name inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      First name
                    </label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className={cn(
                        'h-12 rounded-lg border-border bg-background',
                        'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Last name
                    </label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className={cn(
                        'h-12 rounded-lg border-border bg-background',
                        'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                      )}
                    />
                  </div>
                </div>

                {/* Email input */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="coach@example.com"
                      className={cn(
                        'h-12 rounded-lg border-border bg-background pl-10',
                        'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                      )}
                    />
                  </div>
                </div>

                {/* Info box */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground">How it works:</strong>
                      </p>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>We&apos;ll send an email invitation</li>
                        <li>They&apos;ll create a password</li>
                        <li>They&apos;ll have coach access immediately</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Coach access info */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Dumbbell className="mt-0.5 h-5 w-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Coach access:</strong> Coaches can manage their own clients, create programmes, meal plans, and communicate with their athletes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!showSuccess && (
            <div className="border-t border-border px-6 py-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleInvite}
                  disabled={!inviteEmail || !firstName || isLoading}
                  className={cn(
                    'group relative flex-1 overflow-hidden bg-amber-600 text-white',
                    'hover:bg-amber-700',
                    'disabled:opacity-50'
                  )}
                >
                  {inviteCoach.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send Invite
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
