'use client'

import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Calendar, Flame } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PersonalRecord {
  id: string
  exerciseName: string
  newRecord: {
    weight: number
    reps: number
    rpe?: number
  }
  previousRecord?: {
    weight: number
    reps: number
  }
  improvement?: number
  achievedAt: Date
}

interface PRTimelineProps {
  records: PersonalRecord[]
  isLoading?: boolean
  maxItems?: number
}

function PRCard({ record, index }: { record: PersonalRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="group relative"
    >
      {/* Timeline connector */}
      {index > 0 && (
        <div className="absolute -top-4 left-5 h-4 w-px bg-gradient-to-b from-yellow-500/50 to-yellow-500/20" />
      )}

      <div className="relative flex items-start gap-4">
        {/* Trophy icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/25"
        >
          <Trophy className="h-5 w-5 text-white" />
          {/* Sparkle effect */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-yellow-300 blur-sm"
          />
        </motion.div>

        {/* Content */}
        <div className="flex-1 rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold">{record.exerciseName}</h4>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <span className="font-medium text-amber-600">
                  {record.newRecord.weight}kg × {record.newRecord.reps}
                </span>
                {record.newRecord.rpe && (
                  <span className="text-muted-foreground">@ RPE {record.newRecord.rpe}</span>
                )}
              </div>
            </div>

            {record.improvement && record.improvement > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05, type: 'spring' }}
                className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
              >
                <TrendingUp className="h-3 w-3" />
                +{record.improvement}%
              </motion.div>
            )}
          </div>

          {/* Previous record */}
          {record.previousRecord && (
            <p className="mt-2 text-xs text-muted-foreground">
              Previous: {record.previousRecord.weight}kg × {record.previousRecord.reps}
            </p>
          )}

          {/* Date */}
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(record.achievedAt, { addSuffix: true })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PRSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2 rounded-xl border border-border p-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function PRTimeline({
  records,
  isLoading = false,
  maxItems = 10,
}: PRTimelineProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <PRSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    )
  }

  const displayedRecords = records.slice(0, maxItems)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
            <Flame className="h-4 w-4 text-yellow-500" />
          </div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Personal Records
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">{records.length} total</span>
      </div>

      {/* Timeline */}
      {displayedRecords.length > 0 ? (
        <div className="space-y-6">
          {displayedRecords.map((record, index) => (
            <PRCard key={record.id} record={record} index={index} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Trophy className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No personal records yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Keep training and your PRs will appear here
          </p>
        </div>
      )}
    </motion.div>
  )
}

export type { PersonalRecord }
