'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Users,
  Calendar,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Client {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'active' | 'inactive' | 'paused'
  startDate: Date
  lastCheckIn?: Date
  programmeProgress?: number
}

interface CoachClientsTableProps {
  clients: Client[]
  onViewClient: (id: string) => void
}

type SortField = 'name' | 'startDate' | 'lastCheckIn'
type SortDirection = 'asc' | 'desc'

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-600' },
  inactive: { label: 'Inactive', color: 'bg-slate-500/10 text-slate-600' },
  paused: { label: 'Paused', color: 'bg-amber-500/10 text-amber-600' },
}

export function CoachClientsTable({
  clients,
  onViewClient,
}: CoachClientsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Client['status'] | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter and sort
  const filteredClients = useMemo(() => {
    let result = [...clients]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'startDate':
          comparison = a.startDate.getTime() - b.startDate.getTime()
          break
        case 'lastCheckIn':
          comparison = (a.lastCheckIn?.getTime() || 0) - (b.lastCheckIn?.getTime() || 0)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [clients, search, statusFilter, sortField, sortDirection])

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

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No clients yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold mb-3">Clients ({clients.length})</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {(['all', 'active', 'inactive', 'paused'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-2 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-sm">
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Client
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('startDate')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Started
                  <SortIcon field="startDate" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('lastCheckIn')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Last Check-in
                  <SortIcon field="lastCheckIn" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">Progress</th>
              <th className="text-right p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, index) => (
              <motion.tr
                key={client.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {client.avatar ? (
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                </td>

                <td className="p-3">
                  <span className={cn(
                    'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                    statusConfig[client.status].color
                  )}>
                    {statusConfig[client.status].label}
                  </span>
                </td>

                <td className="p-3">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(client.startDate, { addSuffix: true })}
                  </span>
                </td>

                <td className="p-3">
                  <span className="text-sm text-muted-foreground">
                    {client.lastCheckIn
                      ? formatDistanceToNow(client.lastCheckIn, { addSuffix: true })
                      : 'Never'
                    }
                  </span>
                </td>

                <td className="p-3">
                  {client.programmeProgress !== undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${client.programmeProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {client.programmeProgress}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>

                <td className="p-3 text-right">
                  <motion.button
                    onClick={() => onViewClient(client.id)}
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

        {filteredClients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No clients match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}

export type { Client, CoachClientsTableProps }
