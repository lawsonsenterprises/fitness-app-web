'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Mail, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { useInviteClient } from '@/hooks/use-clients'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  customMessage: z.string().max(500, 'Message must be 500 characters or fewer').optional(),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteClientDialog({ open, onOpenChange }: InviteClientDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const inviteClient = useInviteClient()

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      customMessage: '',
    },
  })

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteClient.mutateAsync({
        email: data.email,
        customMessage: data.customMessage,
      })
      setShowSuccess(true)
      toast.success('Invitation sent successfully', {
        description: `An invitation has been sent to ${data.email}`,
      })
      setTimeout(() => {
        onOpenChange(false)
        setShowSuccess(false)
        form.reset()
      }, 2000)
    } catch {
      toast.error('Failed to send invitation', {
        description: 'Please try again or contact support if the problem persists.',
      })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setShowSuccess(false)
    form.reset()
  }

  if (!open) return null

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
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Invite Client</h2>
              <p className="text-sm text-muted-foreground">
                Send an invitation to a new client
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
                <h3 className="mb-2 text-lg font-medium">Invitation Sent!</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Your client will receive an email with instructions to join.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-medium">
                          Client&apos;s email address
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="client@example.com"
                              disabled={inviteClient.isPending}
                              className={cn(
                                'h-12 rounded-lg border-border bg-background pl-10',
                                'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                              )}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Custom message field */}
                  <FormField
                    control={form.control}
                    name="customMessage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Personal message{' '}
                            <span className="font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {field.value?.length || 0}/500
                          </span>
                        </div>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={4}
                            placeholder="Add a personal note to your invitation..."
                            disabled={inviteClient.isPending}
                            className={cn(
                              'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm',
                              'placeholder:text-muted-foreground/60',
                              'focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
                              'disabled:opacity-50',
                              'resize-none'
                            )}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Email preview */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Email Preview
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">
                        You&apos;ve been invited to join Synced Momentum
                      </p>
                      <p className="text-muted-foreground">
                        Your coach has invited you to join their coaching platform.
                        Click the button below to create your account and get started.
                      </p>
                      {form.watch('customMessage') && (
                        <div className="mt-3 border-l-2 border-amber-500 pl-3 italic text-muted-foreground">
                          &quot;{form.watch('customMessage')}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
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
                  disabled={inviteClient.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={inviteClient.isPending}
                  className={cn(
                    'group relative flex-1 overflow-hidden bg-foreground text-background',
                    'hover:bg-foreground/90'
                  )}
                >
                  {inviteClient.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
