'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { cn } from '@/lib/utils'

// Mock data
const mockDailyActiveUsers = [
  { date: 'Mon', coaches: 85, athletes: 1250 },
  { date: 'Tue', coaches: 92, athletes: 1340 },
  { date: 'Wed', coaches: 88, athletes: 1280 },
  { date: 'Thu', coaches: 95, athletes: 1420 },
  { date: 'Fri', coaches: 90, athletes: 1380 },
  { date: 'Sat', coaches: 45, athletes: 820 },
  { date: 'Sun', coaches: 38, athletes: 680 },
]

const mockCheckInTrends = [
  { week: 'W1', submitted: 450, reviewed: 420 },
  { week: 'W2', submitted: 480, reviewed: 465 },
  { week: 'W3', submitted: 520, reviewed: 505 },
  { week: 'W4', submitted: 495, reviewed: 488 },
]

const mockRetention = [
  { month: 'Jul', retention: 92 },
  { month: 'Aug', retention: 94 },
  { month: 'Sep', retention: 91 },
  { month: 'Oct', retention: 95 },
  { month: 'Nov', retention: 93 },
  { month: 'Dec', retention: 96 },
]

const mockFeatureUsage = [
  { name: 'Check-ins', usage: 95 },
  { name: 'Messaging', usage: 88 },
  { name: 'Programmes', usage: 82 },
  { name: 'Meal Plans', usage: 65 },
  { name: 'Blood Work', usage: 42 },
]

const mockGeography = [
  { region: 'UK', value: 65, color: '#f59e0b' },
  { region: 'USA', value: 20, color: '#6366f1' },
  { region: 'Europe', value: 10, color: '#22c55e' },
  { region: 'Other', value: 5, color: '#94a3b8' },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Platform usage and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                timeRange === range
                  ? 'bg-foreground text-background'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <MetricCard
          icon={Activity}
          label="Daily Active Users"
          value="1,842"
          change="+12.5%"
          positive
        />
        <MetricCard
          icon={Users}
          label="Coach Retention"
          value="96%"
          change="+2%"
          positive
        />
        <MetricCard
          icon={BarChart3}
          label="Avg Session Duration"
          value="12m 34s"
          change="+8%"
          positive
        />
        <MetricCard
          icon={TrendingUp}
          label="Check-in Rate"
          value="89%"
          change="-2%"
          positive={false}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Daily Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Daily Active Users</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDailyActiveUsers} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="coachGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="athleteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                />
                <Area
                  type="monotone"
                  dataKey="athletes"
                  stroke="#6366f1"
                  fill="url(#athleteGradient)"
                  name="Athletes"
                />
                <Area
                  type="monotone"
                  dataKey="coaches"
                  stroke="#f59e0b"
                  fill="url(#coachGradient)"
                  name="Coaches"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Retention Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Coach Retention Rate</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRetention} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  domain={[85, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value}%`, 'Retention']}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Feature Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Feature Usage</h2>
          <div className="space-y-4">
            {mockFeatureUsage.map((feature) => (
              <div key={feature.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{feature.name}</span>
                  <span className="text-sm text-muted-foreground">{feature.usage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Check-in Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Check-in Activity</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCheckInTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="week"
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
                />
                <Bar dataKey="submitted" name="Submitted" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reviewed" name="Reviewed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Geography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Users by Region</h2>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockGeography}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {mockGeography.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {mockGeography.map((item) => (
              <div key={item.region} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.region}: {item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  change: string
  positive: boolean
}

function MetricCard({ icon: Icon, label, value, change, positive }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold">{value}</p>
        <span className={cn(
          'text-sm font-medium',
          positive ? 'text-green-500' : 'text-red-500'
        )}>
          {change}
        </span>
      </div>
    </motion.div>
  )
}
