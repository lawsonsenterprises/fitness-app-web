'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Zap,
  Server,
  Database,
  AlertTriangle,
  Check,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceDataPoint {
  timestamp: string
  apiLatencyP50: number // ms
  apiLatencyP95: number // ms
  apiLatencyP99: number // ms
  dbQueryTime: number // ms
  errorRate: number // percentage
  uptime: number // percentage
}

interface PerformanceMetricsProps {
  data: PerformanceDataPoint[]
  currentUptime: number
  lastIncident?: Date
}

export function PerformanceMetrics({
  data,
  currentUptime,
  lastIncident,
}: PerformanceMetricsProps) {
  // Calculate current stats
  const stats = useMemo(() => {
    if (data.length === 0) return null

    const latest = data[data.length - 1]
    const avgLatency = data.reduce((sum, d) => sum + d.apiLatencyP50, 0) / data.length
    const avgDbTime = data.reduce((sum, d) => sum + d.dbQueryTime, 0) / data.length
    const avgErrorRate = data.reduce((sum, d) => sum + d.errorRate, 0) / data.length

    return {
      current: latest,
      avgLatency: Math.round(avgLatency),
      avgDbTime: Math.round(avgDbTime),
      avgErrorRate: avgErrorRate.toFixed(2),
    }
  }, [data])

  const getLatencyStatus = (latency: number) => {
    if (latency < 100) return { label: 'Excellent', color: 'text-emerald-600' }
    if (latency < 200) return { label: 'Good', color: 'text-blue-600' }
    if (latency < 500) return { label: 'Fair', color: 'text-amber-600' }
    return { label: 'Slow', color: 'text-rose-600' }
  }

  const getUptimeStatus = (uptime: number) => {
    if (uptime >= 99.9) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-500/10' }
    if (uptime >= 99) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-500/10' }
    if (uptime >= 95) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-500/10' }
    return { label: 'Poor', color: 'text-rose-600', bg: 'bg-rose-500/10' }
  }

  const uptimeStatus = getUptimeStatus(currentUptime)

  return (
    <div className="space-y-6">
      {/* Status overview */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">System Status</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Uptime */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('rounded-lg p-4', uptimeStatus.bg)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Check className={cn('h-4 w-4', uptimeStatus.color)} />
              <span className="text-xs text-muted-foreground">Uptime</span>
            </div>
            <p className="text-2xl font-bold">{currentUptime.toFixed(2)}%</p>
            <p className={cn('text-xs', uptimeStatus.color)}>{uptimeStatus.label}</p>
          </motion.div>

          {/* API Latency */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg bg-blue-500/10 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">API Latency (P50)</span>
              </div>
              <p className="text-2xl font-bold">{stats.current.apiLatencyP50}ms</p>
              <p className={cn('text-xs', getLatencyStatus(stats.current.apiLatencyP50).color)}>
                {getLatencyStatus(stats.current.apiLatencyP50).label}
              </p>
            </motion.div>
          )}

          {/* DB Query Time */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-lg bg-violet-500/10 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-violet-500" />
                <span className="text-xs text-muted-foreground">DB Query Time</span>
              </div>
              <p className="text-2xl font-bold">{stats.current.dbQueryTime}ms</p>
              <p className="text-xs text-muted-foreground">Avg: {stats.avgDbTime}ms</p>
            </motion.div>
          )}

          {/* Error Rate */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                'rounded-lg p-4',
                stats.current.errorRate > 1 ? 'bg-rose-500/10' : 'bg-emerald-500/10'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={cn(
                  'h-4 w-4',
                  stats.current.errorRate > 1 ? 'text-rose-500' : 'text-emerald-500'
                )} />
                <span className="text-xs text-muted-foreground">Error Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.current.errorRate.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground">Avg: {stats.avgErrorRate}%</p>
            </motion.div>
          )}
        </div>

        {/* Last incident */}
        {lastIncident && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last incident: {lastIncident.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
          </div>
        )}
      </div>

      {/* Latency chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">API Response Times</h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value}ms`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  `${value}ms`,
                  name.replace('apiLatency', ''),
                ]}
              />
              <Line
                type="monotone"
                dataKey="apiLatencyP50"
                name="P50"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="apiLatencyP95"
                name="P95"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="apiLatencyP99"
                name="P99"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {[
            { label: 'P50 (Median)', color: '#3b82f6' },
            { label: 'P95', color: '#f59e0b' },
            { label: 'P99', color: '#ef4444' },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export type { PerformanceDataPoint, PerformanceMetricsProps }
