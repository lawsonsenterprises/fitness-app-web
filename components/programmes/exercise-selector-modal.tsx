'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  ChevronRight,
  Dumbbell,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExerciseLibrary, type ExerciseLibraryItem } from '@/hooks/athlete'
import { useAuth } from '@/contexts/auth-context'

type MuscleGroup = string
type Equipment = string

const muscleGroups: { id: MuscleGroup; label: string; colour: string }[] = [
  { id: 'chest', label: 'Chest', colour: '#ef4444' },
  { id: 'back', label: 'Back', colour: '#f97316' },
  { id: 'shoulders', label: 'Shoulders', colour: '#eab308' },
  { id: 'biceps', label: 'Biceps', colour: '#22c55e' },
  { id: 'triceps', label: 'Triceps', colour: '#14b8a6' },
  { id: 'forearms', label: 'Forearms', colour: '#06b6d4' },
  { id: 'core', label: 'Core', colour: '#3b82f6' },
  { id: 'quadriceps', label: 'Quadriceps', colour: '#8b5cf6' },
  { id: 'hamstrings', label: 'Hamstrings', colour: '#a855f7' },
  { id: 'glutes', label: 'Glutes', colour: '#ec4899' },
  { id: 'calves', label: 'Calves', colour: '#f43f5e' },
  { id: 'full_body', label: 'Full Body', colour: '#64748b' },
]

const equipmentOptions: { id: Equipment; label: string }[] = [
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbell', label: 'Dumbbell' },
  { id: 'cable', label: 'Cable' },
  { id: 'machine', label: 'Machine' },
  { id: 'bodyweight', label: 'Bodyweight' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'resistance_band', label: 'Resistance Band' },
  { id: 'smith_machine', label: 'Smith Machine' },
]

interface ExerciseSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectExercises: (exercises: Array<{ id: string; name: string }>) => void
  multiSelect?: boolean
}

export function ExerciseSelectorModal({
  isOpen,
  onClose,
  onSelectExercises,
  multiSelect = false,
}: ExerciseSelectorModalProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set())

  const { data: exerciseData, isLoading } = useExerciseLibrary(user?.id)
  const exercises = exerciseData || []

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise: ExerciseLibraryItem) => {
      if (
        searchQuery &&
        !exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      if (
        selectedMuscle &&
        exercise.muscleGroup !== selectedMuscle &&
        !exercise.secondaryMuscles.includes(selectedMuscle)
      ) {
        return false
      }

      if (
        selectedEquipment.length > 0 &&
        !selectedEquipment.some((eq) => exercise.equipment.includes(eq))
      ) {
        return false
      }

      if (selectedDifficulty && exercise.difficulty !== selectedDifficulty) {
        return false
      }

      return true
    })
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment, selectedDifficulty])

  const clearFilters = () => {
    setSelectedMuscle(null)
    setSelectedEquipment([])
    setSelectedDifficulty(null)
  }

  const hasActiveFilters = selectedMuscle || selectedEquipment.length > 0 || selectedDifficulty

  const getMuscleColour = (muscleGroup: MuscleGroup) => {
    return muscleGroups.find((m) => m.id === muscleGroup)?.colour || '#64748b'
  }

  const toggleExercise = (exerciseId: string) => {
    if (!multiSelect) {
      // Single select - immediately select and close
      const exercise = exercises.find((ex) => ex.id === exerciseId)
      if (exercise) {
        onSelectExercises([{ id: exercise.id, name: exercise.name }])
        onClose()
      }
      return
    }

    // Multi-select mode
    const newSelected = new Set(selectedExerciseIds)
    if (newSelected.has(exerciseId)) {
      newSelected.delete(exerciseId)
    } else {
      newSelected.add(exerciseId)
    }
    setSelectedExerciseIds(newSelected)
  }

  const handleConfirmSelection = () => {
    const selected = exercises
      .filter((ex) => selectedExerciseIds.has(ex.id))
      .map((ex) => ({ id: ex.id, name: ex.name }))
    onSelectExercises(selected)
    onClose()
  }

  const handleClose = () => {
    setSelectedExerciseIds(new Set())
    setSearchQuery('')
    clearFilters()
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {multiSelect ? 'Select Exercises' : 'Select Exercise'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose from your exercise library
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search and filters */}
          <div className="p-6 border-b border-border space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                  showFilters || hasActiveFilters
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                    {[selectedMuscle, selectedEquipment.length > 0, selectedDifficulty].filter(
                      Boolean
                    ).length}
                  </span>
                )}
              </button>
            </div>

            {/* Filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                    {/* Muscle groups */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Muscle Group</label>
                      <div className="flex flex-wrap gap-2">
                        {muscleGroups.map((muscle) => (
                          <button
                            key={muscle.id}
                            onClick={() =>
                              setSelectedMuscle(selectedMuscle === muscle.id ? null : muscle.id)
                            }
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                              selectedMuscle === muscle.id
                                ? 'text-white'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            )}
                            style={{
                              backgroundColor:
                                selectedMuscle === muscle.id ? muscle.colour : undefined,
                            }}
                          >
                            {muscle.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Equipment</label>
                      <div className="flex flex-wrap gap-2">
                        {equipmentOptions.map((eq) => (
                          <button
                            key={eq.id}
                            onClick={() =>
                              setSelectedEquipment((prev) =>
                                prev.includes(eq.id)
                                  ? prev.filter((e) => e !== eq.id)
                                  : [...prev, eq.id]
                              )
                            }
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                              selectedEquipment.includes(eq.id)
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {eq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty</label>
                      <div className="flex gap-2">
                        {['beginner', 'intermediate', 'advanced'].map((diff) => (
                          <button
                            key={diff}
                            onClick={() =>
                              setSelectedDifficulty(selectedDifficulty === diff ? null : diff)
                            }
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                              selectedDifficulty === diff
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear filters */}
                    <div className="flex items-center justify-end pt-2 border-t border-border">
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredExercises.length > 0 ? (
              <div className="grid gap-3">
                {filteredExercises.map((exercise) => {
                  const isSelected = selectedExerciseIds.has(exercise.id)
                  return (
                    <button
                      key={exercise.id}
                      onClick={() => toggleExercise(exercise.id)}
                      className={cn(
                        'group rounded-xl border bg-card p-4 text-left transition-all hover:border-blue-500/50',
                        isSelected ? 'border-blue-500 bg-blue-500/5' : 'border-border'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold group-hover:text-blue-500 transition-colors">
                              {exercise.name}
                            </h3>
                            {exercise.isCustom && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: getMuscleColour(exercise.muscleGroup) }}
                            >
                              {muscleGroups.find((m) => m.id === exercise.muscleGroup)?.label}
                            </span>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                exercise.type === 'compound'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-purple-500/10 text-purple-500'
                              )}
                            >
                              {exercise.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {exercise.equipment.join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {multiSelect && isSelected && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                          {!multiSelect && (
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {exercises.length === 0
                    ? 'No exercises found in library'
                    : 'No exercises match your filters'}
                </p>
              </div>
            )}
          </div>

          {/* Footer (multi-select only) */}
          {multiSelect && (
            <div className="border-t border-border p-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedExerciseIds.size} exercise{selectedExerciseIds.size !== 1 ? 's' : ''}{' '}
                selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={selectedExerciseIds.size === 0}
                  className="px-4 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
