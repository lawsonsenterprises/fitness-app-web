'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  Play,
  Heart,
  ChevronRight,
  Dumbbell,
  Target,
  Zap,
  Info,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'compound' | 'isolation'
  description: string
  instructions: string[]
  tips: string[]
  videoUrl?: string
  imageUrl?: string
  isFavourite?: boolean
}

type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'

type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance_band'
  | 'smith_machine'

// Mock data
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    type: 'compound',
    description: 'The king of chest exercises. A fundamental compound movement for upper body strength.',
    instructions: [
      'Lie flat on the bench with your feet firmly on the ground',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack the bar and hold it directly above your chest',
      'Lower the bar to your mid-chest with control',
      'Press the bar back up to the starting position',
    ],
    tips: [
      'Keep your shoulder blades retracted and depressed',
      'Maintain a slight arch in your lower back',
      'Drive through your feet for stability',
    ],
    isFavourite: true,
  },
  {
    id: '2',
    name: 'Conventional Deadlift',
    muscleGroup: 'back',
    secondaryMuscles: ['hamstrings', 'glutes', 'core'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    type: 'compound',
    description: 'The ultimate test of full-body strength. Builds a powerful posterior chain.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at the hips and knees to grip the bar',
      'Keep your back straight and chest up',
      'Drive through your feet and extend hips and knees',
      'Stand tall, then reverse the movement to lower',
    ],
    tips: [
      'Keep the bar close to your body throughout',
      'Engage your lats before lifting',
      'Breathe and brace your core before each rep',
    ],
    isFavourite: true,
  },
  {
    id: '3',
    name: 'Barbell Back Squat',
    muscleGroup: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings', 'core'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    type: 'compound',
    description: 'The foundation of lower body training. Builds strength, power, and muscle mass.',
    instructions: [
      'Position the bar on your upper back, not your neck',
      'Unrack and step back with feet shoulder-width apart',
      'Brace your core and begin descending',
      'Lower until your thighs are at least parallel',
      'Drive through your feet to stand back up',
    ],
    tips: [
      'Keep your knees tracking over your toes',
      'Maintain a neutral spine throughout',
      'Control the descent, explode on the way up',
    ],
  },
  {
    id: '4',
    name: 'Pull-Up',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    type: 'compound',
    description: 'A classic bodyweight exercise that builds a wide, powerful back.',
    instructions: [
      'Hang from the bar with an overhand grip',
      'Grip slightly wider than shoulder-width',
      'Pull yourself up until your chin clears the bar',
      'Lower yourself with control',
      'Repeat for desired reps',
    ],
    tips: [
      'Initiate the movement by depressing your scapulae',
      'Avoid swinging or using momentum',
      'Focus on squeezing your lats at the top',
    ],
  },
  {
    id: '5',
    name: 'Romanian Deadlift',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    equipment: ['barbell', 'dumbbell'],
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Excellent for hamstring development and hip hinge mechanics.',
    instructions: [
      'Stand with feet hip-width apart, holding the bar',
      'Push your hips back while keeping a slight knee bend',
      'Lower the bar along your thighs until you feel a hamstring stretch',
      'Drive your hips forward to return to standing',
      'Squeeze your glutes at the top',
    ],
    tips: [
      'Keep your back straight throughout',
      'Don\'t round your lower back',
      'The bar should travel in a straight line close to your body',
    ],
  },
  {
    id: '6',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps', 'core'],
    equipment: ['barbell', 'dumbbell'],
    difficulty: 'intermediate',
    type: 'compound',
    description: 'The primary movement for building powerful shoulders.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold the bar at shoulder height, hands just outside shoulders',
      'Brace your core and squeeze your glutes',
      'Press the bar overhead until arms are fully extended',
      'Lower the bar back to shoulder height with control',
    ],
    tips: [
      'Move your head back slightly as the bar passes your face',
      'Lock out fully at the top',
      'Keep your elbows slightly in front of the bar',
    ],
  },
  {
    id: '7',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Targets the lateral deltoid for wider, capped shoulders.',
    instructions: [
      'Stand with dumbbells at your sides',
      'Raise your arms out to the sides until parallel with the floor',
      'Keep a slight bend in your elbows',
      'Lower with control back to the starting position',
      'Avoid using momentum',
    ],
    tips: [
      'Lead with your elbows, not your hands',
      'Don\'t go above shoulder height',
      'Use lighter weight with strict form',
    ],
  },
  {
    id: '8',
    name: 'Barbell Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    equipment: ['barbell'],
    difficulty: 'beginner',
    type: 'isolation',
    description: 'The classic bicep builder. Simple but effective.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold the barbell with an underhand grip',
      'Curl the bar up towards your shoulders',
      'Squeeze at the top',
      'Lower with control',
    ],
    tips: [
      'Keep your elbows pinned to your sides',
      'Avoid swinging the weight',
      'Focus on the contraction at the top',
    ],
  },
  {
    id: '9',
    name: 'Tricep Pushdown',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    equipment: ['cable'],
    difficulty: 'beginner',
    type: 'isolation',
    description: 'An effective isolation movement for tricep development.',
    instructions: [
      'Attach a straight or rope handle to a high cable',
      'Stand facing the machine with elbows at your sides',
      'Push the handle down until arms are fully extended',
      'Squeeze your triceps at the bottom',
      'Return with control',
    ],
    tips: [
      'Keep your elbows stationary',
      'Don\'t lean forward excessively',
      'Control the negative portion',
    ],
  },
  {
    id: '10',
    name: 'Hip Thrust',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    type: 'compound',
    description: 'The most effective exercise for glute development.',
    instructions: [
      'Sit on the ground with your upper back against a bench',
      'Roll a barbell over your hips',
      'Plant your feet hip-width apart',
      'Drive through your heels and squeeze your glutes',
      'Lower your hips back down with control',
    ],
    tips: [
      'Keep your chin tucked throughout',
      'Fully extend your hips at the top',
      'Use a pad for comfort on the bar',
    ],
    isFavourite: true,
  },
  {
    id: '11',
    name: 'Hanging Leg Raise',
    muscleGroup: 'core',
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    type: 'isolation',
    description: 'Advanced core exercise targeting the lower abs.',
    instructions: [
      'Hang from a pull-up bar with an overhand grip',
      'Keep your legs straight',
      'Raise your legs until parallel with the floor or higher',
      'Lower with control',
      'Avoid swinging',
    ],
    tips: [
      'Initiate the movement with your abs',
      'Breathe out as you raise your legs',
      'For beginners, bend your knees',
    ],
  },
  {
    id: '12',
    name: 'Cable Fly',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders'],
    equipment: ['cable'],
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Excellent for chest isolation and stretch.',
    instructions: [
      'Set cables at chest height',
      'Stand in the middle with handles in each hand',
      'Step forward slightly for stability',
      'Bring handles together in front of your chest',
      'Return with control, feeling the chest stretch',
    ],
    tips: [
      'Keep a slight bend in your elbows',
      'Focus on squeezing your chest at the peak',
      'Control the stretch on the way back',
    ],
  },
]

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

export default function ExerciseLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false)
  const [exercises, setExercises] = useState(mockExercises)

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      // Search query
      if (
        searchQuery &&
        !exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Muscle group filter
      if (
        selectedMuscle &&
        exercise.muscleGroup !== selectedMuscle &&
        !exercise.secondaryMuscles.includes(selectedMuscle)
      ) {
        return false
      }

      // Equipment filter
      if (
        selectedEquipment.length > 0 &&
        !selectedEquipment.some((eq) => exercise.equipment.includes(eq))
      ) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulty && exercise.difficulty !== selectedDifficulty) {
        return false
      }

      // Type filter
      if (selectedType && exercise.type !== selectedType) {
        return false
      }

      // Favourites filter
      if (showFavouritesOnly && !exercise.isFavourite) {
        return false
      }

      return true
    })
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment, selectedDifficulty, selectedType, showFavouritesOnly])

  const toggleFavourite = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, isFavourite: !ex.isFavourite } : ex
      )
    )
  }

  const clearFilters = () => {
    setSelectedMuscle(null)
    setSelectedEquipment([])
    setSelectedDifficulty(null)
    setSelectedType(null)
    setShowFavouritesOnly(false)
  }

  const hasActiveFilters =
    selectedMuscle || selectedEquipment.length > 0 || selectedDifficulty || selectedType || showFavouritesOnly

  const getMuscleColour = (muscleGroup: MuscleGroup) => {
    return muscleGroups.find((m) => m.id === muscleGroup)?.colour || '#64748b'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Exercise Library</h1>
        <p className="text-muted-foreground mt-1">
          Browse and learn proper form for hundreds of exercises
        </p>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
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
                {[selectedMuscle, selectedEquipment.length > 0, selectedDifficulty, selectedType, showFavouritesOnly].filter(Boolean).length}
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
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
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

                {/* Difficulty and Type */}
                <div className="grid sm:grid-cols-2 gap-4">
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <div className="flex gap-2">
                      {['compound', 'isolation'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(selectedType === type ? null : type)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                            selectedType === type
                              ? 'bg-foreground text-background'
                              : 'bg-muted text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Favourites toggle and clear */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      showFavouritesOnly
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Heart
                      className={cn('h-4 w-4', showFavouritesOnly && 'fill-current')}
                    />
                    Favourites Only
                  </button>
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

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredExercises.length} of {exercises.length} exercises
      </div>

      {/* Exercise grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedExercise(exercise)}
            className="group rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-blue-500/50 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-blue-500 transition-colors">
                  {exercise.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
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
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavourite(exercise.id)
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Heart
                  className={cn(
                    'h-4 w-4 transition-colors',
                    exercise.isFavourite
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-muted-foreground'
                  )}
                />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {exercise.description}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" />
                  {exercise.equipment.length} equipment
                </span>
                <span
                  className={cn(
                    'capitalize',
                    exercise.difficulty === 'beginner' && 'text-emerald-500',
                    exercise.difficulty === 'intermediate' && 'text-amber-500',
                    exercise.difficulty === 'advanced' && 'text-rose-500'
                  )}
                >
                  {exercise.difficulty}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No exercises found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Exercise detail modal */}
      <AnimatePresence>
        {selectedExercise && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="rounded-xl border border-border bg-card shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedExercise.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{
                          backgroundColor: getMuscleColour(selectedExercise.muscleGroup),
                        }}
                      >
                        {muscleGroups.find((m) => m.id === selectedExercise.muscleGroup)?.label}
                      </span>
                      {selectedExercise.secondaryMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                        >
                          {muscleGroups.find((m) => m.id === muscle)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavourite(selectedExercise.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Heart
                        className={cn(
                          'h-5 w-5 transition-colors',
                          exercises.find((e) => e.id === selectedExercise.id)?.isFavourite
                            ? 'text-rose-500 fill-rose-500'
                            : 'text-muted-foreground'
                        )}
                      />
                    </button>
                    <button
                      onClick={() => setSelectedExercise(null)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Quick info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <Target className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium capitalize">{selectedExercise.type}</p>
                      <p className="text-xs text-muted-foreground">Type</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <Zap
                        className={cn(
                          'h-5 w-5 mx-auto mb-2',
                          selectedExercise.difficulty === 'beginner' && 'text-emerald-500',
                          selectedExercise.difficulty === 'intermediate' && 'text-amber-500',
                          selectedExercise.difficulty === 'advanced' && 'text-rose-500'
                        )}
                      />
                      <p className="text-sm font-medium capitalize">
                        {selectedExercise.difficulty}
                      </p>
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <Dumbbell className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                      <p className="text-sm font-medium">
                        {selectedExercise.equipment
                          .map(
                            (eq) =>
                              equipmentOptions.find((e) => e.id === eq)?.label
                          )
                          .join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">Equipment</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      About This Exercise
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedExercise.description}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      How to Perform
                    </h3>
                    <ol className="space-y-2">
                      {selectedExercise.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </span>
                          <span className="text-muted-foreground">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Pro Tips
                    </h3>
                    <ul className="space-y-2">
                      {selectedExercise.tips.map((tip, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 text-sm text-muted-foreground"
                        >
                          <span className="text-amber-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Video link placeholder */}
                  {selectedExercise.videoUrl && (
                    <a
                      href={selectedExercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border border-border hover:border-blue-500 transition-colors"
                    >
                      <Play className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Watch Video Tutorial</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
