'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Users,
  CreditCard,
  Clock,
  MoreVertical,
  Ban,
  UserCheck,
  Eye,
  MessageSquare,
  TrendingUp,
  Activity,
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

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock coach data
const mockCoach = {
  id: '1',
  name: 'Sheridan Lawson',
  email: 'sheridan@syncedmomentum.com',
  phone: '+44 7700 900123',
  avatar: null,
  status: 'active',
  subscription: {
    plan: 'Professional',
    status: 'active',
    mrr: 79,
    nextBilling: '2025-01-15',
  },
  stats: {
    totalClients: 24,
    activeClients: 18,
    pendingClients: 4,
    pausedClients: 2,
    totalRevenue: 2844,
    avgCheckInResponse: '4.2 hours',
  },
  joinedDate: '2024-06-15',
  lastActive: '2024-12-28T09:30:00Z',
  clients: [
    { id: '1', name: 'John Smith', status: 'active', since: '2024-08-01', lastCheckIn: '2024-12-21' },
    { id: '2', name: 'Sarah Johnson', status: 'active', since: '2024-09-15', lastCheckIn: '2024-12-22' },
    { id: '3', name: 'Mike Wilson', status: 'pending', since: '2024-12-20', lastCheckIn: null },
    { id: '4', name: 'Emma Davis', status: 'active', since: '2024-07-10', lastCheckIn: '2024-12-20' },
    { id: '5', name: 'Tom Brown', status: 'paused', since: '2024-05-01', lastCheckIn: '2024-11-15' },
  ],
  recentActivity: [
    { action: 'Reviewed check-in', client: 'John Smith', time: '2 hours ago' },
    { action: 'Updated programme', client: 'Sarah Johnson', time: '4 hours ago' },
    { action: 'Sent message', client: 'Emma Davis', time: '6 hours ago' },
    { action: 'Created meal plan', client: 'Mike Wilson', time: '1 day ago' },
    { action: 'Reviewed check-in', client: 'Tom Brown', time: '2 days ago' },
  ],
  revenueHistory: [
    { month: 'Jul', revenue: 474 },
    { month: 'Aug', revenue: 632 },
    { month: 'Sep', revenue: 790 },
    { month: 'Oct', revenue: 948 },
    { month: 'Nov', revenue: 1106 },
    { month: 'Dec', revenue: 1264 },
  ],
}

export default function CoachDetailPage({
  params,
}: {
  params: Promise<{ coachId: string }>
}) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState<'clients' | 'activity' | 'revenue'>('clients')

  const initials = mockCoach.name.split(' ').map(n => n[0]).join('').toUpperCase()

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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-xl font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{mockCoach.name}</h1>
                <span className={cn('rounded-full px-3 py-1 text-sm font-medium', getStatusColor(mockCoach.status))}>
                  {mockCoach.status.charAt(0).toUpperCase() + mockCoach.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {mockCoach.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {mockCoach.phone}
                </span>
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
          <p className="text-2xl font-bold">{mockCoach.stats.totalClients}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {mockCoach.stats.activeClients} active, {mockCoach.stats.pendingClients} pending
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">MRR</span>
          </div>
          <p className="text-2xl font-bold">£{mockCoach.subscription.mrr}</p>
          <p className="text-xs text-muted-foreground mt-1">{mockCoach.subscription.plan} plan</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">£{mockCoach.stats.totalRevenue}</p>
          <p className="text-xs text-muted-foreground mt-1">Lifetime from this coach</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Response</span>
          </div>
          <p className="text-2xl font-bold">{mockCoach.stats.avgCheckInResponse}</p>
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
                {new Date(mockCoach.joinedDate).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Active</span>
              <span className="text-sm font-medium">
                {new Date(mockCoach.lastActive).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subscription Status</span>
              <span className={cn('text-sm font-medium', getStatusColor(mockCoach.subscription.status))}>
                {mockCoach.subscription.status.charAt(0).toUpperCase() + mockCoach.subscription.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Next Billing</span>
              <span className="text-sm font-medium">
                {new Date(mockCoach.subscription.nextBilling).toLocaleDateString('en-GB')}
              </span>
            </div>
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
              <span className="text-sm font-medium">{mockCoach.stats.activeClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-sm">Pending</span>
              </span>
              <span className="text-sm font-medium">{mockCoach.stats.pendingClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">Paused</span>
              </span>
              <span className="text-sm font-medium">{mockCoach.stats.pausedClients}</span>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Since</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Check-In</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockCoach.clients.map((client) => (
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
                    {new Date(client.since).toLocaleDateString('en-GB')}
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
        </motion.div>
      )}

      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="space-y-4">
            {mockCoach.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.client}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'revenue' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold mb-6">Revenue History</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockCoach.revenueHistory}>
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
        </motion.div>
      )}
    </div>
  )
}
