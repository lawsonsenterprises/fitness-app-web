'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Check,
  X,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SavedComparison {
  id: string
  name: string
  markers: string[]
  createdAt: Date
  lastViewed?: Date
}

interface SavedComparisonsProps {
  comparisons: SavedComparison[]
  onSelect: (comparison: SavedComparison) => void
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
  onCreateNew?: () => void
  currentMarkers?: string[]
  onSaveCurrent?: (name: string) => void
}

function ComparisonCard({
  comparison,
  onSelect,
  onDelete,
  onRename,
}: {
  comparison: SavedComparison
  onSelect: () => void
  onDelete: () => void
  onRename: (newName: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(comparison.name)

  const handleSave = () => {
    if (editName.trim()) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') setIsEditing(false)
                }}
              />
              <button
                onClick={handleSave}
                className="rounded p-1 text-emerald-500 hover:bg-emerald-500/10"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{comparison.name}</p>
              <p className="text-xs text-muted-foreground">
                {comparison.markers.length} markers • Created {comparison.createdAt.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Markers preview */}
      <div className="border-t border-border px-4 py-3 bg-muted/20">
        <div className="flex flex-wrap gap-1.5">
          {comparison.markers.slice(0, 4).map((marker) => (
            <span
              key={marker}
              className="rounded-full bg-background px-2 py-0.5 text-xs font-medium"
            >
              {marker}
            </span>
          ))}
          {comparison.markers.length > 4 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              +{comparison.markers.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* View button */}
      <button
        onClick={onSelect}
        className="w-full flex items-center justify-center gap-2 border-t border-border py-3 text-sm font-medium text-amber-600 hover:bg-amber-500/10 transition-colors"
      >
        View Comparison
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export function SavedComparisons({
  comparisons,
  onSelect,
  onDelete,
  onRename,
  onCreateNew,
  currentMarkers,
  onSaveCurrent,
}: SavedComparisonsProps) {
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveName, setSaveName] = useState('')

  const handleSaveCurrent = () => {
    if (saveName.trim() && onSaveCurrent) {
      onSaveCurrent(saveName.trim())
      setSaveName('')
      setShowSaveForm(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Saved Comparisons</h3>
        </div>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-500/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        )}
      </div>

      {/* Save current selection */}
      {currentMarkers && currentMarkers.length > 0 && onSaveCurrent && (
        <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4">
          {showSaveForm ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Save current selection</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Comparison name..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCurrent()
                    if (e.key === 'Escape') setShowSaveForm(false)
                  }}
                />
                <button
                  onClick={handleSaveCurrent}
                  disabled={!saveName.trim()}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    saveName.trim()
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveForm(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentMarkers.map((marker) => (
                  <span
                    key={marker}
                    className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600"
                  >
                    {marker}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-amber-600"
            >
              <Bookmark className="h-4 w-4" />
              Save current selection ({currentMarkers.length} markers)
            </button>
          )}
        </div>
      )}

      {/* Comparisons list */}
      {comparisons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium text-muted-foreground">No saved comparisons</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Save marker selections to quickly compare trends
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {comparisons.map((comparison) => (
              <ComparisonCard
                key={comparison.id}
                comparison={comparison}
                onSelect={() => onSelect(comparison)}
                onDelete={() => onDelete(comparison.id)}
                onRename={(newName) => onRename(comparison.id, newName)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}

export type { SavedComparison }
