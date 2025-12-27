import { Users, ClipboardCheck, Dumbbell, TrendingUp } from 'lucide-react'

import { TopBar } from '@/components/dashboard/top-bar'
import {
  DashboardWidget,
  WidgetGrid,
} from '@/components/dashboard/dashboard-widget'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard - Synced Momentum',
  description: 'Your coaching dashboard',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" />

      <div className="p-4 lg:p-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Good morning
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

        {/* Recent activity section */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <div className="rounded-xl border border-border bg-card">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <ClipboardCheck className="h-7 w-7 text-muted-foreground" />
              </div>
              <h4 className="mb-1 font-medium">No recent activity</h4>
              <p className="text-sm text-muted-foreground">
                Activity from your clients will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
