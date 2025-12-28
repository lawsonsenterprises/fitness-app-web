'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Check,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkerOption {
  name: string
  category: string
  unit: string
  hasData: boolean
}

interface MarkerSelectorProps {
  availableMarkers: MarkerOption[]
  selectedMarkers: string[]
  onSelectionChange: (markers: string[]) => void
  maxSelection?: number
  label?: string
}

const categoryColors: Record<string, string> = {
  'Hormones': 'bg-violet-500/10 text-violet-600',
  'Thyroid': 'bg-blue-500/10 text-blue-600',
  'Metabolic': 'bg-amber-500/10 text-amber-600',
  'Vitamins': 'bg-emerald-500/10 text-emerald-600',
  'Minerals': 'bg-cyan-500/10 text-cyan-600',
  'Liver': 'bg-rose-500/10 text-rose-600',
  'Kidney': 'bg-orange-500/10 text-orange-600',
  'Lipids': 'bg-pink-500/10 text-pink-600',
  'Blood Cells': 'bg-red-500/10 text-red-600',
}

export function MarkerSelector({
  availableMarkers,
  selectedMarkers,
  onSelectionChange,
  maxSelection = 5,
  label = 'Select Markers',
}: MarkerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  // Group markers by category
  const groupedMarkers = useMemo(() => {
    const filtered = searchQuery
      ? availableMarkers.filter(m =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : availableMarkers

    return filtered.reduce((acc, marker) => {
      if (!acc[marker.category]) {
        acc[marker.category] = []
      }
      acc[marker.category].push(marker)
      return acc
    }, {} as Record<string, MarkerOption[]>)
  }, [availableMarkers, searchQuery])

  const toggleMarker = (markerName: string) => {
    if (selectedMarkers.includes(markerName)) {
      onSelectionChange(selectedMarkers.filter(m => m !== markerName))
    } else if (selectedMarkers.length < maxSelection) {
      onSelectionChange([...selectedMarkers, markerName])
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  const removeMarker = (markerName: string) => {
    onSelectionChange(selectedMarkers.filter(m => m !== markerName))
  }

  return (
    <div className="relative">
      {/* Selected markers display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <span className="text-xs text-muted-foreground">
            {selectedMarkers.length}/{maxSelection} selected
          </span>
        </div>

        {/* Selected chips */}
        {selectedMarkers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedMarkers.map((name) => {
              const marker = availableMarkers.find(m => m.name === name)
              const color = marker ? categoryColors[marker.category] || 'bg-muted text-foreground' : 'bg-muted'
              return (
                <motion.span
                  key={name}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium',
                    color
                  )}
                >
                  {name}
                  <button
                    onClick={() => removeMarker(name)}
                    className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              )
            })}
            <button
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Trigger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left hover:border-muted-foreground/50 transition-colors"
        >
          <span className={selectedMarkers.length === 0 ? 'text-muted-foreground' : ''}>
            {selectedMarkers.length === 0 ? 'Click to select markers...' : 'Add more markers...'}
          </span>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search markers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Markers list */}
              <div className="max-h-72 overflow-y-auto p-2">
                {Object.keys(groupedMarkers).length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No markers found
                  </div>
                ) : (
                  Object.entries(groupedMarkers).map(([category, markers]) => (
                    <div key={category} className="mb-1">
                      {/* Category header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'rounded px-2 py-0.5 text-xs font-medium',
                            categoryColors[category] || 'bg-muted'
                          )}>
                            {category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {markers.length} markers
                          </span>
                        </div>
                        {expandedCategories.includes(category) || searchQuery ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {/* Markers in category */}
                      {(expandedCategories.includes(category) || searchQuery) && (
                        <div className="ml-2 mt-1 space-y-0.5">
                          {markers.map((marker) => {
                            const isSelected = selectedMarkers.includes(marker.name)
                            const isDisabled = !isSelected && selectedMarkers.length >= maxSelection
                            return (
                              <button
                                key={marker.name}
                                onClick={() => !isDisabled && toggleMarker(marker.name)}
                                disabled={isDisabled}
                                className={cn(
                                  'w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
                                  isSelected
                                    ? 'bg-emerald-500/10'
                                    : isDisabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-muted/50'
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      'flex h-4 w-4 items-center justify-center rounded border',
                                      isSelected
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : 'border-muted-foreground'
                                    )}
                                  >
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <span className={cn(
                                    'text-sm font-medium',
                                    isSelected && 'text-emerald-600'
                                  )}>
                                    {marker.name}
                                  </span>
                                  {!marker.hasData && (
                                    <span className="text-xs text-muted-foreground">(no data)</span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {marker.unit}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-3 bg-muted/20">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export type { MarkerOption }
