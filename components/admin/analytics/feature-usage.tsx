'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
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
  Activity,
  Dumbbell,
  Utensils,
  Droplet,
  MessageSquare,
  Scale,
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureData {
  name: string
  key: string
  usage: number // percentage of users
  sessions: number // total sessions
  changeFromLastPeriod: number // percentage change
}

interface FeatureUsageProps {
  features: FeatureData[]
}

const featureIcons: Record<string, typeof Activity> = {
  check_ins: Activity,
  training: Dumbbell,
  nutrition: Utensils,
  blood_work: Droplet,
  messages: MessageSquare,
  weight_logging: Scale,
  goals: Target,
  programmes: Calendar,
}

const featureColors: Record<string, string> = {
  check_ins: '#3b82f6',
  training: '#f97316',
  nutrition: '#10b981',
  blood_work: '#ef4444',
  messages: '#8b5cf6',
  weight_logging: '#06b6d4',
  goals: '#f59e0b',
  programmes: '#ec4899',
}

export function FeatureUsage({ features }: FeatureUsageProps) {
  // Sort by usage
  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => b.usage - a.usage)
  }, [features])

  // Prepare chart data
  const chartData = useMemo(() => {
    return sortedFeatures.map((f) => ({
      ...f,
      color: featureColors[f.key] || '#6b7280',
    }))
  }, [sortedFeatures])

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="font-semibold">Feature Adoption</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Usage across platform features
        </p>
      </div>

      {/* Feature list with progress bars */}
      <div className="space-y-4 mb-6">
        {sortedFeatures.map((feature, index) => {
          const Icon = featureIcons[feature.key] || Activity
          const color = featureColors[feature.key] || '#6b7280'

          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <span className="font-medium text-sm">{feature.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{feature.usage}%</span>
                  <div className="flex items-center gap-1">
                    {feature.changeFromLastPeriod >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-rose-500" />
                    )}
                    <span className={cn(
                      'text-xs',
                      feature.changeFromLastPeriod >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {feature.changeFromLastPeriod >= 0 ? '+' : ''}
                      {feature.changeFromLastPeriod.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${feature.usage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{feature.sessions.toLocaleString()} sessions</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Bar chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 80, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}%`, 'Usage']}
            />
            <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export type { FeatureData, FeatureUsageProps }
