'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Calendar, TrendingUp, Clock } from 'lucide-react'
import { useUserProgramme } from '@/hooks/athlete'
import { useProgrammeDays, useWorkoutItems } from '@/hooks/use-programme-details'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ProgrammeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programmeId = params.id as string

  const { data: programme, isLoading } = useUserProgramme(programmeId)
  const { data: programmeDays = [] } = useProgrammeDays(programmeId)
  const [selectedWeek, setSelectedWeek] = useState(1)

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/10 border-t-foreground"></div>
      </div>
    )
  }

  if (!programme) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Programme not found</h1>
        <Button onClick={() => router.push('/athlete/training/programmes')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Programmes
        </Button>
      </div>
    )
  }

  const isRollingProgramme = !programme.durationWeeks || programme.durationWeeks === 0
  const progress = isRollingProgramme ? 0 : Math.round((programme.currentWeek / programme.durationWeeks) * 100)
  const weekDays = programmeDays.filter(d => d.weekNumber === selectedWeek)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/athlete/training/programmes')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button asChild>
              <Link href={`/athlete/training/programmes/${programmeId}/edit`}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Programme
              </Link>
            </Button>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{programme.name}</h1>
              {programme.isActive && (
                <Badge variant="default" className="bg-amber-500 text-white">
                  Active
                </Badge>
              )}
            </div>
            {programme.description && (
              <p className="mt-2 text-muted-foreground">{programme.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-1 gap-4 ${isRollingProgramme ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{isRollingProgramme ? 'Rolling programme' : `${programme.durationWeeks} weeks`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Week</p>
                <p className="font-semibold">Week {programme.currentWeek}</p>
              </div>
            </div>

            {!isRollingProgramme && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="font-semibold">{progress}% complete</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Week Selector */}
        {!isRollingProgramme && (
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold">Programme Overview</h2>
            <div className="flex items-center gap-2">
              {Array.from({ length: programme.durationWeeks }, (_, i) => i + 1).map((week) => (
                <Button
                  key={week}
                  variant={selectedWeek === week ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedWeek(week)}
                  className="min-w-[60px]"
                >
                  Week {week}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Week Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {daysOfWeek.map((dayName, index) => {
            const dayNumber = index + 1
            const dayData = weekDays.find(d => d.dayNumber === dayNumber)

            return (
              <DayCard
                key={dayNumber}
                dayName={dayName}
                dayData={dayData}
              />
            )
          })}
        </div>

        {/* Empty State */}
        {weekDays.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">No sessions scheduled</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              This week doesn&apos;t have any sessions yet. Click &quot;Edit Programme&quot; to add exercises.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface DayCardProps {
  dayName: string
  dayData?: {
    id: string
    dayName: string | null
    notes: string | null
  }
}

function DayCard({ dayName, dayData }: DayCardProps) {
  const { data: workoutItems = [] } = useWorkoutItems(dayData?.id || '')

  if (!dayData) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4">
        <h3 className="mb-2 font-semibold text-muted-foreground">{dayName}</h3>
        <p className="text-sm text-muted-foreground">Rest day</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 font-semibold">{dayName}</h3>
      {dayData.dayName && (
        <p className="mb-3 text-sm text-muted-foreground">{dayData.dayName}</p>
      )}

      {workoutItems.length > 0 ? (
        <div className="space-y-3">
          {workoutItems.map((item, index) => (
            <div key={item.id} className="rounded-md bg-muted/30 p-3">
              <div className="mb-1 flex items-start gap-2">
                <span className="font-mono text-xs text-muted-foreground">{index + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">
                    {item.exercise?.name || 'Exercise'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.sets} × {item.reps}
                    {item.targetWeightKg && ` • ${item.targetWeightKg}kg`}
                  </p>
                  {item.rpeTarget && (
                    <p className="text-xs text-muted-foreground">
                      RPE: {item.rpeTarget}/10
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No exercises</p>
      )}

      {dayData.notes && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground italic">{dayData.notes}</p>
        </div>
      )}
    </div>
  )
}
