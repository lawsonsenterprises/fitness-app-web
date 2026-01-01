'use client'

import {
  Users,
  UserCircle,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PoundSterling,
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { TopBar } from '@/components/dashboard/top-bar'
import {
  usePlatformStats,
  useSubscriptionStats,
  usePlatformAnalytics,
} from '@/hooks/admin'

// Subscription breakdown colors
const SUBSCRIPTION_COLORS = {
  professional: '#22c55e',
  starter: '#f59e0b',
  enterprise: '#6366f1',
  free: '#94a3b8',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function AdminDashboardPage() {
  const { user, displayName } = useAuth()
  const firstName = displayName?.split(' ')[0] || user?.user_metadata?.first_name || 'Admin'

  // Fetch real data
  const { data: platformStats, isLoading: statsLoading, error: statsError } = usePlatformStats()
  const { data: subscriptionStats, isLoading: subStatsLoading } = useSubscriptionStats()
  const { data: analytics, isLoading: analyticsLoading } = usePlatformAnalytics(90)

  const isLoading = statsLoading || subStatsLoading || analyticsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Dashboard" />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="min-h-screen">
        <TopBar title="Dashboard" />
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  // Prepare chart data from analytics
  const userGrowthData = analytics?.dauData?.slice(-6).map(d => ({
    month: new Date(d.date).toLocaleDateString('en-GB', { month: 'short' }),
    dau: d.dau,
  })) || []

  // Subscription breakdown for pie chart
  const subscriptionBreakdown = [
    { name: 'Professional', value: platformStats?.activeSubscriptions || 0, color: SUBSCRIPTION_COLORS.professional },
  ]

  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" />

      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {getGreeting()}, {firstName}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Platform overview and key metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Coaches"
            value={platformStats?.totalCoaches || 0}
            change={0}
            changeLabel="all time"
            color="amber"
            subLabel={`${platformStats?.activeCoaches || 0} active this week`}
          />
          <StatCard
            icon={UserCircle}
            label="Total Athletes"
            value={(platformStats?.totalAthletes || 0).toLocaleString()}
            change={0}
            changeLabel="all time"
            color="blue"
            subLabel={`${platformStats?.activeAthletes || 0} active this week`}
          />
          <StatCard
            icon={CreditCard}
            label="Active Subscriptions"
            value={subscriptionStats?.activeSubscriptions || 0}
            change={0}
            changeLabel="currently"
            color="green"
            subLabel={`${subscriptionStats?.cancelledLast30Days || 0} cancelled (30d)`}
          />
          <StatCard
            icon={PoundSterling}
            label="Monthly Revenue"
            value={`£${(subscriptionStats?.mrr || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={0}
            changeLabel="MRR"
            color="purple"
            subLabel={`${subscriptionStats?.churnRate || 0}% churn rate`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Active Users Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Daily Active Users (Last 90 Days)</h2>
            <div className="h-[300px]">
              {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
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
                  <p>No activity data yet</p>
                </div>
              )}
            </div>
            {analytics?.avgDau !== undefined && (
              <p className="mt-4 text-sm text-muted-foreground">
                Average: {analytics.avgDau} users/day
              </p>
            )}
          </motion.div>

          {/* Platform Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Platform Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">Coaches</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{platformStats?.totalCoaches || 0}</p>
                  <p className="text-xs text-muted-foreground">{platformStats?.activeCoaches || 0} active</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Athletes</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{platformStats?.totalAthletes || 0}</p>
                  <p className="text-xs text-muted-foreground">{platformStats?.activeAthletes || 0} active</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Subscriptions</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{subscriptionStats?.activeSubscriptions || 0}</p>
                  <p className="text-xs text-muted-foreground">active plans</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                <div className="flex items-center gap-3">
                  <PoundSterling className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">MRR</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">£{(subscriptionStats?.mrr || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{subscriptionStats?.churnRate || 0}% churn</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <a
              href="/admin/coaches"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
            >
              <Users className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Manage Coaches</p>
                <p className="text-xs text-muted-foreground">{platformStats?.totalCoaches || 0} total</p>
              </div>
            </a>
            <a
              href="/admin/athletes"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
            >
              <UserCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Manage Athletes</p>
                <p className="text-xs text-muted-foreground">{platformStats?.totalAthletes || 0} total</p>
              </div>
            </a>
            <a
              href="/admin/subscriptions"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-green-500/30 hover:bg-green-500/5 transition-all"
            >
              <CreditCard className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Subscriptions</p>
                <p className="text-xs text-muted-foreground">{subscriptionStats?.activeSubscriptions || 0} active</p>
              </div>
            </a>
            <a
              href="/admin/support"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-red-500/30 hover:bg-red-500/5 transition-all"
            >
              <TrendingUp className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">Support Tickets</p>
                <p className="text-xs text-muted-foreground">View all tickets</p>
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  change: number
  changeLabel: string
  color: 'amber' | 'blue' | 'green' | 'purple'
  subLabel?: string
  isPercentage?: boolean
}

function StatCard({ icon: Icon, label, value, change, changeLabel, color, subLabel, isPercentage }: StatCardProps) {
  const colorClasses = {
    amber: 'bg-amber-500/10 text-amber-600',
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-green-500/10 text-green-600',
    purple: 'bg-purple-500/10 text-purple-600',
  }

  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between">
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== 0 && (
          <div className={cn(
            'flex items-center gap-1 text-sm',
            isPositive ? 'text-green-500' : 'text-red-500'
          )}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{isPercentage ? `${change}%` : `${isPositive ? '+' : ''}${change}`}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mt-4">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      {subLabel ? (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{subLabel}</p>
      ) : (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{changeLabel}</p>
      )}
    </motion.div>
  )
}
