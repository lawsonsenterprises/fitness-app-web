// ============================================================================
// HealthKit Data Types for Synced Momentum
// These types map to the iOS HealthKit data synced to Supabase
// ============================================================================

/**
 * Daily readiness summary - aggregated daily health metrics from HealthKit
 * Provides overall readiness assessment for training decisions
 */
export interface DailyReadinessSummary {
  id: string
  user_id: string
  date: string // DATE format: YYYY-MM-DD

  // Core scores (0-100 for percentages, 0-21 for strain)
  strain_score: number | null // 0-21 scale
  recovery_score: number | null // 0-100%
  sleep_score: number | null // 0-100%

  // Overall assessment
  overall_readiness_band: ReadinessBand | null
  mode: DayMode | null

  // Activity metrics
  steps: number | null
  active_energy_kcal: number | null
  exercise_minutes: number | null

  // Body composition
  weight_kg: number | null

  // Metadata
  created_at: string | null
  updated_at: string | null
}

/**
 * Daily sleep summary - detailed sleep analysis from HealthKit
 */
export interface DailySleepSummary {
  id: string
  user_id: string
  date: string // The night (DATE format)

  // Duration metrics
  time_asleep_minutes: number | null

  // Quality score
  sleep_score: number | null // 0-100%

  // Sleep phases (in minutes)
  rem_minutes: number | null
  deep_minutes: number | null
  light_minutes: number | null
  awake_minutes: number | null

  // Timing
  sleep_start_time: string | null // TIMESTAMPTZ
  sleep_end_time: string | null // TIMESTAMPTZ

  // Sleep debt/surplus tracking
  sleep_bank_minutes: number | null // Positive = surplus, negative = debt

  // Metadata
  created_at: string | null
  updated_at: string | null
}

/**
 * Daily recovery summary - physiological recovery metrics from HealthKit
 */
export interface DailyRecoverySummary {
  id: string
  user_id: string
  date: string // DATE format

  // Core recovery score
  recovery_score: number | null // 0-100%

  // Heart metrics
  resting_hrv: number | null // HRV in milliseconds
  resting_hr: number | null // Resting heart rate in bpm

  // Respiratory & blood oxygen
  respiratory_rate: number | null // Breaths per minute
  oxygen_saturation: number | null // SpO2 percentage

  // Temperature (deviation from baseline)
  wrist_temperature: number | null // Deviation in degrees Celsius

  // Metadata
  created_at: string | null
  updated_at: string | null
}

/**
 * Daily workout - individual workout sessions from HealthKit
 */
export interface DailyWorkout {
  id: string
  user_id: string
  date: string // Workout date (DATE format)

  // Workout identification
  workout_type: WorkoutType
  name: string | null // Workout name (if available)

  // Duration and timing
  duration_seconds: number | null
  start_time: string | null // TIMESTAMPTZ
  end_time: string | null // TIMESTAMPTZ

  // Metrics
  active_energy_kcal: number | null
  distance_meters: number | null

  // Heart rate
  avg_heart_rate: number | null
  max_heart_rate: number | null

  // Source tracking
  source_name: string | null // e.g., "Apple Watch", "Strava"
  healthkit_uuid: string | null // For deduplication

  // Metadata
  created_at: string | null
  updated_at: string | null
}

// ============================================================================
// Enum Types
// ============================================================================

export type ReadinessBand = 'optimal' | 'moderate' | 'low'
export type DayMode = 'training_day' | 'rest_day'

export type WorkoutType =
  | 'Traditional Strength Training'
  | 'Running'
  | 'Cycling'
  | 'Walking'
  | 'Swimming'
  | 'HIIT'
  | 'Yoga'
  | 'Pilates'
  | 'Rowing'
  | 'Elliptical'
  | 'Stair Climbing'
  | 'Cross Training'
  | 'Functional Strength Training'
  | 'Mixed Cardio'
  | 'Core Training'
  | 'Flexibility'
  | 'Other'
  | string // Allow for other HealthKit workout types

// ============================================================================
// Chart Data Types (for Recharts components)
// ============================================================================

export interface SleepChartData {
  date: string
  hours: number
  score: number
  target: number
}

export interface SleepPhasesChartData {
  date: string
  rem: number
  deep: number
  light: number
  awake: number
}

export interface SleepBankChartData {
  date: string
  minutes: number
  isPositive: boolean
}

export interface HRVChartData {
  date: string
  hrv: number
  avg: number // 7-day rolling average
}

export interface RestingHRChartData {
  date: string
  rhr: number
  avg: number // 7-day rolling average
}

export interface RecoveryChartData {
  date: string
  score: number
  zone: 'optimal' | 'moderate' | 'low'
}

export interface StrainRecoveryChartData {
  date: string
  strain: number // As percentage (strain_score / 21 * 100)
  recovery: number
  isTrainingDay: boolean
}

export interface WeightChartData {
  date: string
  weight: number
  avg: number // 7-day moving average
  goal?: number
}

export interface ActivityChartData {
  date: string
  minutes: number
  target?: number
}

export interface WorkoutTypePieData {
  type: string
  count: number
  percentage: number
  [key: string]: string | number // Index signature for Recharts compatibility
}

// ============================================================================
// Computed/Derived Types
// ============================================================================

/**
 * Today's readiness data with computed values for display
 */
export interface TodaysReadiness {
  // Raw data
  raw: DailyReadinessSummary | null

  // Computed values for display
  recoveryScore: number // 0-100
  sleepScore: number // 0-100
  strainScore: number // 0-21
  strainPercentage: number // 0-100 (strain_score / 21 * 100)
  readinessBand: ReadinessBand
  mode: DayMode

  // Activity
  steps: number
  stepsTarget: number
  stepsPercentage: number
  activeEnergy: number
  exerciseMinutes: number

  // Has data flags
  hasData: boolean
}

/**
 * Weekly activity summary
 */
export interface WeeklyActivitySummary {
  totalSteps: number
  totalActiveEnergy: number
  totalExerciseMinutes: number
  workoutsCompleted: number
  averageSteps: number
  averageExerciseMinutes: number
}

/**
 * Sleep stats for display
 */
export interface SleepStats {
  averageDuration: number // hours
  averageScore: number // 0-100
  consistency: number // 0-100 (how consistent sleep times are)
  sleepBank: number // minutes (current bank status)
  trend: 'improving' | 'declining' | 'stable'
}

/**
 * HRV stats for display
 */
export interface HRVStats {
  current: number // Latest HRV
  sevenDayAvg: number
  thirtyDayAvg: number
  baseline: number // User's normal baseline
  trend: 'improving' | 'declining' | 'stable'
  percentChange: number // Change from baseline
}

/**
 * Recovery stats for display
 */
export interface RecoveryStats {
  current: number // Latest recovery score
  sevenDayAvg: number
  restingHR: number
  restingHRTrend: 'improving' | 'declining' | 'stable'
  status: ReadinessBand
}

/**
 * Weight stats for display
 */
export interface WeightStats {
  current: number
  starting: number // First weight in date range
  change: number // Difference
  weeklyAvgChange: number
  goal?: number
  toGoal?: number
}

// ============================================================================
// Alert/Insight Types
// ============================================================================

export interface RecoveryAlert {
  type: 'warning' | 'info'
  title: string
  message: string
  metric: 'strain' | 'recovery' | 'sleep' | 'hrv'
}

export type RecoveryAlertType =
  | 'high_strain_consecutive' // Strain > recovery for 3+ days
  | 'low_recovery_training_day' // Recovery < 60% on training day
  | 'declining_hrv' // HRV trending down
  | 'poor_sleep_streak' // Multiple nights of poor sleep
  | 'overtraining_risk' // Multiple factors indicating overtraining
