// Shared TypeScript types for the Synced Momentum Coach Platform

import type { User } from '@supabase/supabase-js'

// Re-export database types when generated
export * from './database.types'

// User types
export interface CoachProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  businessName?: string
  bio?: string
  credentials?: string
  brandColour?: string
  websiteUrl?: string
  instagramHandle?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  profile: CoachProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Client types (athletes the coach manages)
export interface Client {
  id: string
  coachId: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  status: ClientStatus
  subscriptionStatus?: SubscriptionStatus
  lastActiveAt?: string
  sessionsThisWeek?: number
  currentProgrammeId?: string
  currentMealPlanId?: string
  createdAt: string
  updatedAt: string
}

export type ClientStatus = 'active' | 'pending' | 'paused' | 'ended'
export type SubscriptionStatus = 'active' | 'trial' | 'cancelled' | 'expired' | 'none'

// Extended client with related data
export interface ClientWithDetails extends Client {
  currentProgramme?: Programme
  currentMealPlan?: MealPlan
  recentCheckIns?: CheckIn[]
  stats?: ClientStats
}

export interface ClientStats {
  trainingAdherence: number
  nutritionAdherence: number
  checkInStreak: number
  totalSessions: number
  personalRecords: number
}

// Check-in types
export interface CheckIn {
  id: string
  clientId: string
  clientName?: string
  clientEmail?: string
  coachId: string
  weekStartDate: string
  submittedAt: string
  weight?: number
  weightUnit?: 'kg' | 'lbs'
  previousWeight?: number
  weightChange?: number
  averageSteps?: number
  stepsTarget?: number
  dailySteps?: number[]
  sleepHours?: number
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent'
  waterIntake?: number
  waterUnit?: 'litres' | 'oz'
  supplementsTaken?: string[]
  supplementsTotal?: number
  supplementCompliance?: number
  notes?: string
  photos?: string[]
  coachFeedback?: string
  coachRating?: number
  reviewedAt?: string
  reviewedBy?: string
  status: CheckInStatus
  createdAt: string
  updatedAt: string
}

export type CheckInStatus = 'pending' | 'reviewed'

// Programme types
export interface Programme {
  id: string
  coachId: string
  name: string
  description?: string
  type: ProgrammeType
  difficulty: DifficultyLevel
  durationWeeks: number
  isTemplate: boolean
  isPublished: boolean
  timesAssigned: number
  createdAt: string
  updatedAt: string
}

export type ProgrammeType = 'strength' | 'hypertrophy' | 'powerlifting' | 'conditioning' | 'mobility' | 'custom'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface ProgrammeWeek {
  id: string
  programmeId: string
  weekNumber: number
  trainingDays: TrainingDay[]
}

export interface TrainingDay {
  id: string
  weekId: string
  dayNumber: number
  name: string
  type: string
  exercises: ProgrammeExercise[]
}

export interface ProgrammeExercise {
  id: string
  programmeId?: string
  dayId?: string
  exerciseId: string
  exerciseName: string
  muscleGroup?: string
  sets: number
  reps: string
  rpeTarget?: number
  restSeconds?: number
  notes?: string
  sortOrder: number
  supersetGroupId?: string
}

export interface ProgrammeAssignment {
  id: string
  clientId: string
  programmeId: string
  programmeName: string
  startDate: string
  endDate?: string
  completionPercentage: number
  status: 'active' | 'completed' | 'cancelled'
  customisations?: Record<string, unknown>
  createdAt: string
}

// Meal plan types
export interface MealPlan {
  id: string
  coachId: string
  name: string
  description?: string
  type: MealPlanType
  trainingDayCalories: number
  trainingDayProtein: number
  trainingDayCarbs: number
  trainingDayFat: number
  nonTrainingDayCalories: number
  nonTrainingDayProtein: number
  nonTrainingDayCarbs: number
  nonTrainingDayFat: number
  isTemplate: boolean
  isPublished: boolean
  timesAssigned: number
  createdAt: string
  updatedAt: string
}

export type MealPlanType = 'cutting' | 'bulking' | 'maintenance' | 'contest_prep'

export interface Meal {
  id: string
  mealPlanId: string
  isTrainingDay: boolean
  name: string
  time: string
  sortOrder: number
  foods: MealFood[]
}

export interface MealFood {
  id: string
  mealId: string
  foodId: string
  foodName: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MealPlanAssignment {
  id: string
  clientId: string
  mealPlanId: string
  mealPlanName: string
  startDate: string
  endDate?: string
  status: 'active' | 'completed' | 'cancelled'
  customisations?: Record<string, unknown>
  createdAt: string
}

// Message types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderType: 'coach' | 'client'
  recipientId: string
  recipientType: 'coach' | 'client'
  content: string
  readAt: string | null
  createdAt: string
}

// Notification types
export interface Notification {
  id: string
  coachId: string
  type: NotificationType
  title: string
  description: string
  linkUrl?: string
  isRead: boolean
  createdAt: string
}

export type NotificationType =
  | 'check_in_submitted'
  | 'message_received'
  | 'client_accepted'
  | 'client_inactive'

// Analytics types
export interface CoachAnalytics {
  totalActiveClients: number
  totalSessionsThisWeek: number
  totalMealsLoggedThisWeek: number
  avgTrainingAdherence: number
  avgNutritionAdherence: number
  checkInSubmissionRate: number
  atRiskClients: Client[]
  clientLoginData: { date: string; count: number }[]
}

// Exercise library types
export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  secondaryMuscles?: string[]
  equipment: string
  difficulty: DifficultyLevel
  instructions?: string
  videoUrl?: string
  imageUrl?: string
}

// Food database types
export interface Food {
  id: string
  name: string
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fibre?: number
  category: string
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
}

// Dashboard types
export interface DashboardStats {
  totalClients: number
  activeClients: number
  pendingCheckIns: number
  upcomingProgrammes: number
}

// Navigation types
export interface NavItem {
  label: string
  href: string
  icon: string
}

// Form types
export interface InviteClientForm {
  email: string
  customMessage?: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
