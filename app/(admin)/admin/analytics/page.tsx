'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
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
import { TopBar } from '@/components/dashboard/top-bar'
import {
  usePlatformStats,
  usePlatformAnalytics,
  useSubscriptionStats,
} from '@/hooks/admin'

// Color palette for charts
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#f59e0b',
  success: '#22c55e',
  muted: '#94a3b8',
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Map time range to days
  const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
  const days = daysMap[timeRange]

  // Fetch real data
  const { data: platformStats, isLoading: statsLoading, error: statsError } = usePlatformStats()
  const { data: analytics, isLoading: analyticsLoading } = usePlatformAnalytics(days)
  const { data: subStats, isLoading: subStatsLoading } = useSubscriptionStats()

  const isLoading = statsLoading || analyticsLoading || subStatsLoading

  if (isLoading) {
    return (
      <>
        <TopBar title="Analytics" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (statsError) {
    return (
      <>
        <TopBar title="Analytics" />
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </>
    )
  }

  // Prepare DAU chart data
  const dauChartData = analytics?.dauData?.slice(-30).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    dau: d.dau,
  })) || []

  // Calculate metrics
  const totalUsers = (platformStats?.totalCoaches || 0) + (platformStats?.totalAthletes || 0)
  const activeUsers = (platformStats?.activeCoaches || 0) + (platformStats?.activeAthletes || 0)
  const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0'

  // User breakdown for pie chart
  const userBreakdown = [
    { name: 'Coaches', value: platformStats?.totalCoaches || 0, color: CHART_COLORS.secondary },
    { name: 'Athletes', value: platformStats?.totalAthletes || 0, color: CHART_COLORS.primary },
  ]

  // Active vs Inactive breakdown
  const activityBreakdown = [
    { name: 'Active (7d)', value: activeUsers, color: CHART_COLORS.success },
    { name: 'Inactive', value: totalUsers - activeUsers, color: CHART_COLORS.muted },
  ]

  return (
    <>
      <TopBar title="Analytics" />
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
            label="Daily Active Users (Avg)"
            value={analytics?.avgDau?.toString() || '0'}
            subLabel={`Based on last ${days} days`}
          />
          <MetricCard
            icon={Users}
            label="Total Users"
            value={totalUsers.toLocaleString()}
            subLabel={`${platformStats?.totalCoaches || 0} coaches, ${platformStats?.totalAthletes || 0} athletes`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Active Rate"
            value={`${activeRate}%`}
            subLabel={`${activeUsers} active in last 7 days`}
            positive={Number(activeRate) > 50}
          />
          <MetricCard
            icon={BarChart3}
            label="Churn Rate"
            value={`${subStats?.churnRate || 0}%`}
            subLabel={`${subStats?.cancelledLast30Days || 0} cancelled (30d)`}
            positive={Number(subStats?.churnRate || 0) < 5}
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
              {dauChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dauChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
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
                      formatter={(value) => [value, 'Active Users']}
                    />
                    <Area
                      type="monotone"
                      dataKey="dau"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#dauGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No activity data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* User Composition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">User Composition</h2>
            <div className="h-[250px] flex items-center justify-center">
              {totalUsers > 0 ? (
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie
                        data={userBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {userBreakdown.map((entry, index) => (
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
                  <div className="space-y-3">
                    {userBreakdown.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.value.toLocaleString()} ({totalUsers > 0 ? ((item.value / totalUsers) * 100).toFixed(1) : 0}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No users yet</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Activity Status</h2>
            <div className="h-[150px]">
              {totalUsers > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {activityBreakdown.map((entry, index) => (
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No users yet</p>
                </div>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {activityBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Platform Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Platform Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10">
                <span className="text-sm font-medium">Coaches</span>
                <div className="text-right">
                  <p className="font-bold">{platformStats?.totalCoaches || 0}</p>
                  <p className="text-xs text-muted-foreground">{platformStats?.activeCoaches || 0} active</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10">
                <span className="text-sm font-medium">Athletes</span>
                <div className="text-right">
                  <p className="font-bold">{platformStats?.totalAthletes || 0}</p>
                  <p className="text-xs text-muted-foreground">{platformStats?.activeAthletes || 0} active</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <span className="text-sm font-medium">Subscriptions</span>
                <div className="text-right">
                  <p className="font-bold">{subStats?.activeSubscriptions || 0}</p>
                  <p className="text-xs text-muted-foreground">active plans</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subscription Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Subscription Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Active Subscriptions</span>
                  <span className="text-sm text-green-500 font-bold">{subStats?.activeSubscriptions || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Cancelled (30d)</span>
                  <span className="text-sm text-red-500 font-bold">{subStats?.cancelledLast30Days || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${(subStats?.activeSubscriptions || 0) > 0
                        ? ((subStats?.cancelledLast30Days || 0) / (subStats?.activeSubscriptions || 1)) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">MRR</span>
                  <span className="text-lg font-bold">£{(subStats?.mrr || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  subLabel: string
  positive?: boolean
}

function MetricCard({ icon: Icon, label, value, subLabel, positive }: MetricCardProps) {
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
        <p className={cn(
          'text-2xl font-bold',
          positive === true && 'text-green-500',
          positive === false && 'text-red-500'
        )}>{value}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>
    </motion.div>
  )
}
