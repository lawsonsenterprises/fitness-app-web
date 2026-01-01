'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Mail, Send, CheckCircle2, Search, UserPlus } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'

const searchSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type SearchFormData = z.infer<typeof searchSchema>

interface FoundProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  contact_email: string | null
}

interface InviteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteClientDialog({ open, onOpenChange }: InviteClientDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [searching, setSearching] = useState(false)
  const [foundProfile, setFoundProfile] = useState<FoundProfile | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const inviteClient = useInviteClient()
  const supabase = createClient()

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSearch = async (data: SearchFormData) => {
    setSearching(true)
    setSearchError(null)
    setFoundProfile(null)

    try {
      // Search for profile by email
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, contact_email')
        .eq('contact_email', data.email)
        .single()

      if (error || !profile) {
        setSearchError('No user found with this email. They need to sign up first.')
        return
      }

      // Check if user has athlete role
      const { data: fullProfile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', profile.id)
        .single()

      if (!fullProfile?.roles?.includes('athlete')) {
        setSearchError('This user is not registered as an athlete.')
        return
      }

      setFoundProfile(profile)
    } catch {
      setSearchError('Failed to search for user. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleInvite = async () => {
    if (!foundProfile) return

    try {
      await inviteClient.mutateAsync({
        clientId: foundProfile.id,
      })
      setShowSuccess(true)
      toast.success('Client added successfully', {
        description: `${foundProfile.display_name || foundProfile.contact_email} has been added as your client.`,
      })
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.'
      toast.error('Failed to add client', {
        description: message,
      })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setShowSuccess(false)
    setFoundProfile(null)
    setSearchError(null)
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
              <h2 className="text-lg font-semibold">Add Client</h2>
              <p className="text-sm text-muted-foreground">
                Search for an existing user to add as your client
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
                <h3 className="mb-2 text-lg font-medium">Client Added!</h3>
                <p className="text-center text-sm text-muted-foreground">
                  The client has been added to your roster and can now receive programmes and meal plans.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
                    {/* Email search field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm font-medium">
                            Search by email
                          </Label>
                          <FormControl>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="client@example.com"
                                  disabled={searching}
                                  className={cn(
                                    'h-12 rounded-lg border-border bg-background pl-10',
                                    'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                                  )}
                                />
                              </div>
                              <Button
                                type="submit"
                                disabled={searching}
                                variant="outline"
                                className="h-12 px-4"
                              >
                                {searching ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Search className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                {/* Search error */}
                {searchError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                    {searchError}
                  </div>
                )}

                {/* Found profile */}
                {foundProfile && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      User Found
                    </p>
                    <div className="flex items-center gap-4">
                      {foundProfile.avatar_url ? (
                        <img
                          src={foundProfile.avatar_url}
                          alt={foundProfile.display_name || 'User'}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-lg font-semibold text-background">
                          {(foundProfile.display_name || foundProfile.contact_email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {foundProfile.display_name || 'No name set'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {foundProfile.contact_email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info box */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> The user must have already signed up to Synced Momentum as an athlete before you can add them as a client.
                  </p>
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
                  disabled={inviteClient.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleInvite}
                  disabled={!foundProfile || inviteClient.isPending}
                  className={cn(
                    'group relative flex-1 overflow-hidden bg-foreground text-background',
                    'hover:bg-foreground/90',
                    'disabled:opacity-50'
                  )}
                >
                  {inviteClient.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Client
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
