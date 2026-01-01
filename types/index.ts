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
// Mapped from coach_clients joined with profiles
export interface Client {
  id: string // coach_clients.id
  coachId: string // coach_clients.coach_id
  clientId: string // coach_clients.client_id (profile id)
  displayName: string | null // profiles.display_name
  email: string | null // profiles.contact_email
  avatarUrl: string | null // profiles.avatar_url
  status: ClientStatus
  checkInFrequency: number | null // coach_clients.check_in_frequency
  nextCheckInDue: string | null // coach_clients.next_check_in_due
  notes: string | null // coach_clients.notes
  startedAt: string | null // coach_clients.started_at
  endedAt: string | null // coach_clients.ended_at
  createdAt: string
  updatedAt: string
}

// Helper to get client display name
export function getClientDisplayName(client: Client): string {
  return client.displayName || client.email || 'Unknown Client'
}

// Helper to get initials from display name
export function getClientInitials(client: Client): string {
  const name = client.displayName || client.email || ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || '??'
}

// Database raw types for internal use
export interface CoachClientRow {
  id: string
  coach_id: string
  client_id: string
  status: ClientStatus | null
  check_in_frequency: number | null
  next_check_in_due: string | null
  notes: string | null
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
  client?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    contact_email: string | null
    roles: string[] | null
  }
}

export type ClientStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'

// Subscription types - matches Stripe/database enums
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused'
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise'

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

// Check-in types - maps to check_ins table
export interface CheckIn {
  id: string
  userId: string // The athlete who submitted
  date: string
  checkInType: string
  weight: number | null
  weightTimestamp: string | null
  sleepHours: number | null
  sleepQuality: string | null
  stepsAverage: number | null
  stepsTotal: number | null
  muscleGroupTrained: string | null
  sessionQuality: string | null
  notes: string | null
  photoData: string | null // JSON string with photo URLs
  videoRecorded: boolean
  coachFeedback: string | null
  coachRating: number | null
  reviewStatus: CheckInReviewStatus
  reviewedAt: string | null
  reviewedBy: string | null
  isFlagged: boolean
  flagReason: string | null
  requiresFollowUp: boolean
  followUpCompletedAt: string | null
  wasSentToCoach: boolean
  sentAt: string | null
  snoozedAt: string | null
  snoozedUntil: string | null
  snoozeCount: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  // Joined client data
  client?: {
    id: string
    displayName: string | null
    avatarUrl: string | null
    contactEmail: string | null
  }
}

export type CheckInReviewStatus = 'pending' | 'reviewed' | 'flagged' | 'archived'

// Backwards compatibility alias
export type CheckInStatus = CheckInReviewStatus

// Raw database row for check_ins
export interface CheckInRow {
  id: string
  user_id: string
  date: string
  check_in_type: string
  weight: number | null
  weight_timestamp: string | null
  sleep_hours: number | null
  sleep_quality: string | null
  steps_average: number | null
  steps_total: number | null
  muscle_group_trained: string | null
  session_quality: string | null
  notes: string | null
  photo_data: string | null
  video_recorded: boolean | null
  coach_feedback: string | null
  coach_rating: number | null
  review_status: CheckInReviewStatus | null
  reviewed_at: string | null
  reviewed_by: string | null
  is_flagged: boolean | null
  flag_reason: string | null
  requires_follow_up: boolean | null
  follow_up_completed_at: string | null
  was_sent_to_coach: boolean | null
  sent_at: string | null
  snoozed_at: string | null
  snoozed_until: string | null
  snooze_count: number | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  // Joined profile data
  client?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    contact_email: string | null
  }
}

// Programme types - maps to programme_templates table
export interface ProgrammeTemplate {
  id: string
  coachId: string
  name: string
  description: string | null
  type: ProgrammeType | null
  difficulty: ProgrammeDifficulty | null
  durationWeeks: number
  daysPerWeek: number
  isTemplate: boolean
  isPublic: boolean
  tags: string[] | null
  content: Record<string, unknown> // JSON blob with programme structure
  createdAt: string
  updatedAt: string
}

// Alias for backwards compatibility
export type Programme = ProgrammeTemplate

// Programme type - matches database enum
export type ProgrammeType = 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'sport_specific' | 'rehabilitation' | 'general_fitness' | 'custom'
export type ProgrammeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'elite'
export type DifficultyLevel = ProgrammeDifficulty // Alias for backwards compatibility

// Raw database row for programme_templates
export interface ProgrammeTemplateRow {
  id: string
  coach_id: string
  name: string
  description: string | null
  type: ProgrammeType | null
  difficulty: ProgrammeDifficulty | null
  duration_weeks: number
  days_per_week: number
  is_template: boolean | null
  is_public: boolean | null
  tags: string[] | null
  content: Record<string, unknown>
  created_at: string
  updated_at: string
}

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

// Programme assignment - maps to programme_assignments table
export interface ProgrammeAssignment {
  id: string
  clientId: string
  coachId: string
  templateId: string | null
  name: string
  content: Record<string, unknown> // Programme content (may be customized from template)
  startDate: string
  endDate: string | null
  status: AssignmentStatus
  currentWeek: number | null
  currentDay: number | null
  progressPercentage: number | null
  lastWorkoutAt: string | null
  coachNotes: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  template?: ProgrammeTemplate
  client?: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export type AssignmentStatus = 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'

// Raw database row for programme_assignments
export interface ProgrammeAssignmentRow {
  id: string
  client_id: string
  coach_id: string
  template_id: string | null
  name: string
  content: Record<string, unknown>
  start_date: string
  end_date: string | null
  status: AssignmentStatus | null
  current_week: number | null
  current_day: number | null
  progress_percentage: number | null
  last_workout_at: string | null
  coach_notes: string | null
  created_at: string
  updated_at: string
  template?: ProgrammeTemplateRow
  client?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
}

// Meal plan types - maps to meal_plan_templates table
export interface MealPlanTemplate {
  id: string
  coachId: string
  name: string
  description: string | null
  goal: MealPlanGoal | null
  durationWeeks: number | null
  targetCalories: number | null
  targetProtein: number | null
  targetCarbs: number | null
  targetFat: number | null
  targetFibre: number | null
  dietaryRequirements: string[] | null
  allergies: string[] | null
  cuisinePreferences: string[] | null
  isTemplate: boolean
  isPublic: boolean
  tags: string[] | null
  content: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Alias for backwards compatibility
export type MealPlan = MealPlanTemplate

export type MealPlanGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance' | 'health' | 'custom'

// Raw database row for meal_plan_templates
export interface MealPlanTemplateRow {
  id: string
  coach_id: string
  name: string
  description: string | null
  goal: MealPlanGoal | null
  duration_weeks: number | null
  target_calories: number | null
  target_protein_g: number | null
  target_carbs_g: number | null
  target_fat_g: number | null
  target_fibre_g: number | null
  dietary_requirements: string[] | null
  allergies: string[] | null
  cuisine_preferences: string[] | null
  is_template: boolean | null
  is_public: boolean | null
  tags: string[] | null
  content: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Meal plan assignment - maps to meal_plan_assignments table
export interface MealPlanAssignment {
  id: string
  clientId: string
  coachId: string
  templateId: string | null
  name: string
  content: Record<string, unknown>
  startDate: string
  endDate: string | null
  status: AssignmentStatus
  adherencePercentage: number | null
  targetCalories: number | null
  targetProtein: number | null
  targetCarbs: number | null
  targetFat: number | null
  targetFibre: number | null
  dietaryRequirements: string[] | null
  allergies: string[] | null
  coachNotes: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  template?: MealPlanTemplate
  client?: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  }
}

// Raw database row for meal_plan_assignments
export interface MealPlanAssignmentRow {
  id: string
  client_id: string
  coach_id: string
  template_id: string | null
  name: string
  content: Record<string, unknown>
  start_date: string
  end_date: string | null
  status: AssignmentStatus | null
  adherence_percentage: number | null
  target_calories: number | null
  target_protein_g: number | null
  target_carbs_g: number | null
  target_fat_g: number | null
  target_fibre_g: number | null
  dietary_requirements: string[] | null
  allergies: string[] | null
  coach_notes: string | null
  created_at: string
  updated_at: string
  template?: MealPlanTemplateRow
  client?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
}

// Legacy types for backwards compatibility
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

// Message types - maps to coach_messages table
export interface Message {
  id: string
  coachClientId: string // coach_client_id - the relationship ID
  senderId: string // sender_id - who sent the message
  content: string
  type: MessageType
  isRead: boolean
  readAt: string | null
  replyToId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  // Joined data
  sender?: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'system'

// Raw database row for internal use
export interface CoachMessageRow {
  id: string
  coach_client_id: string
  sender_id: string
  content: string
  type: MessageType | null
  is_read: boolean | null
  read_at: string | null
  reply_to_id: string | null
  metadata: Record<string, unknown> | null
  is_deleted_by_sender: boolean | null
  is_deleted_by_recipient: boolean | null
  created_at: string
  updated_at: string
  sender?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
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

// ============================================================================
// Admin/Platform Types - Maps to new Phase 5 tables
// ============================================================================

// Subscription - maps to subscriptions table
export interface Subscription {
  id: string
  userId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  status: SubscriptionStatus
  tier: SubscriptionTier
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  trialStart: string | null
  trialEnd: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  user?: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export interface SubscriptionRow {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  tier: SubscriptionTier
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  trial_start: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
}

// Support Ticket - maps to support_tickets table
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_user' | 'waiting_on_admin' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory = 'account' | 'billing' | 'technical' | 'feature_request' | 'bug_report' | 'coaching' | 'data_privacy' | 'other'

export interface SupportTicket {
  id: string
  ticketNumber: number
  userId: string
  assignedTo: string | null
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  tags: string[]
  resolution: string | null
  resolvedAt: string | null
  resolvedBy: string | null
  satisfactionRating: number | null
  satisfactionFeedback: string | null
  internalNotes: string | null
  firstResponseAt: string | null
  slaDeadline: string | null
  slaBreached: boolean
  createdAt: string
  updatedAt: string
  closedAt: string | null
  // Joined data
  user?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    displayName: string | null
  }
  assignee?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    displayName: string | null
  }
}

export interface SupportTicketRow {
  id: string
  ticket_number: number
  user_id: string
  assigned_to: string | null
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  tags: string[]
  resolution: string | null
  resolved_at: string | null
  resolved_by: string | null
  satisfaction_rating: number | null
  satisfaction_feedback: string | null
  internal_notes: string | null
  first_response_at: string | null
  sla_deadline: string | null
  sla_breached: boolean
  created_at: string
  updated_at: string
  closed_at: string | null
}

// Ticket Message - maps to support_ticket_messages table
export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  content: string
  isInternal: boolean
  attachments: unknown[]
  readAt: string | null
  createdAt: string
  // Joined data
  sender?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
}

export interface TicketMessageRow {
  id: string
  ticket_id: string
  sender_id: string
  content: string
  is_internal: boolean
  attachments: unknown[]
  read_at: string | null
  created_at: string
}

// Platform Metrics - maps to platform_metrics table
export type MetricType = 'user_count' | 'active_users' | 'new_signups' | 'coach_count' | 'athlete_count' | 'check_ins_submitted' | 'programmes_created' | 'meal_plans_created' | 'messages_sent' | 'revenue' | 'churn_rate' | 'retention_rate'
export type MetricPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface PlatformMetric {
  id: string
  metricType: MetricType
  metricPeriod: MetricPeriod
  metricValue: number
  metricDate: string
  breakdownByRole: Record<string, unknown> | null
  breakdownByPlan: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface PlatformMetricRow {
  id: string
  metric_type: MetricType
  metric_period: MetricPeriod
  metric_value: number
  metric_date: string
  breakdown_by_role: Record<string, unknown> | null
  breakdown_by_plan: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Audit Log - maps to audit_logs table
export type AuditAction =
  | 'auth.login' | 'auth.logout' | 'auth.password_change' | 'auth.password_reset' | 'auth.mfa_enable' | 'auth.mfa_disable'
  | 'user.create' | 'user.update' | 'user.delete' | 'user.role_change' | 'user.suspend' | 'user.reactivate'
  | 'subscription.create' | 'subscription.update' | 'subscription.cancel' | 'subscription.payment' | 'subscription.refund'
  | 'coach.client_add' | 'coach.client_remove' | 'coach.programme_create' | 'coach.programme_assign' | 'coach.meal_plan_create' | 'coach.meal_plan_assign' | 'coach.check_in_review'
  | 'admin.user_view' | 'admin.subscription_modify' | 'admin.ticket_assign' | 'admin.ticket_resolve' | 'admin.settings_change' | 'admin.data_export' | 'admin.data_delete'
  | 'system.error' | 'system.maintenance' | 'system.migration'

export type AuditSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

export interface AuditLog {
  id: string
  actorId: string | null
  actorType: string
  actorEmail: string | null
  action: AuditAction
  resourceType: string | null
  resourceId: string | null
  resourceName: string | null
  description: string | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  severity: AuditSeverity
  success: boolean | null
  errorCode: string | null
  errorMessage: string | null
  targetUserId: string | null
  targetUserEmail: string | null
  requestId: string | null
  sessionId: string | null
  actorIp: string | null
  actorUserAgent: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface AuditLogRow {
  id: string
  actor_id: string | null
  actor_type: string
  actor_email: string | null
  action: AuditAction
  resource_type: string | null
  resource_id: string | null
  resource_name: string | null
  description: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  severity: AuditSeverity
  success: boolean | null
  error_code: string | null
  error_message: string | null
  target_user_id: string | null
  target_user_email: string | null
  request_id: string | null
  session_id: string | null
  actor_ip: unknown
  actor_user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Coach Notes - maps to coach_notes table
export type NoteCategory = 'general' | 'progress' | 'concern' | 'goal' | 'medical' | 'behaviour' | 'reminder'

export interface CoachNote {
  id: string
  coachId: string
  clientId: string
  category: NoteCategory
  content: string
  isPrivate: boolean
  isPinned: boolean
  reminderDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CoachNoteRow {
  id: string
  coach_id: string
  client_id: string
  category: NoteCategory
  content: string
  is_private: boolean
  is_pinned: boolean
  reminder_date: string | null
  created_at: string
  updated_at: string
}

// Notification Preferences - maps to notification_preferences table (if exists)
export interface NotificationPreferences {
  id: string
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  checkInReminders: boolean
  messageNotifications: boolean
  programmeUpdates: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationPreferencesRow {
  id: string
  user_id: string
  email_enabled: boolean
  push_enabled: boolean
  check_in_reminders: boolean
  message_notifications: boolean
  programme_updates: boolean
  weekly_digest: boolean
  marketing_emails: boolean
  created_at: string
  updated_at: string
}
