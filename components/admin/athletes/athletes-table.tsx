'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Users,
  MoreHorizontal,
  UserCog,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Athlete {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'active' | 'inactive' | 'pending'
  coachName?: string
  coachId?: string
  joinedAt: Date
  lastActiveAt?: Date
  checkInStreak?: number
}

interface AthletesTableProps {
  athletes: Athlete[]
  onViewAthlete: (id: string) => void
  onViewCoach?: (id: string) => void
  onImpersonate: (id: string) => void
  onEmailAthlete: (id: string) => void
}

type SortField = 'name' | 'coachName' | 'joinedAt' | 'lastActiveAt'
type SortDirection = 'asc' | 'desc'

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-600' },
  inactive: { label: 'Inactive', color: 'bg-slate-500/10 text-slate-600' },
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600' },
}

export function AthletesTable({
  athletes,
  onViewAthlete,
  onViewCoach,
  onImpersonate,
  onEmailAthlete,
}: AthletesTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Athlete['status'] | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Filter and sort
  const filteredAthletes = useMemo(() => {
    let result = [...athletes]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.email.toLowerCase().includes(searchLower) ||
          a.coachName?.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'coachName':
          comparison = (a.coachName || '').localeCompare(b.coachName || '')
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
  }, [athletes, search, statusFilter, sortField, sortDirection])

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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athletes or coaches..."
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'inactive', 'pending'] as const).map((status) => (
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

        <div className="mt-3 text-sm text-muted-foreground">
          Showing {filteredAthletes.length} of {athletes.length} athletes
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
                  Athlete
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">
                <button
                  onClick={() => handleSort('coachName')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Coach
                  <SortIcon field="coachName" />
                </button>
              </th>
              <th className="text-left p-4 font-medium">Streak</th>
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
            {filteredAthletes.map((athlete, index) => (
              <motion.tr
                key={athlete.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {athlete.avatar ? (
                      <Image
                        src={athlete.avatar}
                        alt={athlete.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {athlete.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{athlete.name}</p>
                      <p className="text-sm text-muted-foreground">{athlete.email}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span className={cn(
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                    statusConfig[athlete.status].color
                  )}>
                    {statusConfig[athlete.status].label}
                  </span>
                </td>

                <td className="p-4">
                  {athlete.coachName ? (
                    <button
                      onClick={() => athlete.coachId && onViewCoach?.(athlete.coachId)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {athlete.coachName}
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">No coach</span>
                  )}
                </td>

                <td className="p-4">
                  {athlete.checkInStreak !== undefined ? (
                    <span className={cn(
                      'text-sm font-medium',
                      athlete.checkInStreak >= 7 ? 'text-emerald-600' :
                      athlete.checkInStreak >= 3 ? 'text-blue-600' :
                      'text-muted-foreground'
                    )}>
                      {athlete.checkInStreak} weeks
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>

                <td className="p-4">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(athlete.joinedAt, { addSuffix: true })}
                  </span>
                </td>

                <td className="p-4">
                  <span className="text-sm text-muted-foreground">
                    {athlete.lastActiveAt
                      ? formatDistanceToNow(athlete.lastActiveAt, { addSuffix: true })
                      : 'Never'
                    }
                  </span>
                </td>

                <td className="p-4 text-right">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === athlete.id ? null : athlete.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {openMenuId === athlete.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl border border-border bg-card shadow-lg py-1"
                      >
                        <button
                          onClick={() => {
                            onViewAthlete(athlete.id)
                            setOpenMenuId(null)
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            onImpersonate(athlete.id)
                            setOpenMenuId(null)
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-left text-violet-600"
                        >
                          <UserCog className="h-4 w-4" />
                          Impersonate
                        </button>
                        <button
                          onClick={() => {
                            onEmailAthlete(athlete.id)
                            setOpenMenuId(null)
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-left text-blue-600"
                        >
                          <Mail className="h-4 w-4" />
                          Send Email
                        </button>
                      </motion.div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredAthletes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No athletes found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export type { Athlete, AthletesTableProps }
