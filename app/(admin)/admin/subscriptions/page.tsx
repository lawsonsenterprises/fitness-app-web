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

// Mock data
const mockSubscriptions = [
  {
    id: '1',
    coach: 'Sarah Johnson',
    plan: 'Pro Annual',
    status: 'active',
    amount: 450,
    nextBilling: '2025-03-15',
    startedAt: '2024-03-15',
  },
  {
    id: '2',
    coach: 'Mike Thompson',
    plan: 'Pro Monthly',
    status: 'active',
    amount: 49,
    nextBilling: '2025-01-22',
    startedAt: '2024-06-22',
  },
  {
    id: '3',
    coach: 'Emma Williams',
    plan: 'Trial',
    status: 'trial',
    amount: 0,
    nextBilling: '2025-01-10',
    startedAt: '2024-12-10',
  },
  {
    id: '4',
    coach: 'James Wilson',
    plan: 'Pro Monthly',
    status: 'cancelled',
    amount: 49,
    nextBilling: null,
    startedAt: '2024-01-08',
  },
  {
    id: '5',
    coach: 'Lisa Brown',
    plan: 'Enterprise',
    status: 'active',
    amount: 199,
    nextBilling: '2025-01-12',
    startedAt: '2023-09-12',
  },
]

const mockRevenueByPlan = [
  { plan: 'Pro Monthly', revenue: 8820, count: 45 },
  { plan: 'Pro Annual', revenue: 14400, count: 32 },
  { plan: 'Enterprise', revenue: 2985, count: 15 },
]

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'cancelled'>('all')

  const filteredSubscriptions = mockSubscriptions.filter((sub) => {
    const matchesSearch = sub.coach.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalMRR = mockSubscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + (s.plan.includes('Annual') ? s.amount / 12 : s.amount), 0)

  return (
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
          <p className="text-2xl font-bold">£{totalMRR.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {mockSubscriptions.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Trials</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">
            {mockSubscriptions.filter(s => s.status === 'trial').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Cancelled</span>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {mockSubscriptions.filter(s => s.status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Revenue by Plan Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Revenue by Plan</h2>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockRevenueByPlan} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="plan"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `£${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`£${Number(value).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by coach name..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'trial', 'cancelled'] as const).map((status) => (
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

      {/* Table */}
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
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Next Billing</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{sub.coach}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium">
                      <CreditCard className="h-3 w-3" />
                      {sub.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                      sub.status === 'active' && 'bg-green-500/10 text-green-600',
                      sub.status === 'trial' && 'bg-amber-500/10 text-amber-600',
                      sub.status === 'cancelled' && 'bg-red-500/10 text-red-600'
                    )}>
                      {sub.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
                      {sub.status === 'trial' && <Clock className="h-3 w-3" />}
                      {sub.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium">
                    {sub.amount > 0 ? `£${sub.amount}` : 'Free'}
                    {sub.plan.includes('Annual') && <span className="text-xs text-muted-foreground">/yr</span>}
                    {sub.plan === 'Pro Monthly' && <span className="text-xs text-muted-foreground">/mo</span>}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {sub.nextBilling ? new Date(sub.nextBilling).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }) : '-'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(sub.startedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
