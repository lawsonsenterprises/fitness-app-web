'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  CreditCard,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

interface Subscription {
  id: string
  coachId: string
  coachName: string
  coachEmail: string
  tier: string
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  amount: number
  currency: string
  interval: 'month' | 'year'
  currentPeriodEnd: Date
  cancelAtPeriodEnd?: boolean
  clientCount?: number
}

interface SubscriptionsTableProps {
  subscriptions: Subscription[]
  onViewSubscription: (id: string) => void
  onViewCoach: (id: string) => void
}

type SortField = 'coachName' | 'tier' | 'amount' | 'currentPeriodEnd'
type SortDirection = 'asc' | 'desc'

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-600' },
  past_due: { label: 'Past Due', color: 'bg-rose-500/10 text-rose-600' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-500/10 text-slate-600' },
  trialing: { label: 'Trial', color: 'bg-blue-500/10 text-blue-600' },
}

export function SubscriptionsTable({
  subscriptions,
  onViewSubscription,
  onViewCoach,
}: SubscriptionsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Subscription['status'] | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('coachName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Calculate totals
  const totals = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active' || s.status === 'trialing')
    const mrr = active.reduce((sum, s) => {
      if (s.interval === 'year') {
        return sum + (s.amount / 12)
      }
      return sum + s.amount
    }, 0)
    const pastDue = subscriptions.filter(s => s.status === 'past_due').length

    return { mrr, activeCount: active.length, pastDue }
  }, [subscriptions])

  // Filter and sort
  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.coachName.toLowerCase().includes(searchLower) ||
          s.coachEmail.toLowerCase().includes(searchLower) ||
          s.tier.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter)
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'coachName':
          comparison = a.coachName.localeCompare(b.coachName)
          break
        case 'tier':
          comparison = a.tier.localeCompare(b.tier)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'currentPeriodEnd':
          comparison = a.currentPeriodEnd.getTime() - b.currentPeriodEnd.getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [subscriptions, search, statusFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(totals.mrr, 'GBP')}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          <p className="text-2xl font-bold mt-1">{totals.activeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            {totals.pastDue > 0 && <AlertTriangle className="h-4 w-4 text-rose-500" />}
            <p className="text-sm text-muted-foreground">Past Due</p>
          </div>
          <p className={cn(
            'text-2xl font-bold mt-1',
            totals.pastDue > 0 && 'text-rose-600'
          )}>
            {totals.pastDue}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        {/* Toolbar */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscriptions..."
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'active', 'trialing', 'past_due', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                    statusFilter === status
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {status === 'all' ? 'All' : statusConfig[status].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">
                  <button
                    onClick={() => handleSort('coachName')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Coach
                    <SortIcon field="coachName" />
                  </button>
                </th>
                <th className="text-left p-4 font-medium">
                  <button
                    onClick={() => handleSort('tier')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Plan
                    <SortIcon field="tier" />
                  </button>
                </th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Amount
                    <SortIcon field="amount" />
                  </button>
                </th>
                <th className="text-left p-4 font-medium">
                  <button
                    onClick={() => handleSort('currentPeriodEnd')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Renews
                    <SortIcon field="currentPeriodEnd" />
                  </button>
                </th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub, index) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <button
                        onClick={() => onViewCoach(sub.coachId)}
                        className="font-medium hover:text-blue-600 transition-colors"
                      >
                        {sub.coachName}
                      </button>
                      <p className="text-sm text-muted-foreground">{sub.coachEmail}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>{sub.tier}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                        statusConfig[sub.status].color
                      )}>
                        {statusConfig[sub.status].label}
                      </span>
                      {sub.cancelAtPeriodEnd && (
                        <span className="text-xs text-amber-600">Cancelling</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <div>
                      <p className="font-medium">{formatCurrency(sub.amount, sub.currency)}</p>
                      <p className="text-xs text-muted-foreground">/{sub.interval}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(sub.currentPeriodEnd, 'd MMM yyyy')}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <motion.button
                      onClick={() => onViewSubscription(sub.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredSubscriptions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No subscriptions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export type { Subscription, SubscriptionsTableProps }
