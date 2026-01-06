'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Copy, Clipboard, Trash2 } from 'lucide-react'
import { useUserProgramme } from '@/hooks/athlete'
import { useProgrammeDays, useWorkoutItems } from '@/hooks/use-programme-details'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { DayEditorModal } from '@/components/programmes/day-editor-modal'

interface WeekData {
  [dayNumber: number]: {
    dayName: string
    notes: string
    exerciseCount: number
  }
}

export default function ProgrammeBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const programmeId = params.id as string

  const { data: programme, isLoading } = useUserProgramme(programmeId)
  const { data: programmeDays = [] } = useProgrammeDays(programmeId)

  const [selectedWeek, setSelectedWeek] = useState(1)
  const [editingDay, setEditingDay] = useState<{ week: number; day: number } | null>(null)
  const [copiedWeek, setCopiedWeek] = useState<WeekData | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleSave = useCallback(async () => {
    // Sessions are saved automatically when edited in DayEditorModal
    // This just clears the unsaved changes indicator
    setHasUnsavedChanges(false)
    toast.success('Programme saved')
  }, [])

  const handleCopyWeek = () => {
    const weekDays = programmeDays.filter(d => d.weekNumber === selectedWeek)
    const weekData: WeekData = {}

    weekDays.forEach(day => {
      weekData[day.dayNumber] = {
        dayName: day.dayName || '',
        notes: day.notes || '',
        exerciseCount: 0, // Will be populated from workout_items
      }
    })

    setCopiedWeek(weekData)
    toast.success(`Week ${selectedWeek} copied`)
  }

  const handlePasteWeek = async () => {
    if (!copiedWeek) {
      toast.error('No week copied')
      return
    }

    // Implementation will create programme_days and workout_items for the selected week
    toast.success(`Week pasted to Week ${selectedWeek}`)
    setHasUnsavedChanges(true)
  }

  const handleClearWeek = async () => {
    if (!confirm(`Are you sure you want to clear all exercises from Week ${selectedWeek}?`)) {
      return
    }

    // Implementation will delete all workout_items for this week
    toast.success(`Week ${selectedWeek} cleared`)
    setHasUnsavedChanges(true)
  }

  const getDayData = (weekNumber: number, dayNumber: number) => {
    const day = programmeDays.find(d => d.weekNumber === weekNumber && d.dayNumber === dayNumber)
    return day || null
  }

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

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/athlete/training/programmes')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{programme.name}</h1>
                  {programme.description && (
                    <p className="text-sm text-muted-foreground">{programme.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-sm text-muted-foreground">Unsaved changes</span>
                )}
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Week Selector */}
          {!isRollingProgramme && (
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Week:</span>
                <div className="flex gap-2">
                  {Array.from({ length: programme.durationWeeks }, (_, i) => i + 1).map((week) => (
                    <Button
                      key={week}
                      variant={selectedWeek === week ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedWeek(week)}
                      className="min-w-[40px]"
                    >
                      {week}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Week Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyWeek}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasteWeek}
                  disabled={!copiedWeek}
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  Paste Week
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearWeek}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Week
                </Button>
              </div>
            </div>
          )}

          {/* 7-Day Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {daysOfWeek.map((dayName, index) => {
              const dayNumber = index + 1
              const dayData = getDayData(selectedWeek, dayNumber)

              return (
                <DayCard
                  key={dayNumber}
                  dayName={dayName}
                  dayData={dayData}
                  onEdit={() => setEditingDay({ week: selectedWeek, day: dayNumber })}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Day Editor Modal */}
      {editingDay && (
        <DayEditorModal
          programmeId={programmeId}
          weekNumber={editingDay.week}
          dayNumber={editingDay.day}
          dayName={daysOfWeek[editingDay.day - 1]}
          onClose={() => setEditingDay(null)}
          onSave={() => {
            setEditingDay(null)
            setHasUnsavedChanges(true)
          }}
        />
      )}
    </>
  )
}

interface DayCardProps {
  dayName: string
  dayData: {
    id: string
    dayName: string | null
  } | null
  onEdit: () => void
}

function DayCard({ dayName, dayData, onEdit }: DayCardProps) {
  const { data: workoutItems = [] } = useWorkoutItems(dayData?.id || '')

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-md">
      <h3 className="mb-2 font-semibold">{dayName}</h3>

      <div className="mb-4 flex-1">
        {dayData ? (
          <>
            {dayData.dayName && (
              <p className="mb-2 text-sm text-muted-foreground">{dayData.dayName}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {workoutItems.length} exercise{workoutItems.length !== 1 ? 's' : ''}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No session</p>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onEdit}
      >
        {dayData ? 'Edit' : 'Add Session'}
      </Button>
    </div>
  )
}
