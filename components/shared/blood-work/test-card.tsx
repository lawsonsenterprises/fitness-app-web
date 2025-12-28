'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface BloodTest {
  id: string
  testDate: Date
  labProvider: 'atlas_labs' | 'randox_health' | 'manual' | string
  markerCount: number
  outOfRangeCount: number
  tags?: string[]
  notes?: string
}

interface TestCardProps {
  test: BloodTest
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onExport?: () => void
  showActions?: boolean
  variant?: 'default' | 'compact'
  className?: string
}

const labProviderLabels: Record<string, string> = {
  atlas_labs: 'Atlas Labs',
  randox_health: 'Randox Health',
  manual: 'Manual Entry',
}

export function TestCard({
  test,
  onClick,
  onEdit,
  onDelete,
  onExport,
  showActions = true,
  variant = 'default',
  className,
}: TestCardProps) {
  const hasIssues = test.outOfRangeCount > 0

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-blue-500/50 transition-colors',
          className
        )}
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            hasIssues ? 'bg-amber-500/10' : 'bg-emerald-500/10'
          )}
        >
          {hasIssues ? (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium">
            {format(test.testDate, 'd MMM yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            {labProviderLabels[test.labProvider] || test.labProvider} • {test.markerCount} markers
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-xl border bg-card overflow-hidden',
        hasIssues ? 'border-amber-500/30' : 'border-border',
        className
      )}
    >
      {/* Header */}
      <div
        onClick={onClick}
        className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                hasIssues ? 'bg-amber-500/10' : 'bg-emerald-500/10'
              )}
            >
              {hasIssues ? (
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">
                  {format(test.testDate, 'd MMMM yyyy')}
                </h3>
              </div>

              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{labProviderLabels[test.labProvider] || test.labProvider}</span>
                </div>
                <span>•</span>
                <span>{test.markerCount} markers tested</span>
              </div>

              {/* Status badge */}
              {hasIssues ? (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {test.outOfRangeCount} out of range
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All markers normal
                </div>
              )}
            </div>
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        {test.tags && test.tags.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {test.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions footer */}
      {showActions && (onEdit || onDelete || onExport) && (
        <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-muted/30">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {onExport && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onExport()
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors ml-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export type { BloodTest, TestCardProps }
