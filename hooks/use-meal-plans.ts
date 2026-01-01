'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  MealPlanTemplate,
  MealPlanTemplateRow,
  MealPlanAssignment,
  MealPlanAssignmentRow,
  MealPlanGoal,
  AssignmentStatus,
  PaginatedResponse,
} from '@/types'

const supabase = createClient()

// Transform database row to MealPlanTemplate interface
function transformTemplate(row: MealPlanTemplateRow): MealPlanTemplate {
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    description: row.description,
    goal: row.goal,
    durationWeeks: row.duration_weeks,
    targetCalories: row.target_calories,
    targetProtein: row.target_protein_g,
    targetCarbs: row.target_carbs_g,
    targetFat: row.target_fat_g,
    targetFibre: row.target_fibre_g,
    dietaryRequirements: row.dietary_requirements,
    allergies: row.allergies,
    cuisinePreferences: row.cuisine_preferences,
    isTemplate: row.is_template ?? true,
    isPublic: row.is_public ?? false,
    tags: row.tags,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Transform database row to MealPlanAssignment interface
function transformAssignment(row: MealPlanAssignmentRow): MealPlanAssignment {
  return {
    id: row.id,
    clientId: row.client_id,
    coachId: row.coach_id,
    templateId: row.template_id,
    name: row.name,
    content: row.content,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status ?? 'scheduled',
    adherencePercentage: row.adherence_percentage,
    targetCalories: row.target_calories,
    targetProtein: row.target_protein_g,
    targetCarbs: row.target_carbs_g,
    targetFat: row.target_fat_g,
    targetFibre: row.target_fibre_g,
    dietaryRequirements: row.dietary_requirements,
    allergies: row.allergies,
    coachNotes: row.coach_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    template: row.template ? transformTemplate(row.template) : undefined,
    client: row.client ? {
      id: row.client.id,
      displayName: row.client.display_name,
      avatarUrl: row.client.avatar_url,
    } : undefined,
  }
}

// ==================== Meal Plan Templates ====================

interface UseMealPlanTemplatesOptions {
  goal?: MealPlanGoal
  isPublic?: boolean
  search?: string
  page?: number
  pageSize?: number
}

async function fetchMealPlanTemplates(
  options: UseMealPlanTemplatesOptions = {}
): Promise<PaginatedResponse<MealPlanTemplate>> {
  const { goal, isPublic, search, page = 1, pageSize = 20 } = options

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Build query
  let query = supabase
    .from('meal_plan_templates')
    .select('*', { count: 'exact' })
    .eq('coach_id', user.id)
    .order('updated_at', { ascending: false })

  // Apply filters
  if (goal) {
    query = query.eq('goal', goal)
  }
  if (typeof isPublic === 'boolean') {
    query = query.eq('is_public', isPublic)
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching meal plan templates:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const templates = (data || []).map(row => transformTemplate(row as MealPlanTemplateRow))
  const total = count || 0

  return {
    data: templates,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export function useMealPlanTemplates(options: UseMealPlanTemplatesOptions = {}) {
  return useQuery({
    queryKey: ['mealPlanTemplates', options],
    queryFn: () => fetchMealPlanTemplates(options),
    staleTime: 30 * 1000,
  })
}

// Alias for backwards compatibility
export function useMealPlans(options: UseMealPlanTemplatesOptions = {}) {
  return useMealPlanTemplates(options)
}

// Fetch a single meal plan template
async function fetchMealPlanTemplate(templateId: string): Promise<MealPlanTemplate | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return null
  }

  const { data, error } = await supabase
    .from('meal_plan_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    console.error('Error fetching meal plan template:', error)
    return null
  }

  return transformTemplate(data as MealPlanTemplateRow)
}

export function useMealPlanTemplate(templateId: string) {
  return useQuery({
    queryKey: ['mealPlanTemplate', templateId],
    queryFn: () => fetchMealPlanTemplate(templateId),
    enabled: !!templateId,
  })
}

// Alias for backwards compatibility
export function useMealPlan(mealPlanId: string) {
  return useMealPlanTemplate(mealPlanId)
}

// Create a meal plan template
interface CreateMealPlanTemplateData {
  name: string
  description?: string
  goal?: MealPlanGoal
  durationWeeks?: number
  targetCalories?: number
  targetProtein?: number
  targetCarbs?: number
  targetFat?: number
  targetFibre?: number
  dietaryRequirements?: string[]
  allergies?: string[]
  cuisinePreferences?: string[]
  isTemplate?: boolean
  isPublic?: boolean
  tags?: string[]
  content?: Record<string, unknown>
}

async function createMealPlanTemplate(data: CreateMealPlanTemplateData): Promise<MealPlanTemplate> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data: newTemplate, error } = await supabase
    .from('meal_plan_templates')
    .insert({
      coach_id: user.id,
      name: data.name,
      description: data.description || null,
      goal: data.goal || null,
      duration_weeks: data.durationWeeks || null,
      target_calories: data.targetCalories || null,
      target_protein_g: data.targetProtein || null,
      target_carbs_g: data.targetCarbs || null,
      target_fat_g: data.targetFat || null,
      target_fibre_g: data.targetFibre || null,
      dietary_requirements: data.dietaryRequirements || null,
      allergies: data.allergies || null,
      cuisine_preferences: data.cuisinePreferences || null,
      is_template: data.isTemplate ?? true,
      is_public: data.isPublic ?? false,
      tags: data.tags || null,
      content: data.content || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating meal plan template:', error)
    throw new Error('Failed to create meal plan template')
  }

  return transformTemplate(newTemplate as MealPlanTemplateRow)
}

export function useCreateMealPlanTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMealPlanTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanTemplates'] })
    },
  })
}

// Alias for backwards compatibility
export function useCreateMealPlan() {
  return useCreateMealPlanTemplate()
}

// Update a meal plan template
interface UpdateMealPlanTemplateData {
  templateId: string
  name?: string
  description?: string
  goal?: MealPlanGoal
  durationWeeks?: number
  targetCalories?: number
  targetProtein?: number
  targetCarbs?: number
  targetFat?: number
  targetFibre?: number
  dietaryRequirements?: string[]
  allergies?: string[]
  cuisinePreferences?: string[]
  isTemplate?: boolean
  isPublic?: boolean
  tags?: string[]
  content?: Record<string, unknown>
}

async function updateMealPlanTemplate(data: UpdateMealPlanTemplateData): Promise<MealPlanTemplate> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.goal !== undefined) updateData.goal = data.goal
  if (data.durationWeeks !== undefined) updateData.duration_weeks = data.durationWeeks
  if (data.targetCalories !== undefined) updateData.target_calories = data.targetCalories
  if (data.targetProtein !== undefined) updateData.target_protein_g = data.targetProtein
  if (data.targetCarbs !== undefined) updateData.target_carbs_g = data.targetCarbs
  if (data.targetFat !== undefined) updateData.target_fat_g = data.targetFat
  if (data.targetFibre !== undefined) updateData.target_fibre_g = data.targetFibre
  if (data.dietaryRequirements !== undefined) updateData.dietary_requirements = data.dietaryRequirements
  if (data.allergies !== undefined) updateData.allergies = data.allergies
  if (data.cuisinePreferences !== undefined) updateData.cuisine_preferences = data.cuisinePreferences
  if (data.isTemplate !== undefined) updateData.is_template = data.isTemplate
  if (data.isPublic !== undefined) updateData.is_public = data.isPublic
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.content !== undefined) updateData.content = data.content

  const { data: updatedTemplate, error } = await supabase
    .from('meal_plan_templates')
    .update(updateData)
    .eq('id', data.templateId)
    .eq('coach_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating meal plan template:', error)
    throw new Error('Failed to update meal plan template')
  }

  return transformTemplate(updatedTemplate as MealPlanTemplateRow)
}

export function useUpdateMealPlanTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMealPlanTemplate,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanTemplates'] })
      queryClient.invalidateQueries({ queryKey: ['mealPlanTemplate', variables.templateId] })
    },
  })
}

// Alias for backwards compatibility
export function useUpdateMealPlan() {
  return useUpdateMealPlanTemplate()
}

// Delete a meal plan template
async function deleteMealPlanTemplate(templateId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { error } = await supabase
    .from('meal_plan_templates')
    .delete()
    .eq('id', templateId)
    .eq('coach_id', user.id)

  if (error) {
    console.error('Error deleting meal plan template:', error)
    throw new Error('Failed to delete meal plan template')
  }
}

export function useDeleteMealPlanTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMealPlanTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanTemplates'] })
    },
  })
}

// Alias for backwards compatibility
export function useDeleteMealPlan() {
  return useDeleteMealPlanTemplate()
}

// Duplicate a meal plan template
async function duplicateMealPlanTemplate(templateId: string): Promise<MealPlanTemplate> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Fetch original template
  const { data: original, error: fetchError } = await supabase
    .from('meal_plan_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (fetchError || !original) {
    throw new Error('Template not found')
  }

  // Create duplicate
  const { data: duplicate, error: createError } = await supabase
    .from('meal_plan_templates')
    .insert({
      coach_id: user.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      goal: original.goal,
      duration_weeks: original.duration_weeks,
      target_calories: original.target_calories,
      target_protein_g: original.target_protein_g,
      target_carbs_g: original.target_carbs_g,
      target_fat_g: original.target_fat_g,
      target_fibre_g: original.target_fibre_g,
      dietary_requirements: original.dietary_requirements,
      allergies: original.allergies,
      cuisine_preferences: original.cuisine_preferences,
      is_template: true,
      is_public: false,
      tags: original.tags,
      content: original.content,
    })
    .select()
    .single()

  if (createError) {
    console.error('Error duplicating meal plan template:', createError)
    throw new Error('Failed to duplicate meal plan template')
  }

  return transformTemplate(duplicate as MealPlanTemplateRow)
}

export function useDuplicateMealPlanTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: duplicateMealPlanTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanTemplates'] })
    },
  })
}

// Alias for backwards compatibility
export function useDuplicateMealPlan() {
  return useDuplicateMealPlanTemplate()
}

// ==================== Meal Plan Assignments ====================

interface UseMealPlanAssignmentsOptions {
  clientId?: string
  status?: AssignmentStatus
  page?: number
  pageSize?: number
}

async function fetchMealPlanAssignments(
  options: UseMealPlanAssignmentsOptions = {}
): Promise<PaginatedResponse<MealPlanAssignment>> {
  const { clientId, status, page = 1, pageSize = 20 } = options

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Build query with joins
  let query = supabase
    .from('meal_plan_assignments')
    .select(`
      *,
      template:meal_plan_templates (*),
      client:profiles!client_id (
        id,
        display_name,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  // Apply filters
  if (clientId) {
    query = query.eq('client_id', clientId)
  }
  if (status) {
    query = query.eq('status', status)
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching meal plan assignments:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const assignments = (data || []).map(row => transformAssignment(row as MealPlanAssignmentRow))
  const total = count || 0

  return {
    data: assignments,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export function useMealPlanAssignments(options: UseMealPlanAssignmentsOptions = {}) {
  return useQuery({
    queryKey: ['mealPlanAssignments', options],
    queryFn: () => fetchMealPlanAssignments(options),
    staleTime: 30 * 1000,
  })
}

// Fetch assignments for a specific client
export function useClientMealPlanAssignments(clientId: string) {
  return useMealPlanAssignments({ clientId })
}

// Fetch a single assignment
async function fetchMealPlanAssignment(assignmentId: string): Promise<MealPlanAssignment | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return null
  }

  const { data, error } = await supabase
    .from('meal_plan_assignments')
    .select(`
      *,
      template:meal_plan_templates (*),
      client:profiles!client_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('id', assignmentId)
    .single()

  if (error) {
    console.error('Error fetching meal plan assignment:', error)
    return null
  }

  return transformAssignment(data as MealPlanAssignmentRow)
}

export function useMealPlanAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ['mealPlanAssignment', assignmentId],
    queryFn: () => fetchMealPlanAssignment(assignmentId),
    enabled: !!assignmentId,
  })
}

// Assign a meal plan to a client
interface AssignMealPlanData {
  clientId: string
  templateId?: string
  name: string
  content: Record<string, unknown>
  startDate: string
  endDate?: string
  targetCalories?: number
  targetProtein?: number
  targetCarbs?: number
  targetFat?: number
  targetFibre?: number
  dietaryRequirements?: string[]
  allergies?: string[]
  coachNotes?: string
}

async function assignMealPlan(data: AssignMealPlanData): Promise<MealPlanAssignment> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data: newAssignment, error } = await supabase
    .from('meal_plan_assignments')
    .insert({
      client_id: data.clientId,
      coach_id: user.id,
      template_id: data.templateId || null,
      name: data.name,
      content: data.content,
      start_date: data.startDate,
      end_date: data.endDate || null,
      status: 'scheduled',
      adherence_percentage: 0,
      target_calories: data.targetCalories || null,
      target_protein_g: data.targetProtein || null,
      target_carbs_g: data.targetCarbs || null,
      target_fat_g: data.targetFat || null,
      target_fibre_g: data.targetFibre || null,
      dietary_requirements: data.dietaryRequirements || null,
      allergies: data.allergies || null,
      coach_notes: data.coachNotes || null,
    })
    .select(`
      *,
      template:meal_plan_templates (*),
      client:profiles!client_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Error assigning meal plan:', error)
    throw new Error('Failed to assign meal plan')
  }

  return transformAssignment(newAssignment as MealPlanAssignmentRow)
}

export function useAssignMealPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignMealPlan,
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanAssignments'] })
      queryClient.invalidateQueries({ queryKey: ['mealPlanAssignments', { clientId: assignment.clientId }] })
    },
  })
}

// Update an assignment
interface UpdateMealPlanAssignmentData {
  assignmentId: string
  status?: AssignmentStatus
  adherencePercentage?: number
  coachNotes?: string
  content?: Record<string, unknown>
}

async function updateMealPlanAssignment(data: UpdateMealPlanAssignmentData): Promise<MealPlanAssignment> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const updateData: Record<string, unknown> = {}
  if (data.status !== undefined) updateData.status = data.status
  if (data.adherencePercentage !== undefined) updateData.adherence_percentage = data.adherencePercentage
  if (data.coachNotes !== undefined) updateData.coach_notes = data.coachNotes
  if (data.content !== undefined) updateData.content = data.content

  const { data: updatedAssignment, error } = await supabase
    .from('meal_plan_assignments')
    .update(updateData)
    .eq('id', data.assignmentId)
    .eq('coach_id', user.id)
    .select(`
      *,
      template:meal_plan_templates (*),
      client:profiles!client_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Error updating meal plan assignment:', error)
    throw new Error('Failed to update meal plan assignment')
  }

  return transformAssignment(updatedAssignment as MealPlanAssignmentRow)
}

export function useUpdateMealPlanAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMealPlanAssignment,
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanAssignments'] })
      queryClient.invalidateQueries({ queryKey: ['mealPlanAssignment', assignment.id] })
    },
  })
}

// Unassign/delete an assignment
async function unassignMealPlan(assignmentId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { error } = await supabase
    .from('meal_plan_assignments')
    .delete()
    .eq('id', assignmentId)
    .eq('coach_id', user.id)

  if (error) {
    console.error('Error unassigning meal plan:', error)
    throw new Error('Failed to unassign meal plan')
  }
}

export function useUnassignMealPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unassignMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanAssignments'] })
    },
  })
}
