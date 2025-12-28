'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CohortData {
  cohort: string // e.g., "Jan 2024"
  users: number
  retention: number[] // percentage retained in each subsequent period
}

interface RetentionCohortsProps {
  cohorts: CohortData[]
  periodLabel?: string // e.g., "Week" or "Month"
}

function getRetentionColor(retention: number): string {
  if (retention >= 80) return 'bg-emerald-500'
  if (retention >= 60) return 'bg-emerald-400'
  if (retention >= 40) return 'bg-amber-400'
  if (retention >= 20) return 'bg-amber-500'
  return 'bg-rose-500'
}

function getRetentionTextColor(retention: number): string {
  if (retention >= 80) return 'text-emerald-900'
  if (retention >= 60) return 'text-emerald-900'
  if (retention >= 40) return 'text-amber-900'
  return 'text-white'
}

export function RetentionCohorts({
  cohorts,
  periodLabel = 'Week',
}: RetentionCohortsProps) {
  // Calculate average retention per period
  const averageRetention = useMemo(() => {
    if (cohorts.length === 0) return []

    const maxPeriods = Math.max(...cohorts.map((c) => c.retention.length))
    const averages: number[] = []

    for (let i = 0; i < maxPeriods; i++) {
      const values = cohorts
        .filter((c) => c.retention[i] !== undefined)
        .map((c) => c.retention[i])
      if (values.length > 0) {
        averages.push(values.reduce((a, b) => a + b, 0) / values.length)
      }
    }

    return averages
  }, [cohorts])

  // Find best and worst cohorts
  const cohortStats = useMemo(() => {
    if (cohorts.length === 0) return null

    // Calculate week 4 retention (or last available)
    const withRetention = cohorts.map((c) => ({
      ...c,
      retentionAt4: c.retention[3] ?? c.retention[c.retention.length - 1] ?? 0,
    }))

    const sorted = [...withRetention].sort((a, b) => b.retentionAt4 - a.retentionAt4)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]

    // Latest cohort
    const latest = cohorts[cohorts.length - 1]

    return { best, worst, latest }
  }, [cohorts])

  if (cohorts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No cohort data available</p>
      </div>
    )
  }

  const maxPeriods = Math.max(...cohorts.map((c) => c.retention.length))

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="font-semibold">Retention Cohorts</h3>
        <p className="text-sm text-muted-foreground mt-1">
          User retention by signup cohort
        </p>
      </div>

      {/* Summary stats */}
      {cohortStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Best Cohort</span>
            </div>
            <p className="font-semibold">{cohortStats.best.cohort}</p>
            <p className="text-xs text-muted-foreground">
              {cohortStats.best.retentionAt4.toFixed(1)}% at {periodLabel} 4
            </p>
          </div>

          <div className="rounded-lg bg-blue-500/10 p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Latest Cohort</span>
            </div>
            <p className="font-semibold">{cohortStats.latest.cohort}</p>
            <p className="text-xs text-muted-foreground">
              {cohortStats.latest.users} users
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Avg {periodLabel} 4 Retention</span>
            </div>
            <p className="font-semibold">{(averageRetention[3] ?? 0).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Cohort table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2 text-xs font-medium text-muted-foreground">
                Cohort
              </th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground">
                Users
              </th>
              {Array.from({ length: maxPeriods }, (_, i) => (
                <th
                  key={i}
                  className="text-center p-2 text-xs font-medium text-muted-foreground"
                >
                  {periodLabel} {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort, cohortIndex) => (
              <motion.tr
                key={cohort.cohort}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: cohortIndex * 0.03 }}
              >
                <td className="p-2 text-sm font-medium">{cohort.cohort}</td>
                <td className="p-2 text-center text-sm text-muted-foreground">
                  {cohort.users.toLocaleString()}
                </td>
                {Array.from({ length: maxPeriods }, (_, i) => {
                  const retention = cohort.retention[i]
                  const hasData = retention !== undefined

                  return (
                    <td key={i} className="p-1">
                      {hasData ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: (cohortIndex * maxPeriods + i) * 0.01 }}
                          className={cn(
                            'rounded px-2 py-1 text-center text-xs font-medium',
                            getRetentionColor(retention),
                            getRetentionTextColor(retention)
                          )}
                          style={{ opacity: 0.3 + (retention / 100) * 0.7 }}
                        >
                          {retention.toFixed(0)}%
                        </motion.div>
                      ) : (
                        <div className="px-2 py-1 text-center text-xs text-muted-foreground">
                          -
                        </div>
                      )}
                    </td>
                  )
                })}
              </motion.tr>
            ))}

            {/* Average row */}
            <tr className="border-t border-border bg-muted/30">
              <td className="p-2 text-sm font-semibold">Average</td>
              <td className="p-2"></td>
              {averageRetention.map((avg, i) => (
                <td key={i} className="p-1">
                  <div
                    className={cn(
                      'rounded px-2 py-1 text-center text-xs font-semibold',
                      getRetentionColor(avg),
                      getRetentionTextColor(avg)
                    )}
                  >
                    {avg.toFixed(0)}%
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Color legend */}
      <div className="flex justify-center gap-4 mt-6 text-xs">
        {[
          { label: '80%+', color: 'bg-emerald-500' },
          { label: '60-79%', color: 'bg-emerald-400' },
          { label: '40-59%', color: 'bg-amber-400' },
          { label: '20-39%', color: 'bg-amber-500' },
          { label: '<20%', color: 'bg-rose-500' },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className={cn('h-3 w-3 rounded', item.color)} />
            <span className="text-muted-foreground">{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export type { CohortData, RetentionCohortsProps }
