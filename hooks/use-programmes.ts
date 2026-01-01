'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  ProgrammeTemplate,
  ProgrammeTemplateRow,
  ProgrammeAssignment,
  ProgrammeAssignmentRow,
  ProgrammeType,
  ProgrammeDifficulty,
  AssignmentStatus,
  PaginatedResponse,
} from '@/types'

const supabase = createClient()

// Transform database row to ProgrammeTemplate interface
function transformTemplate(row: ProgrammeTemplateRow): ProgrammeTemplate {
  return {
    id: row.id,
    coachId: row.coach_id,
    name: row.name,
    description: row.description,
    type: row.type,
    difficulty: row.difficulty,
    durationWeeks: row.duration_weeks,
    daysPerWeek: row.days_per_week,
    isTemplate: row.is_template ?? true,
    isPublic: row.is_public ?? false,
    tags: row.tags,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Transform database row to ProgrammeAssignment interface
function transformAssignment(row: ProgrammeAssignmentRow): ProgrammeAssignment {
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
    currentWeek: row.current_week,
    currentDay: row.current_day,
    progressPercentage: row.progress_percentage,
    lastWorkoutAt: row.last_workout_at,
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

// ==================== Programme Templates ====================

interface UseProgrammeTemplatesOptions {
  type?: ProgrammeType
  difficulty?: ProgrammeDifficulty
  isTemplate?: boolean
  isPublic?: boolean
  search?: string
  page?: number
  pageSize?: number
}

async function fetchProgrammeTemplates(
  options: UseProgrammeTemplatesOptions = {}
): Promise<PaginatedResponse<ProgrammeTemplate>> {
  const { type, difficulty, isTemplate, isPublic, search, page = 1, pageSize = 20 } = options

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Build query
  let query = supabase
    .from('programme_templates')
    .select('*', { count: 'exact' })
    .eq('coach_id', user.id)
    .order('updated_at', { ascending: false })

  // Apply filters
  if (type) {
    query = query.eq('type', type)
  }
  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }
  if (typeof isTemplate === 'boolean') {
    query = query.eq('is_template', isTemplate)
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
    console.error('Error fetching programme templates:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const templates = (data || []).map(row => transformTemplate(row as ProgrammeTemplateRow))
  const total = count || 0

  return {
    data: templates,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export function useProgrammeTemplates(options: UseProgrammeTemplatesOptions = {}) {
  return useQuery({
    queryKey: ['programmeTemplates', options],
    queryFn: () => fetchProgrammeTemplates(options),
    staleTime: 30 * 1000,
  })
}

// Alias for backwards compatibility
export function useProgrammes(options: UseProgrammeTemplatesOptions = {}) {
  return useProgrammeTemplates(options)
}

// Fetch a single programme template
async function fetchProgrammeTemplate(templateId: string): Promise<ProgrammeTemplate | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return null
  }

  const { data, error } = await supabase
    .from('programme_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    console.error('Error fetching programme template:', error)
    return null
  }

  return transformTemplate(data as ProgrammeTemplateRow)
}

export function useProgrammeTemplate(templateId: string) {
  return useQuery({
    queryKey: ['programmeTemplate', templateId],
    queryFn: () => fetchProgrammeTemplate(templateId),
    enabled: !!templateId,
  })
}

// Alias for backwards compatibility
export function useProgramme(programmeId: string) {
  return useProgrammeTemplate(programmeId)
}

// Create a programme template
interface CreateProgrammeTemplateData {
  name: string
  description?: string
  type?: ProgrammeType
  difficulty?: ProgrammeDifficulty
  durationWeeks: number
  daysPerWeek: number
  isTemplate?: boolean
  isPublic?: boolean
  tags?: string[]
  content?: Record<string, unknown>
}

async function createProgrammeTemplate(data: CreateProgrammeTemplateData): Promise<ProgrammeTemplate> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data: newTemplate, error } = await supabase
    .from('programme_templates')
    .insert({
      coach_id: user.id,
      name: data.name,
      description: data.description || null,
      type: data.type || null,
      difficulty: data.difficulty || null,
      duration_weeks: data.durationWeeks,
      days_per_week: data.daysPerWeek,
      is_template: data.isTemplate ?? true,
      is_public: data.isPublic ?? false,
      tags: data.tags || null,
      content: data.content || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating programme template:', error)
    throw new Error('Failed to create programme template')
  }

  return transformTemplate(newTemplate as ProgrammeTemplateRow)
}

export function useCreateProgrammeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProgrammeTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmeTemplates'] })
    },
  })
}

// Alias for backwards compatibility
export function useCreateProgramme() {
  return useCreateProgrammeTemplate()
}

// Update a programme template
interface UpdateProgrammeTemplateData {
  templateId: string
  name?: string
  description?: string
  type?: ProgrammeType
  difficulty?: ProgrammeDifficulty
  durationWeeks?: number
  daysPerWeek?: number
  isTemplate?: boolean
  isPublic?: boolean
  tags?: string[]
  content?: Record<string, unknown>
}

async function updateProgrammeTemplate(data: UpdateProgrammeTemplateData): Promise<ProgrammeTemplate> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.type !== undefined) updateData.type = data.type
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
  if (data.durationWeeks !== undefined) updateData.duration_weeks = data.durationWeeks
  if (data.daysPerWeek !== undefined) updateData.days_per_week = data.daysPerWeek
  if (data.isTemplate !== undefined) updateData.is_template = data.isTemplate
  if (data.isPublic !== undefined) updateData.is_public = data.isPublic
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.content !== undefined) updateData.content = data.content

  const { data: updatedTemplate, error } = await supabase
    .from('programme_templates')
    .update(updateData)
    .eq('id', data.templateId)
    .eq('coach_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating programme template:', error)
    throw new Error('Failed to update programme template')
  }

  return transformTemplate(updatedTemplate as ProgrammeTemplateRow)
}

export function useUpdateProgrammeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProgrammeTemplate,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programmeTemplates'] })
      queryClient.invalidateQueries({ queryKey: ['programmeTemplate', variables.templateId] })
    },
  })
}

// Alias for backwards compatibility
export function useUpdateProgramme() {
  return useUpdateProgrammeTemplate()
}

// Delete a programme template
async function deleteProgrammeTemplate(templateId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { error } = await supabase
    .from('programme_templates')
    .delete()
    .eq('id', templateId)
    .eq('coach_id', user.id)

  if (error) {
    console.error('Error deleting programme template:', error)
    throw new Error('Failed to delete programme template')
  }
}

export function useDeleteProgrammeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProgrammeTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmeTemplates'] })
    },
  })
}

// Alias for backwards compatibility
export function useDeleteProgramme() {
  return useDeleteProgrammeTemplate()
}

// Duplicate a programme template
async function duplicateProgrammeTemplate(templateId: string): Promise<ProgrammeTemplate> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Fetch original template
  const { data: original, error: fetchError } = await supabase
    .from('programme_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (fetchError || !original) {
    throw new Error('Template not found')
  }

  // Create duplicate
  const { data: duplicate, error: createError } = await supabase
    .from('programme_templates')
    .insert({
      coach_id: user.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      type: original.type,
      difficulty: original.difficulty,
      duration_weeks: original.duration_weeks,
      days_per_week: original.days_per_week,
      is_template: true,
      is_public: false,
      tags: original.tags,
      content: original.content,
    })
    .select()
    .single()

  if (createError) {
    console.error('Error duplicating programme template:', createError)
    throw new Error('Failed to duplicate programme template')
  }

  return transformTemplate(duplicate as ProgrammeTemplateRow)
}

export function useDuplicateProgrammeTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: duplicateProgrammeTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmeTemplates'] })
    },
  })
}

// Alias for backwards compatibility
export function useDuplicateProgramme() {
  return useDuplicateProgrammeTemplate()
}

// ==================== Programme Assignments ====================

interface UseProgrammeAssignmentsOptions {
  clientId?: string // Filter by client
  status?: AssignmentStatus
  page?: number
  pageSize?: number
}

async function fetchProgrammeAssignments(
  options: UseProgrammeAssignmentsOptions = {}
): Promise<PaginatedResponse<ProgrammeAssignment>> {
  const { clientId, status, page = 1, pageSize = 20 } = options

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Build query with joins
  let query = supabase
    .from('programme_assignments')
    .select(`
      *,
      template:programme_templates (*),
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
    console.error('Error fetching programme assignments:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const assignments = (data || []).map(row => transformAssignment(row as ProgrammeAssignmentRow))
  const total = count || 0

  return {
    data: assignments,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export function useProgrammeAssignments(options: UseProgrammeAssignmentsOptions = {}) {
  return useQuery({
    queryKey: ['programmeAssignments', options],
    queryFn: () => fetchProgrammeAssignments(options),
    staleTime: 30 * 1000,
  })
}

// Fetch assignments for a specific client
export function useClientProgrammeAssignments(clientId: string) {
  return useProgrammeAssignments({ clientId })
}

// Fetch a single assignment
async function fetchProgrammeAssignment(assignmentId: string): Promise<ProgrammeAssignment | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return null
  }

  const { data, error } = await supabase
    .from('programme_assignments')
    .select(`
      *,
      template:programme_templates (*),
      client:profiles!client_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('id', assignmentId)
    .single()

  if (error) {
    console.error('Error fetching programme assignment:', error)
    return null
  }

  return transformAssignment(data as ProgrammeAssignmentRow)
}

export function useProgrammeAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ['programmeAssignment', assignmentId],
    queryFn: () => fetchProgrammeAssignment(assignmentId),
    enabled: !!assignmentId,
  })
}

// Assign a programme to a client
interface AssignProgrammeData {
  clientId: string
  templateId?: string // If using a template
  name: string
  content: Record<string, unknown>
  startDate: string
  endDate?: string
  coachNotes?: string
}

async function assignProgramme(data: AssignProgrammeData): Promise<ProgrammeAssignment> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data: newAssignment, error } = await supabase
    .from('programme_assignments')
    .insert({
      client_id: data.clientId,
      coach_id: user.id,
      template_id: data.templateId || null,
      name: data.name,
      content: data.content,
      start_date: data.startDate,
      end_date: data.endDate || null,
      status: 'scheduled',
      current_week: 1,
      current_day: 1,
      progress_percentage: 0,
      coach_notes: data.coachNotes || null,
    })
    .select(`
      *,
      template:programme_templates (*),
      client:profiles!client_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Error assigning programme:', error)
    throw new Error('Failed to assign programme')
  }

  return transformAssignment(newAssignment as ProgrammeAssignmentRow)
}

export function useAssignProgramme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignProgramme,
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({ queryKey: ['programmeAssignments'] })
      queryClient.invalidateQueries({ queryKey: ['programmeAssignments', { clientId: assignment.clientId }] })
    },
  })
}

// Update an assignment
interface UpdateAssignmentData {
  assignmentId: string
  status?: AssignmentStatus
  currentWeek?: number
  currentDay?: number
  progressPercentage?: number
  lastWorkoutAt?: string
  coachNotes?: string
  content?: Record<string, unknown>
}

async function updateProgrammeAssignment(data: UpdateAssignmentData): Promise<ProgrammeAssignment> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const updateData: Record<string, unknown> = {}
  if (data.status !== undefined) updateData.status = data.status
  if (data.currentWeek !== undefined) updateData.current_week = data.currentWeek
  if (data.currentDay !== undefined) updateData.current_day = data.currentDay
  if (data.progressPercentage !== undefined) updateData.progress_percentage = data.progressPercentage
  if (data.lastWorkoutAt !== undefined) updateData.last_workout_at = data.lastWorkoutAt
  if (data.coachNotes !== undefined) updateData.coach_notes = data.coachNotes
  if (data.content !== undefined) updateData.content = data.content

  const { data: updatedAssignment, error } = await supabase
    .from('programme_assignments')
    .update(updateData)
    .eq('id', data.assignmentId)
    .eq('coach_id', user.id)
    .select(`
      *,
      template:programme_templates (*),
      client:profiles!client_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Error updating programme assignment:', error)
    throw new Error('Failed to update programme assignment')
  }

  return transformAssignment(updatedAssignment as ProgrammeAssignmentRow)
}

export function useUpdateProgrammeAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProgrammeAssignment,
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({ queryKey: ['programmeAssignments'] })
      queryClient.invalidateQueries({ queryKey: ['programmeAssignment', assignment.id] })
    },
  })
}

// Unassign/delete an assignment
async function unassignProgramme(assignmentId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { error } = await supabase
    .from('programme_assignments')
    .delete()
    .eq('id', assignmentId)
    .eq('coach_id', user.id)

  if (error) {
    console.error('Error unassigning programme:', error)
    throw new Error('Failed to unassign programme')
  }
}

export function useUnassignProgramme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unassignProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmeAssignments'] })
    },
  })
}
