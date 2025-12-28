'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { MealPlan, Meal, PaginatedResponse } from '@/types'

// Mock meal plan templates data
const mockMealPlans: (MealPlan & { meals?: Meal[] })[] = [
  {
    id: '1',
    coachId: 'coach-1',
    name: 'Lean Bulk - 2800kcal',
    description: 'A caloric surplus meal plan designed for lean muscle gain with moderate carbs.',
    type: 'bulking',
    trainingDayCalories: 2800,
    trainingDayProtein: 180,
    trainingDayCarbs: 320,
    trainingDayFat: 80,
    nonTrainingDayCalories: 2400,
    nonTrainingDayProtein: 180,
    nonTrainingDayCarbs: 240,
    nonTrainingDayFat: 75,
    isTemplate: true,
    isPublished: true,
    timesAssigned: 15,
    createdAt: '2024-06-10T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    coachId: 'coach-1',
    name: 'Cutting Phase - 1800kcal',
    description: 'A caloric deficit plan for fat loss while preserving muscle mass. High protein, moderate carbs.',
    type: 'cutting',
    trainingDayCalories: 2000,
    trainingDayProtein: 200,
    trainingDayCarbs: 180,
    trainingDayFat: 55,
    nonTrainingDayCalories: 1800,
    nonTrainingDayProtein: 200,
    nonTrainingDayCarbs: 120,
    nonTrainingDayFat: 55,
    isTemplate: true,
    isPublished: true,
    timesAssigned: 22,
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-11-20T10:00:00Z',
  },
  {
    id: '3',
    coachId: 'coach-1',
    name: 'Maintenance - 2200kcal',
    description: 'A balanced maintenance plan for maintaining current weight and body composition.',
    type: 'maintenance',
    trainingDayCalories: 2400,
    trainingDayProtein: 165,
    trainingDayCarbs: 260,
    trainingDayFat: 70,
    nonTrainingDayCalories: 2200,
    nonTrainingDayProtein: 165,
    nonTrainingDayCarbs: 220,
    nonTrainingDayFat: 70,
    isTemplate: true,
    isPublished: true,
    timesAssigned: 10,
    createdAt: '2024-08-20T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
  },
  {
    id: '4',
    coachId: 'coach-1',
    name: 'Contest Prep - Final Week',
    description: 'Competition prep meal plan for the final week before a bodybuilding show.',
    type: 'contest_prep',
    trainingDayCalories: 1500,
    trainingDayProtein: 220,
    trainingDayCarbs: 50,
    trainingDayFat: 45,
    nonTrainingDayCalories: 1200,
    nonTrainingDayProtein: 200,
    nonTrainingDayCarbs: 30,
    nonTrainingDayFat: 40,
    isTemplate: true,
    isPublished: false,
    timesAssigned: 0,
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
  },
]

interface UseMealPlansOptions {
  type?: string
  isPublished?: boolean
  search?: string
  page?: number
  pageSize?: number
}

async function fetchMealPlans(
  options: UseMealPlansOptions = {}
): Promise<PaginatedResponse<MealPlan>> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const { type, isPublished, search = '', page = 1, pageSize = 20 } = options

  let filtered = [...mockMealPlans]

  if (type) {
    filtered = filtered.filter((p) => p.type === type)
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

export function useMealPlans(options: UseMealPlansOptions = {}) {
  return useQuery({
    queryKey: ['mealPlans', options],
    queryFn: () => fetchMealPlans(options),
    staleTime: 30 * 1000,
  })
}

// Hook for fetching a single meal plan
async function fetchMealPlan(mealPlanId: string): Promise<MealPlan | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockMealPlans.find((p) => p.id === mealPlanId) || null
}

export function useMealPlan(mealPlanId: string) {
  return useQuery({
    queryKey: ['mealPlan', mealPlanId],
    queryFn: () => fetchMealPlan(mealPlanId),
    enabled: !!mealPlanId,
  })
}

// Hook for creating a meal plan
interface CreateMealPlanData {
  name: string
  description?: string
  type: string
  trainingDayCalories: number
  trainingDayProtein: number
  trainingDayCarbs: number
  trainingDayFat: number
  nonTrainingDayCalories: number
  nonTrainingDayProtein: number
  nonTrainingDayCarbs: number
  nonTrainingDayFat: number
}

async function createMealPlan(data: CreateMealPlanData): Promise<MealPlan> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newMealPlan: MealPlan = {
    id: `meal-${Date.now()}`,
    coachId: 'coach-1',
    name: data.name,
    description: data.description,
    type: data.type as MealPlan['type'],
    trainingDayCalories: data.trainingDayCalories,
    trainingDayProtein: data.trainingDayProtein,
    trainingDayCarbs: data.trainingDayCarbs,
    trainingDayFat: data.trainingDayFat,
    nonTrainingDayCalories: data.nonTrainingDayCalories,
    nonTrainingDayProtein: data.nonTrainingDayProtein,
    nonTrainingDayCarbs: data.nonTrainingDayCarbs,
    nonTrainingDayFat: data.nonTrainingDayFat,
    isTemplate: true,
    isPublished: false,
    timesAssigned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockMealPlans.unshift(newMealPlan)
  return newMealPlan
}

export function useCreateMealPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
    },
  })
}

// Hook for updating a meal plan
interface UpdateMealPlanData {
  mealPlanId: string
  name?: string
  description?: string
  type?: string
  trainingDayCalories?: number
  trainingDayProtein?: number
  trainingDayCarbs?: number
  trainingDayFat?: number
  nonTrainingDayCalories?: number
  nonTrainingDayProtein?: number
  nonTrainingDayCarbs?: number
  nonTrainingDayFat?: number
  isPublished?: boolean
}

async function updateMealPlan(data: UpdateMealPlanData): Promise<MealPlan> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const mealPlan = mockMealPlans.find((p) => p.id === data.mealPlanId)
  if (!mealPlan) {
    throw new Error('Meal plan not found')
  }

  if (data.name) mealPlan.name = data.name
  if (data.description !== undefined) mealPlan.description = data.description
  if (data.type) mealPlan.type = data.type as MealPlan['type']
  if (data.trainingDayCalories !== undefined) mealPlan.trainingDayCalories = data.trainingDayCalories
  if (data.trainingDayProtein !== undefined) mealPlan.trainingDayProtein = data.trainingDayProtein
  if (data.trainingDayCarbs !== undefined) mealPlan.trainingDayCarbs = data.trainingDayCarbs
  if (data.trainingDayFat !== undefined) mealPlan.trainingDayFat = data.trainingDayFat
  if (data.nonTrainingDayCalories !== undefined) mealPlan.nonTrainingDayCalories = data.nonTrainingDayCalories
  if (data.nonTrainingDayProtein !== undefined) mealPlan.nonTrainingDayProtein = data.nonTrainingDayProtein
  if (data.nonTrainingDayCarbs !== undefined) mealPlan.nonTrainingDayCarbs = data.nonTrainingDayCarbs
  if (data.nonTrainingDayFat !== undefined) mealPlan.nonTrainingDayFat = data.nonTrainingDayFat
  if (data.isPublished !== undefined) mealPlan.isPublished = data.isPublished
  mealPlan.updatedAt = new Date().toISOString()

  return mealPlan
}

export function useUpdateMealPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMealPlan,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
      queryClient.invalidateQueries({ queryKey: ['mealPlan', variables.mealPlanId] })
    },
  })
}

// Hook for deleting a meal plan
async function deleteMealPlan(mealPlanId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockMealPlans.findIndex((p) => p.id === mealPlanId)
  if (index !== -1) {
    mockMealPlans.splice(index, 1)
  }
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
    },
  })
}

// Hook for duplicating a meal plan
async function duplicateMealPlan(mealPlanId: string): Promise<MealPlan> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const original = mockMealPlans.find((p) => p.id === mealPlanId)
  if (!original) {
    throw new Error('Meal plan not found')
  }

  const duplicate: MealPlan = {
    ...original,
    id: `meal-${Date.now()}`,
    name: `${original.name} (Copy)`,
    isPublished: false,
    timesAssigned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockMealPlans.unshift(duplicate)
  return duplicate
}

export function useDuplicateMealPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: duplicateMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
    },
  })
}
