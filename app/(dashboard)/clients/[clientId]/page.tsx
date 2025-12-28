'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  MessageSquare,
  ClipboardList,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Award,
  Download,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { ClientStatusBadge, SubscriptionBadge } from '@/components/clients/client-status-badge'
import { ExportModal } from '@/components/exports/export-modal'
import { useClient } from '@/hooks/use-clients'
import { cn } from '@/lib/utils'

// Mock data for charts
const adherenceData = [
  { day: 'Mon', training: 100, nutrition: 85 },
  { day: 'Tue', training: 100, nutrition: 90 },
  { day: 'Wed', training: 0, nutrition: 75 },
  { day: 'Thu', training: 100, nutrition: 95 },
  { day: 'Fri', training: 100, nutrition: 88 },
  { day: 'Sat', training: 100, nutrition: 70 },
  { day: 'Sun', training: 0, nutrition: 80 },
]

const weightData = [
  { date: 'Week 1', weight: 82.5 },
  { date: 'Week 2', weight: 82.1 },
  { date: 'Week 3', weight: 81.8 },
  { date: 'Week 4', weight: 81.3 },
]

// Mock recent check-ins
const mockCheckIns = [
  {
    id: '1',
    weekStartDate: '2024-12-23',
    weight: 81.3,
    weightChange: -0.5,
    averageSteps: 9500,
    sleepHours: 7.5,
    status: 'reviewed',
  },
  {
    id: '2',
    weekStartDate: '2024-12-16',
    weight: 81.8,
    weightChange: -0.3,
    averageSteps: 8800,
    sleepHours: 7.2,
    status: 'reviewed',
  },
  {
    id: '3',
    weekStartDate: '2024-12-09',
    weight: 82.1,
    weightChange: -0.4,
    averageSteps: 9200,
    sleepHours: 7.8,
    status: 'reviewed',
  },
]

// Mock current programme
const mockProgramme = {
  id: '1',
  name: 'Hypertrophy Block - Phase 2',
  type: 'hypertrophy',
  startDate: '2024-12-02',
  endDate: '2025-01-26',
  completionPercentage: 45,
}

// Mock current meal plan
const mockMealPlan = {
  id: '1',
  name: 'Lean Bulk - 2800kcal',
  type: 'bulking',
  trainingDayCalories: 2800,
  trainingDayProtein: 180,
  trainingDayCarbs: 320,
  trainingDayFat: 80,
  nonTrainingDayCalories: 2400,
  nonTrainingDayProtein: 180,
  nonTrainingDayCarbs: 240,
  nonTrainingDayFat: 75,
}

export default function ClientOverviewPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client, isLoading } = useClient(clientId)
  const [showExportModal, setShowExportModal] = useState(false)

  if (isLoading) {
    return <ClientOverviewSkeleton />
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Client not found</p>
        <Link href="/clients" className="mt-4 text-amber-600 hover:text-amber-700">
          Back to clients
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Send Message
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Add Note
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Dumbbell className="h-4 w-4" />
          Assign Programme
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowExportModal(true)}
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        defaultType="client_progress"
        entityId={clientId}
        entityTitle={`${client.firstName}-${client.lastName}-progress`}
      />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          {/* Current Programme Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Current Programme</h3>
              <Link
                href={`/clients/${clientId}/training`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                View Details
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{mockProgramme.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(mockProgramme.startDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    -{' '}
                    {new Date(mockProgramme.endDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
                  {mockProgramme.type}
                </span>
              </div>
              {/* Progress bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{mockProgramme.completionPercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
                    style={{ width: `${mockProgramme.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Current Meal Plan Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Current Meal Plan</h3>
              <Link
                href={`/clients/${clientId}/nutrition`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                View Details
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{mockMealPlan.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{mockMealPlan.type}</p>
                </div>
              </div>
              {/* Macro breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Training Day
                  </p>
                  <p className="text-lg font-semibold">{mockMealPlan.trainingDayCalories} kcal</p>
                  <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                    <span>P: {mockMealPlan.trainingDayProtein}g</span>
                    <span>C: {mockMealPlan.trainingDayCarbs}g</span>
                    <span>F: {mockMealPlan.trainingDayFat}g</span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Rest Day
                  </p>
                  <p className="text-lg font-semibold">{mockMealPlan.nonTrainingDayCalories} kcal</p>
                  <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                    <span>P: {mockMealPlan.nonTrainingDayProtein}g</span>
                    <span>C: {mockMealPlan.nonTrainingDayCarbs}g</span>
                    <span>F: {mockMealPlan.nonTrainingDayFat}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adherence Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Weekly Adherence</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Training</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Nutrition</span>
                </div>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adherenceData}>
                  <defs>
                    <linearGradient id="colorTraining" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNutrition" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#71717a' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#71717a' }}
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
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
                    dataKey="training"
                    stroke="#f59e0b"
                    fill="url(#colorTraining)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="nutrition"
                    stroke="#10b981"
                    fill="url(#colorNutrition)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weight Trend Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Weight Trend</h3>
              <span className="text-sm text-muted-foreground">Last 4 weeks</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
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
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value} kg`, 'Weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Client Info Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Client Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1 text-sm">{client.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1">
                  <ClientStatusBadge status={client.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Subscription
                </dt>
                <dd className="mt-1">
                  <SubscriptionBadge status={client.subscriptionStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member Since
                </dt>
                <dd className="mt-1 text-sm">
                  {new Date(client.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              {client.lastActiveAt && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Last Active
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(client.lastActiveAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Stats Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Performance Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="text-2xl font-bold">92%</span>
                </div>
                <p className="text-xs text-muted-foreground">Training</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Target className="h-4 w-4 text-emerald-500" />
                  <span className="text-2xl font-bold">85%</span>
                </div>
                <p className="text-xs text-muted-foreground">Nutrition</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">8</span>
                </div>
                <p className="text-xs text-muted-foreground">Check-In Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span className="text-2xl font-bold">12</span>
                </div>
                <p className="text-xs text-muted-foreground">PRs This Month</p>
              </div>
            </div>
          </div>

          {/* Recent Check-Ins */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Recent Check-Ins</h3>
              <Link
                href={`/clients/${clientId}/check-ins`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {mockCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(checkIn.weekStartDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {checkIn.averageSteps.toLocaleString()} steps · {checkIn.sleepHours}h sleep
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{checkIn.weight} kg</p>
                    <p
                      className={cn(
                        'flex items-center justify-end gap-0.5 text-xs',
                        checkIn.weightChange < 0
                          ? 'text-emerald-600'
                          : checkIn.weightChange > 0
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                      )}
                    >
                      {checkIn.weightChange < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : checkIn.weightChange > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {Math.abs(checkIn.weightChange)} kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Quick Actions skeleton */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
