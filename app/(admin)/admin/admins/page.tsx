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
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TopBar } from '@/components/dashboard/top-bar'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useAdmins, useDemoteAdmin } from '@/hooks/admin'
import { useAuth } from '@/contexts/auth-context'
import { AddAdminDialog } from '@/components/admin/admins/add-admin-dialog'

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
  const [adminToRemove, setAdminToRemove] = useState<{ id: string; name: string } | null>(null)

  const { data: adminsData, isLoading, error } = useAdmins({
    search: searchQuery || undefined,
  })
  const demoteAdmin = useDemoteAdmin(user?.id || '')

  const admins = adminsData?.admins || []

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return

    try {
      await demoteAdmin.mutateAsync(adminToRemove.id)
      toast.success('Admin access removed', {
        description: `${adminToRemove.name} is no longer an admin.`,
      })
      setAdminToRemove(null)
    } catch (error) {
      toast.error('Failed to remove admin', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
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
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            <UserPlus className="h-4 w-4" />
            Add Admin
          </Button>
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
                    const isActiveToday = admin.updated_at &&
                      new Date(admin.updated_at) >= new Date(new Date().setHours(0, 0, 0, 0))
                    const otherRoles = admin.roles.filter(r => r !== 'admin')

                    return (
                      <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white font-bold">
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
                          <div className="flex gap-1">
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
                            ) : (
                              <span className="text-sm text-muted-foreground">Admin only</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
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
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {getRelativeTime(admin.updated_at)}
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
                            ) : (
                              <button
                                onClick={() => setAdminToRemove({
                                  id: admin.id,
                                  name: getDisplayName(admin.display_name, admin.contact_email),
                                })}
                                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group"
                                title="Remove admin access"
                              >
                                <UserMinus className="h-4 w-4 text-muted-foreground group-hover:text-red-500" />
                              </button>
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
      <ConfirmationDialog
        isOpen={!!adminToRemove}
        onClose={() => setAdminToRemove(null)}
        onConfirm={handleRemoveAdmin}
        title="Remove Admin Access"
        description={`Are you sure you want to remove admin access from ${adminToRemove?.name}? They will no longer be able to access the admin dashboard.`}
        confirmLabel="Remove Admin"
        variant="destructive"
        icon={<UserMinus className="h-6 w-6 text-red-500" />}
      />
    </>
  )
}
