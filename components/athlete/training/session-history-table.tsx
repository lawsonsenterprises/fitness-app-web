'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionHistoryItem {
  id: string
  date: Date
  type: string
  duration: number
  exerciseCount: number
  totalVolume: number
  notes?: string
}

interface SessionHistoryTableProps {
  sessions: SessionHistoryItem[]
  onViewSession?: (sessionId: string) => void
  isLoading?: boolean
}

type SortKey = 'date' | 'duration' | 'volume'
type SortDir = 'asc' | 'desc'

export function SessionHistoryTable({
  sessions,
  onViewSession,
  isLoading = false,
}: SessionHistoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    let comparison = 0
    switch (sortKey) {
      case 'date':
        comparison = a.date.getTime() - b.date.getTime()
        break
      case 'duration':
        comparison = a.duration - b.duration
        break
      case 'volume':
        comparison = a.totalVolume - b.totalVolume
        break
    }
    return sortDir === 'asc' ? comparison : -comparison
  })

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null
    return sortDir === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="animate-pulse">
          <div className="border-b border-border bg-muted/30 p-4">
            <div className="h-5 w-40 rounded bg-muted" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border p-4">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-48 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-border bg-muted/30 p-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Session History
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Date
                  <SortIcon column="date" />
                </button>
              </th>
              <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('duration')}
                  className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Duration
                  <SortIcon column="duration" />
                </button>
              </th>
              <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5" />
                  Exercises
                </span>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('volume')}
                  className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Volume
                  <SortIcon column="volume" />
                </button>
              </th>
              <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notes
              </th>
              <th className="w-16 p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedSessions.map((session, index) => (
              <motion.tr
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="group transition-colors hover:bg-muted/30"
              >
                <td className="p-4">
                  <span className="font-medium">
                    {session.date.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {session.date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                    {session.type}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{session.duration} min</td>
                <td className="p-4 text-muted-foreground">{session.exerciseCount}</td>
                <td className="p-4">
                  <span className="font-medium">{session.totalVolume.toLocaleString()}</span>
                  <span className="ml-1 text-sm text-muted-foreground">kg</span>
                </td>
                <td className="p-4 max-w-[200px]">
                  <span className="text-sm text-muted-foreground line-clamp-1">
                    {session.notes || '—'}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onViewSession?.(session.id)}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
                      'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.length === 0 && (
        <div className="p-8 text-center">
          <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No sessions recorded yet</p>
        </div>
      )}
    </motion.div>
  )
}

export type { SessionHistoryItem }
