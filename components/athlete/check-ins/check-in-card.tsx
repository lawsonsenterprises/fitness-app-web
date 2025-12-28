'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Calendar,
  Scale,
  Footprints,
  Moon,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Pill,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckInData {
  id: string
  date: Date
  weight: number
  weightUnit?: string
  weightChange?: number
  steps: number[]
  sleep: number[]
  supplementCompliance?: number
  notes?: string
  hasCoachFeedback: boolean
  coachFeedbackPreview?: string
}

interface CheckInCardProps {
  checkIn: CheckInData
  onClick?: () => void
  expanded?: boolean
}

export function CheckInCard({
  checkIn,
  onClick,
  expanded = false,
}: CheckInCardProps) {
  const avgSteps = Math.round(checkIn.steps.reduce((a, b) => a + b, 0) / checkIn.steps.length)
  const avgSleep = (checkIn.sleep.reduce((a, b) => a + b, 0) / checkIn.sleep.length).toFixed(1)

  const getTrendIcon = () => {
    if (!checkIn.weightChange) return null
    if (checkIn.weightChange > 0.2) return { Icon: TrendingUp, color: 'text-rose-500', label: '+' }
    if (checkIn.weightChange < -0.2) return { Icon: TrendingDown, color: 'text-emerald-500', label: '' }
    return { Icon: Minus, color: 'text-muted-foreground', label: '' }
  }

  const weightTrend = getTrendIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:border-muted-foreground/30 hover:shadow-sm'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="font-semibold">
              {checkIn.date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(checkIn.date, { addSuffix: true })}
            </p>
          </div>
        </div>
        {onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
        {/* Weight */}
        <div className="rounded-lg bg-emerald-500/10 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Scale className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Weight</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold">{checkIn.weight}</span>
            <span className="text-sm text-muted-foreground">{checkIn.weightUnit || 'kg'}</span>
          </div>
          {weightTrend && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs', weightTrend.color)}>
              <weightTrend.Icon className="h-3 w-3" />
              {weightTrend.label}{Math.abs(checkIn.weightChange!).toFixed(1)}kg
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="rounded-lg bg-blue-500/10 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Footprints className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Avg Steps</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold">{avgSteps.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {checkIn.steps.length} days tracked
          </div>
        </div>

        {/* Sleep */}
        <div className="rounded-lg bg-violet-500/10 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Moon className="h-4 w-4 text-violet-500" />
            <span className="text-xs text-muted-foreground">Avg Sleep</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold">{avgSleep}</span>
            <span className="text-sm text-muted-foreground">hrs</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {checkIn.sleep.length} nights tracked
          </div>
        </div>

        {/* Supplements */}
        {checkIn.supplementCompliance !== undefined && (
          <div className="rounded-lg bg-amber-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Pill className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Supplements</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{checkIn.supplementCompliance}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              compliance
            </div>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <>
          {/* Steps breakdown */}
          <div className="border-t border-border p-4">
            <p className="text-sm font-medium mb-2">Daily Steps</p>
            <div className="flex items-end gap-1 h-16">
              {checkIn.steps.map((steps, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500/20 rounded-t hover:bg-blue-500/30 transition-colors"
                  style={{
                    height: `${Math.min((steps / 15000) * 100, 100)}%`,
                  }}
                  title={`Day ${i + 1}: ${steps.toLocaleString()} steps`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Day 1</span>
              <span>Day {checkIn.steps.length}</span>
            </div>
          </div>

          {/* Sleep breakdown */}
          <div className="border-t border-border p-4">
            <p className="text-sm font-medium mb-2">Sleep Hours</p>
            <div className="flex items-end gap-1 h-16">
              {checkIn.sleep.map((hours, i) => (
                <div
                  key={i}
                  className="flex-1 bg-violet-500/20 rounded-t hover:bg-violet-500/30 transition-colors"
                  style={{
                    height: `${Math.min((hours / 10) * 100, 100)}%`,
                  }}
                  title={`Night ${i + 1}: ${hours} hours`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Night 1</span>
              <span>Night {checkIn.sleep.length}</span>
            </div>
          </div>
        </>
      )}

      {/* Notes preview */}
      {checkIn.notes && !expanded && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{checkIn.notes}</p>
        </div>
      )}

      {/* Coach feedback indicator */}
      {checkIn.hasCoachFeedback && (
        <div className={cn(
          'flex items-center gap-2 px-4 py-3 bg-blue-500/10',
          !checkIn.notes && !expanded && 'border-t border-border'
        )}>
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-600">Coach feedback available</span>
          {checkIn.coachFeedbackPreview && (
            <span className="text-sm text-muted-foreground truncate">
              — {checkIn.coachFeedbackPreview}
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}

export type { CheckInData }
