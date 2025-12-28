'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Droplets,
  Upload,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
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
  ReferenceLine,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock blood work data
const mockBloodTests = [
  {
    id: '1',
    date: '2024-12-15',
    lab: 'Medichecks',
    status: 'reviewed',
    markers: 12,
    flagged: 1,
    summary: 'Overall healthy. Vitamin D slightly low.',
  },
  {
    id: '2',
    date: '2024-09-20',
    lab: 'Medichecks',
    status: 'reviewed',
    markers: 12,
    flagged: 2,
    summary: 'Ferritin and Vitamin D below optimal.',
  },
  {
    id: '3',
    date: '2024-06-12',
    lab: 'Forth Edge',
    status: 'reviewed',
    markers: 10,
    flagged: 0,
    summary: 'All markers within optimal range.',
  },
]

const mockKeyMarkers = [
  {
    name: 'Testosterone',
    current: 22.5,
    unit: 'nmol/L',
    reference: { low: 8.64, high: 29 },
    optimal: { low: 15, high: 25 },
    trend: 'up',
    status: 'optimal',
  },
  {
    name: 'Free Testosterone',
    current: 0.42,
    unit: 'nmol/L',
    reference: { low: 0.2, high: 0.62 },
    optimal: { low: 0.3, high: 0.5 },
    trend: 'stable',
    status: 'optimal',
  },
  {
    name: 'Vitamin D',
    current: 65,
    unit: 'nmol/L',
    reference: { low: 50, high: 175 },
    optimal: { low: 100, high: 150 },
    trend: 'down',
    status: 'low',
  },
  {
    name: 'Ferritin',
    current: 95,
    unit: 'ug/L',
    reference: { low: 30, high: 400 },
    optimal: { low: 100, high: 150 },
    trend: 'up',
    status: 'borderline',
  },
  {
    name: 'HbA1c',
    current: 32,
    unit: 'mmol/mol',
    reference: { low: 20, high: 42 },
    optimal: { low: 20, high: 36 },
    trend: 'stable',
    status: 'optimal',
  },
  {
    name: 'TSH',
    current: 1.8,
    unit: 'mU/L',
    reference: { low: 0.27, high: 4.2 },
    optimal: { low: 0.5, high: 2.5 },
    trend: 'stable',
    status: 'optimal',
  },
]

const mockTrendData = [
  { date: 'Jun 24', testosterone: 20.1, vitaminD: 95, ferritin: 72 },
  { date: 'Sep 24', testosterone: 21.2, vitaminD: 78, ferritin: 85 },
  { date: 'Dec 24', testosterone: 22.5, vitaminD: 65, ferritin: 95 },
]

export default function BloodWorkPage() {
  const [selectedMarker, setSelectedMarker] = useState<'testosterone' | 'vitaminD' | 'ferritin'>('testosterone')

  const markerConfig = {
    testosterone: { color: '#22c55e', label: 'Testosterone', unit: 'nmol/L', optimalLow: 15, optimalHigh: 25 },
    vitaminD: { color: '#f59e0b', label: 'Vitamin D', unit: 'nmol/L', optimalLow: 100, optimalHigh: 150 },
    ferritin: { color: '#8b5cf6', label: 'Ferritin', unit: 'ug/L', optimalLow: 100, optimalHigh: 150 },
  }

  const config = markerConfig[selectedMarker]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Blood Work</h1>
          <p className="mt-1 text-muted-foreground">
            Track your biomarkers and health trends
          </p>
        </div>
        <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
          <Upload className="h-4 w-4" />
          Upload Results
        </Button>
      </div>

      {/* Key Markers Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Key Markers</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockKeyMarkers.map((marker) => (
            <div
              key={marker.name}
              className={cn(
                'rounded-xl border bg-card p-4',
                marker.status === 'low' && 'border-amber-500/50',
                marker.status === 'high' && 'border-red-500/50',
                marker.status === 'optimal' && 'border-border',
                marker.status === 'borderline' && 'border-yellow-500/50'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{marker.name}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold">{marker.current}</span>
                    <span className="text-sm text-muted-foreground">{marker.unit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {marker.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {marker.trend === 'down' && <TrendingDown className="h-4 w-4 text-amber-500" />}
                  {marker.trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}

                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    marker.status === 'optimal' && 'bg-green-500/10',
                    marker.status === 'low' && 'bg-amber-500/10',
                    marker.status === 'high' && 'bg-red-500/10',
                    marker.status === 'borderline' && 'bg-yellow-500/10'
                  )}>
                    {marker.status === 'optimal' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {(marker.status === 'low' || marker.status === 'borderline') && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {marker.status === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              </div>

              {/* Reference Range Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{marker.reference.low}</span>
                  <span className="text-green-500">Optimal: {marker.optimal.low}-{marker.optimal.high}</span>
                  <span>{marker.reference.high}</span>
                </div>
                <div className="relative h-2 rounded-full bg-gradient-to-r from-amber-500 via-green-500 to-amber-500 overflow-hidden">
                  {/* Current value indicator */}
                  <div
                    className="absolute top-0 h-full w-1 bg-foreground rounded-full"
                    style={{
                      left: `${((marker.current - marker.reference.low) / (marker.reference.high - marker.reference.low)) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <h2 className="text-lg font-semibold">Marker Trends</h2>
          <div className="flex gap-2">
            {Object.entries(markerConfig).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedMarker(key as typeof selectedMarker)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  selectedMarker === key
                    ? 'bg-foreground text-background'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              {/* Optimal range reference */}
              <ReferenceLine
                y={config.optimalLow}
                stroke={config.color}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={config.optimalHigh}
                stroke={config.color}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <Line
                type="monotone"
                dataKey={selectedMarker}
                stroke={config.color}
                strokeWidth={3}
                dot={{ fill: config.color, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: config.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: config.color }} />
            {config.label} ({config.unit})
          </span>
          <span className="flex items-center gap-2">
            <div className="w-6 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: config.color, opacity: 0.5 }} />
            Optimal range
          </span>
        </div>
      </motion.div>

      {/* Test History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Test History</h2>
        </div>

        <div className="divide-y divide-border">
          {mockBloodTests.map((test) => (
            <Link
              key={test.id}
              href={`/athlete/blood-work/${test.id}`}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <Droplets className="h-6 w-6 text-red-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {new Date(test.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <span className="text-xs text-muted-foreground">• {test.lab}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{test.summary}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{test.markers} markers</p>
                  {test.flagged > 0 && (
                    <p className="text-xs text-amber-500">{test.flagged} flagged</p>
                  )}
                </div>

                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  test.status === 'reviewed' && 'bg-green-500/10 text-green-600'
                )}>
                  Reviewed
                </span>

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
