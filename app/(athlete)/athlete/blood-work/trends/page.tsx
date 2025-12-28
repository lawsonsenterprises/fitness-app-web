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

// Comprehensive marker data with historical values
const allMarkers = [
  {
    id: 'testosterone',
    name: 'Testosterone',
    category: 'Hormones',
    unit: 'nmol/L',
    reference: { low: 8.64, high: 29 },
    optimal: { low: 15, high: 25 },
    color: '#22c55e',
    data: [
      { date: 'Jan 24', value: 18.5 },
      { date: 'Mar 24', value: 19.2 },
      { date: 'Jun 24', value: 20.1 },
      { date: 'Sep 24', value: 21.2 },
      { date: 'Dec 24', value: 22.5 },
    ],
  },
  {
    id: 'freeTestosterone',
    name: 'Free Testosterone',
    category: 'Hormones',
    unit: 'nmol/L',
    reference: { low: 0.2, high: 0.62 },
    optimal: { low: 0.3, high: 0.5 },
    color: '#10b981',
    data: [
      { date: 'Jan 24', value: 0.35 },
      { date: 'Mar 24', value: 0.38 },
      { date: 'Jun 24', value: 0.4 },
      { date: 'Sep 24', value: 0.41 },
      { date: 'Dec 24', value: 0.42 },
    ],
  },
  {
    id: 'shbg',
    name: 'SHBG',
    category: 'Hormones',
    unit: 'nmol/L',
    reference: { low: 18.3, high: 54.1 },
    optimal: { low: 20, high: 40 },
    color: '#14b8a6',
    data: [
      { date: 'Jan 24', value: 32 },
      { date: 'Mar 24', value: 34 },
      { date: 'Jun 24', value: 35 },
      { date: 'Sep 24', value: 33 },
      { date: 'Dec 24', value: 35 },
    ],
  },
  {
    id: 'vitaminD',
    name: 'Vitamin D',
    category: 'Vitamins & Minerals',
    unit: 'nmol/L',
    reference: { low: 50, high: 175 },
    optimal: { low: 100, high: 150 },
    color: '#f59e0b',
    data: [
      { date: 'Jan 24', value: 45 },
      { date: 'Mar 24', value: 62 },
      { date: 'Jun 24', value: 95 },
      { date: 'Sep 24', value: 78 },
      { date: 'Dec 24', value: 65 },
    ],
  },
  {
    id: 'ferritin',
    name: 'Ferritin',
    category: 'Vitamins & Minerals',
    unit: 'ug/L',
    reference: { low: 30, high: 400 },
    optimal: { low: 100, high: 150 },
    color: '#8b5cf6',
    data: [
      { date: 'Jan 24', value: 65 },
      { date: 'Mar 24', value: 72 },
      { date: 'Jun 24', value: 85 },
      { date: 'Sep 24', value: 92 },
      { date: 'Dec 24', value: 95 },
    ],
  },
  {
    id: 'tsh',
    name: 'TSH',
    category: 'Thyroid',
    unit: 'mU/L',
    reference: { low: 0.27, high: 4.2 },
    optimal: { low: 0.5, high: 2.5 },
    color: '#3b82f6',
    data: [
      { date: 'Jan 24', value: 1.6 },
      { date: 'Mar 24', value: 1.8 },
      { date: 'Jun 24', value: 1.7 },
      { date: 'Sep 24', value: 1.9 },
      { date: 'Dec 24', value: 1.8 },
    ],
  },
  {
    id: 'freeT4',
    name: 'Free T4',
    category: 'Thyroid',
    unit: 'pmol/L',
    reference: { low: 12, high: 22 },
    optimal: { low: 14, high: 18 },
    color: '#6366f1',
    data: [
      { date: 'Jan 24', value: 15.2 },
      { date: 'Mar 24', value: 15.8 },
      { date: 'Jun 24', value: 16.1 },
      { date: 'Sep 24', value: 16.0 },
      { date: 'Dec 24', value: 16.2 },
    ],
  },
  {
    id: 'freeT3',
    name: 'Free T3',
    category: 'Thyroid',
    unit: 'pmol/L',
    reference: { low: 3.1, high: 6.8 },
    optimal: { low: 4.5, high: 6.0 },
    color: '#a855f7',
    data: [
      { date: 'Jan 24', value: 4.5 },
      { date: 'Mar 24', value: 4.6 },
      { date: 'Jun 24', value: 4.8 },
      { date: 'Sep 24', value: 4.7 },
      { date: 'Dec 24', value: 4.8 },
    ],
  },
  {
    id: 'totalCholesterol',
    name: 'Total Cholesterol',
    category: 'Lipid Panel',
    unit: 'mmol/L',
    reference: { low: 0, high: 5 },
    optimal: { low: 3.5, high: 4.5 },
    color: '#ef4444',
    data: [
      { date: 'Jan 24', value: 5.2 },
      { date: 'Mar 24', value: 5.0 },
      { date: 'Jun 24', value: 4.8 },
      { date: 'Sep 24', value: 4.7 },
      { date: 'Dec 24', value: 4.8 },
    ],
  },
  {
    id: 'ldl',
    name: 'LDL Cholesterol',
    category: 'Lipid Panel',
    unit: 'mmol/L',
    reference: { low: 0, high: 3 },
    optimal: { low: 0, high: 2.5 },
    color: '#f97316',
    data: [
      { date: 'Jan 24', value: 3.2 },
      { date: 'Mar 24', value: 3.0 },
      { date: 'Jun 24', value: 2.9 },
      { date: 'Sep 24', value: 2.8 },
      { date: 'Dec 24', value: 2.9 },
    ],
  },
  {
    id: 'hdl',
    name: 'HDL Cholesterol',
    category: 'Lipid Panel',
    unit: 'mmol/L',
    reference: { low: 1.0, high: 10 },
    optimal: { low: 1.5, high: 2.5 },
    color: '#84cc16',
    data: [
      { date: 'Jan 24', value: 1.3 },
      { date: 'Mar 24', value: 1.4 },
      { date: 'Jun 24', value: 1.5 },
      { date: 'Sep 24', value: 1.5 },
      { date: 'Dec 24', value: 1.6 },
    ],
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    category: 'Blood Count',
    unit: 'mmol/mol',
    reference: { low: 20, high: 42 },
    optimal: { low: 20, high: 36 },
    color: '#ec4899',
    data: [
      { date: 'Jan 24', value: 34 },
      { date: 'Mar 24', value: 33 },
      { date: 'Jun 24', value: 32 },
      { date: 'Sep 24', value: 32 },
      { date: 'Dec 24', value: 32 },
    ],
  },
]

const suggestedComparisons = [
  {
    name: 'Testosterone Panel',
    markers: ['testosterone', 'freeTestosterone', 'shbg'],
    description: 'Compare total and free testosterone with SHBG',
  },
  {
    name: 'Lipid Panel',
    markers: ['totalCholesterol', 'ldl', 'hdl'],
    description: 'Track cholesterol markers together',
  },
  {
    name: 'Thyroid Function',
    markers: ['tsh', 'freeT4', 'freeT3'],
    description: 'Complete thyroid hormone overview',
  },
  {
    name: 'Key Vitamins',
    markers: ['vitaminD', 'ferritin'],
    description: 'Essential vitamin and mineral levels',
  },
]

const dateRanges = [
  { id: '6m', label: '6 Months' },
  { id: '1y', label: '1 Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom' },
]

export default function BloodWorkTrendsPage() {
  const [selectedMarkers, setSelectedMarkers] = useState<string[]>(['testosterone', 'vitaminD'])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('1y')
  const [showOptimalRange, setShowOptimalRange] = useState(true)

  const categories = useMemo(() => {
    const cats = new Map<string, typeof allMarkers>()
    allMarkers.forEach((marker) => {
      const existing = cats.get(marker.category) || []
      cats.set(marker.category, [...existing, marker])
    })
    return cats
  }, [])

  const filteredMarkers = useMemo(() => {
    if (!searchQuery) return allMarkers
    return allMarkers.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const selectedMarkersData = useMemo(() => {
    return allMarkers.filter((m) => selectedMarkers.includes(m.id))
  }, [selectedMarkers])

  // Combine data for chart
  const chartData = useMemo(() => {
    if (selectedMarkersData.length === 0) return []

    const allDates = new Set<string>()
    selectedMarkersData.forEach((marker) => {
      marker.data.forEach((d) => allDates.add(d.date))
    })

    const dates = Array.from(allDates).sort((a, b) => {
      const [monthA, yearA] = a.split(' ')
      const [monthB, yearB] = b.split(' ')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return (
        parseInt(yearA) - parseInt(yearB) ||
        months.indexOf(monthA) - months.indexOf(monthB)
      )
    })

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

  const applySuggestedComparison = (markers: string[]) => {
    setSelectedMarkers(markers)
  }

  const getTrend = (marker: typeof allMarkers[0]) => {
    const data = marker.data
    if (data.length < 2) return 'stable'
    const latest = data[data.length - 1].value
    const previous = data[data.length - 2].value
    const change = ((latest - previous) / previous) * 100
    if (change > 5) return 'up'
    if (change < -5) return 'down'
    return 'stable'
  }

  const getStatus = (marker: typeof allMarkers[0]) => {
    const latest = marker.data[marker.data.length - 1].value
    if (latest < marker.reference.low) return 'low'
    if (latest > marker.reference.high) return 'high'
    if (latest >= marker.optimal.low && latest <= marker.optimal.high) return 'optimal'
    return 'normal'
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
          {/* Suggested Comparisons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <h3 className="text-sm font-semibold mb-3">Quick Comparisons</h3>
            <div className="space-y-2">
              {suggestedComparisons.map((comparison) => (
                <button
                  key={comparison.name}
                  onClick={() => applySuggestedComparison(comparison.markers)}
                  className="w-full text-left rounded-lg bg-muted/50 p-3 hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-sm">{comparison.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{comparison.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Marker Search & Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
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
              {Array.from(categories.entries()).map(([category, markers]) => {
                const filtered = markers.filter((m) =>
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
                const latestValue = marker.data[marker.data.length - 1].value
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
                      <div className="flex justify-between text-muted-foreground mt-1">
                        <span>Optimal</span>
                        <span className="font-medium text-foreground">
                          {marker.optimal.low} - {marker.optimal.high}
                        </span>
                      </div>
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
