'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Scale,
  Footprints,
  Moon,
  Pill,
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Image,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock check-in data
const mockCheckIn = {
  id: '1',
  submittedAt: '2024-12-21T10:30:00Z',
  weekNumber: 7,
  status: 'reviewed',
  coachRating: 5,
  weight: {
    current: 76.2,
    previous: 77.1,
    change: -0.9,
    trend: 'down',
  },
  steps: {
    daily: [
      { day: 'Mon', steps: 12450 },
      { day: 'Tue', steps: 8920 },
      { day: 'Wed', steps: 11200 },
      { day: 'Thu', steps: 9800 },
      { day: 'Fri', steps: 13500 },
      { day: 'Sat', steps: 15200 },
      { day: 'Sun', steps: 7800 },
    ],
    average: 11267,
    target: 10000,
  },
  sleep: {
    daily: [
      { day: 'Mon', hours: 7.5, quality: 85 },
      { day: 'Tue', hours: 6.8, quality: 72 },
      { day: 'Wed', hours: 8.0, quality: 90 },
      { day: 'Thu', hours: 7.2, quality: 78 },
      { day: 'Fri', hours: 7.8, quality: 85 },
      { day: 'Sat', hours: 8.5, quality: 92 },
      { day: 'Sun', hours: 7.0, quality: 75 },
    ],
    average: 7.5,
    target: 7.5,
    avgQuality: 82,
  },
  supplements: [
    { name: 'Creatine', daysCompliant: 7, totalDays: 7, compliance: 100 },
    { name: 'Vitamin D', daysCompliant: 6, totalDays: 7, compliance: 86 },
    { name: 'Fish Oil', daysCompliant: 5, totalDays: 7, compliance: 71 },
    { name: 'Magnesium', daysCompliant: 7, totalDays: 7, compliance: 100 },
  ],
  overallCompliance: 89,
  athleteNotes: 'Felt really strong this week. Sleep was a bit off on Tuesday due to late work, but made up for it over the weekend. Training sessions all completed with good intensity.',
  coachFeedback: 'Excellent week! Weight is trending nicely and your training consistency is paying off. Keep the sleep consistent if possible - Tuesday dip affected Wednesday performance slightly. Very happy with your progress.',
  progressPhotos: [
    { id: '1', type: 'front', url: '/placeholder.jpg' },
    { id: '2', type: 'side', url: '/placeholder.jpg' },
    { id: '3', type: 'back', url: '/placeholder.jpg' },
  ],
  comparison: {
    weightChange4Weeks: -2.8,
    avgStepsChange: '+1200',
    avgSleepChange: '+0.3h',
  },
}

export default function CheckInDetailPage({
  params,
}: {
  params: Promise<{ checkInId: string }>
}) {
  const resolvedParams = use(params)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/athlete/check-ins"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Check-Ins
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Week {mockCheckIn.weekNumber} Check-In</h1>
              <span className={cn(
                'rounded-full px-3 py-1 text-sm font-medium',
                mockCheckIn.status === 'reviewed' && 'bg-green-500/10 text-green-600'
              )}>
                Reviewed
              </span>
            </div>
            <p className="mt-1 text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Submitted {new Date(mockCheckIn.submittedAt).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {mockCheckIn.coachRating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < mockCheckIn.coachRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Weight Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold">Weight</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-3xl font-bold">{mockCheckIn.weight.current} kg</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Previous</p>
                <p className="text-3xl font-bold">{mockCheckIn.weight.previous} kg</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Change</p>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'text-3xl font-bold',
                    mockCheckIn.weight.change < 0 ? 'text-green-500' : 'text-amber-500'
                  )}>
                    {mockCheckIn.weight.change > 0 ? '+' : ''}{mockCheckIn.weight.change} kg
                  </p>
                  {mockCheckIn.weight.trend === 'down' && <TrendingDown className="h-5 w-5 text-green-500" />}
                  {mockCheckIn.weight.trend === 'up' && <TrendingUp className="h-5 w-5 text-amber-500" />}
                  {mockCheckIn.weight.trend === 'stable' && <Minus className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Steps Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Footprints className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold">Daily Steps</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{mockCheckIn.steps.average.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">avg/day (target: {mockCheckIn.steps.target.toLocaleString()})</p>
              </div>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCheckIn.steps.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="steps" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Sleep Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Moon className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold">Sleep</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{mockCheckIn.sleep.average}h</p>
                <p className="text-sm text-muted-foreground">avg/night • {mockCheckIn.sleep.avgQuality}% quality</p>
              </div>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockCheckIn.sleep.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[5, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Supplements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Pill className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold">Supplement Compliance</h2>
              </div>
              <div className="text-2xl font-bold">{mockCheckIn.overallCompliance}%</div>
            </div>

            <div className="space-y-4">
              {mockCheckIn.supplements.map((supplement) => (
                <div key={supplement.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{supplement.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {supplement.daysCompliant}/{supplement.totalDays} days • {supplement.compliance}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        supplement.compliance >= 90 ? 'bg-green-500' :
                        supplement.compliance >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${supplement.compliance}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coach Feedback */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-green-500/30 bg-green-500/5 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-600">Coach Feedback</h3>
            </div>
            <p className="text-sm text-green-600/90 leading-relaxed">{mockCheckIn.coachFeedback}</p>
          </motion.div>

          {/* Athlete Notes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">Your Notes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{mockCheckIn.athleteNotes}</p>
          </motion.div>

          {/* Progress Photos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Image className="h-5 w-5" />
              <h3 className="font-semibold">Progress Photos</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {mockCheckIn.progressPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center"
                >
                  <p className="text-xs text-muted-foreground capitalize">{photo.type}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 4 Week Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">4 Week Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weight Change</span>
                <span className="font-medium text-green-500">{mockCheckIn.comparison.weightChange4Weeks} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Steps</span>
                <span className="font-medium text-green-500">{mockCheckIn.comparison.avgStepsChange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Sleep</span>
                <span className="font-medium text-green-500">{mockCheckIn.comparison.avgSleepChange}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
