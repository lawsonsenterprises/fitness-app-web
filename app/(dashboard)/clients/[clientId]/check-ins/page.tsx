'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { useClient } from '@/hooks/use-clients'
import { cn } from '@/lib/utils'

// Mock check-in data
const mockCheckIns = [
  {
    id: '1',
    weekStartDate: '2024-12-23',
    submittedAt: '2024-12-27T09:30:00Z',
    weight: 81.3,
    weightChange: -0.5,
    averageSteps: 9500,
    stepsTarget: 10000,
    dailySteps: [9200, 10500, 8800, 9100, 10200, 9800, 8900],
    sleepHours: 7.5,
    sleepQuality: 'good',
    supplementCompliance: 95,
    notes: 'Feeling great this week. Energy levels are high and training is going well. Hit a new PR on bench press!',
    coachFeedback: 'Excellent progress! Keep pushing on the step count and maintain the sleep quality.',
    coachRating: 5,
    status: 'reviewed',
  },
  {
    id: '2',
    weekStartDate: '2024-12-16',
    submittedAt: '2024-12-20T10:15:00Z',
    weight: 81.8,
    weightChange: -0.3,
    averageSteps: 8800,
    stepsTarget: 10000,
    dailySteps: [8500, 9200, 8100, 9500, 8900, 8400, 9000],
    sleepHours: 7.2,
    sleepQuality: 'fair',
    supplementCompliance: 90,
    notes: 'Good week overall. Sleep was a bit disrupted due to work stress.',
    coachFeedback: 'Good effort. Try to prioritise sleep hygiene this coming week.',
    coachRating: 4,
    status: 'reviewed',
  },
  {
    id: '3',
    weekStartDate: '2024-12-09',
    submittedAt: '2024-12-13T11:00:00Z',
    weight: 82.1,
    weightChange: -0.4,
    averageSteps: 9200,
    stepsTarget: 10000,
    dailySteps: [9000, 9500, 8800, 9200, 9800, 9100, 9000],
    sleepHours: 7.8,
    sleepQuality: 'good',
    supplementCompliance: 100,
    notes: 'Strong week. All training sessions completed. Feeling motivated.',
    coachFeedback: 'Fantastic adherence! This is exactly what we need to see.',
    coachRating: 5,
    status: 'reviewed',
  },
]

export default function ClientCheckInsPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)
  const [expandedId, setExpandedId] = useState<string | null>(mockCheckIns[0]?.id || null)

  if (!client) return null

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Check-Ins</p>
          <p className="mt-1 text-2xl font-bold">{mockCheckIns.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Current Streak</p>
          <p className="mt-1 text-2xl font-bold">8 weeks</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Rating</p>
          <div className="mt-1 flex items-center gap-1">
            <p className="text-2xl font-bold">4.7</p>
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Weight Change</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">-1.2 kg</p>
        </div>
      </div>

      {/* Check-in timeline */}
      <div className="space-y-4">
        {mockCheckIns.map((checkIn) => {
          const isExpanded = expandedId === checkIn.id
          const stepsData = checkIn.dailySteps.map((steps, i) => ({
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            steps,
            target: checkIn.stepsTarget,
          }))

          return (
            <div
              key={checkIn.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              {/* Header - always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : checkIn.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      checkIn.status === 'reviewed'
                        ? 'bg-emerald-500/10'
                        : 'bg-amber-500/10'
                    )}
                  >
                    {checkIn.status === 'reviewed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      Week of{' '}
                      {new Date(checkIn.weekStartDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted{' '}
                      {new Date(checkIn.submittedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Quick stats */}
                  <div className="hidden items-center gap-6 md:flex">
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
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {checkIn.averageSteps.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">avg steps</p>
                    </div>
                    {checkIn.coachRating && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-4 w-4',
                              star <= checkIn.coachRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-muted'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border px-6 py-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left column */}
                    <div className="space-y-6">
                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-muted/30 p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Weight
                          </p>
                          <p className="mt-1 text-xl font-semibold">{checkIn.weight} kg</p>
                          <p
                            className={cn(
                              'mt-1 flex items-center gap-1 text-sm',
                              checkIn.weightChange < 0
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            )}
                          >
                            {checkIn.weightChange < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            {Math.abs(checkIn.weightChange)} kg from last week
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Sleep
                          </p>
                          <p className="mt-1 text-xl font-semibold">{checkIn.sleepHours}h avg</p>
                          <p className="mt-1 text-sm capitalize text-muted-foreground">
                            Quality: {checkIn.sleepQuality}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Avg Steps
                          </p>
                          <p className="mt-1 text-xl font-semibold">
                            {checkIn.averageSteps.toLocaleString()}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Target: {checkIn.stepsTarget.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Supplements
                          </p>
                          <p className="mt-1 text-xl font-semibold">{checkIn.supplementCompliance}%</p>
                          <p className="mt-1 text-sm text-muted-foreground">Compliance</p>
                        </div>
                      </div>

                      {/* Daily steps chart */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium">Daily Steps</h4>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stepsData}>
                              <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#71717a' }}
                              />
                              <YAxis hide />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                                formatter={(value) => [
                                  typeof value === 'number' ? value.toLocaleString() : value,
                                  'Steps',
                                ]}
                              />
                              <Bar
                                dataKey="steps"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                      {/* Client notes */}
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Client Notes</h4>
                        <p className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                          {checkIn.notes}
                        </p>
                      </div>

                      {/* Coach feedback */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-sm font-medium">Coach Feedback</h4>
                          {checkIn.coachRating && (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    'h-4 w-4',
                                    star <= checkIn.coachRating
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-muted'
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        {checkIn.coachFeedback ? (
                          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
                            {checkIn.coachFeedback}
                          </p>
                        ) : (
                          <div className="rounded-lg border border-dashed border-border p-4">
                            <p className="text-sm text-muted-foreground">
                              No feedback added yet
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Add Feedback
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
