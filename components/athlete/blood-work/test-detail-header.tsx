'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronLeft,
  Calendar,
  Building2,
  Tag,
  Download,
  Share2,
  Trash2,
  Edit2,
  MoreVertical,
  Check,
  AlertTriangle,
  Droplets,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TestDetailHeaderProps {
  testId: string
  date: Date
  lab: string
  tags?: string[]
  notes?: string
  markerCount: number
  optimalCount: number
  outOfRangeCount: number
  onEdit?: () => void
  onDelete?: () => void
  onDownload?: () => void
  onShare?: () => void
  backHref?: string
}

export function TestDetailHeader({
  testId,
  date,
  lab,
  tags,
  notes,
  markerCount,
  optimalCount,
  outOfRangeCount,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  backHref = '/athlete/blood-work',
}: TestDetailHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  const hasIssues = outOfRangeCount > 0

  return (
    <div className="space-y-4">
      {/* Navigation and actions */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Blood Work
        </Link>

        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {/* More menu */}
          {(onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-full mt-2 z-50 w-40 rounded-lg border border-border bg-card shadow-lg"
                  >
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit()
                          setShowMenu(false)
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete()
                          setShowMenu(false)
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main header card */}
      <div className={cn(
        'rounded-xl border overflow-hidden',
        hasIssues ? 'border-amber-500/30' : 'border-emerald-500/30'
      )}>
        {/* Top section */}
        <div className={cn(
          'p-6',
          hasIssues ? 'bg-amber-500/5' : 'bg-emerald-500/5'
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl',
                hasIssues ? 'bg-amber-500/20' : 'bg-emerald-500/20'
              )}>
                <Droplets className={cn(
                  'h-7 w-7',
                  hasIssues ? 'text-amber-500' : 'text-emerald-500'
                )} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Blood Test Results
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {date.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {lab}
                  </span>
                  <span className="text-muted-foreground/50">
                    {formatDistanceToNow(date, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className={cn(
              'hidden sm:flex items-center gap-2 rounded-full px-4 py-2',
              hasIssues ? 'bg-amber-500/20' : 'bg-emerald-500/20'
            )}>
              {hasIssues ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600">
                    {outOfRangeCount} marker{outOfRangeCount !== 1 ? 's' : ''} flagged
                  </span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">
                    All markers in range
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold">{markerCount}</p>
            <p className="text-xs text-muted-foreground">Total Markers</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{optimalCount}</p>
            <p className="text-xs text-muted-foreground">Optimal</p>
          </div>
          <div className="p-4 text-center">
            <p className={cn(
              'text-2xl font-bold',
              outOfRangeCount > 0 ? 'text-rose-600' : 'text-muted-foreground'
            )}>
              {outOfRangeCount}
            </p>
            <p className="text-xs text-muted-foreground">Flagged</p>
          </div>
        </div>

        {/* Tags and notes */}
        {(tags?.length || notes) && (
          <div className="border-t border-border bg-muted/20 p-4 space-y-3">
            {tags && tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {notes && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
