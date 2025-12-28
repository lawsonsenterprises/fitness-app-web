'use client'

import { useState } from 'react'
import {
  Dumbbell,
  Calendar,
  Clock,
  ChevronRight,
  Trophy,
  Target,
  TrendingUp,
  Play,
  CheckCircle2,
  Timer,
  Flame,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock data
const mockProgramme = {
  name: 'Strength & Hypertrophy - Phase 2',
  week: 4,
  totalWeeks: 8,
  startDate: '2024-12-01',
  endDate: '2025-01-26',
  goal: 'Build muscle mass while increasing strength on compound lifts',
}

const mockWeeklySchedule = [
  { day: 'Monday', name: 'Upper - Push Focus', status: 'completed', duration: '55 min' },
  { day: 'Tuesday', name: 'Lower - Quad Focus', status: 'completed', duration: '50 min' },
  { day: 'Wednesday', name: 'Rest', status: 'rest', duration: '-' },
  { day: 'Thursday', name: 'Upper - Pull Focus', status: 'completed', duration: '48 min' },
  { day: 'Friday', name: 'Lower - Hip Focus', status: 'current', duration: '~50 min' },
  { day: 'Saturday', name: 'Arms & Core', status: 'upcoming', duration: '~40 min' },
  { day: 'Sunday', name: 'Rest', status: 'rest', duration: '-' },
]

const mockTodayWorkout = {
  id: '1',
  name: 'Lower - Hip Focus',
  warmup: [
    { name: '5 min cardio', sets: '-', reps: '-' },
    { name: 'Hip circles', sets: '2', reps: '10 each' },
    { name: 'Glute bridges', sets: '2', reps: '15' },
  ],
  exercises: [
    { name: 'Romanian Deadlift', sets: '4', reps: '8-10', weight: '80kg', rest: '90s', notes: 'Focus on stretch' },
    { name: 'Hip Thrust', sets: '4', reps: '10-12', weight: '100kg', rest: '90s', notes: 'Pause at top' },
    { name: 'Bulgarian Split Squat', sets: '3', reps: '10 each', weight: '20kg DB', rest: '60s', notes: null },
    { name: 'Leg Curl', sets: '3', reps: '12-15', weight: '45kg', rest: '60s', notes: 'Control the negative' },
    { name: 'Calf Raises', sets: '4', reps: '15-20', weight: '60kg', rest: '45s', notes: 'Full ROM' },
  ],
  cooldown: [
    { name: 'Hip flexor stretch', duration: '60s each' },
    { name: 'Hamstring stretch', duration: '60s each' },
    { name: 'Pigeon pose', duration: '90s each' },
  ],
}

const mockPRs = [
  { exercise: 'Deadlift', weight: '180kg', date: '2024-12-15', trend: 'up' },
  { exercise: 'Squat', weight: '150kg', date: '2024-12-10', trend: 'up' },
  { exercise: 'Bench Press', weight: '110kg', date: '2024-12-08', trend: 'same' },
  { exercise: 'Hip Thrust', weight: '140kg', date: '2024-12-20', trend: 'up' },
]

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'prs'>('today')

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Training</h1>
        <p className="mt-1 text-muted-foreground">
          Your workouts and progress
        </p>
      </div>

      {/* Programme Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{mockProgramme.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{mockProgramme.goal}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Week</p>
              <p className="text-2xl font-bold">
                {mockProgramme.week}
                <span className="text-muted-foreground text-base font-normal">/{mockProgramme.totalWeeks}</span>
              </p>
            </div>
            <div className="h-12 w-12 relative">
              <svg className="w-12 h-12 -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - mockProgramme.week / mockProgramme.totalWeeks)}
                  strokeLinecap="round"
                  className="text-amber-500"
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'today', label: "Today's Workout", icon: Dumbbell },
          { id: 'week', label: 'This Week', icon: Calendar },
          { id: 'prs', label: 'Personal Records', icon: Trophy },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-foreground text-background'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'today' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Today's Workout Card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                    <Dumbbell className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{mockTodayWorkout.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ~50 min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        ~320 kcal
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4" />
                  Start Workout
                </Button>
              </div>
            </div>

            {/* Warmup */}
            <div className="p-6 border-b border-border bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Warmup</h4>
              <div className="space-y-2">
                {mockTodayWorkout.warmup.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.sets !== '-' ? `${item.sets} × ${item.reps}` : item.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Exercises */}
            <div className="divide-y divide-border">
              {mockTodayWorkout.exercises.map((exercise, idx) => (
                <div key={idx} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600">
                          {idx + 1}
                        </span>
                        <h4 className="font-medium">{exercise.name}</h4>
                      </div>
                      {exercise.notes && (
                        <p className="text-sm text-muted-foreground mt-1 ml-8">{exercise.notes}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Sets</p>
                        <p className="font-medium">{exercise.sets}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reps</p>
                        <p className="font-medium">{exercise.reps}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="font-medium">{exercise.weight}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rest</p>
                        <p className="font-medium">{exercise.rest}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cooldown */}
            <div className="p-6 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Cooldown</h4>
              <div className="space-y-2">
                {mockTodayWorkout.cooldown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">{item.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'week' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="divide-y divide-border">
            {mockWeeklySchedule.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-4 flex items-center gap-4',
                  day.status === 'current' && 'bg-amber-500/5 border-l-4 border-l-amber-500',
                  day.status === 'rest' && 'bg-muted/30'
                )}
              >
                <div className="w-24 shrink-0">
                  <p className={cn(
                    'font-medium',
                    day.status === 'completed' && 'text-muted-foreground',
                    day.status === 'current' && 'text-amber-600'
                  )}>
                    {day.day}
                  </p>
                </div>

                <div className="flex-1">
                  <p className={cn(
                    'font-medium',
                    day.status === 'rest' && 'text-muted-foreground'
                  )}>
                    {day.name}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {day.duration !== '-' && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {day.duration}
                    </span>
                  )}

                  {day.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {day.status === 'current' && (
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                      Start
                    </Button>
                  )}
                  {day.status === 'upcoming' && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'prs' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {mockPRs.map((pr, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{pr.exercise}</p>
                    <p className="text-3xl font-bold mt-1">{pr.weight}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set on {new Date(pr.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    pr.trend === 'up' && 'bg-green-500/10'
                  )}>
                    {pr.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                    {pr.trend === 'same' && <Trophy className="h-5 w-5 text-amber-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">PR History</h3>
            <p className="text-sm text-muted-foreground">
              View your complete personal record history and track your strength gains over time.
            </p>
            <Button variant="outline" className="mt-4">
              View All Records
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
