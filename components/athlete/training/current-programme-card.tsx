'use client'

import { motion } from 'framer-motion'
import { Dumbbell, Calendar, User, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Programme {
  id: string
  name: string
  description?: string
  coachName: string
  startDate: Date
  endDate: Date
  currentWeek: number
  totalWeeks: number
  type?: string
}

interface CurrentProgrammeCardProps {
  programme?: Programme | null
  isLoading?: boolean
}

export function CurrentProgrammeCard({
  programme,
  isLoading = false,
}: CurrentProgrammeCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-muted" />
          </div>
          <div className="h-3 w-full rounded-full bg-muted" />
          <div className="flex gap-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!programme) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border bg-card p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No Active Programme</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your coach hasn&apos;t assigned a programme yet
        </p>
      </motion.div>
    )
  }

  const progressPercent = (programme.currentWeek / programme.totalWeeks) * 100
  const daysRemaining = Math.ceil(
    (programme.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{programme.name}</h3>
              {programme.type && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                  {programme.type}
                </span>
              )}
            </div>
            {programme.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {programme.description}
              </p>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500"
          >
            <Dumbbell className="h-6 w-6 text-white" />
          </motion.div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              Week {programme.currentWeek} of {programme.totalWeeks}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500"
            />
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {programme.coachName}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Started {programme.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Completed'}
          </span>
        </div>

        {/* View button */}
        <Link
          href={`/athlete/training/programmes/${programme.id}`}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl',
            'bg-foreground px-4 py-3 font-medium text-background',
            'transition-all hover:bg-foreground/90',
            'group-hover:shadow-lg group-hover:shadow-amber-500/10'
          )}
        >
          View Full Programme
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  )
}
