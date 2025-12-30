'use client'

import {
  Users,
  UserCircle,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PoundSterling,
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

// Mock data
const mockStats = {
  totalCoaches: 127,
  coachesChange: 12,
  totalAthletes: 1842,
  athletesChange: 156,
  activeSubscriptions: 98,
  subscriptionsChange: 8,
  monthlyRevenue: 24750,
  revenueChange: 18.5,
}

const mockRevenueData = [
  { month: 'Jul', revenue: 18500 },
  { month: 'Aug', revenue: 19200 },
  { month: 'Sep', revenue: 20100 },
  { month: 'Oct', revenue: 21800 },
  { month: 'Nov', revenue: 23200 },
  { month: 'Dec', revenue: 24750 },
]

const mockUserGrowth = [
  { month: 'Jul', coaches: 95, athletes: 1200 },
  { month: 'Aug', coaches: 102, athletes: 1380 },
  { month: 'Sep', coaches: 108, athletes: 1520 },
  { month: 'Oct', coaches: 115, athletes: 1650 },
  { month: 'Nov', coaches: 121, athletes: 1780 },
  { month: 'Dec', coaches: 127, athletes: 1842 },
]

const mockSubscriptionBreakdown = [
  { name: 'Pro Monthly', value: 45, color: '#f59e0b' },
  { name: 'Pro Annual', value: 32, color: '#22c55e' },
  { name: 'Enterprise', value: 15, color: '#6366f1' },
  { name: 'Trial', value: 8, color: '#94a3b8' },
]

const mockRecentActivity = [
  { id: '1', type: 'coach_signup', name: 'James Wilson', time: '5 min ago' },
  { id: '2', type: 'subscription', name: 'Sarah Parker upgraded to Pro', time: '12 min ago' },
  { id: '3', type: 'athlete_signup', name: '3 new athletes joined', time: '25 min ago' },
  { id: '4', type: 'payment', name: '£450 payment received', time: '1 hour ago' },
  { id: '5', type: 'coach_signup', name: 'Mike Thompson', time: '2 hours ago' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function AdminDashboardPage() {
  const { user, displayName } = useAuth()
  const firstName = displayName || user?.user_metadata?.first_name || 'Admin'

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
          value={mockStats.totalCoaches}
          change={mockStats.coachesChange}
          changeLabel="this month"
          color="amber"
        />
        <StatCard
          icon={UserCircle}
          label="Total Athletes"
          value={mockStats.totalAthletes.toLocaleString()}
          change={mockStats.athletesChange}
          changeLabel="this month"
          color="blue"
        />
        <StatCard
          icon={CreditCard}
          label="Active Subscriptions"
          value={mockStats.activeSubscriptions}
          change={mockStats.subscriptionsChange}
          changeLabel="this month"
          color="green"
        />
        <StatCard
          icon={PoundSterling}
          label="Monthly Revenue"
          value={`£${mockStats.monthlyRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={mockStats.revenueChange}
          changeLabel="vs last month"
          color="purple"
          isPercentage
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                  tickFormatter={(value) => `£${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`£${Number(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subscription Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockSubscriptionBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {mockSubscriptionBreakdown.map((entry, index) => (
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
          <div className="mt-4 space-y-2">
            {mockSubscriptionBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockUserGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                />
                <Bar dataKey="coaches" name="Coaches" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="athletes" name="Athletes" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  activity.type === 'coach_signup' && 'bg-amber-500/10',
                  activity.type === 'athlete_signup' && 'bg-blue-500/10',
                  activity.type === 'subscription' && 'bg-green-500/10',
                  activity.type === 'payment' && 'bg-purple-500/10'
                )}>
                  {activity.type === 'coach_signup' && <Users className="h-4 w-4 text-amber-500" />}
                  {activity.type === 'athlete_signup' && <UserCircle className="h-4 w-4 text-blue-500" />}
                  {activity.type === 'subscription' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {activity.type === 'payment' && <PoundSterling className="h-4 w-4 text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.name}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
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
  isPercentage?: boolean
}

function StatCard({ icon: Icon, label, value, change, changeLabel, color, isPercentage }: StatCardProps) {
  const colorClasses = {
    amber: 'bg-amber-500/10 text-amber-600',
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-green-500/10 text-green-600',
    purple: 'bg-purple-500/10 text-purple-600',
  }

  const isPositive = change > 0

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
        <div className={cn(
          'flex items-center gap-1 text-sm',
          isPositive ? 'text-green-500' : 'text-red-500'
        )}>
          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span>{isPercentage ? `${change}%` : `+${change}`}</span>
        </div>
      </div>
      <p className="text-2xl font-bold mt-4">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-foreground/70 mt-0.5">{changeLabel}</p>
    </motion.div>
  )
}
