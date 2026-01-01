'use client'

import Link from 'next/link'
import {
  Calendar,
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ProgrammeTypeBadge, DifficultyBadge } from './programme-type-badge'
import { cn } from '@/lib/utils'
import type { ProgrammeTemplate } from '@/types'

interface ProgrammeTemplateCardProps {
  programme: ProgrammeTemplate
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ProgrammeTemplateCard({
  programme,
  onDuplicate,
  onDelete,
}: ProgrammeTemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border bg-card p-5 transition-all',
        'hover:border-amber-500/30 hover:shadow-lg hover:-translate-y-0.5'
      )}
    >
      {/* Status indicator */}
      <div className="absolute -top-px left-6 h-1 w-16 rounded-b-full bg-gradient-to-r from-amber-400 to-amber-600" />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <ProgrammeTypeBadge type={programme.type} size="sm" />
          {programme.isPublic ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Public
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Private
            </span>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                <Link
                  href={`/programmes/${programme.id}`}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setShowMenu(false)}
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  View Details
                </Link>
                <Link
                  href={`/programmes/${programme.id}/edit`}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setShowMenu(false)}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit
                </Link>
                <button
                  onClick={() => {
                    onDuplicate?.(programme.id)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  Duplicate
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={() => {
                    onDelete?.(programme.id)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title and description */}
      <Link href={`/programmes/${programme.id}`} className="block">
        <h3 className="mb-2 font-semibold text-lg leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors">
          {programme.name}
        </h3>
        {programme.description && (
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
            {programme.description}
          </p>
        )}
      </Link>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{programme.durationWeeks} weeks</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>{programme.daysPerWeek} days/week</span>
          </div>
        </div>
        <DifficultyBadge difficulty={programme.difficulty} size="sm" />
      </div>

      {/* Quick assign button on hover */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/programmes/assign?template=${programme.id}`}>
          <Button size="sm" className="w-full bg-amber-500 text-white hover:bg-amber-600">
            Assign to Client
          </Button>
        </Link>
      </div>
    </div>
  )
}
