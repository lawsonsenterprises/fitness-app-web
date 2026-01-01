'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Printer,
  Plus,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useBloodTests } from '@/hooks/athlete'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

// Hook to fetch all blood markers with their historical data
function useAllBloodMarkersWithHistory(athleteId?: string) {
  return useQuery({
    queryKey: ['blood-markers-history', athleteId],
    queryFn: async () => {
      if (!athleteId) return []

      const supabase = createClient()

      // Get all blood panels for this user with their markers
      const { data: panels, error } = await supabase
        .from('blood_panels')
        .select('id, date, blood_markers(*)')
        .eq('user_id', athleteId)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching blood markers history:', error)
        return []
      }

      // Group markers by their code with historical values
      const markerMap = new Map<string, {
        id: string
        code: string
        name: string
        category: string
        unit: string
        reference_low: number | null
        reference_high: number | null
        color: string
        data: Array<{ date: string; value: number }>
      }>()

      // Color palette for markers
      const colors = [
        '#22c55e', '#10b981', '#14b8a6', '#f59e0b', '#8b5cf6',
        '#3b82f6', '#6366f1', '#a855f7', '#ef4444', '#f97316',
        '#84cc16', '#ec4899', '#06b6d4', '#0ea5e9',
      ]
      let colorIndex = 0

      panels?.forEach((panel: {
        id: string
        date: string | null
        blood_markers: Array<{
          id: string
          code: string
          name: string
          category: string | null
          unit: string
          value: number
          reference_low: number | null
          reference_high: number | null
        }> | null
      }) => {
        const dateStr = panel.date
          ? new Date(panel.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
          : 'Unknown'

        panel.blood_markers?.forEach((marker: {
          id: string
          code: string
          name: string
          category: string | null
          unit: string
          value: number
          reference_low: number | null
          reference_high: number | null
        }) => {
          if (!markerMap.has(marker.code)) {
            markerMap.set(marker.code, {
              id: marker.code,
              code: marker.code,
              name: marker.name,
              category: marker.category || 'Other',
              unit: marker.unit,
              reference_low: marker.reference_low,
              reference_high: marker.reference_high,
              color: colors[colorIndex % colors.length],
              data: [],
            })
            colorIndex++
          }

          const existing = markerMap.get(marker.code)!
          existing.data.push({
            date: dateStr,
            value: marker.value,
          })
        })
      })

      return Array.from(markerMap.values())
    },
    enabled: !!athleteId,
  })
}

const dateRanges = [
  { id: '6m', label: '6 Months' },
  { id: '1y', label: '1 Year' },
  { id: 'all', label: 'All Time' },
]

export default function BloodWorkTrendsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [selectedMarkers, setSelectedMarkers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('1y')
  const [showOptimalRange, setShowOptimalRange] = useState(true)

  const { data: markers = [], isLoading: markersLoading } = useAllBloodMarkersWithHistory(user?.id)

  const isLoading = authLoading || (user && markersLoading)

  // Group markers by category
  const categories = useMemo(() => {
    const cats = new Map<string, typeof markers>()
    markers.forEach((marker) => {
      const existing = cats.get(marker.category) || []
      cats.set(marker.category, [...existing, marker])
    })
    return cats
  }, [markers])

  // Filter markers by search query
  const filteredMarkers = useMemo(() => {
    if (!searchQuery) return markers
    return markers.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [markers, searchQuery])

  // Get selected markers data
  const selectedMarkersData = useMemo(() => {
    return markers.filter((m) => selectedMarkers.includes(m.id))
  }, [markers, selectedMarkers])

  // Combine data for chart
  const chartData = useMemo(() => {
    if (selectedMarkersData.length === 0) return []

    const allDates = new Set<string>()
    selectedMarkersData.forEach((marker) => {
      marker.data.forEach((d) => allDates.add(d.date))
    })

    const dates = Array.from(allDates)

    return dates.map((date) => {
      const point: { date: string; [key: string]: number | string } = { date }
      selectedMarkersData.forEach((marker) => {
        const dataPoint = marker.data.find((d) => d.date === date)
        if (dataPoint) {
          point[marker.id] = dataPoint.value
        }
      })
      return point
    })
  }, [selectedMarkersData])

  const toggleMarker = (markerId: string) => {
    if (selectedMarkers.includes(markerId)) {
      setSelectedMarkers(selectedMarkers.filter((id) => id !== markerId))
    } else if (selectedMarkers.length < 6) {
      setSelectedMarkers([...selectedMarkers, markerId])
    }
  }

  const getTrend = (marker: typeof markers[0]) => {
    const data = marker.data
    if (data.length < 2) return 'stable'
    const latest = data[data.length - 1].value
    const previous = data[data.length - 2].value
    const change = ((latest - previous) / previous) * 100
    if (change > 5) return 'up'
    if (change < -5) return 'down'
    return 'stable'
  }

  const getStatus = (marker: typeof markers[0]) => {
    if (!marker.reference_low || !marker.reference_high) return 'normal'
    const latest = marker.data[marker.data.length - 1]?.value || 0
    if (latest < marker.reference_low) return 'low'
    if (latest > marker.reference_high) return 'high'
    return 'optimal'
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show empty state if no markers data
  if (markers.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div>
          <Link
            href="/athlete/blood-work"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Blood Work
          </Link>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Marker Trends</h1>
          <p className="mt-1 text-muted-foreground">
            Compare multiple biomarkers over time
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 rounded-xl border border-border bg-card p-12 text-center"
        >
          <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Blood Work Data</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Upload blood work results to track and compare your biomarkers over time.
          </p>
          <Button asChild>
            <Link href="/athlete/blood-work">
              Go to Blood Work
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <Link
            href="/athlete/blood-work"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Blood Work
          </Link>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Marker Trends</h1>
          <p className="mt-1 text-muted-foreground">
            Compare multiple biomarkers over time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Sidebar - Marker Selection */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Marker Search & Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Select Markers</h3>
              <span className="text-xs text-muted-foreground">{selectedMarkers.length}/6</span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-4">
              {Array.from(categories.entries()).map(([category, categoryMarkers]) => {
                const filtered = categoryMarkers.filter((m) =>
                  filteredMarkers.some((f) => f.id === m.id)
                )
                if (filtered.length === 0) return null

                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {category}
                    </p>
                    <div className="space-y-1">
                      {filtered.map((marker) => (
                        <button
                          key={marker.id}
                          onClick={() => toggleMarker(marker.id)}
                          disabled={
                            !selectedMarkers.includes(marker.id) && selectedMarkers.length >= 6
                          }
                          className={cn(
                            'w-full flex items-center gap-3 rounded-lg p-2 text-left transition-colors',
                            selectedMarkers.includes(marker.id)
                              ? 'bg-foreground/10'
                              : 'hover:bg-muted/50',
                            !selectedMarkers.includes(marker.id) &&
                              selectedMarkers.length >= 6 &&
                              'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: marker.color }}
                          />
                          <span className="text-sm flex-1">{marker.name}</span>
                          {selectedMarkers.includes(marker.id) && (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Main Content - Chart & Details */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Chart Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    dateRange === range.id
                      ? 'bg-foreground text-background'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOptimalRange}
                onChange={(e) => setShowOptimalRange(e.target.checked)}
                className="rounded border-border"
              />
              Show optimal range
            </label>
          </motion.div>

          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            {selectedMarkers.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                <Plus className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium">No markers selected</p>
                <p className="text-sm mt-1">Select up to 6 markers to compare</p>
              </div>
            ) : (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />

                    {selectedMarkersData.map((marker) => (
                      <Line
                        key={marker.id}
                        type="monotone"
                        dataKey={marker.id}
                        name={marker.name}
                        stroke={marker.color}
                        strokeWidth={2}
                        dot={{ fill: marker.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: marker.color }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Selected Markers Details */}
          {selectedMarkersData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {selectedMarkersData.map((marker) => {
                const latestValue = marker.data[marker.data.length - 1]?.value || 0
                const previousValue = marker.data[marker.data.length - 2]?.value
                const trend = getTrend(marker)
                const status = getStatus(marker)
                const changePercent = previousValue
                  ? (((latestValue - previousValue) / previousValue) * 100).toFixed(1)
                  : null

                return (
                  <div
                    key={marker.id}
                    className="rounded-xl border border-border bg-card p-4"
                    style={{ borderLeftColor: marker.color, borderLeftWidth: 4 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{marker.name}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold">{latestValue}</span>
                          <span className="text-sm text-muted-foreground">{marker.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {trend === 'down' && <TrendingDown className="h-4 w-4 text-amber-500" />}
                        {trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}

                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full',
                            status === 'optimal' && 'bg-green-500/10',
                            status === 'normal' && 'bg-blue-500/10',
                            status === 'low' && 'bg-amber-500/10',
                            status === 'high' && 'bg-red-500/10'
                          )}
                        >
                          {status === 'optimal' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {status === 'normal' && <Info className="h-4 w-4 text-blue-500" />}
                          {(status === 'low' || status === 'high') && (
                            <AlertTriangle
                              className={cn(
                                'h-4 w-4',
                                status === 'low' ? 'text-amber-500' : 'text-red-500'
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Previous</span>
                        <span className="font-medium text-foreground">
                          {previousValue || 'N/A'} {marker.unit}
                        </span>
                      </div>
                      {changePercent && (
                        <div className="flex justify-between text-muted-foreground mt-1">
                          <span>Change</span>
                          <span
                            className={cn(
                              'font-medium',
                              parseFloat(changePercent) > 0 ? 'text-green-500' : 'text-amber-500'
                            )}
                          >
                            {parseFloat(changePercent) > 0 ? '+' : ''}
                            {changePercent}%
                          </span>
                        </div>
                      )}
                      {marker.reference_low !== null && marker.reference_high !== null && (
                        <div className="flex justify-between text-muted-foreground mt-1">
                          <span>Reference</span>
                          <span className="font-medium text-foreground">
                            {marker.reference_low} - {marker.reference_high}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
