'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Programme, ProgrammeExercise, PaginatedResponse } from '@/types'

// Mock exercise data (subset of MuscleWiki exercises)
export const exercisesData = [
  { id: '1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'intermediate' },
  { id: '3', name: 'Cable Fly', muscleGroup: 'Chest', equipment: 'Cable', difficulty: 'beginner' },
  { id: '4', name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '5', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', difficulty: 'beginner' },
  { id: '6', name: 'Pull-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'intermediate' },
  { id: '7', name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '8', name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbell', difficulty: 'beginner' },
  { id: '9', name: 'Barbell Curl', muscleGroup: 'Biceps', equipment: 'Barbell', difficulty: 'beginner' },
  { id: '10', name: 'Tricep Pushdown', muscleGroup: 'Triceps', equipment: 'Cable', difficulty: 'beginner' },
  { id: '11', name: 'Barbell Squat', muscleGroup: 'Quads', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '12', name: 'Leg Press', muscleGroup: 'Quads', equipment: 'Machine', difficulty: 'beginner' },
  { id: '13', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '14', name: 'Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Machine', difficulty: 'beginner' },
  { id: '15', name: 'Hip Thrust', muscleGroup: 'Glutes', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '16', name: 'Calf Raises', muscleGroup: 'Calves', equipment: 'Machine', difficulty: 'beginner' },
  { id: '17', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', difficulty: 'advanced' },
  { id: '18', name: 'Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell', difficulty: 'beginner' },
  { id: '19', name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Cable', difficulty: 'beginner' },
  { id: '20', name: 'Skull Crushers', muscleGroup: 'Triceps', equipment: 'Barbell', difficulty: 'intermediate' },
]

// Mock training day with exercises
export interface TrainingDay {
  id: string
  name: string
  dayType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body' | 'rest'
  sortOrder: number
  exercises: ProgrammeExercise[]
}

// Mock programme templates data
const mockProgrammes: (Programme & { trainingDays?: TrainingDay[] })[] = [
  {
    id: '1',
    coachId: 'coach-1',
    name: 'Push Pull Legs - Hypertrophy',
    description: 'A classic 6-day push/pull/legs split designed for muscle growth. Each muscle group is trained twice per week with moderate to high volume.',
    durationWeeks: 8,
    type: 'hypertrophy',
    difficulty: 'intermediate',
    isTemplate: true,
    isPublished: true,
    timesAssigned: 12,
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    trainingDays: [
      {
        id: 'day-1',
        name: 'Push A',
        dayType: 'push',
        sortOrder: 0,
        exercises: [
          { id: 'ex-1', programmeId: '1', exerciseId: '1', exerciseName: 'Barbell Bench Press', sets: 4, reps: '6-8', rpeTarget: 8, restSeconds: 180, sortOrder: 0 },
          { id: 'ex-2', programmeId: '1', exerciseId: '2', exerciseName: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rpeTarget: 7, restSeconds: 120, sortOrder: 1 },
          { id: 'ex-3', programmeId: '1', exerciseId: '7', exerciseName: 'Overhead Press', sets: 3, reps: '8-10', rpeTarget: 7, restSeconds: 120, sortOrder: 2 },
          { id: 'ex-4', programmeId: '1', exerciseId: '8', exerciseName: 'Lateral Raises', sets: 3, reps: '12-15', rpeTarget: 8, restSeconds: 60, sortOrder: 3 },
          { id: 'ex-5', programmeId: '1', exerciseId: '10', exerciseName: 'Tricep Pushdown', sets: 3, reps: '12-15', rpeTarget: 8, restSeconds: 60, sortOrder: 4 },
        ],
      },
      {
        id: 'day-2',
        name: 'Pull A',
        dayType: 'pull',
        sortOrder: 1,
        exercises: [
          { id: 'ex-6', programmeId: '1', exerciseId: '17', exerciseName: 'Deadlift', sets: 4, reps: '5-6', rpeTarget: 8, restSeconds: 240, sortOrder: 0 },
          { id: 'ex-7', programmeId: '1', exerciseId: '4', exerciseName: 'Barbell Row', sets: 4, reps: '6-8', rpeTarget: 7, restSeconds: 120, sortOrder: 1 },
          { id: 'ex-8', programmeId: '1', exerciseId: '5', exerciseName: 'Lat Pulldown', sets: 3, reps: '10-12', rpeTarget: 7, restSeconds: 90, sortOrder: 2 },
          { id: 'ex-9', programmeId: '1', exerciseId: '19', exerciseName: 'Face Pulls', sets: 3, reps: '15-20', rpeTarget: 7, restSeconds: 60, sortOrder: 3 },
          { id: 'ex-10', programmeId: '1', exerciseId: '9', exerciseName: 'Barbell Curl', sets: 3, reps: '10-12', rpeTarget: 8, restSeconds: 60, sortOrder: 4 },
        ],
      },
      {
        id: 'day-3',
        name: 'Legs A',
        dayType: 'legs',
        sortOrder: 2,
        exercises: [
          { id: 'ex-11', programmeId: '1', exerciseId: '11', exerciseName: 'Barbell Squat', sets: 4, reps: '6-8', rpeTarget: 8, restSeconds: 180, sortOrder: 0 },
          { id: 'ex-12', programmeId: '1', exerciseId: '12', exerciseName: 'Leg Press', sets: 3, reps: '10-12', rpeTarget: 7, restSeconds: 120, sortOrder: 1 },
          { id: 'ex-13', programmeId: '1', exerciseId: '13', exerciseName: 'Romanian Deadlift', sets: 3, reps: '8-10', rpeTarget: 7, restSeconds: 120, sortOrder: 2 },
          { id: 'ex-14', programmeId: '1', exerciseId: '14', exerciseName: 'Leg Curl', sets: 3, reps: '10-12', rpeTarget: 7, restSeconds: 90, sortOrder: 3 },
          { id: 'ex-15', programmeId: '1', exerciseId: '16', exerciseName: 'Calf Raises', sets: 4, reps: '12-15', rpeTarget: 8, restSeconds: 60, sortOrder: 4 },
        ],
      },
    ],
  },
  {
    id: '2',
    coachId: 'coach-1',
    name: 'Upper Lower - Strength',
    description: 'A 4-day upper/lower split focused on building raw strength with compound movements. Lower rep ranges with heavy loads.',
    durationWeeks: 12,
    type: 'strength',
    difficulty: 'advanced',
    isTemplate: true,
    isPublished: true,
    timesAssigned: 8,
    createdAt: '2024-07-20T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: '3',
    coachId: 'coach-1',
    name: 'Full Body - Beginner',
    description: 'A 3-day full body routine perfect for beginners. Focuses on learning compound movements with moderate volume.',
    durationWeeks: 6,
    type: 'hypertrophy',
    difficulty: 'beginner',
    isTemplate: true,
    isPublished: true,
    timesAssigned: 24,
    createdAt: '2024-08-10T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
  },
  {
    id: '4',
    coachId: 'coach-1',
    name: 'Powerlifting Peaking',
    description: 'An 8-week peaking programme for competition prep. Focus on SBD with reduced volume and increased intensity.',
    durationWeeks: 8,
    type: 'powerlifting',
    difficulty: 'advanced',
    isTemplate: true,
    isPublished: false,
    timesAssigned: 0,
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
]

interface UseProgrammesOptions {
  type?: string
  difficulty?: string
  isPublished?: boolean
  search?: string
  page?: number
  pageSize?: number
}

async function fetchProgrammes(
  options: UseProgrammesOptions = {}
): Promise<PaginatedResponse<Programme>> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const { type, difficulty, isPublished, search = '', page = 1, pageSize = 20 } = options

  let filtered = [...mockProgrammes]

  if (type) {
    filtered = filtered.filter((p) => p.type === type)
  }

  if (difficulty) {
    filtered = filtered.filter((p) => p.difficulty === difficulty)
  }

  if (isPublished !== undefined) {
    filtered = filtered.filter((p) => p.isPublished === isPublished)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
    )
  }

  // Sort by most recently updated
  filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export function useProgrammes(options: UseProgrammesOptions = {}) {
  return useQuery({
    queryKey: ['programmes', options],
    queryFn: () => fetchProgrammes(options),
    staleTime: 30 * 1000,
  })
}

// Hook for fetching a single programme
async function fetchProgramme(programmeId: string): Promise<(Programme & { trainingDays?: TrainingDay[] }) | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockProgrammes.find((p) => p.id === programmeId) || null
}

export function useProgramme(programmeId: string) {
  return useQuery({
    queryKey: ['programme', programmeId],
    queryFn: () => fetchProgramme(programmeId),
    enabled: !!programmeId,
  })
}

// Hook for creating a programme
interface CreateProgrammeData {
  name: string
  description?: string
  durationWeeks: number
  type: string
  difficulty: string
  trainingDays?: TrainingDay[]
}

async function createProgramme(data: CreateProgrammeData): Promise<Programme> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newProgramme: Programme = {
    id: `prog-${Date.now()}`,
    coachId: 'coach-1',
    name: data.name,
    description: data.description,
    durationWeeks: data.durationWeeks,
    type: data.type as Programme['type'],
    difficulty: data.difficulty as Programme['difficulty'],
    isTemplate: true,
    isPublished: false,
    timesAssigned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockProgrammes.unshift(newProgramme)
  return newProgramme
}

export function useCreateProgramme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmes'] })
    },
  })
}

// Hook for updating a programme
interface UpdateProgrammeData {
  programmeId: string
  name?: string
  description?: string
  durationWeeks?: number
  type?: string
  difficulty?: string
  isPublished?: boolean
  trainingDays?: TrainingDay[]
}

async function updateProgramme(data: UpdateProgrammeData): Promise<Programme> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const programme = mockProgrammes.find((p) => p.id === data.programmeId)
  if (!programme) {
    throw new Error('Programme not found')
  }

  if (data.name) programme.name = data.name
  if (data.description !== undefined) programme.description = data.description
  if (data.durationWeeks) programme.durationWeeks = data.durationWeeks
  if (data.type) programme.type = data.type as Programme['type']
  if (data.difficulty) programme.difficulty = data.difficulty as Programme['difficulty']
  if (data.isPublished !== undefined) programme.isPublished = data.isPublished
  if (data.trainingDays) programme.trainingDays = data.trainingDays
  programme.updatedAt = new Date().toISOString()

  return programme
}

export function useUpdateProgramme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProgramme,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programmes'] })
      queryClient.invalidateQueries({ queryKey: ['programme', variables.programmeId] })
    },
  })
}

// Hook for deleting a programme
async function deleteProgramme(programmeId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockProgrammes.findIndex((p) => p.id === programmeId)
  if (index !== -1) {
    mockProgrammes.splice(index, 1)
  }
}

export function useDeleteProgramme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmes'] })
    },
  })
}

// Hook for duplicating a programme
async function duplicateProgramme(programmeId: string): Promise<Programme> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const original = mockProgrammes.find((p) => p.id === programmeId)
  if (!original) {
    throw new Error('Programme not found')
  }

  const duplicate: Programme & { trainingDays?: TrainingDay[] } = {
    ...original,
    id: `prog-${Date.now()}`,
    name: `${original.name} (Copy)`,
    isPublished: false,
    timesAssigned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockProgrammes.unshift(duplicate)
  return duplicate
}

export function useDuplicateProgramme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: duplicateProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmes'] })
    },
  })
}
