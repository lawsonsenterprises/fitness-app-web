'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  AlertTriangle,
  ChevronLeft,
  Edit2,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExtractedMarker {
  name: string
  value: number
  unit: string
  referenceRange?: { min: number; max: number }
  confidence: number
  selected: boolean
}

interface MarkerExtractionReviewProps {
  markers: ExtractedMarker[]
  onConfirm: (markers: ExtractedMarker[]) => void
  onBack: () => void
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-500/10'
  if (confidence >= 0.75) return 'text-amber-600 bg-amber-500/10'
  return 'text-rose-600 bg-rose-500/10'
}

function getValueStatus(value: number, range?: { min: number; max: number }): 'optimal' | 'normal' | 'borderline' | 'out-of-range' {
  if (!range) return 'normal'

  const rangeWidth = range.max - range.min
  const optimalMin = range.min + rangeWidth * 0.25
  const optimalMax = range.max - rangeWidth * 0.25

  if (value < range.min || value > range.max) return 'out-of-range'
  if (value < range.min + rangeWidth * 0.1 || value > range.max - rangeWidth * 0.1) return 'borderline'
  if (value >= optimalMin && value <= optimalMax) return 'optimal'
  return 'normal'
}

const statusColors = {
  optimal: 'text-emerald-600 bg-emerald-500/10',
  normal: 'text-blue-600 bg-blue-500/10',
  borderline: 'text-amber-600 bg-amber-500/10',
  'out-of-range': 'text-rose-600 bg-rose-500/10',
}

function MarkerRow({
  marker,
  onToggle,
  onEdit,
}: {
  marker: ExtractedMarker
  onToggle: () => void
  onEdit: (value: number) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(marker.value.toString())
  const status = getValueStatus(marker.value, marker.referenceRange)

  const handleSave = () => {
    const newValue = parseFloat(editValue)
    if (!isNaN(newValue)) {
      onEdit(newValue)
    }
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border p-3 transition-all',
        marker.selected
          ? 'border-border bg-card'
          : 'border-border/50 bg-muted/30 opacity-60'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
          marker.selected
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-muted-foreground'
        )}
      >
        {marker.selected && <Check className="h-3 w-3 text-white" />}
      </button>

      {/* Marker name and confidence */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{marker.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn(
            'rounded px-1.5 py-0.5 text-xs font-medium',
            getConfidenceColor(marker.confidence)
          )}>
            {Math.round(marker.confidence * 100)}% confident
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-20 rounded border border-border bg-background px-2 py-1 text-sm text-right"
              autoFocus
            />
            <span className="text-sm text-muted-foreground">{marker.unit}</span>
            <button
              onClick={handleSave}
              className="rounded p-1 text-emerald-500 hover:bg-emerald-500/10"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setEditValue(marker.value.toString())
                setIsEditing(false)
              }}
              className="rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className={cn(
              'rounded px-2 py-1 text-sm font-semibold',
              statusColors[status]
            )}>
              {marker.value} {marker.unit}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Reference range */}
      {marker.referenceRange && (
        <div className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
          Range: {marker.referenceRange.min}-{marker.referenceRange.max}
        </div>
      )}
    </div>
  )
}

export function MarkerExtractionReview({
  markers: initialMarkers,
  onConfirm,
  onBack,
}: MarkerExtractionReviewProps) {
  const [markers, setMarkers] = useState(initialMarkers)

  const toggleMarker = (index: number) => {
    setMarkers(prev =>
      prev.map((m, i) =>
        i === index ? { ...m, selected: !m.selected } : m
      )
    )
  }

  const editMarkerValue = (index: number, value: number) => {
    setMarkers(prev =>
      prev.map((m, i) =>
        i === index ? { ...m, value } : m
      )
    )
  }

  const selectAll = () => {
    setMarkers(prev => prev.map(m => ({ ...m, selected: true })))
  }

  const deselectAll = () => {
    setMarkers(prev => prev.map(m => ({ ...m, selected: false })))
  }

  const selectedCount = markers.filter(m => m.selected).length
  const lowConfidenceCount = markers.filter(m => m.confidence < 0.75).length

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Review Extracted Markers</h3>
            <p className="text-sm text-muted-foreground">
              {markers.length} markers detected • {selectedCount} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              Select all
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={deselectAll}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Deselect all
            </button>
          </div>
        </div>

        {lowConfidenceCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-600">
              {lowConfidenceCount} marker{lowConfidenceCount !== 1 ? 's have' : ' has'} low confidence.
              Please verify the values are correct.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2">
          <Info className="h-4 w-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-600">
            Click the edit icon to correct any values. Uncheck markers you don&apos;t want to save.
          </p>
        </div>
      </div>

      {/* Markers list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {markers.map((marker, i) => (
          <motion.div
            key={marker.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <MarkerRow
              marker={marker}
              onToggle={() => toggleMarker(i)}
              onEdit={(value) => editMarkerValue(i, value)}
            />
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => onConfirm(markers)}
          disabled={selectedCount === 0}
          className={cn(
            'rounded-lg px-6 py-2 text-sm font-medium transition-colors',
            selectedCount > 0
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          Confirm {selectedCount} Marker{selectedCount !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}

export type { ExtractedMarker }
