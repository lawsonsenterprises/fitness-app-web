'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Target,
  Camera,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock data
const mockWeightData = [
  { date: 'Nov 1', weight: 78.5 },
  { date: 'Nov 8', weight: 78.2 },
  { date: 'Nov 15', weight: 77.9 },
  { date: 'Nov 22', weight: 77.5 },
  { date: 'Nov 29', weight: 77.1 },
  { date: 'Dec 6', weight: 76.8 },
  { date: 'Dec 13', weight: 76.5 },
  { date: 'Dec 20', weight: 76.2 },
]

const mockMeasurements = [
  { name: 'Chest', current: 104, previous: 103, unit: 'cm' },
  { name: 'Waist', current: 82, previous: 84, unit: 'cm' },
  { name: 'Hips', current: 98, previous: 99, unit: 'cm' },
  { name: 'Arms', current: 38, previous: 37.5, unit: 'cm' },
  { name: 'Thighs', current: 62, previous: 61, unit: 'cm' },
]

const mockPhotos = [
  { date: '2024-12-20', hasPhotos: true },
  { date: '2024-12-13', hasPhotos: true },
  { date: '2024-12-06', hasPhotos: true },
  { date: '2024-11-29', hasPhotos: false },
  { date: '2024-11-22', hasPhotos: true },
]

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m')
  const [photoIndex, setPhotoIndex] = useState(0)

  const startWeight = mockWeightData[0].weight
  const currentWeight = mockWeightData[mockWeightData.length - 1].weight
  const weightChange = currentWeight - startWeight

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Progress</h1>
        <p className="mt-1 text-muted-foreground">
          Track your body composition and visual progress
        </p>
      </div>

      {/* Weight Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4 mb-6"
      >
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Scale className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Current</span>
          </div>
          <p className="text-2xl font-bold">{currentWeight}kg</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Target</span>
          </div>
          <p className="text-2xl font-bold">74.0kg</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            {weightChange < 0 ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-xs font-medium uppercase tracking-wider">Change</span>
          </div>
          <p className={cn('text-2xl font-bold', weightChange < 0 ? 'text-green-500' : 'text-amber-500')}>
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">To Go</span>
          </div>
          <p className="text-2xl font-bold">{(currentWeight - 74).toFixed(1)}kg</p>
        </div>
      </motion.div>

      {/* Weight Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <h2 className="text-lg font-semibold">Weight Trend</h2>
          <div className="flex gap-2">
            {(['1m', '3m', '6m', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                  timeRange === range
                    ? 'bg-foreground text-background'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockWeightData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#weightGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Measurements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Measurements</h2>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <div className="space-y-4">
            {mockMeasurements.map((measurement) => {
              const change = measurement.current - measurement.previous
              return (
                <div key={measurement.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{measurement.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{measurement.current}{measurement.unit}</span>
                    <span className={cn(
                      'text-sm',
                      change > 0 ? 'text-green-500' : change < 0 ? 'text-amber-500' : 'text-muted-foreground'
                    )}>
                      {change > 0 ? '+' : ''}{change.toFixed(1)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Progress Photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Progress Photos</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Camera className="h-4 w-4" />
              Add Photos
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
              disabled={photoIndex === 0}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex-1 grid grid-cols-3 gap-2">
              {['Front', 'Side', 'Back'].map((view) => (
                <div
                  key={view}
                  className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center"
                >
                  <div className="text-center">
                    <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                    <span className="text-xs text-muted-foreground mt-1 block">{view}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhotoIndex(Math.min(mockPhotos.length - 1, photoIndex + 1))}
              disabled={photoIndex === mockPhotos.length - 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {new Date(mockPhotos[photoIndex].date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
