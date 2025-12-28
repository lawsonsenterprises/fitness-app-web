'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronLeft,
  Calendar,
  Scale,
  Footprints,
  Moon,
  Pill,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CoachFeedbackDisplay, type CoachFeedback } from './coach-feedback-display'

interface CheckInDetail {
  id: string
  date: Date
  weight: number
  weightUnit?: string
  weightChange?: number
  steps: number[]
  sleep: number[]
  supplements?: Array<{ name: string; taken: boolean }>
  notes?: string
  photos?: string[]
  coachFeedback?: CoachFeedback
}

interface CheckInDetailViewProps {
  checkIn: CheckInDetail
  backHref?: string
}

export function CheckInDetailView({
  checkIn,
  backHref = '/athlete/check-ins',
}: CheckInDetailViewProps) {
  const avgSteps = Math.round(
    checkIn.steps.reduce((a, b) => a + b, 0) / checkIn.steps.filter(s => s > 0).length || 0
  )
  const avgSleep = (
    checkIn.sleep.reduce((a, b) => a + b, 0) / checkIn.sleep.filter(s => s > 0).length || 0
  ).toFixed(1)
  const supplementCompliance = checkIn.supplements
    ? Math.round((checkIn.supplements.filter(s => s.taken).length / checkIn.supplements.length) * 100)
    : null

  const getTrendIcon = () => {
    if (!checkIn.weightChange) return null
    if (checkIn.weightChange > 0.2) return { Icon: TrendingUp, color: 'text-rose-500' }
    if (checkIn.weightChange < -0.2) return { Icon: TrendingDown, color: 'text-emerald-500' }
    return { Icon: Minus, color: 'text-muted-foreground' }
  }

  const weightTrend = getTrendIcon()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Check-ins
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
            <Calendar className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {checkIn.date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(checkIn.date, { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-5 w-5 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Weight</span>
          </div>
          <p className="text-2xl font-bold">
            {checkIn.weight} {checkIn.weightUnit || 'kg'}
          </p>
          {weightTrend && checkIn.weightChange && (
            <div className={cn('flex items-center gap-1 text-sm mt-1', weightTrend.color)}>
              <weightTrend.Icon className="h-4 w-4" />
              {checkIn.weightChange > 0 ? '+' : ''}{checkIn.weightChange.toFixed(1)}kg
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Footprints className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Avg Steps</span>
          </div>
          <p className="text-2xl font-bold">{avgSteps.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {checkIn.steps.filter(s => s > 0).length} days tracked
          </p>
        </div>

        {/* Sleep */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="h-5 w-5 text-violet-500" />
            <span className="text-sm text-muted-foreground">Avg Sleep</span>
          </div>
          <p className="text-2xl font-bold">{avgSleep} hrs</p>
          <p className="text-xs text-muted-foreground mt-1">
            {checkIn.sleep.filter(s => s > 0).length} nights tracked
          </p>
        </div>

        {/* Supplements */}
        {supplementCompliance !== null && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-5 w-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Supplements</span>
            </div>
            <p className="text-2xl font-bold">{supplementCompliance}%</p>
            <p className="text-xs text-muted-foreground mt-1">compliance</p>
          </div>
        )}
      </div>

      {/* Steps breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold mb-4">Daily Steps</h3>
        <div className="flex items-end gap-2 h-32">
          {checkIn.steps.map((steps, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 rounded-t transition-colors"
                style={{
                  height: `${Math.max(8, Math.min((steps / 15000) * 100, 100))}%`,
                }}
              />
              <p className="text-xs font-medium mt-2">{(steps / 1000).toFixed(0)}k</p>
              <p className="text-[10px] text-muted-foreground">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold mb-4">Sleep Hours</h3>
        <div className="flex items-end gap-2 h-32">
          {checkIn.sleep.map((hours, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-violet-500/20 hover:bg-violet-500/30 rounded-t transition-colors"
                style={{
                  height: `${Math.max(8, Math.min((hours / 10) * 100, 100))}%`,
                }}
              />
              <p className="text-xs font-medium mt-2">{hours}h</p>
              <p className="text-[10px] text-muted-foreground">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Supplements */}
      {checkIn.supplements && checkIn.supplements.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-4">Supplement Compliance</h3>
          <div className="grid grid-cols-2 gap-2">
            {checkIn.supplements.map((supplement) => (
              <div
                key={supplement.name}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2',
                  supplement.taken ? 'bg-emerald-500/10' : 'bg-muted/30'
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full',
                    supplement.taken ? 'bg-emerald-500' : 'bg-muted'
                  )}
                >
                  {supplement.taken && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={cn(
                  'text-sm',
                  supplement.taken ? 'text-emerald-600' : 'text-muted-foreground'
                )}>
                  {supplement.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {checkIn.notes && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-muted-foreground">{checkIn.notes}</p>
        </div>
      )}

      {/* Photos */}
      {checkIn.photos && checkIn.photos.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-4">Progress Photos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {checkIn.photos.map((photo, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted overflow-hidden"
              >
                <img
                  src={photo}
                  alt={`Progress photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach feedback */}
      {checkIn.coachFeedback && (
        <CoachFeedbackDisplay feedback={checkIn.coachFeedback} />
      )}
    </div>
  )
}

export type { CheckInDetail }
