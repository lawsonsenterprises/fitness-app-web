'use client'

import { useState } from 'react'
import {
  CreditCard,
  Search,
  PoundSterling,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { TopBar } from '@/components/dashboard/top-bar'
import { useSubscriptions, useSubscriptionStats } from '@/hooks/admin'
import type { SubscriptionStatus, SubscriptionTier } from '@/types'

const statusConfig: Record<SubscriptionStatus, { label: string; icon: typeof CheckCircle2; color: string; bgColor: string }> = {
  trialing: { label: 'Trial', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  active: { label: 'Active', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  past_due: { label: 'Past Due', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  canceled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-500/10' },
  unpaid: { label: 'Unpaid', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-500/10' },
  incomplete: { label: 'Incomplete', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  incomplete_expired: { label: 'Expired', icon: XCircle, color: 'text-zinc-600', bgColor: 'bg-zinc-500/10' },
  paused: { label: 'Paused', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
}

const tierConfig: Record<SubscriptionTier, { label: string; color: string }> = {
  free: { label: 'Free', color: 'text-zinc-600' },
  starter: { label: 'Starter', color: 'text-blue-600' },
  professional: { label: 'Pro', color: 'text-green-600' },
  enterprise: { label: 'Enterprise', color: 'text-purple-600' },
}

function getDisplayName(user?: { first_name?: string | null; last_name?: string | null; display_name?: string | null; email?: string }): string {
  if (!user) return 'Unknown'
  if (user.display_name) return user.display_name
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
  if (user.first_name) return user.first_name
  return user.email || 'Unknown'
}

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trialing' | 'canceled'>('all')

  const { data: subscriptionsData, isLoading, error } = useSubscriptions({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
  })
  const { data: stats } = useSubscriptionStats()

  const subscriptions = subscriptionsData?.subscriptions || []

  if (error) {
    return (
      <>
        <TopBar title="Subscriptions" />
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Failed to load subscriptions</p>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Subscriptions" />
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Subscriptions</h1>
          <p className="mt-1 text-muted-foreground">
            Manage subscriptions and billing
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <PoundSterling className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">MRR</span>
            </div>
            <p className="text-2xl font-bold">
              £{(stats?.mrr || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-500">
              {stats?.activeSubscriptions || 0}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Trials</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">
              {subscriptions.filter(s => s.status === 'trialing').length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Cancelled (30d)</span>
            </div>
            <p className="text-2xl font-bold text-red-500">
              {stats?.cancelledLast30Days || 0}
            </p>
          </div>
        </div>

        {/* Churn Rate */}
        {stats?.churnRate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6 mb-6"
          >
            <h2 className="text-lg font-semibold mb-2">Churn Rate</h2>
            <p className="text-3xl font-bold">{stats.churnRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              Based on cancellations in the last 30 days
            </p>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'trialing', 'canceled'] as const).map((status) => (
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
                {status === 'canceled' ? 'cancelled' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : subscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No Subscriptions Found</h3>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No subscriptions have been created yet'}
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Current Period</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscriptions.map((sub) => {
                    const status = statusConfig[sub.status as SubscriptionStatus] || statusConfig.active
                    const tier = tierConfig[sub.tier as SubscriptionTier] || tierConfig.free
                    const StatusIcon = status.icon

                    return (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{getDisplayName(sub.user)}</td>
                        <td className="p-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium',
                            tier.color
                          )}>
                            <CreditCard className="h-3 w-3" />
                            {tier.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            status.bgColor,
                            status.color
                          )}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {sub.current_period_start && sub.current_period_end ? (
                            <>
                              {new Date(sub.current_period_start).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}
                              {' - '}
                              {new Date(sub.current_period_end).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : '-'}
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
        {subscriptions.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {subscriptions.length} of {subscriptionsData?.total || subscriptions.length} subscriptions
          </div>
        )}
      </div>
    </>
  )
}
