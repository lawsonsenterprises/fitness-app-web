'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  Search,
  UserMinus,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  UserPlus,
  RefreshCw,
  Mail,
  Key,
  Trash2,
  Crown,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TopBar } from '@/components/dashboard/top-bar'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useAdmins, useDemoteAdmin, useDeleteAdmin, usePendingInvites, useResendInvite, usePromoteToSuperAdmin } from '@/hooks/admin'
import { useAuth } from '@/contexts/auth-context'
import { AddAdminDialog } from '@/components/admin/admins/add-admin-dialog'
import { ResetPasswordModal } from '@/components/admin/shared/reset-password-modal'

function getInitials(displayName?: string | null, email?: string | null): string {
  if (displayName) {
    const parts = displayName.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return displayName.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '??'
}

function getDisplayName(displayName?: string | null, email?: string | null): string {
  if (displayName) return displayName
  return email || 'Unknown'
}

function getRelativeTime(date: string | null): string {
  if (!date) return 'Never'
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 5) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [adminToRemove, setAdminToRemove] = useState<{ id: string; name: string; isAdminOnly: boolean } | null>(null)
  const [resetPasswordAdmin, setResetPasswordAdmin] = useState<{ id: string; name: string; email: string } | null>(null)
  const [adminToPromote, setAdminToPromote] = useState<{ id: string; name: string } | null>(null)
  const [isProcessingAction, setIsProcessingAction] = useState<'demote' | 'delete' | 'promote' | null>(null)

  const { data: adminsData, isLoading, error, refetch: refetchAdmins } = useAdmins({
    search: searchQuery || undefined,
  })
  const { data: pendingInvites = [], refetch: refetchPendingInvites } = usePendingInvites()
  const demoteAdmin = useDemoteAdmin(user?.id || '')
  const deleteAdmin = useDeleteAdmin(user?.id || '')
  const resendInvite = useResendInvite()
  const promoteToSuperAdmin = usePromoteToSuperAdmin()

  const admins = adminsData?.admins || []

  // Check if current user is a super admin (for showing/hiding management buttons)
  const currentUserAdmin = admins.find(a => a.id === user?.id)
  const isSuperAdmin = currentUserAdmin?.roles?.includes('super_admin') || false

  // Cross-reference admins with pending invites to mark who hasn't confirmed
  const pendingAdminIds = new Set(pendingInvites.map(p => p.userId))

  const handleResendInvite = async (userId: string, email: string) => {
    try {
      await resendInvite.mutateAsync(userId)
      // Explicitly refetch to ensure UI updates (user ID changes after resend)
      await Promise.all([refetchAdmins(), refetchPendingInvites()])
      toast.success('Invite resent', {
        description: `A new invitation email has been sent to ${email}.`,
      })
    } catch (error) {
      toast.error('Failed to resend invite', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleDemoteAdmin = async () => {
    if (!adminToRemove) return

    setIsProcessingAction('demote')
    try {
      await demoteAdmin.mutateAsync(adminToRemove.id)
      await Promise.all([refetchAdmins(), refetchPendingInvites()])
      toast.success('Admin access removed', {
        description: `${adminToRemove.name} is no longer an admin.`,
      })
      setAdminToRemove(null)
    } catch (error) {
      toast.error('Failed to remove admin', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsProcessingAction(null)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!adminToRemove) return

    setIsProcessingAction('delete')
    try {
      await deleteAdmin.mutateAsync(adminToRemove.id)
      await Promise.all([refetchAdmins(), refetchPendingInvites()])
      toast.success('Admin deleted', {
        description: `${adminToRemove.name} has been permanently removed.`,
      })
      setAdminToRemove(null)
    } catch (error) {
      toast.error('Failed to delete admin', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsProcessingAction(null)
    }
  }

  const handlePromoteToSuperAdmin = async () => {
    if (!adminToPromote) return

    setIsProcessingAction('promote')
    try {
      await promoteToSuperAdmin.mutateAsync(adminToPromote.id)
      await refetchAdmins()
      toast.success('Promoted to Super Admin', {
        description: `${adminToPromote.name} is now a super admin.`,
      })
      setAdminToPromote(null)
    } catch (error) {
      toast.error('Failed to promote', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsProcessingAction(null)
    }
  }

  if (error) {
    return (
      <>
        <TopBar title="Admins" />
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Failed to load admins</p>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Admins" />
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Admins</h1>
            <p className="mt-1 text-muted-foreground">
              Manage platform administrators
            </p>
          </div>
          {isSuperAdmin && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <UserPlus className="h-4 w-4" />
              Add Admin
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Admins</p>
            <p className="text-2xl font-bold mt-1">{adminsData?.total || 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Active Today</p>
            <p className="text-2xl font-bold mt-1 text-green-500">
              {adminsData?.activeToday || 0}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Full Platform Access</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Admins have complete control over the platform
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admins..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : admins.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShieldCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No Admins Found</h3>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'No administrators have been added yet'}
            </p>
          </motion.div>
        ) : (
          /* Table */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Admin</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Other Roles</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Active</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Added</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {admins.map((admin) => {
                    const isCurrentUser = admin.id === user?.id
                    const isPending = pendingAdminIds.has(admin.id)
                    const isActiveToday = !isPending && admin.updated_at &&
                      new Date(admin.updated_at) >= new Date(new Date().setHours(0, 0, 0, 0))
                    const isTargetSuperAdmin = admin.roles.includes('super_admin')
                    const otherRoles = admin.roles.filter(r => r !== 'admin' && r !== 'super_admin')

                    return (
                      <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-full text-white font-bold',
                              isPending ? 'bg-amber-500' : 'bg-red-500'
                            )}>
                              {getInitials(admin.display_name, admin.contact_email)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {getDisplayName(admin.display_name, admin.contact_email)}
                                </p>
                                {isCurrentUser && (
                                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{admin.contact_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {isTargetSuperAdmin && (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-600">
                                Super Admin
                              </span>
                            )}
                            {otherRoles.length > 0 ? (
                              otherRoles.map((role) => (
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
                              ))
                            ) : !isTargetSuperAdmin ? (
                              <span className="text-sm text-muted-foreground">—</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="p-4">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-600">
                              <Mail className="h-3 w-3" />
                              Pending Invite
                            </span>
                          ) : (
                            <span className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                              isActiveToday ? 'bg-green-500/10 text-green-600' : 'bg-zinc-500/10 text-zinc-600'
                            )}>
                              {isActiveToday ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3" />
                                  Away
                                </>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {isPending ? 'Never' : getRelativeTime(admin.updated_at)}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : 'Unknown'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {isCurrentUser ? (
                              <span className="text-xs text-muted-foreground px-2">
                                Cannot modify yourself
                              </span>
                            ) : isTargetSuperAdmin ? (
                              <span className="text-xs text-muted-foreground px-2">
                                Protected account
                              </span>
                            ) : (
                              <>
                                {isPending && isSuperAdmin && (
                                  <button
                                    onClick={() => handleResendInvite(admin.id, admin.contact_email || '')}
                                    disabled={resendInvite.isPending}
                                    className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors group"
                                    title="Resend invite email"
                                  >
                                    {resendInvite.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4 text-muted-foreground group-hover:text-amber-500" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => setResetPasswordAdmin({
                                    id: admin.id,
                                    name: getDisplayName(admin.display_name, admin.contact_email),
                                    email: admin.contact_email || '',
                                  })}
                                  className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors group"
                                  title="Reset password"
                                >
                                  <Key className="h-4 w-4 text-muted-foreground group-hover:text-amber-500" />
                                </button>
                                {isSuperAdmin && !isTargetSuperAdmin && (
                                  <button
                                    onClick={() => setAdminToPromote({
                                      id: admin.id,
                                      name: getDisplayName(admin.display_name, admin.contact_email),
                                    })}
                                    className="p-2 rounded-lg hover:bg-purple-500/10 transition-colors group"
                                    title="Promote to Super Admin"
                                  >
                                    <Crown className="h-4 w-4 text-muted-foreground group-hover:text-purple-500" />
                                  </button>
                                )}
                                {isSuperAdmin && (
                                  <button
                                    onClick={() => {
                                      const nonAdminRoles = admin.roles.filter((r: string) => r !== 'admin' && r !== 'super_admin')
                                      setAdminToRemove({
                                        id: admin.id,
                                        name: getDisplayName(admin.display_name, admin.contact_email),
                                        isAdminOnly: nonAdminRoles.length === 0,
                                      })
                                    }}
                                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group"
                                    title="Remove admin access"
                                  >
                                    <UserMinus className="h-4 w-4 text-muted-foreground group-hover:text-red-500" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Summary */}
        {admins.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {admins.length} admin{admins.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Add Admin Dialog */}
      <AddAdminDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      {/* Remove Admin Confirmation */}
      {adminToRemove && !adminToRemove.isAdminOnly && (
        <ConfirmationDialog
          isOpen={true}
          onClose={() => setAdminToRemove(null)}
          onConfirm={handleDemoteAdmin}
          title="Remove Admin Access"
          description={`Are you sure you want to remove admin access from ${adminToRemove.name}? They will no longer be able to access the admin dashboard but will keep their other roles.`}
          confirmLabel="Remove Admin"
          variant="destructive"
          icon={<UserMinus className="h-6 w-6 text-red-500" />}
        />
      )}

      {/* Admin-Only User Choice Dialog */}
      {adminToRemove && adminToRemove.isAdminOnly && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setAdminToRemove(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">Admin-Only User</h3>
                <p className="text-sm text-muted-foreground">{adminToRemove.name}</p>
              </div>
            </div>

            <p className="mb-6 text-sm text-muted-foreground">
              This user only has the admin role. What would you like to do?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleDemoteAdmin}
                disabled={isProcessingAction !== null}
                className="w-full flex items-center gap-3 rounded-lg border border-border p-4 text-left hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  {isProcessingAction === 'demote' ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <UserMinus className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Keep as Athlete</p>
                  <p className="text-xs text-muted-foreground">
                    Remove admin access but keep them in the system as an athlete
                  </p>
                </div>
              </button>

              <button
                onClick={handleDeleteAdmin}
                disabled={isProcessingAction !== null}
                className="w-full flex items-center gap-3 rounded-lg border border-red-500/30 p-4 text-left hover:bg-red-500/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  {isProcessingAction === 'delete' ? (
                    <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-red-600">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove them from the system
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setAdminToRemove(null)}
              className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Reset Password Modal */}
      {resetPasswordAdmin && (
        <ResetPasswordModal
          isOpen={!!resetPasswordAdmin}
          onClose={() => setResetPasswordAdmin(null)}
          user={{
            id: resetPasswordAdmin.id,
            name: resetPasswordAdmin.name,
            email: resetPasswordAdmin.email,
          }}
        />
      )}

      {/* Promote to Super Admin Confirmation */}
      {adminToPromote && (
        <ConfirmationDialog
          isOpen={true}
          onClose={() => setAdminToPromote(null)}
          onConfirm={handlePromoteToSuperAdmin}
          title="Promote to Super Admin"
          description={`Are you sure you want to promote ${adminToPromote.name} to super admin? They will have full control over admin management and cannot be demoted or deleted.`}
          confirmLabel={isProcessingAction === 'promote' ? 'Promoting...' : 'Promote'}
          variant="default"
          icon={<Crown className="h-6 w-6 text-purple-500" />}
        />
      )}
    </>
  )
}
