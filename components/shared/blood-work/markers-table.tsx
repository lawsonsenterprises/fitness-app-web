'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Marker {
  id: string
  name: string
  category: string
  value: number
  unit: string
  reference: {
    low: number
    high: number
  }
  optimal?: {
    low: number
    high: number
  }
  previousValue?: number
  trend?: 'up' | 'down' | 'stable'
}

interface MarkersTableProps {
  markers: Marker[]
  onMarkerClick?: (marker: Marker) => void
  onViewTrend?: (marker: Marker) => void
  showSearch?: boolean
  showFilters?: boolean
  className?: string
}

const categories = [
  'All',
  'Hormones',
  'Thyroid',
  'Lipid Panel',
  'Liver Function',
  'Kidney Function',
  'Vitamins & Minerals',
  'Blood Count',
  'Other',
]

const statusFilters = ['All', 'Normal', 'Out of Range', 'Optimal']

export function MarkersTable({
  markers,
  onMarkerClick,
  onViewTrend,
  showSearch = true,
  showFilters = true,
  className,
}: MarkersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Marker | 'status'
    direction: 'asc' | 'desc'
  } | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const getStatus = (marker: Marker): 'low' | 'normal' | 'high' | 'optimal' => {
    const { value, reference, optimal } = marker
    if (value < reference.low) return 'low'
    if (value > reference.high) return 'high'
    if (optimal && value >= optimal.low && value <= optimal.high) return 'optimal'
    return 'normal'
  }

  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      // Search filter
      if (
        searchQuery &&
        !marker.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !marker.category.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'All' && marker.category !== selectedCategory) {
        return false
      }

      // Status filter
      if (selectedStatus !== 'All') {
        const status = getStatus(marker)
        if (selectedStatus === 'Normal' && status !== 'normal' && status !== 'optimal') {
          return false
        }
        if (selectedStatus === 'Out of Range' && status !== 'low' && status !== 'high') {
          return false
        }
        if (selectedStatus === 'Optimal' && status !== 'optimal') {
          return false
        }
      }

      return true
    })
  }, [markers, searchQuery, selectedCategory, selectedStatus])

  // Group by category
  const groupedMarkers = useMemo(() => {
    const groups = new Map<string, Marker[]>()
    filteredMarkers.forEach((marker) => {
      const existing = groups.get(marker.category) || []
      groups.set(marker.category, [...existing, marker])
    })
    return groups
  }, [filteredMarkers])

  const handleSort = (key: keyof Marker | 'status') => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedMarkers = useMemo(() => {
    if (!sortConfig) return filteredMarkers

    return [...filteredMarkers].sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      if (sortConfig.key === 'status') {
        const statusOrder = { low: 0, high: 1, normal: 2, optimal: 3 }
        aValue = statusOrder[getStatus(a)]
        bValue = statusOrder[getStatus(b)]
      } else {
        aValue = a[sortConfig.key] as string | number
        bValue = b[sortConfig.key] as string | number
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredMarkers, sortConfig])

  const getStatusIcon = (status: 'low' | 'normal' | 'high' | 'optimal') => {
    switch (status) {
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />
      case 'optimal':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusLabel = (status: 'low' | 'normal' | 'high' | 'optimal') => {
    const labels = {
      low: 'Low',
      high: 'High',
      normal: 'Normal',
      optimal: 'Optimal',
    }
    return labels[status]
  }

  const getStatusColour = (status: 'low' | 'normal' | 'high' | 'optimal') => {
    switch (status) {
      case 'low':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30'
      case 'high':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/30'
      case 'optimal':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30'
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-amber-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search markers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                {statusFilters.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredMarkers.length} of {markers.length} markers
      </div>

      {/* Grouped table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {Array.from(groupedMarkers.entries()).map(([category, categoryMarkers]) => (
          <div key={category} className="border-b border-border last:border-b-0">
            {/* Category header */}
            <button
              onClick={() =>
                setExpandedCategory(expandedCategory === category ? null : category)
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{category}</span>
                <span className="text-sm text-muted-foreground">
                  ({categoryMarkers.length})
                </span>
              </div>
              {expandedCategory === category ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {/* Markers in category */}
            <AnimatePresence>
              {(expandedCategory === category || expandedCategory === null) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-border">
                    {categoryMarkers.map((marker) => {
                      const status = getStatus(marker)
                      return (
                        <div
                          key={marker.id}
                          onClick={() => onMarkerClick?.(marker)}
                          className={cn(
                            'flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors',
                            onMarkerClick && 'cursor-pointer'
                          )}
                        >
                          {/* Status icon */}
                          <div className="shrink-0">{getStatusIcon(status)}</div>

                          {/* Marker name */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{marker.name}</p>
                          </div>

                          {/* Value */}
                          <div className="text-right">
                            <p className="font-semibold">
                              {marker.value} {marker.unit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ref: {marker.reference.low} - {marker.reference.high}
                            </p>
                          </div>

                          {/* Status badge */}
                          <div
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium border',
                              getStatusColour(status)
                            )}
                          >
                            {getStatusLabel(status)}
                          </div>

                          {/* Trend */}
                          <div className="shrink-0">{getTrendIcon(marker.trend)}</div>

                          {/* View trend button */}
                          {onViewTrend && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewTrend(marker)
                              }}
                              className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredMarkers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No markers found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}

export type { Marker, MarkersTableProps }
