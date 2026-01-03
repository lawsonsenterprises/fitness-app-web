'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Trophy,
  Dumbbell,
  TrendingUp,
  Calendar,
  Flame,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PersonalRecord {
  id: string
  exercise: string
  weight: number
  unit: string
  reps: number
  date: Date
  previousBest?: number
  improvement?: number
  category?: string
}

interface PRSummaryProps {
  records: PersonalRecord[]
  onViewAll?: () => void
  onRecordClick?: (id: string) => void
  limit?: number
}

const categoryColors: Record<string, string> = {
  'Upper Body': 'bg-blue-500/10 text-blue-600',
  'Lower Body': 'bg-emerald-500/10 text-emerald-600',
  'Back': 'bg-violet-500/10 text-violet-600',
  'Chest': 'bg-rose-500/10 text-rose-600',
  'Shoulders': 'bg-amber-500/10 text-amber-600',
  'Arms': 'bg-cyan-500/10 text-cyan-600',
  'Legs': 'bg-emerald-500/10 text-emerald-600',
  'Core': 'bg-orange-500/10 text-orange-600',
}

function PRCard({
  record,
  index,
  onClick,
}: {
  record: PersonalRecord
  index: number
  onClick?: () => void
}) {
  const categoryColor = record.category
    ? categoryColors[record.category] || 'bg-muted text-muted-foreground'
    : 'bg-muted text-muted-foreground'

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
          <Trophy className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="font-semibold">{record.exercise}</p>
          <div className="flex items-center gap-2 mt-1">
            {record.category && (
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', categoryColor)}>
                {record.category}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(record.date, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xl font-bold">
            {record.weight.toFixed(1)}{record.unit} × {record.reps}
          </p>
          {record.improvement && (
            <p className="flex items-center justify-end gap-1 text-sm text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              +{record.improvement.toFixed(1)}{record.unit}
            </p>
          )}
        </div>
        {onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
      </div>
    </motion.button>
  )
}

export function PRSummary({
  records,
  onViewAll,
  onRecordClick,
  limit = 5,
}: PRSummaryProps) {
  // Sort by date (newest first) and limit
  const displayedRecords = records
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)

  // Calculate stats
  const totalPRs = records.length
  const recentPRs = records.filter(r => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return r.date >= thirtyDaysAgo
  }).length

  // Group by category
  const categoryCount = records.reduce((acc, r) => {
    const cat = r.category || 'Other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No PRs recorded yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Hit a new personal record during your training to see it here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-amber-500/10 p-3 text-center">
          <Trophy className="mx-auto h-5 w-5 text-amber-500" />
          <p className="mt-1 text-2xl font-bold">{totalPRs}</p>
          <p className="text-xs text-muted-foreground">Total PRs</p>
        </div>
        <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
          <Flame className="mx-auto h-5 w-5 text-emerald-500" />
          <p className="mt-1 text-2xl font-bold">{recentPRs}</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </div>
        <div className="rounded-xl bg-blue-500/10 p-3 text-center">
          <Dumbbell className="mx-auto h-5 w-5 text-blue-500" />
          <p className="mt-1 text-2xl font-bold">{Object.keys(categoryCount).length}</p>
          <p className="text-xs text-muted-foreground">Categories</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recent Personal Records</h3>
        {onViewAll && records.length > limit && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* PR list */}
      <div className="space-y-2">
        {displayedRecords.map((record, i) => (
          <PRCard
            key={record.id}
            record={record}
            index={i}
            onClick={onRecordClick ? () => onRecordClick(record.id) : undefined}
          />
        ))}
      </div>

      {/* Category breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-sm font-semibold mb-3">PRs by Category</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => (
              <span
                key={category}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  categoryColors[category] || 'bg-muted text-muted-foreground'
                )}
              >
                {category}: {count}
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}

export type { PersonalRecord }
