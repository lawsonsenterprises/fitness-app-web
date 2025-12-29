'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Dumbbell,
  UtensilsCrossed,
  ClipboardCheck,
  TrendingUp,
  ChevronRight,
  Calendar,
  Flame,
  Footprints,
  Moon,
  Target,
  Clock,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { ReadinessGauge } from '@/components/athlete/readiness-gauge'
import { WeatherWidget } from '@/components/athlete/weather-widget'

// Mock data - would come from API
const mockDashboardData = {
  readinessScore: 78,
  todayWorkout: {
    name: 'Upper Body - Push Focus',
    duration: '45-60 min',
    exercises: 8,
    scheduledTime: '18:00',
  },
  weeklyStats: {
    workoutsCompleted: 4,
    workoutsPlanned: 5,
    caloriesBurned: 2340,
    stepsTaken: 52400,
    averageSleep: 7.2,
  },
  dailyMetrics: {
    calories: { current: 1840, target: 2400 },
    protein: { current: 145, target: 180 },
    steps: { current: 8420, target: 10000 },
    water: { current: 2.1, target: 3 },
  },
  recentCheckIn: {
    date: '2 days ago',
    status: 'reviewed',
    feedback: 'Great progress this week!',
  },
  upcomingTasks: [
    { id: '1', title: 'Submit weekly check-in', due: 'Tomorrow', type: 'check-in' },
    { id: '2', title: 'Blood work appointment', due: 'In 3 days', type: 'blood-work' },
    { id: '3', title: 'Programme ends', due: 'In 2 weeks', type: 'programme' },
  ],
  progressHighlights: [
    { label: 'Weight', value: '76.2 kg', change: '-1.8 kg', trend: 'down', period: 'this month' },
    { label: 'Deadlift PR', value: '180 kg', change: '+10 kg', trend: 'up', period: 'this month' },
    { label: 'Body Fat', value: '14.2%', change: '-0.8%', trend: 'down', period: 'this month' },
  ],
}

export default function AthleteDashboardPage() {
  const { user } = useAuth()
  const [data] = useState(mockDashboardData)

  const firstName = user?.user_metadata?.first_name || 'Athlete'
  const greeting = getGreeting()

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s how you&apos;re doing today
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column - Main content */}
        <div className="space-y-6 lg:col-span-8">
          {/* Readiness + Today's Workout */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Readiness Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Readiness Score</h2>
              <ReadinessGauge score={data.readinessScore} />
            </motion.div>

            {/* Today's Workout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Today&apos;s Workout</h2>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{data.todayWorkout.scheduledTime}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  <Dumbbell className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{data.todayWorkout.name}</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{data.todayWorkout.duration}</span>
                    <span>•</span>
                    <span>{data.todayWorkout.exercises} exercises</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/athlete/training">
                    View Training Programme
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Weekly Progress Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">This Week</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Dumbbell className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Workouts</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {data.weeklyStats.workoutsCompleted}
                  <span className="text-muted-foreground text-base font-normal">/{data.weeklyStats.workoutsPlanned}</span>
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Calories</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{data.weeklyStats.caloriesBurned.toLocaleString()}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Footprints className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Steps</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{(data.weeklyStats.stepsTaken / 1000).toFixed(1)}k</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Sleep</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{data.weeklyStats.averageSleep}h</p>
              </div>
            </div>
          </motion.div>

          {/* Daily Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today&apos;s Targets</h2>
              <Link href="/athlete/nutrition" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                View Details
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <MetricProgress
                icon={Flame}
                label="Calories"
                current={data.dailyMetrics.calories.current}
                target={data.dailyMetrics.calories.target}
                unit="kcal"
                color="orange"
              />
              <MetricProgress
                icon={Target}
                label="Protein"
                current={data.dailyMetrics.protein.current}
                target={data.dailyMetrics.protein.target}
                unit="g"
                color="purple"
              />
              <MetricProgress
                icon={Footprints}
                label="Steps"
                current={data.dailyMetrics.steps.current}
                target={data.dailyMetrics.steps.target}
                unit=""
                color="blue"
              />
              <MetricProgress
                icon={Droplets}
                label="Water"
                current={data.dailyMetrics.water.current}
                target={data.dailyMetrics.water.target}
                unit="L"
                color="cyan"
              />
            </div>
          </motion.div>

          {/* Progress Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Progress Highlights</h2>
              <Link href="/athlete/progress" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                See All Progress
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {data.progressHighlights.map((highlight, index) => (
                <div key={index} className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">{highlight.label}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{highlight.value}</span>
                    <span className={cn(
                      'flex items-center gap-0.5 text-sm font-medium',
                      highlight.trend === 'up' ? 'text-green-500' : 'text-amber-500'
                    )}>
                      {highlight.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {highlight.change}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{highlight.period}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column - Sidebar content */}
        <div className="space-y-6 lg:col-span-4">
          {/* Weather */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <WeatherWidget />
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
            <div className="space-y-3">
              {data.upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    task.type === 'check-in' && 'bg-amber-500/10',
                    task.type === 'blood-work' && 'bg-red-500/10',
                    task.type === 'programme' && 'bg-blue-500/10'
                  )}>
                    {task.type === 'check-in' && <ClipboardCheck className="h-4 w-4 text-amber-600" />}
                    {task.type === 'blood-work' && <Droplets className="h-4 w-4 text-red-600" />}
                    {task.type === 'programme' && <Calendar className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Check-in */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Last Check-in</h2>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                data.recentCheckIn.status === 'reviewed' && 'bg-green-500/10 text-green-600'
              )}>
                Reviewed
              </span>
            </div>

            <p className="text-sm text-muted-foreground">Submitted {data.recentCheckIn.date}</p>

            {data.recentCheckIn.feedback && (
              <div className="mt-3 rounded-lg bg-amber-500/10 p-3 border border-amber-500/20">
                <p className="text-sm text-amber-600">
                  &ldquo;{data.recentCheckIn.feedback}&rdquo;
                </p>
              </div>
            )}

            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/athlete/check-ins">View All Check-ins</Link>
            </Button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/athlete/check-ins/new"
                className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
              >
                <ClipboardCheck className="h-6 w-6 text-amber-600" />
                <span className="text-xs font-medium">Check-in</span>
              </Link>
              <Link
                href="/athlete/nutrition"
                className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
              >
                <UtensilsCrossed className="h-6 w-6 text-green-600" />
                <span className="text-xs font-medium">Log Meal</span>
              </Link>
              <Link
                href="/athlete/progress"
                className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
              >
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-medium">Log Weight</span>
              </Link>
              <Link
                href="/athlete/blood-work"
                className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
              >
                <Droplets className="h-6 w-6 text-red-600" />
                <span className="text-xs font-medium">Blood Work</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

interface MetricProgressProps {
  icon: React.ElementType
  label: string
  current: number
  target: number
  unit: string
  color: 'orange' | 'purple' | 'blue' | 'cyan'
}

function MetricProgress({ icon: Icon, label, current, target, unit, color }: MetricProgressProps) {
  const percentage = Math.min((current / target) * 100, 100)

  const colorClasses = {
    orange: 'text-orange-500 bg-orange-500',
    purple: 'text-purple-500 bg-purple-500',
    blue: 'text-blue-500 bg-blue-500',
    cyan: 'text-cyan-500 bg-cyan-500',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', colorClasses[color].split(' ')[0])} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{current.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">/ {target.toLocaleString()}{unit}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color].split(' ')[1])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
