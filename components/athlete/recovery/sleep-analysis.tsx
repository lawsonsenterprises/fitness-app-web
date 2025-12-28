'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Moon,
  Sun,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SleepData {
  date: Date
  duration: number // hours
  quality: number // 1-100
  deepSleep?: number // hours
  remSleep?: number // hours
  lightSleep?: number // hours
  awakeTime?: number // minutes
  bedtime?: string
  wakeTime?: string
}

interface SleepAnalysisProps {
  data: SleepData[]
  targetSleep?: number
}

const qualityColors = {
  excellent: '#10b981',
  good: '#3b82f6',
  fair: '#f59e0b',
  poor: '#ef4444',
}

function getQualityLabel(quality: number): keyof typeof qualityColors {
  if (quality >= 80) return 'excellent'
  if (quality >= 60) return 'good'
  if (quality >= 40) return 'fair'
  return 'poor'
}

export function SleepAnalysis({ data, targetSleep = 8 }: SleepAnalysisProps) {

  // Sort data by date
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-7) // Last 7 days
  }, [data])

  // Chart data
  const chartData = useMemo(() => {
    return sortedData.map(d => ({
      ...d,
      dayStr: d.date.toLocaleDateString('en-GB', { weekday: 'short' }),
      color: qualityColors[getQualityLabel(d.quality)],
    }))
  }, [sortedData])

  // Calculate stats
  const stats = useMemo(() => {
    if (sortedData.length === 0) return null

    const durations = sortedData.map(d => d.duration)
    const qualities = sortedData.map(d => d.quality)
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const avgQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length
    const weekChange = durations.length >= 2
      ? durations[durations.length - 1] - durations[0]
      : 0

    return {
      avgDuration: avgDuration.toFixed(1),
      avgQuality: Math.round(avgQuality),
      weekChange,
      metTarget: avgDuration >= targetSleep,
      nightsBelowTarget: durations.filter(d => d < targetSleep).length,
    }
  }, [sortedData, targetSleep])

  // Last night details
  const lastNight = sortedData[sortedData.length - 1]

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <Moon className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No sleep data yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Connect your sleep tracker or log sleep manually
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-violet-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Moon className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Avg Sleep</span>
            </div>
            <p className="text-xl font-bold">{stats.avgDuration}h</p>
            <p className={cn(
              'text-xs',
              stats.metTarget ? 'text-emerald-600' : 'text-amber-600'
            )}>
              Target: {targetSleep}h
            </p>
          </div>

          <div className="rounded-xl bg-blue-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Avg Quality</span>
            </div>
            <p className="text-xl font-bold">{stats.avgQuality}%</p>
            <p className="text-xs text-muted-foreground">
              {getQualityLabel(stats.avgQuality)}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              {stats.weekChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : stats.weekChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">Trend</span>
            </div>
            <p className={cn(
              'text-xl font-bold',
              stats.weekChange > 0 ? 'text-emerald-600' : stats.weekChange < 0 ? 'text-rose-600' : ''
            )}>
              {stats.weekChange > 0 ? '+' : ''}{stats.weekChange.toFixed(1)}h
            </p>
            <p className="text-xs text-muted-foreground">this week</p>
          </div>

          <div className="rounded-xl bg-amber-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Below Target</span>
            </div>
            <p className="text-xl font-bold">{stats.nightsBelowTarget}</p>
            <p className="text-xs text-muted-foreground">nights this week</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold mb-4">Weekly Sleep Duration</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="dayStr"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                domain={[0, 12]}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => [`${value ?? 0}h`, 'Sleep']}
              />
              {/* Target line */}
              <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs">
          {Object.entries(qualityColors).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize text-muted-foreground">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Last night details */}
      {lastNight && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-4">Last Night</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {lastNight.bedtime && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Moon className="h-3 w-3" /> Bedtime
                </p>
                <p className="font-semibold mt-1">{lastNight.bedtime}</p>
              </div>
            )}
            {lastNight.wakeTime && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sun className="h-3 w-3" /> Wake Time
                </p>
                <p className="font-semibold mt-1">{lastNight.wakeTime}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-semibold mt-1">{lastNight.duration}h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quality</p>
              <p className="font-semibold mt-1">{lastNight.quality}%</p>
            </div>
          </div>

          {/* Sleep stages */}
          {(lastNight.deepSleep || lastNight.remSleep || lastNight.lightSleep) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium mb-3">Sleep Stages</p>
              <div className="flex h-4 rounded-full overflow-hidden">
                {lastNight.deepSleep && (
                  <div
                    className="bg-indigo-500"
                    style={{ width: `${(lastNight.deepSleep / lastNight.duration) * 100}%` }}
                    title={`Deep: ${lastNight.deepSleep}h`}
                  />
                )}
                {lastNight.remSleep && (
                  <div
                    className="bg-violet-500"
                    style={{ width: `${(lastNight.remSleep / lastNight.duration) * 100}%` }}
                    title={`REM: ${lastNight.remSleep}h`}
                  />
                )}
                {lastNight.lightSleep && (
                  <div
                    className="bg-blue-400"
                    style={{ width: `${(lastNight.lightSleep / lastNight.duration) * 100}%` }}
                    title={`Light: ${lastNight.lightSleep}h`}
                  />
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {lastNight.deepSleep && <span>Deep: {lastNight.deepSleep}h</span>}
                {lastNight.remSleep && <span>REM: {lastNight.remSleep}h</span>}
                {lastNight.lightSleep && <span>Light: {lastNight.lightSleep}h</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export type { SleepData }
