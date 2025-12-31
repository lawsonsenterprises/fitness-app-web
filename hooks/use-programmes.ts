'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Programme, ProgrammeExercise, PaginatedResponse } from '@/types'

// Training day with exercises
export interface TrainingDay {
  id: string
  name: string
  dayType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body' | 'rest'
  sortOrder: number
  exercises: ProgrammeExercise[]
}

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
  // TODO: Implement real Supabase query when schema is aligned
  // The programmes table exists but schema differs from frontend types (uses user_id, not coachId)
  console.warn('Programmes feature not fully implemented - schema alignment needed')

  const { page = 1, pageSize = 20 } = options

  return {
    data: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
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
  // TODO: Implement real Supabase query when schema is aligned
  console.warn('Programmes feature not fully implemented - schema alignment needed')
  return null
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
  // TODO: Implement real Supabase mutation when schema is aligned
  console.warn('Programmes feature not fully implemented - schema alignment needed')
  throw new Error('Programmes feature not implemented')
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
  // TODO: Implement real Supabase mutation when schema is aligned
  console.warn('Programmes feature not fully implemented - schema alignment needed')
  throw new Error('Programmes feature not implemented')
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
  // TODO: Implement real Supabase mutation when schema is aligned
  console.warn('Programmes feature not fully implemented - schema alignment needed')
  throw new Error('Programmes feature not implemented')
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
  // TODO: Implement real Supabase mutation when schema is aligned
  console.warn('Programmes feature not fully implemented - schema alignment needed')
  throw new Error('Programmes feature not implemented')
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
