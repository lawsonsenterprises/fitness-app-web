'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Dumbbell,
  Calendar,
  Clock,
  ChevronRight,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle2,
  Timer,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useCurrentProgramme, useWeeklySchedule, usePersonalRecords } from '@/hooks/athlete'
import { TopBar } from '@/components/dashboard/top-bar'

export default function TrainingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'week' | 'prs'>('week')

  const { data: programme, isLoading: programmeLoading } = useCurrentProgramme(user?.id)
  const { data: weeklySchedule, isLoading: scheduleLoading } = useWeeklySchedule(user?.id)
  const { data: personalRecords, isLoading: prsLoading } = usePersonalRecords(user?.id)

  // Show loading while auth is loading OR (user exists AND queries are loading)
  const isLoading = authLoading || (user && (programmeLoading || scheduleLoading || prsLoading))

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <TopBar title="Training" />
      <div className="p-6 lg:p-8">
        {/* Programme Overview */}
      {programme ? (
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
                <h2 className="text-lg font-semibold">
                  {programme.programme_templates?.name || 'Active Programme'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {programme.programme_templates?.description || 'Your current training programme'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Week</p>
                <p className="text-2xl font-bold">
                  {programme.current_week || 1}
                  <span className="text-muted-foreground text-base font-normal">
                    /{programme.programme_templates?.duration_weeks || '?'}
                  </span>
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
                    strokeDashoffset={
                      2 * Math.PI * 20 * (1 - (programme.current_week || 1) / (programme.programme_templates?.duration_weeks || 1))
                    }
                    strokeLinecap="round"
                    className="text-amber-500"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-8 mb-6 text-center"
        >
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Active Programme</h2>
          <p className="text-sm text-muted-foreground">
            Your coach will assign a training programme to you soon.
          </p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
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
      {activeTab === 'week' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          {weeklySchedule && weeklySchedule.length > 0 ? (
            <div className="divide-y divide-border">
              {weeklySchedule.map((day, idx) => (
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
                      <span className="text-xs font-medium text-amber-600 px-2 py-1 bg-amber-500/10 rounded">
                        Today
                      </span>
                    )}
                    {day.status === 'upcoming' && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                No scheduled sessions this week.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'prs' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {personalRecords && personalRecords.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {personalRecords.map((pr) => (
                  <div
                    key={pr.id}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{pr.exercise_name}</p>
                        <p className="text-3xl font-bold mt-1">{pr.weight_kg}kg</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(pr.achieved_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                        <TrendingUp className="h-5 w-5 text-green-500" />
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
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/athlete/training/exercises">
                    View All Records
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">No Personal Records Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your personal records will appear here as you log your workouts in the iOS app.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Log Workouts CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center"
      >
        <Dumbbell className="h-8 w-8 mx-auto text-amber-600 mb-3" />
        <h3 className="font-semibold mb-2">Log Your Workouts</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Use the Synced Momentum iOS app to log your workouts and track your progress in real-time.
        </p>
      </motion.div>
      </div>
    </>
  )
}
