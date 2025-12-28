'use client'

import { motion } from 'framer-motion'
import {
  Pill,
  Check,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Supplement {
  name: string
  taken: boolean
}

interface SupplementComplianceFormProps {
  supplements: Supplement[]
  onChange: (supplements: Supplement[]) => void
}

export function SupplementComplianceForm({
  supplements,
  onChange,
}: SupplementComplianceFormProps) {
  const toggleSupplement = (index: number) => {
    const newSupplements = [...supplements]
    newSupplements[index] = {
      ...newSupplements[index],
      taken: !newSupplements[index].taken,
    }
    onChange(newSupplements)
  }

  const toggleAll = (taken: boolean) => {
    onChange(supplements.map(s => ({ ...s, taken })))
  }

  const takenCount = supplements.filter(s => s.taken).length
  const compliancePercent = supplements.length > 0
    ? Math.round((takenCount / supplements.length) * 100)
    : 0

  if (supplements.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20">
              <Pill className="h-7 w-7 text-amber-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Supplement Tracking</h2>
          <p className="text-sm text-muted-foreground mt-1">
            No supplements assigned by your coach
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
          <p className="text-muted-foreground">
            Your coach hasn't assigned any supplements yet
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20">
            <Pill className="h-7 w-7 text-amber-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Supplement Compliance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Which supplements did you take consistently this week?
        </p>
      </div>

      {/* Compliance meter */}
      <div className="rounded-xl bg-amber-500/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Weekly Compliance</span>
          <span className="text-lg font-bold text-amber-600">{compliancePercent}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${compliancePercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-amber-500"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {takenCount} of {supplements.length} supplements taken consistently
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => toggleAll(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors"
        >
          <Check className="h-4 w-4" />
          All taken
        </button>
        <button
          onClick={() => toggleAll(false)}
          className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-500/20 transition-colors"
        >
          <X className="h-4 w-4" />
          None taken
        </button>
      </div>

      {/* Supplement list */}
      <div className="space-y-2">
        {supplements.map((supplement, i) => (
          <motion.button
            key={supplement.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggleSupplement(i)}
            className={cn(
              'w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all',
              supplement.taken
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-border bg-card hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                  supplement.taken
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-muted-foreground'
                )}
              >
                {supplement.taken && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className={cn(
                'font-medium',
                supplement.taken && 'text-emerald-600'
              )}>
                {supplement.name}
              </span>
            </div>

            <span className={cn(
              'text-sm',
              supplement.taken ? 'text-emerald-600' : 'text-muted-foreground'
            )}>
              {supplement.taken ? 'Taken' : 'Not taken'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export type { Supplement }
