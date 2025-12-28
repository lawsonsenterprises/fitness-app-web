'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarkerRow, type Marker } from './marker-row'

interface MarkersTableProps {
  markers: Marker[]
  onMarkerClick?: (markerName: string) => void
  showTrends?: boolean
  compact?: boolean
}

type SortField = 'name' | 'value' | 'status' | 'category'
type SortOrder = 'asc' | 'desc'
type StatusFilter = 'all' | 'optimal' | 'normal' | 'borderline' | 'out-of-range'

const statusPriority = {
  'out-of-range': 0,
  borderline: 1,
  normal: 2,
  optimal: 3,
}

export function MarkersTable({
  markers,
  onMarkerClick,
  showTrends = true,
  compact = false,
}: MarkersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('status')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(markers.map(m => m.category).filter(Boolean))]
    return cats.sort()
  }, [markers])

  // Filter and sort markers
  const filteredMarkers = useMemo(() => {
    return markers
      .filter(marker => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (!marker.name.toLowerCase().includes(query)) {
            return false
          }
        }
        // Status filter
        if (statusFilter !== 'all' && marker.status !== statusFilter) {
          return false
        }
        // Category filter
        if (categoryFilter && marker.category !== categoryFilter) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        let comparison = 0
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'value':
            comparison = a.value - b.value
            break
          case 'status':
            comparison = statusPriority[a.status] - statusPriority[b.status]
            break
          case 'category':
            comparison = (a.category || '').localeCompare(b.category || '')
            break
        }
        return sortOrder === 'asc' ? comparison : -comparison
      })
  }, [markers, searchQuery, sortField, sortOrder, statusFilter, categoryFilter])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Count by status
  const statusCounts = useMemo(() => {
    return markers.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [markers])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search markers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter chips */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              All ({markers.length})
            </button>
            <button
              onClick={() => setStatusFilter('out-of-range')}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === 'out-of-range'
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
              )}
            >
              Flagged ({statusCounts['out-of-range'] || 0})
            </button>
            <button
              onClick={() => setStatusFilter('optimal')}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === 'optimal'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
              )}
            >
              Optimal ({statusCounts['optimal'] || 0})
            </button>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="rounded-lg border border-border bg-background py-1.5 pl-3 pr-8 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header */}
        {!compact && (
          <div className="grid grid-cols-12 gap-4 bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
            <button
              onClick={() => toggleSort('name')}
              className="col-span-4 flex items-center gap-1 text-left hover:text-foreground"
            >
              Marker
              {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            <button
              onClick={() => toggleSort('value')}
              className="col-span-2 flex items-center gap-1 text-left hover:text-foreground"
            >
              Value
              {sortField === 'value' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            <div className="col-span-2">Range</div>
            <button
              onClick={() => toggleSort('status')}
              className="col-span-2 flex items-center gap-1 text-left hover:text-foreground"
            >
              Status
              {sortField === 'status' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
            {showTrends && <div className="col-span-2">Trend</div>}
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-border">
          {filteredMarkers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No markers match your filters</p>
            </div>
          ) : (
            filteredMarkers.map((marker, i) => (
              <motion.div
                key={marker.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <MarkerRow
                  marker={marker}
                  onClick={() => onMarkerClick?.(marker.name)}
                  showTrend={showTrends}
                  compact={compact}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredMarkers.length} of {markers.length} markers
        </span>
        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="text-emerald-600 hover:text-emerald-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
