'use client'

import { useState, useEffect } from 'react'
import { X, Plus, GripVertical, Trash2, Edit2 } from 'lucide-react'
import {
  useProgrammeDay,
  useCreateProgrammeDay,
  useUpdateProgrammeDay,
  useWorkoutItems,
  useDeleteWorkoutItem,
  useReorderWorkoutItems,
} from '@/hooks/use-programme-details'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ExerciseSelectorModal } from '@/components/programmes/exercise-selector-modal'
import { ExerciseConfigModal } from '@/components/programmes/exercise-config-modal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DayEditorModalProps {
  programmeId: string
  weekNumber: number
  dayNumber: number
  dayName: string
  onClose: () => void
  onSave: () => void
}

export function DayEditorModal({
  programmeId,
  weekNumber,
  dayNumber,
  dayName: defaultDayName,
  onClose,
  onSave,
}: DayEditorModalProps) {
  const { data: existingDay } = useProgrammeDay(programmeId, weekNumber, dayNumber)
  const { data: workoutItems = [], refetch: refetchWorkoutItems } = useWorkoutItems(existingDay?.id || '')
  const createDayMutation = useCreateProgrammeDay()
  const updateDayMutation = useUpdateProgrammeDay()
  const deleteItemMutation = useDeleteWorkoutItem()
  const reorderMutation = useReorderWorkoutItems()

  const [sessionName, setSessionName] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [editingExercise, setEditingExercise] = useState<{
    itemId: string
    exerciseId: string
    exerciseName: string
    sets: number
    reps: string
    targetWeightKg: number | null
    restSeconds: number
    rpeTarget: number | null
    notes: string | null
  } | null>(null)
  const [selectedExerciseForConfig, setSelectedExerciseForConfig] = useState<{
    id: string
    name: string
  } | null>(null)

  const [items, setItems] = useState(workoutItems)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (existingDay) {
      setSessionName(existingDay.dayName || '')
      setSessionNotes(existingDay.notes || '')
    }
  }, [existingDay])

  useEffect(() => {
    setItems(workoutItems)
  }, [workoutItems])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex(item => item.id === active.id)
    const newIndex = items.findIndex(item => item.id === over.id)

    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    // Update order indices in database
    const updates = newItems.map((item, index) => ({
      id: item.id,
      orderIndex: index,
    }))

    try {
      await reorderMutation.mutateAsync({
        programmeDayId: existingDay!.id,
        items: updates,
      })
      toast.success('Exercise order updated')
    } catch (error) {
      console.error('Error reordering exercises:', error)
      toast.error('Failed to reorder exercises')
      // Revert on error
      setItems(workoutItems)
    }
  }

  const handleSave = async () => {
    try {
      if (!existingDay) {
        // Create new day
        await createDayMutation.mutateAsync({
          programmeId,
          weekNumber,
          dayNumber,
          dayName: sessionName || undefined,
          notes: sessionNotes || undefined,
        })
      } else {
        // Update existing day
        await updateDayMutation.mutateAsync({
          dayId: existingDay.id,
          programmeId,
          dayName: sessionName || undefined,
          notes: sessionNotes || undefined,
        })
      }

      toast.success('Session saved')
      onSave()
    } catch (error) {
      console.error('Error saving session:', error)
      toast.error('Failed to save session')
    }
  }

  const handleDeleteExercise = async (itemId: string, exerciseName: string) => {
    if (!confirm(`Remove "${exerciseName}" from this session?`)) {
      return
    }

    if (!existingDay) return

    try {
      await deleteItemMutation.mutateAsync({
        itemId,
        programmeDayId: existingDay.id,
      })
      toast.success('Exercise removed')
    } catch (error) {
      console.error('Error deleting exercise:', error)
      toast.error('Failed to remove exercise')
    }
  }

  const handleEditExercise = (item: typeof workoutItems[0]) => {
    setEditingExercise({
      itemId: item.id,
      exerciseId: item.exerciseId,
      exerciseName: item.exercise?.name || 'Exercise',
      sets: item.sets,
      reps: item.reps,
      targetWeightKg: item.targetWeightKg,
      restSeconds: item.restSeconds,
      rpeTarget: item.rpeTarget,
      notes: item.notes,
    })
  }

  const handleExercisesSelected = (exercises: { id: string; name: string }[]) => {
    if (exercises.length === 1) {
      setSelectedExerciseForConfig(exercises[0])
    }
    setShowExerciseSelector(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Edit {defaultDayName} - Week {weekNumber}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Session Name */}
          <div>
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder={`e.g., Upper Body, ${defaultDayName} Workout`}
              className="mt-1.5"
            />
          </div>

          {/* Session Notes */}
          <div>
            <Label htmlFor="session-notes">Session Notes (Optional)</Label>
            <Textarea
              id="session-notes"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add notes about this session..."
              rows={2}
              className="mt-1.5"
            />
          </div>

          {/* Exercises */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Label>Exercises</Label>
              <Button
                size="sm"
                onClick={() => {
                  if (!existingDay) {
                    toast.error('Please save the session first before adding exercises')
                    return
                  }
                  setShowExerciseSelector(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No exercises added yet. Click &quot;Add Exercise&quot; to get started.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <SortableExerciseItem
                        key={item.id}
                        item={item}
                        index={index}
                        onEdit={() => handleEditExercise(item)}
                        onDelete={() => handleDeleteExercise(item.id, item.exercise?.name || 'Exercise')}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={createDayMutation.isPending || updateDayMutation.isPending}
            >
              {createDayMutation.isPending || updateDayMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Session'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && existingDay && (
        <ExerciseSelectorModal
          isOpen={showExerciseSelector}
          onClose={() => setShowExerciseSelector(false)}
          onSelectExercises={handleExercisesSelected}
          multiSelect={false}
        />
      )}

      {/* Exercise Config Modal (for adding new exercise) */}
      {selectedExerciseForConfig && existingDay && (
        <ExerciseConfigModal
          isOpen={true}
          onClose={() => setSelectedExerciseForConfig(null)}
          exercise={selectedExerciseForConfig}
          programmeDayId={existingDay.id}
          onSave={() => {
            setSelectedExerciseForConfig(null)
            refetchWorkoutItems()
          }}
        />
      )}

      {/* Exercise Config Modal (for editing existing exercise) */}
      {editingExercise && existingDay && (
        <ExerciseConfigModal
          isOpen={true}
          onClose={() => setEditingExercise(null)}
          exercise={{
            id: editingExercise.exerciseId,
            name: editingExercise.exerciseName,
          }}
          programmeDayId={existingDay.id}
          existingItem={editingExercise}
          onSave={() => {
            setEditingExercise(null)
            refetchWorkoutItems()
          }}
        />
      )}
    </>
  )
}

interface SortableExerciseItemProps {
  item: {
    id: string
    sets: number
    reps: string
    targetWeightKg: number | null
    restSeconds: number
    rpeTarget: number | null
    notes: string | null
    exercise?: {
      name: string
    }
  }
  index: number
  onEdit: () => void
  onDelete: () => void
}

function SortableExerciseItem({ item, index, onEdit, onDelete }: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Exercise Info */}
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{index + 1}.</span>
          <span className="font-semibold">{item.exercise?.name || 'Exercise'}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {item.sets} sets × {item.reps} reps
          {item.targetWeightKg && ` • ${item.targetWeightKg}kg`}
          {` • ${item.restSeconds}s rest`}
        </p>
        {item.rpeTarget && (
          <p className="text-sm text-muted-foreground">RPE: {item.rpeTarget}/10</p>
        )}
        {item.notes && (
          <p className="mt-1 text-sm text-muted-foreground italic">{item.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
