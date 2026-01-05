'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createExerciseSchema = z.object({
  name: z.string().min(3, 'Exercise name must be at least 3 characters').max(100, 'Exercise name must be at most 100 characters'),
  primaryMuscle: z.enum(['abs', 'chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'calves', 'biceps', 'triceps', 'forearms', 'core', 'quadriceps', 'hamstrings', 'full_body'], {
    required_error: 'Primary muscle group is required',
  }),
  secondaryMuscles: z.array(z.string()).optional(),
  equipment: z.enum(['barbell', 'dumbbell', 'bodyweight', 'cable', 'machine', 'kettlebell', 'resistance_band', 'smith_machine', 'other'], {
    required_error: 'Equipment is required',
  }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Difficulty is required',
  }),
  type: z.enum(['compound', 'isolation'], {
    required_error: 'Exercise type is required',
  }),
  youtubeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
})

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>

export async function createCustomExercise(input: CreateExerciseInput) {
  const supabase = await createClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate input
  const validatedFields = createExerciseSchema.safeParse(input)

  if (!validatedFields.success) {
    return {
      error: 'Invalid input',
      details: validatedFields.error.flatten().fieldErrors,
    }
  }

  const data = validatedFields.data

  // Convert instructions string to array (split by newline)
  const instructionsArray = data.instructions
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Insert custom exercise
  const { data: exercise, error } = await supabase
    .from('exercises')
    .insert({
      name: data.name,
      primary_muscle: data.primaryMuscle,
      secondary_muscles: data.secondaryMuscles || [],
      equipment: data.equipment,
      difficulty: data.difficulty,
      type: data.type,
      youtube_url: data.youtubeUrl || null,
      description: data.description,
      instructions: instructionsArray,
      is_custom: true,
      created_by_user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating custom exercise:', error)
    return { error: 'Failed to create exercise', details: error.message }
  }

  // Revalidate exercise library pages
  revalidatePath('/dashboard/exercises')
  revalidatePath('/athlete/training/exercises')

  return { success: true, exercise }
}
