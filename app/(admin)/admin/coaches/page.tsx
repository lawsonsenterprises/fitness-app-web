'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  Mail,
  Calendar,
  UserCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TopBar } from '@/components/dashboard/top-bar'
import { useAllCoaches, usePlatformStats } from '@/hooks/admin'

function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '??'
}

function getDisplayName(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  if (firstName) {
    return firstName
  }
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

export default function CoachesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'inactive'>('all')

  const { data: coachesData, isLoading, error } = useAllCoaches({
    search: searchQuery || undefined,
  })
  const { data: stats } = usePlatformStats()

  const coaches = coachesData?.coaches || []

  // Filter coaches based on status
  const filteredCoaches = coaches.filter((coach) => {
    if (statusFilter === 'all') return true
    // TODO: Add proper status filtering based on subscription status
    return true
  })

  if (error) {
    return (
      <>
        <TopBar title="Coaches" />
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Failed to load coaches</p>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Coaches" />
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Coaches</h1>
            <p className="mt-1 text-muted-foreground">
              Manage all coaches on the platform
            </p>
          </div>
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <Users className="h-4 w-4" />
            Add Coach
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Coaches</p>
            <p className="text-2xl font-bold mt-1">{stats?.totalCoaches || coaches.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Active (7 days)</p>
            <p className="text-2xl font-bold mt-1 text-green-500">
              {stats?.activeCoaches || 0}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">On Trial</p>
            <p className="text-2xl font-bold mt-1 text-amber-500">
              {coaches.filter(c => c.subscriptions?.some((s: { status: string }) => s.status === 'trialing')).length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Athletes</p>
            <p className="text-2xl font-bold mt-1">
              {stats?.totalAthletes || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coaches..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'trial', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                  statusFilter === status
                    ? 'bg-foreground text-background'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCoaches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No Coaches Found</h3>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'No coaches have signed up yet'}
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Coach</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Active</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCoaches.map((coach) => {
                    const subscription = coach.subscriptions?.[0]
                    const isActive = coach.last_sign_in_at &&
                      new Date(coach.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    const isTrial = subscription?.status === 'trialing'

                    return (
                      <tr key={coach.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
                              {getInitials(coach.first_name, coach.last_name, coach.email)}
                            </div>
                            <div>
                              <p className="font-medium">{getDisplayName(coach.first_name, coach.last_name, coach.email)}</p>
                              <p className="text-sm text-muted-foreground">{coach.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            isActive && 'bg-green-500/10 text-green-600',
                            isTrial && 'bg-amber-500/10 text-amber-600',
                            !isActive && !isTrial && 'bg-zinc-500/10 text-zinc-600'
                          )}>
                            {isActive && <CheckCircle2 className="h-3 w-3" />}
                            {isTrial && <Calendar className="h-3 w-3" />}
                            {!isActive && !isTrial && <XCircle className="h-3 w-3" />}
                            {isTrial ? 'Trial' : isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-sm">
                          {subscription?.tier || 'Free'}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {coach.created_at ? new Date(coach.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : 'Unknown'}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {getRelativeTime(coach.last_sign_in_at)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/coaches/${coach.id}`}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                              <Ban className="h-4 w-4 text-red-500" />
                            </button>
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
        {filteredCoaches.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {filteredCoaches.length} of {coachesData?.total || coaches.length} coaches
          </div>
        )}
      </div>
    </>
  )
}
