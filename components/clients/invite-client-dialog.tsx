'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Mail, CheckCircle2, Search, UserPlus, Send, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { useInviteClient, useInviteNewClient } from '@/hooks/use-clients'
import { searchAthleteByEmail } from '@/app/actions/search-athlete'

const searchSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required'),
  message: z.string().optional(),
})

type SearchFormData = z.infer<typeof searchSchema>
type InviteFormData = z.infer<typeof inviteSchema>

interface FoundProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  contact_email: string | null
  email: string | null
}

interface InviteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Mode = 'search' | 'invite'

export function InviteClientDialog({ open, onOpenChange }: InviteClientDialogProps) {
  const [mode, setMode] = useState<Mode>('search')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundProfile, setFoundProfile] = useState<FoundProfile | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [notFoundEmail, setNotFoundEmail] = useState<string | null>(null)

  const inviteExisting = useInviteClient()
  const inviteNew = useInviteNewClient()

  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { email: '' },
  })

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', name: '', message: '' },
  })

  const handleSearch = async (data: SearchFormData) => {
    setSearching(true)
    setSearchError(null)
    setFoundProfile(null)
    setNotFoundEmail(null)

    try {
      const result = await searchAthleteByEmail(data.email)

      if (!result.success || !result.profile) {
        // User not found - offer to send invite
        setNotFoundEmail(data.email)
        setSearchError(result.error || 'No user found with this email.')
        return
      }

      setFoundProfile({
        id: result.profile.id,
        display_name: result.profile.display_name,
        avatar_url: result.profile.avatar_url,
        contact_email: result.profile.email,
        email: result.profile.email,
      })
    } catch {
      setSearchError('Failed to search for user. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleAddExisting = async () => {
    if (!foundProfile) return

    try {
      await inviteExisting.mutateAsync({ clientId: foundProfile.id })
      setSuccessMessage(`${foundProfile.display_name || foundProfile.email} has been added as your client.`)
      setShowSuccess(true)
      toast.success('Client added successfully')
      setTimeout(handleClose, 2000)
    } catch (error) {
      toast.error('Failed to add client', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleSendInvite = async (data: InviteFormData) => {
    try {
      await inviteNew.mutateAsync({
        email: data.email,
        name: data.name,
        message: data.message,
      })
      setSuccessMessage(`An invitation has been sent to ${data.email}. They'll be added as your client once they sign up.`)
      setShowSuccess(true)
      toast.success('Invitation sent')
      setTimeout(handleClose, 2000)
    } catch (error) {
      toast.error('Failed to send invitation', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const switchToInvite = () => {
    if (notFoundEmail) {
      inviteForm.setValue('email', notFoundEmail)
    }
    setMode('invite')
    setSearchError(null)
    setNotFoundEmail(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    setMode('search')
    setShowSuccess(false)
    setSuccessMessage('')
    setFoundProfile(null)
    setSearchError(null)
    setNotFoundEmail(null)
    searchForm.reset()
    inviteForm.reset()
  }

  if (!open) return null

  const isLoading = inviteExisting.isPending || inviteNew.isPending

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
                {mode === 'search' ? 'Search for an existing user or invite someone new' : 'Send an invitation to join'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mode tabs */}
          {!showSuccess && (
            <div className="flex border-b border-border">
              <button
                onClick={() => setMode('search')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  mode === 'search'
                    ? 'border-b-2 border-foreground text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Search className="mr-2 inline h-4 w-4" />
                Find Existing
              </button>
              <button
                onClick={() => setMode('invite')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  mode === 'invite'
                    ? 'border-b-2 border-foreground text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Send className="mr-2 inline h-4 w-4" />
                Invite New
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium">
                  {mode === 'search' ? 'Client Added!' : 'Invitation Sent!'}
                </h3>
                <p className="text-center text-sm text-muted-foreground">
                  {successMessage}
                </p>
              </div>
            ) : mode === 'search' ? (
              /* Search Mode */
              <div className="space-y-6">
                <Form {...searchForm}>
                  <form onSubmit={searchForm.handleSubmit(handleSearch)} className="space-y-4">
                    <FormField
                      control={searchForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm font-medium">Search by email</Label>
                          <FormControl>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="client@example.com"
                                  disabled={searching}
                                  className="h-12 rounded-lg border-border bg-background pl-10"
                                />
                              </div>
                              <Button type="submit" disabled={searching} variant="outline" className="h-12 px-4">
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                {/* Search error with invite option */}
                {searchError && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-700 dark:text-amber-400">{searchError}</p>
                    {notFoundEmail && (
                      <Button
                        onClick={switchToInvite}
                        variant="outline"
                        size="sm"
                        className="mt-3"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send invitation to {notFoundEmail}
                      </Button>
                    )}
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
                          {(foundProfile.display_name || foundProfile.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{foundProfile.display_name || 'No name set'}</p>
                        <p className="text-sm text-muted-foreground">{foundProfile.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Invite Mode */
              <div className="space-y-6">
                <Form {...inviteForm}>
                  <form onSubmit={inviteForm.handleSubmit(handleSendInvite)} className="space-y-4">
                    <FormField
                      control={inviteForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm font-medium">Their name</Label>
                          <FormControl>
                            <Input {...field} placeholder="John Smith" className="h-12 rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={inviteForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm font-medium">Email address</Label>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input {...field} type="email" placeholder="client@example.com" className="h-12 rounded-lg pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={inviteForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm font-medium">Personal message (optional)</Label>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Looking forward to working with you..."
                              className="min-h-[80px] resize-none rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                {/* Info box */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div className="text-sm text-muted-foreground">
                      <p><strong className="text-foreground">How it works:</strong></p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>We send them an email invitation</li>
                        <li>They download the Synced Momentum app</li>
                        <li>They sign up using this email</li>
                        <li>They are automatically added as your client</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!showSuccess && (
            <div className="border-t border-border px-6 py-4">
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
                  Cancel
                </Button>
                {mode === 'search' ? (
                  <Button
                    type="button"
                    onClick={handleAddExisting}
                    disabled={!foundProfile || isLoading}
                    className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                  >
                    {inviteExisting.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Client
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={inviteForm.handleSubmit(handleSendInvite)}
                    disabled={isLoading}
                    className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
                  >
                    {inviteNew.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
