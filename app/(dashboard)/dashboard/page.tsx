import {
  Users,
  ClipboardCheck,
  Dumbbell,
  TrendingUp,
  ArrowRight,
  Clock,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

import { TopBar } from '@/components/dashboard/top-bar'
import {
  DashboardWidget,
  WidgetGrid,
} from '@/components/dashboard/dashboard-widget'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard - Synced Momentum',
  description: 'Your coaching dashboard',
}

// Mock data for demonstration
const upcomingCheckIns = [
  { id: 1, name: 'James Wilson', dueIn: '2 hours', avatar: 'JW' },
  { id: 2, name: 'Sarah Chen', dueIn: '4 hours', avatar: 'SC' },
  { id: 3, name: 'Michael Brown', dueIn: 'Tomorrow', avatar: 'MB' },
]

const recentActivity = [
  { id: 1, type: 'check-in', client: 'Emma Thompson', time: '10 min ago', message: 'Submitted weekly check-in' },
  { id: 2, type: 'programme', client: 'David Lee', time: '1 hour ago', message: 'Completed Week 4 of Hypertrophy Programme' },
  { id: 3, type: 'message', client: 'Lisa Park', time: '2 hours ago', message: 'Sent you a message' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" />

      <div className="p-4 lg:p-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {getGreeting()}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your clients today.
          </p>
        </div>

        {/* Stats widgets */}
        <WidgetGrid columns={4}>
          <DashboardWidget
            title="Total Clients"
            value={24}
            subtitle="Active coaching relationships"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardWidget
            title="Pending Check-ins"
            value={8}
            subtitle="Awaiting your review"
            icon={ClipboardCheck}
            href={ROUTES.CHECK_INS}
          />
          <DashboardWidget
            title="Active Programmes"
            value={18}
            subtitle="Currently in progress"
            icon={Dumbbell}
            trend={{ value: 5, isPositive: true }}
          />
          <DashboardWidget
            title="Client Progress"
            value="94%"
            subtitle="On track this month"
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
          />
        </WidgetGrid>

        {/* Two column layout for upcoming and activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Upcoming Check-ins */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Upcoming Check-ins</h3>
              </div>
              <Link
                href={ROUTES.CHECK_INS}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {upcomingCheckIns.length > 0 ? (
                upcomingCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                        {checkIn.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{checkIn.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {checkIn.dueIn}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming check-ins
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        activity.type === 'check-in'
                          ? 'bg-emerald-500'
                          : activity.type === 'programme'
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.client}</span>
                        <span className="text-muted-foreground">
                          {' '}
                          {activity.message}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardCheck className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No recent activity
                  </p>
                </div>
              )}
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
              description="8 pending reviews"
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
              icon={Dumbbell}
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
