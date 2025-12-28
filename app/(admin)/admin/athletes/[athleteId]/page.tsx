'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Mail,
  Calendar,
  User,
  Dumbbell,
  UtensilsCrossed,
  ClipboardCheck,
  Eye,
  MessageSquare,
  Activity,
  Scale,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock athlete data
const mockAthlete = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@email.com',
  avatar: null,
  status: 'active',
  coach: {
    id: '1',
    name: 'Sheridan Lawson',
  },
  stats: {
    currentWeight: 76.2,
    startWeight: 82.5,
    goalWeight: 74,
    checkInsSubmitted: 12,
    avgCompliance: 87,
    currentProgramme: '8-Week Hypertrophy Block',
    currentMealPlan: 'Cutting Phase Meal Plan',
  },
  joinedDate: '2024-08-01',
  lastActive: '2024-12-28T08:45:00Z',
  lastCheckIn: '2024-12-21',
  weightHistory: [
    { date: 'Oct 1', weight: 82.5 },
    { date: 'Oct 15', weight: 81.2 },
    { date: 'Nov 1', weight: 80.1 },
    { date: 'Nov 15', weight: 79.0 },
    { date: 'Dec 1', weight: 77.8 },
    { date: 'Dec 15', weight: 76.8 },
    { date: 'Dec 28', weight: 76.2 },
  ],
  recentActivity: [
    { action: 'Submitted check-in', time: '6 days ago', type: 'check-in' },
    { action: 'Logged workout', time: '2 days ago', type: 'workout' },
    { action: 'Logged meals', time: '1 day ago', type: 'nutrition' },
    { action: 'Logged weight', time: '1 day ago', type: 'weight' },
    { action: 'Logged workout', time: 'Today', type: 'workout' },
  ],
  subscription: {
    status: 'active',
    plan: 'Monthly',
    mrr: 0, // Athlete subs go to coach
  },
}

export default function AthleteDetailPage({
  params,
}: {
  params: Promise<{ athleteId: string }>
}) {
  const _resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview')

  const initials = mockAthlete.name.split(' ').map(n => n[0]).join('').toUpperCase()
  const weightLost = mockAthlete.stats.startWeight - mockAthlete.stats.currentWeight
  const progressPercent = ((mockAthlete.stats.startWeight - mockAthlete.stats.currentWeight) /
    (mockAthlete.stats.startWeight - mockAthlete.stats.goalWeight)) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600'
      case 'pending': return 'bg-amber-500/10 text-amber-600'
      case 'paused': return 'bg-blue-500/10 text-blue-600'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check-in': return ClipboardCheck
      case 'workout': return Dumbbell
      case 'nutrition': return UtensilsCrossed
      case 'weight': return Scale
      default: return Activity
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/athletes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Athletes
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-xl font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{mockAthlete.name}</h1>
                <span className={cn('rounded-full px-3 py-1 text-sm font-medium', getStatusColor(mockAthlete.status))}>
                  {mockAthlete.status.charAt(0).toUpperCase() + mockAthlete.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {mockAthlete.email}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Coach: {mockAthlete.coach.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Impersonate
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4 mb-8"
      >
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Scale className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Current Weight</span>
          </div>
          <p className="text-2xl font-bold">{mockAthlete.stats.currentWeight} kg</p>
          <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            {weightLost.toFixed(1)} kg lost
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Progress</span>
          </div>
          <p className="text-2xl font-bold">{Math.min(progressPercent, 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            Goal: {mockAthlete.stats.goalWeight} kg
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ClipboardCheck className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Check-Ins</span>
          </div>
          <p className="text-2xl font-bold">{mockAthlete.stats.checkInsSubmitted}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {mockAthlete.stats.avgCompliance}% avg compliance
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Last Check-In</span>
          </div>
          <p className="text-2xl font-bold">
            {new Date(mockAthlete.lastCheckIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.floor((Date.now() - new Date(mockAthlete.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </p>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 mb-8"
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Joined</span>
              <span className="text-sm font-medium">
                {new Date(mockAthlete.joinedDate).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Active</span>
              <span className="text-sm font-medium">
                {new Date(mockAthlete.lastActive).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Coach</span>
              <Link href={`/admin/coaches/${mockAthlete.coach.id}`} className="text-sm font-medium text-red-600 hover:underline">
                {mockAthlete.coach.name}
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Current Assignments</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Dumbbell className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-xs text-muted-foreground">Programme</p>
                <p className="text-sm font-medium">{mockAthlete.stats.currentProgramme}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <UtensilsCrossed className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Meal Plan</p>
                <p className="text-sm font-medium">{mockAthlete.stats.currentMealPlan}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold mb-6">Weight Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAthlete.weightHistory}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value} kg`, 'Weight']}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#weightGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Start Weight</p>
              <p className="text-xl font-bold">{mockAthlete.stats.startWeight} kg</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Current Weight</p>
              <p className="text-xl font-bold">{mockAthlete.stats.currentWeight} kg</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Goal Weight</p>
              <p className="text-xl font-bold">{mockAthlete.stats.goalWeight} kg</p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {mockAthlete.recentActivity.map((activity, index) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    activity.type === 'check-in' && 'bg-amber-500/10',
                    activity.type === 'workout' && 'bg-blue-500/10',
                    activity.type === 'nutrition' && 'bg-green-500/10',
                    activity.type === 'weight' && 'bg-purple-500/10'
                  )}>
                    <Icon className={cn(
                      'h-5 w-5',
                      activity.type === 'check-in' && 'text-amber-600',
                      activity.type === 'workout' && 'text-blue-600',
                      activity.type === 'nutrition' && 'text-green-600',
                      activity.type === 'weight' && 'text-purple-600'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
