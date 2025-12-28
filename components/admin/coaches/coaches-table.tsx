'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
  MoreHorizontal,
  Eye,
  UserCog,
  Shield,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { CoachRowActions } from './coach-row-actions'

interface Coach {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'active' | 'suspended' | 'pending'
  clientCount: number
  subscriptionTier?: string
  joinedAt: Date
  lastActiveAt?: Date
}

interface CoachesTableProps {
  coaches: Coach[]
  onViewCoach: (id: string) => void
  onSuspendCoach: (id: string) => void
  onActivateCoach: (id: string) => void
  onImpersonate: (id: string) => void
  onEmailCoach: (id: string) => void
}

type SortField = 'name' | 'clientCount' | 'joinedAt' | 'lastActiveAt'
type SortDirection = 'asc' | 'desc'

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-600' },
  suspended: { label: 'Suspended', color: 'bg-rose-500/10 text-rose-600' },
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600' },
}

export function CoachesTable({
  coaches,
  onViewCoach,
  onSuspendCoach,
  onActivateCoach,
  onImpersonate,
  onEmailCoach,
}: CoachesTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Coach['status'] | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter and sort coaches
  const filteredCoaches = useMemo(() => {
    let result = [...coaches]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'clientCount':
          comparison = a.clientCount - b.clientCount
          break
        case 'joinedAt':
          comparison = a.joinedAt.getTime() - b.joinedAt.getTime()
          break
        case 'lastActiveAt':
          comparison = (a.lastActiveAt?.getTime() || 0) - (b.lastActiveAt?.getTime() || 0)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [coaches, search, statusFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
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
    <div className="rounded-xl border border-border bg-card">
      {/* Toolbar */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coaches..."
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'suspended', 'pending'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                  statusFilter === status
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-muted-foreground">
          Showing {filteredCoaches.length} of {coaches.length} coaches
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Coach
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">
                <button
                  onClick={() => handleSort('clientCount')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Clients
                  <SortIcon field="clientCount" />
                </button>
              </th>
              <th className="text-left p-4 font-medium">Subscription</th>
              <th className="text-left p-4 font-medium">
                <button
                  onClick={() => handleSort('joinedAt')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Joined
                  <SortIcon field="joinedAt" />
                </button>
              </th>
              <th className="text-left p-4 font-medium">
                <button
                  onClick={() => handleSort('lastActiveAt')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Last Active
                  <SortIcon field="lastActiveAt" />
                </button>
              </th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoaches.map((coach, index) => (
              <motion.tr
                key={coach.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                {/* Coach info */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {coach.avatar ? (
                      <img
                        src={coach.avatar}
                        alt={coach.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {coach.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{coach.name}</p>
                      <p className="text-sm text-muted-foreground">{coach.email}</p>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="p-4">
                  <span className={cn(
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                    statusConfig[coach.status].color
                  )}>
                    {statusConfig[coach.status].label}
                  </span>
                </td>

                {/* Client count */}
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{coach.clientCount}</span>
                  </div>
                </td>

                {/* Subscription */}
                <td className="p-4">
                  <span className="text-sm">
                    {coach.subscriptionTier || '-'}
                  </span>
                </td>

                {/* Joined */}
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(coach.joinedAt, { addSuffix: true })}
                  </span>
                </td>

                {/* Last active */}
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">
                    {coach.lastActiveAt
                      ? formatDistanceToNow(coach.lastActiveAt, { addSuffix: true })
                      : 'Never'
                    }
                  </span>
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <CoachRowActions
                    coach={coach}
                    onView={() => onViewCoach(coach.id)}
                    onSuspend={() => onSuspendCoach(coach.id)}
                    onActivate={() => onActivateCoach(coach.id)}
                    onImpersonate={() => onImpersonate(coach.id)}
                    onEmail={() => onEmailCoach(coach.id)}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredCoaches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No coaches found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export type { Coach, CoachesTableProps }
