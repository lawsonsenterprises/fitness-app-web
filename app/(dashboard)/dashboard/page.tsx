'use client'

import {
  Users,
  ClipboardCheck,
  Dumbbell,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { TopBar } from '@/components/dashboard/top-bar'
import {
  DashboardWidget,
  WidgetGrid,
} from '@/components/dashboard/dashboard-widget'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { useAnalytics, useDashboardStats, useClientActivity, useClientAdherence } from '@/hooks/use-analytics'
import { useCheckInStats } from '@/hooks/use-check-ins'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user, displayName } = useAuth()
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics()
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats()
  const { data: clientActivity } = useClientActivity()
  const { data: clientAdherence } = useClientAdherence()
  const { data: checkInStats } = useCheckInStats()

  const isLoading = analyticsLoading || statsLoading
  // Extract first name from display_name (split on space) or fall back to metadata
  const firstName = displayName?.split(' ')[0] || user?.user_metadata?.first_name || 'Coach'

  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" />

      <div className="p-4 lg:p-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {getGreeting()}, {firstName}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your clients today.
          </p>
        </div>

        {/* Stats widgets */}
        <WidgetGrid columns={4}>
          <DashboardWidget
            title="Active Clients"
            value={isLoading ? '-' : analytics?.totalActiveClients || 0}
            subtitle="Active coaching relationships"
            icon={Users}
            trend={dashboardStats ? {
              value: dashboardStats.clientGrowthRate,
              isPositive: dashboardStats.clientGrowthRate > 0
            } : undefined}
          />
          <DashboardWidget
            title="Pending Check-ins"
            value={checkInStats?.pending || 0}
            subtitle="Awaiting your review"
            icon={ClipboardCheck}
            href={ROUTES.CHECK_INS}
          />
          <DashboardWidget
            title="Training Adherence"
            value={isLoading ? '-' : `${Math.round(analytics?.avgTrainingAdherence ?? 0)}%`}
            subtitle="Average across all clients"
            icon={Dumbbell}
            trend={{ value: 5, isPositive: true }}
          />
          <DashboardWidget
            title="Check-in Rate"
            value={isLoading ? '-' : `${Math.round(analytics?.checkInSubmissionRate ?? 0)}%`}
            subtitle="Submission this week"
            icon={TrendingUp}
            trend={{ value: 2, isPositive: true }}
          />
        </WidgetGrid>

        {/* Charts row */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Client Activity Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Weekly Activity</h3>
            <div className="h-64">
              {clientActivity && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={clientActivity}>
                    <defs>
                      <linearGradient id="colorTraining" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#71717a' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#71717a' }}
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
                      dataKey="trainingSessions"
                      stroke="#f59e0b"
                      fill="url(#colorTraining)"
                      strokeWidth={2}
                      name="Training Sessions"
                    />
                    <Area
                      type="monotone"
                      dataKey="mealsLogged"
                      stroke="#10b981"
                      fill="url(#colorMeals)"
                      strokeWidth={2}
                      name="Meals Logged"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Training Sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Meals Logged</span>
              </div>
            </div>
          </div>

          {/* Client Adherence Leaderboard */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Top Performers</h3>
              <Link
                href={ROUTES.CLIENTS}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {clientAdherence?.map((client, index) => (
                <Link
                  key={client.clientId}
                  href={`/clients/${client.clientId}`}
                  className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <span className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    index === 0 ? 'bg-amber-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{client.clientName}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Training: {client.trainingAdherence}%</span>
                      <span>Nutrition: {client.nutritionAdherence}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-600">{client.overallScore}%</p>
                    <p className="text-xs text-muted-foreground">Overall</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* At-risk clients and quick actions */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* At-risk clients */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Clients Needing Attention</h3>
              </div>
            </div>
            <div className="divide-y divide-border">
              {analytics?.atRiskClients && analytics.atRiskClients.length > 0 ? (
                analytics.atRiskClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-sm font-medium text-amber-600">
                        {client.firstName[0]}{client.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{client.firstName} {client.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          Last active {client.lastActiveAt
                            ? new Date(client.lastActiveAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short'
                              })
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-600 capitalize">
                      {client.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    All clients are on track!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Unread Messages */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Unread Messages</h3>
                {dashboardStats && dashboardStats.unreadMessages > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
                    {dashboardStats.unreadMessages}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {dashboardStats?.unreadMessages || 0} unread messages
              </p>
              <Link href={ROUTES.CLIENTS}>
                <Button variant="outline" size="sm" className="mt-4">
                  View Messages
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="Add New Client"
              description="Invite a client to your roster"
              href={ROUTES.CLIENTS}
              icon={Users}
            />
            <QuickActionCard
              title="Review Check-ins"
              description={`${checkInStats?.pending || 0} pending reviews`}
              href={ROUTES.CHECK_INS}
              icon={ClipboardCheck}
            />
            <QuickActionCard
              title="Create Programme"
              description="Build a new training programme"
              href={ROUTES.PROGRAMMES}
              icon={Dumbbell}
            />
            <QuickActionCard
              title="Create Meal Plan"
              description="Design nutrition guidance"
              href={ROUTES.MEAL_PLANS}
              icon={UtensilsCrossed}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string
  description: string
  href: string
  icon: React.ElementType
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-foreground">
        <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-amber-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
  )
}
