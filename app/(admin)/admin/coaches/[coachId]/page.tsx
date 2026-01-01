'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Users,
  CreditCard,
  Clock,
  Ban,
  Eye,
  MessageSquare,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCoachDetail } from '@/hooks/admin'

export default function CoachDetailPage({
  params,
}: {
  params: Promise<{ coachId: string }>
}) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState<'clients' | 'activity' | 'revenue'>('clients')

  // Fetch coach data
  const { data: coach, isLoading, error } = useCoachDetail(resolvedParams.coachId)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !coach) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href="/admin/coaches"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Coaches
        </Link>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-1">Coach Not Found</h3>
          <p className="text-sm text-muted-foreground">
            The coach you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    )
  }

  const coachName = coach.display_name ||
    [coach.first_name, coach.last_name].filter(Boolean).join(' ') ||
    'Unknown Coach'
  const initials = coachName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
  const stats = coach.stats || {
    totalClients: 0,
    activeClients: 0,
    pendingClients: 0,
    pausedClients: 0,
    totalRevenue: 0,
    avgCheckInResponse: 'N/A',
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600'
      case 'pending': return 'bg-amber-500/10 text-amber-600'
      case 'paused': return 'bg-blue-500/10 text-blue-600'
      case 'ended': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/coaches"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Coaches
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {coach.avatar_url ? (
              <img
                src={coach.avatar_url}
                alt={coachName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-xl font-bold text-white">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{coachName}</h1>
                <span className={cn('rounded-full px-3 py-1 text-sm font-medium', getStatusColor(coach.status || 'active'))}>
                  {(coach.status || 'active').charAt(0).toUpperCase() + (coach.status || 'active').slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {coach.email || coach.contact_email || 'No email'}
                </span>
                {coach.contact_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {coach.contact_phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Impersonate
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4 mb-8"
      >
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Clients</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalClients}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.activeClients} active, {stats.pendingClients} pending
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">MRR</span>
          </div>
          <p className="text-2xl font-bold">£{coach.mrr || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{coach.subscription?.tier || 'No'} plan</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">£{stats.totalRevenue}</p>
          <p className="text-xs text-muted-foreground mt-1">Lifetime from this coach</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Response</span>
          </div>
          <p className="text-2xl font-bold">{stats.avgCheckInResponse}</p>
          <p className="text-xs text-muted-foreground mt-1">Check-in response time</p>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 mb-8"
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Joined</span>
              <span className="text-sm font-medium">
                {coach.created_at ? new Date(coach.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                }) : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Active</span>
              <span className="text-sm font-medium">
                {coach.last_sign_in_at
                  ? formatDistanceToNow(new Date(coach.last_sign_in_at), { addSuffix: true })
                  : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subscription Status</span>
              <span className={cn('text-sm font-medium', getStatusColor(coach.subscription?.status || 'inactive'))}>
                {(coach.subscription?.status || 'Inactive').charAt(0).toUpperCase() + (coach.subscription?.status || 'inactive').slice(1)}
              </span>
            </div>
            {coach.subscription?.current_period_end && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Next Billing</span>
                <span className="text-sm font-medium">
                  {new Date(coach.subscription.current_period_end).toLocaleDateString('en-GB')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Client Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Active</span>
              </span>
              <span className="text-sm font-medium">{stats.activeClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-sm">Pending</span>
              </span>
              <span className="text-sm font-medium">{stats.pendingClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">Paused</span>
              </span>
              <span className="text-sm font-medium">{stats.pausedClients}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['clients', 'activity', 'revenue'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'clients' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          {coach.clients && coach.clients.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Since</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Next Check-In</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coach.clients.map((client: { id: string; name: string; status: string; since: string; lastCheckIn: string | null }) => (
                  <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{client.name}</p>
                    </td>
                    <td className="p-4">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(client.status))}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {client.since ? new Date(client.since).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {client.lastCheckIn ? new Date(client.lastCheckIn).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/athletes/${client.id}`}
                        className="flex items-center text-sm text-red-600 hover:text-red-700"
                      >
                        View <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No clients yet</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          {coach.recentActivity && coach.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {coach.recentActivity.map((activity: { action: string; client: string; time: string }, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.client}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activity.time ? formatDistanceToNow(new Date(activity.time), { addSuffix: true }) : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'revenue' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold mb-6">Revenue History</h3>
          {coach.revenueHistory && coach.revenueHistory.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coach.revenueHistory.map((item: { last_payment_amount: number; current_period_start: string }) => ({
                  month: item.current_period_start ? new Date(item.current_period_start).toLocaleDateString('en-GB', { month: 'short' }) : 'N/A',
                  revenue: item.last_payment_amount || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `£${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`£${value}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No revenue history available</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
