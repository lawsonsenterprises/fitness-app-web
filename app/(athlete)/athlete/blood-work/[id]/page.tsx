'use client'

import { useState, use, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Minus,
  FileText,
  Building2,
  MessageSquare,
  Loader2,
  Droplets,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useBloodTest } from '@/hooks/athlete'
import { getMarkerReferenceRanges } from '@/lib/blood-markers'

// Helper to determine marker status based on value and reference ranges
function getMarkerStatus(value: number, refLow: number | null, refHigh: number | null): 'optimal' | 'low' | 'high' | 'borderline' {
  if (refLow === null || refHigh === null) return 'optimal'
  if (value < refLow) return 'low'
  if (value > refHigh) return 'high'
  // Check if close to boundaries (within 10%)
  const range = refHigh - refLow
  if (value < refLow + range * 0.15 || value > refHigh - range * 0.15) return 'borderline'
  return 'optimal'
}

// Get effective reference ranges - use stored values if valid, otherwise look up from definitions
function getEffectiveReferenceRanges(
  marker: { label: string; code?: string | null; reference_low: number | null; reference_high: number | null }
): { low: number | null; high: number | null } {
  // If stored references are valid (not null and not both 0), use them
  const hasValidStoredRefs =
    marker.reference_low !== null &&
    marker.reference_high !== null &&
    !(marker.reference_low === 0 && marker.reference_high === 0)

  if (hasValidStoredRefs) {
    return { low: marker.reference_low, high: marker.reference_high }
  }

  // Look up from standard definitions by label first, then by code if available
  let standardRefs = getMarkerReferenceRanges(marker.label)
  if (!standardRefs && marker.code) {
    standardRefs = getMarkerReferenceRanges(marker.code)
  }

  if (standardRefs) {
    return { low: standardRefs.low, high: standardRefs.high }
  }

  return { low: null, high: null }
}

// Group markers by category (using definitions lookup since DB doesn't store category)
function groupMarkersByCategory(markers: Array<{
  id: string
  code?: string | null
  label: string
  value: number
  unit: string
  reference_low: number | null
  reference_high: number | null
}>) {
  const groups: Record<string, typeof markers> = {}
  markers.forEach(marker => {
    // Default to 'Other' - category lookup could be added from BLOOD_MARKER_DEFINITIONS if needed
    const category = 'Blood Markers'
    if (!groups[category]) groups[category] = []
    groups[category].push(marker)
  })
  return Object.entries(groups).map(([name, markers]) => ({ name, markers }))
}

type FilterType = 'all' | 'attention' | 'optimal'

export default function BloodWorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [expandedMarker, setExpandedMarker] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const { data: bloodTest, isLoading, error } = useBloodTest(resolvedParams.id)

  // Calculate summary stats
  const totalMarkers = bloodTest?.blood_markers?.length || 0

  const { optimalCount, flaggedCount } = useMemo(() => {
    if (!bloodTest?.blood_markers) return { optimalCount: 0, flaggedCount: 0 }
    let optimal = 0
    let flagged = 0
    bloodTest.blood_markers.forEach((m: { label: string; code?: string | null; value: number; reference_low: number | null; reference_high: number | null }) => {
      const refs = getEffectiveReferenceRanges(m)
      const status = getMarkerStatus(m.value, refs.low, refs.high)
      if (status === 'optimal') optimal++
      else flagged++
    })
    return { optimalCount: optimal, flaggedCount: flagged }
  }, [bloodTest])

  // Process markers into categories with filtering
  const categories = useMemo(() => {
    if (!bloodTest?.blood_markers) return []

    // Filter markers based on selected filter
    const filtered = bloodTest.blood_markers.filter((m: { label: string; code?: string | null; value: number; reference_low: number | null; reference_high: number | null }) => {
      if (filter === 'all') return true
      const refs = getEffectiveReferenceRanges(m)
      const status = getMarkerStatus(m.value, refs.low, refs.high)
      if (filter === 'attention') return status !== 'optimal'
      return status === 'optimal'
    })

    return groupMarkersByCategory(filtered)
  }, [bloodTest, filter])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !bloodTest) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/athlete/blood-work"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Blood Work Results</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-muted-foreground">
            {error ? 'Failed to load blood work data' : 'Blood work results not found'}
          </p>
        </div>
      </div>
    )
  }

  const testDate = bloodTest.date ? new Date(bloodTest.date) : null

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/athlete/blood-work"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {testDate ? testDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }) : 'Blood Work Results'}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              {bloodTest.lab_name && (
                <>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {bloodTest.lab_name}
                  </span>
                  <span>•</span>
                </>
              )}
              <span>{totalMarkers} markers tested</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards - Clickable Filters */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setFilter(filter === 'optimal' ? 'all' : 'optimal')}
          className={cn(
            'rounded-xl border p-6 cursor-pointer transition-all',
            filter === 'optimal'
              ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/20'
              : 'border-border bg-card hover:border-green-500/50'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Optimal</p>
              <p className="text-2xl font-bold">{optimalCount}</p>
            </div>
          </div>
          {filter === 'optimal' && (
            <p className="text-xs text-green-600 mt-2">Showing optimal only</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setFilter(filter === 'attention' ? 'all' : 'attention')}
          className={cn(
            'rounded-xl border p-6 cursor-pointer transition-all',
            filter === 'attention'
              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
              : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
              <p className="text-2xl font-bold">{flaggedCount}</p>
            </div>
          </div>
          {filter === 'attention' && (
            <p className="text-xs text-amber-600 mt-2">Showing flagged only</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-xl border p-6 cursor-pointer transition-all',
            filter === 'all'
              ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
              : 'border-border bg-card hover:border-blue-500/50'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Markers</p>
              <p className="text-2xl font-bold">{totalMarkers}</p>
            </div>
          </div>
          {filter === 'all' && (
            <p className="text-xs text-blue-600 mt-2">Showing all</p>
          )}
        </motion.div>
      </div>

      {/* Notes */}
      {bloodTest.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <MessageSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-600">Notes</h3>
              <p className="text-sm mt-1">{bloodTest.notes}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Marker Categories */}
      {categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map((category, categoryIdx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + categoryIdx * 0.1 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold">{category.name}</h2>
              </div>

              <div className="divide-y divide-border">
                {category.markers.map((marker) => {
                  const isExpanded = expandedMarker === marker.id
                  const refs = getEffectiveReferenceRanges(marker)
                  const status = getMarkerStatus(marker.value, refs.low, refs.high)
                  const hasValidRefs = refs.low !== null && refs.high !== null

                  return (
                    <div key={marker.id}>
                      <button
                        onClick={() => setExpandedMarker(isExpanded ? null : marker.id)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          status === 'optimal' && 'bg-green-500/10',
                          status === 'low' && 'bg-amber-500/10',
                          status === 'high' && 'bg-red-500/10',
                          status === 'borderline' && 'bg-yellow-500/10'
                        )}>
                          {status === 'optimal' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {(status === 'low' || status === 'borderline') && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          {status === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>

                        <div className="flex-1 text-left">
                          <p className="font-medium">{marker.label}</p>
                          {hasValidRefs && (
                            <p className="text-sm text-muted-foreground">
                              Reference: {refs.low} - {refs.high} {marker.unit}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Minus className="h-4 w-4 text-muted-foreground" />

                          <div className="text-right">
                            <p className="text-xl font-bold">{marker.value}</p>
                            <p className="text-xs text-muted-foreground">{marker.unit}</p>
                          </div>
                        </div>
                      </button>

                      {/* Expanded View */}
                      {isExpanded && hasValidRefs && refs.low !== null && refs.high !== null && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4"
                        >
                          <div className="rounded-lg bg-muted/30 p-4">
                            <h4 className="text-sm font-medium mb-4">Value Position</h4>

                            {/* Simple visual indicator */}
                            <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                              {/* Optimal range */}
                              <div
                                className="absolute h-full bg-green-500/20"
                                style={{
                                  left: '20%',
                                  width: '60%',
                                }}
                              />
                              {/* Value indicator */}
                              <div
                                className={cn(
                                  'absolute top-1 bottom-1 w-2 rounded-full',
                                  status === 'optimal' ? 'bg-green-500' : status === 'high' ? 'bg-red-500' : 'bg-amber-500'
                                )}
                                style={{
                                  left: `${Math.min(Math.max((marker.value - refs.low) / (refs.high - refs.low) * 80 + 10, 2), 98)}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              <span>{refs.low} {marker.unit}</span>
                              <span className="text-green-600">Optimal Range</span>
                              <span>{refs.high} {marker.unit}</span>
                            </div>

                            {status !== 'optimal' && (
                              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-sm text-amber-600">
                                  <strong>Note:</strong> This marker is {status === 'low' ? 'below' : status === 'high' ? 'above' : 'near the edge of'} the reference range. Consult with your coach or healthcare provider.
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-12 text-center"
        >
          {filter !== 'all' ? (
            <>
              {filter === 'attention' ? (
                <>
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500/50 mb-4" />
                  <h2 className="text-lg font-semibold mb-2">All Clear</h2>
                  <p className="text-sm text-muted-foreground">
                    No markers need attention - everything is in the optimal range.
                  </p>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-12 w-12 mx-auto text-amber-500/50 mb-4" />
                  <h2 className="text-lg font-semibold mb-2">None in Optimal Range</h2>
                  <p className="text-sm text-muted-foreground">
                    No markers are currently in the optimal range.
                  </p>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setFilter('all')}
              >
                Show All Markers
              </Button>
            </>
          ) : (
            <>
              <Droplets className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Markers Found</h2>
              <p className="text-sm text-muted-foreground">
                No blood markers have been recorded for this test.
              </p>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
