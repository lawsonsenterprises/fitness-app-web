'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Droplets,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TestCard, type BloodTest } from './test-card'

interface TestsGridProps {
  tests: BloodTest[]
  onTestClick?: (testId: string) => void
  onUpload?: () => void
}

type SortField = 'date' | 'markers' | 'lab'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'

export function TestsGrid({ tests, onTestClick, onUpload }: TestsGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedLab, setSelectedLab] = useState<string | null>(null)

  // Get unique labs for filter
  const labs = [...new Set(tests.map(t => t.lab))]

  // Filter and sort tests
  const filteredTests = tests
    .filter(test => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesDate = test.date.toLocaleDateString('en-GB').includes(query)
        const matchesLab = test.lab.toLowerCase().includes(query)
        const matchesTags = test.tags?.some(tag => tag.toLowerCase().includes(query))
        const matchesMarkers = test.markers.some(m => m.name.toLowerCase().includes(query))
        if (!matchesDate && !matchesLab && !matchesTags && !matchesMarkers) {
          return false
        }
      }
      if (selectedLab && test.lab !== selectedLab) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime()
          break
        case 'markers':
          comparison = a.markers.length - b.markers.length
          break
        case 'lab':
          comparison = a.lab.localeCompare(b.lab)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Blood Tests</h2>
          <p className="text-sm text-muted-foreground">
            {tests.length} test{tests.length !== 1 ? 's' : ''} on record
          </p>
        </div>
        {onUpload && (
          <button
            onClick={onUpload}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Upload New Test
          </button>
        )}
      </div>

      {/* Filters and search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by date, lab, marker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Lab filter */}
          <div className="relative">
            <select
              value={selectedLab || ''}
              onChange={(e) => setSelectedLab(e.target.value || null)}
              className="appearance-none rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Labs</option>
              {labs.map((lab) => (
                <option key={lab} value={lab}>
                  {lab}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Sort buttons */}
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => toggleSort('date')}
              className={cn(
                'flex items-center gap-1 px-3 py-2 text-sm transition-colors',
                sortField === 'date' ? 'text-emerald-600' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Calendar className="h-4 w-4" />
              {sortField === 'date' && (sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />)}
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-l-lg p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-r-lg p-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tests display */}
      {filteredTests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-12 text-center">
          <Droplets className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 font-medium text-muted-foreground">
            {searchQuery || selectedLab ? 'No tests match your filters' : 'No blood tests yet'}
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {searchQuery || selectedLab
              ? 'Try adjusting your search or filters'
              : 'Upload your first blood test to start tracking'}
          </p>
          {onUpload && !searchQuery && !selectedLab && (
            <button
              onClick={onUpload}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upload Test
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test, i) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TestCard
                test={test}
                onClick={() => onTestClick?.(test.id)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTests.map((test, i) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <TestCard
                test={test}
                variant="compact"
                onClick={() => onTestClick?.(test.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
