'use client'

import { useState } from 'react'
import { X, Loader2, Search, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSearchUsersForPromotion, usePromoteToAdmin } from '@/hooks/admin'

interface FoundUser {
  id: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  roles: string[]
}

interface AddAdminDialogProps {
  isOpen: boolean
  onClose: () => void
}

function getDisplayName(user: FoundUser): string {
  if (user.display_name) return user.display_name
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
  if (user.first_name) return user.first_name
  return user.email || 'Unknown User'
}

function getInitials(user: FoundUser): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  }
  if (user.display_name) {
    const parts = user.display_name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return user.display_name.slice(0, 2).toUpperCase()
  }
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase()
  }
  return '??'
}

export function AddAdminDialog({ isOpen, onClose }: AddAdminDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<FoundUser | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const { data: searchResults, isLoading: isSearching } = useSearchUsersForPromotion(searchQuery)
  const promoteToAdmin = usePromoteToAdmin()

  const handlePromote = async () => {
    if (!selectedUser) return

    try {
      await promoteToAdmin.mutateAsync(selectedUser.id)
      setShowSuccess(true)
      toast.success('Admin added', {
        description: `${getDisplayName(selectedUser)} now has admin access.`,
      })
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      toast.error('Failed to add admin', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleClose = () => {
    onClose()
    setSearchQuery('')
    setSelectedUser(null)
    setShowSuccess(false)
  }

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
              <h2 className="text-lg font-semibold">Add Admin</h2>
              <p className="text-sm text-muted-foreground">
                Grant admin access to an existing user
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
                <h3 className="mb-2 text-lg font-medium">Admin Added!</h3>
                <p className="text-center text-sm text-muted-foreground">
                  {selectedUser && getDisplayName(selectedUser)} now has full platform access.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search input */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Search users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setSelectedUser(null)
                      }}
                      placeholder="Search by name or email..."
                      className={cn(
                        'h-12 rounded-lg border-border bg-background pl-10',
                        'focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20'
                      )}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Type at least 2 characters to search
                  </p>
                </div>

                {/* Search results */}
                {searchQuery.length >= 2 && searchResults && searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Results ({searchResults.length})
                    </p>
                    <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-2">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user as FoundUser)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                            selectedUser?.id === user.id
                              ? 'bg-red-500/10 ring-1 ring-red-500/50'
                              : 'hover:bg-muted'
                          )}
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={getDisplayName(user as FoundUser)}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-sm font-semibold text-background">
                              {getInitials(user as FoundUser)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {getDisplayName(user as FoundUser)}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {user.roles.map((role: string) => (
                              <span
                                key={role}
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                                  role === 'coach' && 'bg-amber-500/10 text-amber-600',
                                  role === 'athlete' && 'bg-blue-500/10 text-blue-600'
                                )}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {searchQuery.length >= 2 && searchResults && searchResults.length === 0 && !isSearching && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No users found matching &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}

                {/* Selected user confirmation */}
                {selectedUser && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500 shrink-0" />
                      <div>
                        <p className="font-medium text-red-600">
                          Grant admin access?
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          <strong>{getDisplayName(selectedUser)}</strong> will have full control over the platform including access to all coaches, athletes, subscriptions, and settings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info box */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Admin access:</strong> Admins can view and manage all platform data, suspend users, access billing information, and modify system settings.
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
                  disabled={promoteToAdmin.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handlePromote}
                  disabled={!selectedUser || promoteToAdmin.isPending}
                  className={cn(
                    'group relative flex-1 overflow-hidden bg-red-600 text-white',
                    'hover:bg-red-700',
                    'disabled:opacity-50'
                  )}
                >
                  {promoteToAdmin.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Grant Admin Access
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
