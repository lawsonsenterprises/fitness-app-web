import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  DailyReadinessSummary,
  DailySleepSummary,
  DailyRecoverySummary,
  DailyWorkout,
  TodaysReadiness,
  WeeklyActivitySummary,
  SleepStats,
  HRVStats,
  RecoveryStats,
  WeightStats,
  RecoveryAlert,
} from '@/types/healthkit'

const supabase = createClient()

// ============================================================================
// Helper Functions
// ============================================================================

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return getDateString(date)
}

function calculateTrend(current: number, previous: number): 'improving' | 'declining' | 'stable' {
  const change = ((current - previous) / previous) * 100
  if (change > 5) return 'improving'
  if (change < -5) return 'declining'
  return 'stable'
}

function calculate7DayAverage(data: number[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, val) => sum + val, 0) / data.length
}

// ============================================================================
// Today's Readiness Hook
// ============================================================================

export function useTodaysReadiness(userId?: string) {
  return useQuery({
    queryKey: ['readiness', 'today', userId],
    queryFn: async (): Promise<TodaysReadiness> => {
      const today = getDateString(new Date())

      const { data, error } = await supabase
        .from('daily_readiness_summaries')
        .select('*')
        .eq('user_id', userId!)
        .eq('date', today)
        .maybeSingle()

      if (error) {
        console.error('Error fetching today\'s readiness:', error)
      }

      const raw = data as DailyReadinessSummary | null
      const defaultTarget = 10000 // Default step target

      if (!raw) {
        return {
          raw: null,
          recoveryScore: 0,
          sleepScore: 0,
          strainScore: 0,
          strainPercentage: 0,
          readinessBand: 'low',
          mode: 'rest_day',
          steps: 0,
          stepsTarget: defaultTarget,
          stepsPercentage: 0,
          activeEnergy: 0,
          exerciseMinutes: 0,
          hasData: false,
        }
      }

      const strainScore = raw.strain_score || 0
      const recoveryScore = raw.recovery_score || 0
      const steps = raw.steps || 0

      // Calculate strain percentage - if strain_score > 21, it's already a percentage
      // WHOOP uses 0-21 scale, but iOS app might send as percentage
      const strainPercentage = strainScore > 21
        ? Math.min(Math.round(strainScore), 100)  // Already a percentage, cap at 100
        : Math.round((strainScore / 21) * 100)     // Convert 0-21 to percentage

      return {
        raw,
        recoveryScore,
        sleepScore: raw.sleep_score || 0,
        strainScore,
        strainPercentage,
        readinessBand: raw.overall_readiness_band || 'moderate',
        mode: raw.mode || 'rest_day',
        steps,
        stepsTarget: defaultTarget,
        stepsPercentage: Math.min(Math.round((steps / defaultTarget) * 100), 100),
        activeEnergy: raw.active_energy_kcal || 0,
        exerciseMinutes: raw.exercise_minutes || 0,
        hasData: true,
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================================================
// Sleep Data Hook
// ============================================================================

export function useSleepData(userId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['sleep', days, userId],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_sleep_summaries')
        .select('*')
        .eq('user_id', userId!)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching sleep data:', error)
        return { data: [], stats: null }
      }

      const sleepData = (data || []) as DailySleepSummary[]

      // Calculate stats
      if (sleepData.length === 0) {
        return { data: sleepData, stats: null }
      }

      const durations = sleepData
        .filter(d => d.time_asleep_minutes != null)
        .map(d => d.time_asleep_minutes!)

      const scores = sleepData
        .filter(d => d.sleep_score != null)
        .map(d => d.sleep_score!)

      const avgDuration = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length / 60
        : 0

      const avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0

      // Calculate consistency (standard deviation of sleep times)
      let consistency = 100
      if (sleepData.length >= 3) {
        const times = sleepData
          .filter(d => d.sleep_start_time)
          .map(d => new Date(d.sleep_start_time!).getHours() * 60 + new Date(d.sleep_start_time!).getMinutes())

        if (times.length >= 3) {
          const mean = times.reduce((a, b) => a + b, 0) / times.length
          const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length
          const stdDev = Math.sqrt(variance)
          consistency = Math.max(0, Math.round(100 - stdDev / 2))
        }
      }

      const latestSleepBank = sleepData[sleepData.length - 1]?.sleep_bank_minutes || 0

      // Determine trend
      const recentScores = scores.slice(-7)
      const olderScores = scores.slice(-14, -7)
      let trend: 'improving' | 'declining' | 'stable' = 'stable'
      if (recentScores.length > 0 && olderScores.length > 0) {
        const recentAvg = calculate7DayAverage(recentScores)
        const olderAvg = calculate7DayAverage(olderScores)
        trend = calculateTrend(recentAvg, olderAvg)
      }

      const stats: SleepStats = {
        averageDuration: Math.round(avgDuration * 10) / 10,
        averageScore: Math.round(avgScore),
        consistency,
        sleepBank: latestSleepBank,
        trend,
      }

      return { data: sleepData, stats }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Recovery Data Hook
// ============================================================================

export function useRecoveryData(userId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['recovery', days, userId],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_recovery_summaries')
        .select('*')
        .eq('user_id', userId!)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching recovery data:', error)
        return { data: [], stats: null }
      }

      const recoveryData = (data || []) as DailyRecoverySummary[]

      if (recoveryData.length === 0) {
        return { data: recoveryData, stats: null }
      }

      // Calculate HRV stats
      const hrvValues = recoveryData
        .filter(d => d.resting_hrv != null)
        .map(d => d.resting_hrv!)

      const currentHRV = hrvValues[hrvValues.length - 1] || 0
      const sevenDayHRV = calculate7DayAverage(hrvValues.slice(-7))
      const thirtyDayHRV = calculate7DayAverage(hrvValues)

      // Determine HRV trend
      const recentHRV = hrvValues.slice(-7)
      const olderHRV = hrvValues.slice(-14, -7)
      let hrvTrend: 'improving' | 'declining' | 'stable' = 'stable'
      if (recentHRV.length > 0 && olderHRV.length > 0) {
        const recentAvg = calculate7DayAverage(recentHRV)
        const olderAvg = calculate7DayAverage(olderHRV)
        hrvTrend = calculateTrend(recentAvg, olderAvg)
      }

      const hrvStats: HRVStats = {
        current: Math.round(currentHRV),
        sevenDayAvg: Math.round(sevenDayHRV),
        thirtyDayAvg: Math.round(thirtyDayHRV),
        baseline: Math.round(thirtyDayHRV), // Use 30-day avg as baseline
        trend: hrvTrend,
        percentChange: thirtyDayHRV > 0
          ? Math.round(((currentHRV - thirtyDayHRV) / thirtyDayHRV) * 100)
          : 0,
      }

      // Calculate recovery stats
      const recoveryScores = recoveryData
        .filter(d => d.recovery_score != null)
        .map(d => d.recovery_score!)

      const rhrValues = recoveryData
        .filter(d => d.resting_hr != null)
        .map(d => d.resting_hr!)

      const currentRecovery = recoveryScores[recoveryScores.length - 1] || 0
      const currentRHR = rhrValues[rhrValues.length - 1] || 0

      // Determine RHR trend (lower is better for RHR)
      const recentRHR = rhrValues.slice(-7)
      const olderRHR = rhrValues.slice(-14, -7)
      let rhrTrend: 'improving' | 'declining' | 'stable' = 'stable'
      if (recentRHR.length > 0 && olderRHR.length > 0) {
        const recentAvg = calculate7DayAverage(recentRHR)
        const olderAvg = calculate7DayAverage(olderRHR)
        // For RHR, lower is better, so invert the trend
        const rawTrend = calculateTrend(recentAvg, olderAvg)
        rhrTrend = rawTrend === 'improving' ? 'declining' : rawTrend === 'declining' ? 'improving' : 'stable'
      }

      // Determine status based on recovery score
      let status: 'optimal' | 'moderate' | 'low' = 'moderate'
      if (currentRecovery >= 80) status = 'optimal'
      else if (currentRecovery < 60) status = 'low'

      const recoveryStats: RecoveryStats = {
        current: Math.round(currentRecovery),
        sevenDayAvg: Math.round(calculate7DayAverage(recoveryScores.slice(-7))),
        restingHR: Math.round(currentRHR),
        restingHRTrend: rhrTrend,
        status,
      }

      return { data: recoveryData, hrvStats, recoveryStats }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// HealthKit Workouts Hook
// ============================================================================

export function useHealthKitWorkouts(userId?: string, limit: number = 20) {
  return useQuery({
    queryKey: ['healthkit-workouts', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_workouts')
        .select('*')
        .eq('user_id', userId!)
        .order('start_time', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching HealthKit workouts:', error)
        return []
      }

      return (data || []) as DailyWorkout[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Weight Trends Hook (from readiness summaries)
// ============================================================================

export function useHealthKitWeightTrends(userId?: string, days: number = 90) {
  return useQuery({
    queryKey: ['healthkit-weight-trends', userId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_readiness_summaries')
        .select('date, weight_kg')
        .eq('user_id', userId!)
        .not('weight_kg', 'is', null)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching weight trends:', error)
        return { data: [], stats: null }
      }

      const weightData = (data || []).map(d => ({
        date: d.date,
        weight_kg: d.weight_kg as number,
      }))

      if (weightData.length === 0) {
        return { data: weightData, stats: null }
      }

      const weights = weightData.map(d => d.weight_kg)
      const currentWeight = weights[weights.length - 1]
      const startingWeight = weights[0]

      // Calculate weekly average change
      let weeklyAvgChange = 0
      if (weightData.length >= 7) {
        const weeklyChanges: number[] = []
        for (let i = 7; i < weightData.length; i++) {
          weeklyChanges.push(weights[i] - weights[i - 7])
        }
        if (weeklyChanges.length > 0) {
          weeklyAvgChange = weeklyChanges.reduce((a, b) => a + b, 0) / weeklyChanges.length
        }
      }

      const stats: WeightStats = {
        current: Math.round(currentWeight * 10) / 10,
        starting: Math.round(startingWeight * 10) / 10,
        change: Math.round((currentWeight - startingWeight) * 10) / 10,
        weeklyAvgChange: Math.round(weeklyAvgChange * 100) / 100,
      }

      return { data: weightData, stats }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Strain vs Recovery Hook
// ============================================================================

export function useStrainRecovery(userId?: string, days: number = 7) {
  return useQuery({
    queryKey: ['strain-recovery', userId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_readiness_summaries')
        .select('date, strain_score, recovery_score, mode')
        .eq('user_id', userId!)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching strain/recovery data:', error)
        return { data: [], alerts: [] }
      }

      const strainRecoveryData = (data || []) as Pick<DailyReadinessSummary, 'date' | 'strain_score' | 'recovery_score' | 'mode'>[]

      // Generate alerts
      const alerts: RecoveryAlert[] = []

      // Check for high strain consecutive days
      let consecutiveHighStrain = 0
      for (const day of strainRecoveryData) {
        const strainPct = ((day.strain_score || 0) / 21) * 100
        const recoveryPct = day.recovery_score || 0
        if (strainPct > recoveryPct) {
          consecutiveHighStrain++
        } else {
          consecutiveHighStrain = 0
        }
      }

      if (consecutiveHighStrain >= 3) {
        alerts.push({
          type: 'warning',
          title: 'Consider a Rest Day',
          message: `Your strain has exceeded your recovery for ${consecutiveHighStrain} consecutive days. Consider taking a rest day to prevent overtraining.`,
          metric: 'strain',
        })
      }

      // Check for low recovery on training day
      const latestDay = strainRecoveryData[strainRecoveryData.length - 1]
      if (latestDay && latestDay.mode === 'training_day' && (latestDay.recovery_score || 0) < 60) {
        alerts.push({
          type: 'warning',
          title: 'Low Recovery - Reduce Intensity',
          message: 'Your recovery is below 60% on a training day. Consider reducing training intensity or volume.',
          metric: 'recovery',
        })
      }

      return { data: strainRecoveryData, alerts }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Weekly Activity Summary Hook
// ============================================================================

export function useWeeklyActivity(userId?: string) {
  return useQuery({
    queryKey: ['weekly-activity', userId],
    queryFn: async (): Promise<WeeklyActivitySummary> => {
      const startDate = getDaysAgo(7)

      // Fetch readiness data for steps/energy/exercise
      const { data: readinessData, error: readinessError } = await supabase
        .from('daily_readiness_summaries')
        .select('steps, active_energy_kcal, exercise_minutes')
        .eq('user_id', userId!)
        .gte('date', startDate)

      // Fetch workout count
      const { count: workoutCount, error: workoutError } = await supabase
        .from('daily_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .gte('date', startDate)

      if (readinessError) console.error('Error fetching readiness:', readinessError)
      if (workoutError) console.error('Error fetching workouts:', workoutError)

      const days = readinessData || []
      const totalSteps = days.reduce((sum, d) => sum + (d.steps || 0), 0)
      const totalActiveEnergy = days.reduce((sum, d) => sum + (d.active_energy_kcal || 0), 0)
      const totalExerciseMinutes = days.reduce((sum, d) => sum + (d.exercise_minutes || 0), 0)

      return {
        totalSteps,
        totalActiveEnergy: Math.round(totalActiveEnergy),
        totalExerciseMinutes: Math.round(totalExerciseMinutes),
        workoutsCompleted: workoutCount || 0,
        averageSteps: days.length > 0 ? Math.round(totalSteps / days.length) : 0,
        averageExerciseMinutes: days.length > 0 ? Math.round(totalExerciseMinutes / days.length) : 0,
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
