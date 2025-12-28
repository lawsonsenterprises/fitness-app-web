'use client'

import { useParams } from 'next/navigation'
import { Dumbbell, Trophy, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useClient } from '@/hooks/use-clients'

// Mock data
const mockSessions = [
  {
    id: '1',
    date: '2024-12-27',
    type: 'Push A',
    duration: 65,
    exercises: 6,
    volume: 12500,
  },
  {
    id: '2',
    date: '2024-12-26',
    type: 'Pull A',
    duration: 58,
    exercises: 7,
    volume: 11200,
  },
  {
    id: '3',
    date: '2024-12-25',
    type: 'Legs A',
    duration: 72,
    exercises: 5,
    volume: 18500,
  },
  {
    id: '4',
    date: '2024-12-24',
    type: 'Rest',
    duration: 0,
    exercises: 0,
    volume: 0,
  },
  {
    id: '5',
    date: '2024-12-23',
    type: 'Push B',
    duration: 62,
    exercises: 6,
    volume: 13100,
  },
]

const mockPRs = [
  { exercise: 'Bench Press', weight: 120, date: '2024-12-20', improvement: '+5kg' },
  { exercise: 'Squat', weight: 160, date: '2024-12-18', improvement: '+7.5kg' },
  { exercise: 'Deadlift', weight: 180, date: '2024-12-15', improvement: '+10kg' },
  { exercise: 'Overhead Press', weight: 70, date: '2024-12-10', improvement: '+2.5kg' },
]

export default function ClientTrainingPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)

  if (!client) return null

  return (
    <div className="space-y-8">
      {/* Current Programme Overview */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Current Programme</h2>
            <p className="text-sm text-muted-foreground">Hypertrophy Block - Phase 2</p>
          </div>
          <Button variant="outline" size="sm">
            Modify Programme
          </Button>
        </div>

        {/* Week overview */}
        <div className="mb-6 grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const isTrainingDay = [0, 1, 3, 4, 5].includes(i)
            const isToday = i === 4 // Friday
            return (
              <div
                key={day}
                className={`rounded-lg border p-3 text-center ${
                  isToday ? 'border-amber-500 bg-amber-500/10' : 'border-border'
                }`}
              >
                <p className="text-xs text-muted-foreground">{day}</p>
                <div className="mt-2">
                  {isTrainingDay ? (
                    <Dumbbell className={`mx-auto h-5 w-5 ${isToday ? 'text-amber-500' : 'text-foreground'}`} />
                  ) : (
                    <span className="text-xs text-muted-foreground">Rest</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Programme Progress</span>
            <span className="font-medium">Week 4 of 8</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
              style={{ width: '50%' }}
            />
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold">Session History</h3>
        </div>
        <div className="divide-y divide-border">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {session.type === 'Rest' ? (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Dumbbell className="h-5 w-5 text-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{session.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
              {session.type !== 'Rest' && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{session.duration}</p>
                    <p className="text-xs text-muted-foreground">mins</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{session.exercises}</p>
                    <p className="text-xs text-muted-foreground">exercises</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{session.volume.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">kg volume</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Personal Records */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Recent Personal Records</h3>
          </div>
        </div>
        <div className="divide-y divide-border">
          {mockPRs.map((pr) => (
            <div
              key={pr.exercise}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="font-medium">{pr.exercise}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(pr.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{pr.weight} kg</p>
                <p className="text-sm text-emerald-600">{pr.improvement}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
