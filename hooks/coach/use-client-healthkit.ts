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
  WorkoutTypePieData,
} from '@/types/healthkit'

const supabase = createClient()

// ============================================================================
// Helper Functions
// ============================================================================

function getDateString(date: Date): string {
  // Use local date to match iOS app's date storage
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
// Client Readiness Hook (for coach viewing client data)
// ============================================================================

export function useClientReadiness(clientId?: string) {
  return useQuery({
    queryKey: ['client-readiness', clientId],
    queryFn: async (): Promise<TodaysReadiness> => {
      const today = getDateString(new Date())
      const defaultTarget = 10000

      // Fetch from all three tables in parallel to get the most complete data
      const [readinessResult, sleepResult, recoveryResult] = await Promise.all([
        supabase
          .from('daily_readiness_summaries')
          .select('*')
          .eq('user_id', clientId!)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('daily_sleep_summaries')
          .select('*')
          .eq('user_id', clientId!)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('daily_recovery_summaries')
          .select('*')
          .eq('user_id', clientId!)
          .eq('date', today)
          .maybeSingle(),
      ])

      if (readinessResult.error) {
        console.error('Error fetching client readiness:', readinessResult.error)
      }
      if (sleepResult.error) {
        console.error('Error fetching client sleep:', sleepResult.error)
      }
      if (recoveryResult.error) {
        console.error('Error fetching client recovery:', recoveryResult.error)
      }

      const raw = readinessResult.data as DailyReadinessSummary | null
      const sleepData = sleepResult.data as DailySleepSummary | null
      const recoveryData = recoveryResult.data as DailyRecoverySummary | null

      // Check if we have any data from any table
      const hasAnyData = raw || sleepData || recoveryData

      if (!hasAnyData) {
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

      // Merge data from all tables, preferring specific tables over readiness summary
      const strainScore = raw?.strain_score || 0
      const recoveryScore = recoveryData?.recovery_score ?? raw?.recovery_score ?? 0
      const sleepScore = sleepData?.sleep_score ?? raw?.sleep_score ?? 0
      const steps = raw?.steps || 0
      const activeEnergy = raw?.active_energy_kcal || 0
      const exerciseMinutes = raw?.exercise_minutes || 0

      // Calculate strain percentage - if strain_score > 21, it's already a percentage
      const strainPercentage = strainScore > 21
        ? Math.min(Math.round(strainScore), 100)
        : Math.round((strainScore / 21) * 100)

      return {
        raw,
        recoveryScore,
        sleepScore,
        strainScore,
        strainPercentage,
        readinessBand: raw?.overall_readiness_band || 'moderate',
        mode: raw?.mode || 'rest_day',
        steps,
        stepsTarget: defaultTarget,
        stepsPercentage: Math.min(Math.round((steps / defaultTarget) * 100), 100),
        activeEnergy,
        exerciseMinutes,
        hasData: true,
      }
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Readiness History (30 days for chart)
// ============================================================================

export function useClientReadinessHistory(clientId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['client-readiness-history', clientId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_readiness_summaries')
        .select('*')
        .eq('user_id', clientId!)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching client readiness history:', error)
        return []
      }

      return (data || []) as DailyReadinessSummary[]
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Sleep Data Hook
// ============================================================================

export function useClientSleepData(clientId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['client-sleep', clientId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_sleep_summaries')
        .select('*')
        .eq('user_id', clientId!)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching client sleep data:', error)
        return { data: [], stats: null }
      }

      const sleepData = (data || []) as DailySleepSummary[]

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
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Recovery Data Hook
// ============================================================================

export function useClientRecoveryData(clientId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['client-recovery', clientId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_recovery_summaries')
        .select('*')
        .eq('user_id', clientId!)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching client recovery data:', error)
        return { data: [], hrvStats: null, recoveryStats: null }
      }

      const recoveryData = (data || []) as DailyRecoverySummary[]

      if (recoveryData.length === 0) {
        return { data: recoveryData, hrvStats: null, recoveryStats: null }
      }

      // Calculate HRV stats
      const hrvValues = recoveryData
        .filter(d => d.resting_hrv != null)
        .map(d => d.resting_hrv!)

      const currentHRV = hrvValues[hrvValues.length - 1] || 0
      const sevenDayHRV = calculate7DayAverage(hrvValues.slice(-7))
      const thirtyDayHRV = calculate7DayAverage(hrvValues)

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
        baseline: Math.round(thirtyDayHRV),
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

      const recentRHR = rhrValues.slice(-7)
      const olderRHR = rhrValues.slice(-14, -7)
      let rhrTrend: 'improving' | 'declining' | 'stable' = 'stable'
      if (recentRHR.length > 0 && olderRHR.length > 0) {
        const recentAvg = calculate7DayAverage(recentRHR)
        const olderAvg = calculate7DayAverage(olderRHR)
        const rawTrend = calculateTrend(recentAvg, olderAvg)
        rhrTrend = rawTrend === 'improving' ? 'declining' : rawTrend === 'declining' ? 'improving' : 'stable'
      }

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
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Workouts Hook
// ============================================================================

export function useClientWorkouts(clientId?: string, limit: number = 20) {
  return useQuery({
    queryKey: ['client-workouts', clientId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_workouts')
        .select('*')
        .eq('user_id', clientId!)
        .order('start_time', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching client workouts:', error)
        return []
      }

      return (data || []) as DailyWorkout[]
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Workout Stats (for pie chart and summary)
// ============================================================================

export function useClientWorkoutStats(clientId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['client-workout-stats', clientId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_workouts')
        .select('*')
        .eq('user_id', clientId!)
        .gte('date', startDate)

      if (error) {
        console.error('Error fetching client workout stats:', error)
        return {
          totalWorkouts: 0,
          avgDuration: 0,
          avgCalories: 0,
          workoutTypes: [],
        }
      }

      const workouts = (data || []) as DailyWorkout[]

      if (workouts.length === 0) {
        return {
          totalWorkouts: 0,
          avgDuration: 0,
          avgCalories: 0,
          workoutTypes: [],
        }
      }

      // Calculate averages
      const durations = workouts.filter(w => w.duration_seconds).map(w => w.duration_seconds!)
      const calories = workouts.filter(w => w.active_energy_kcal).map(w => w.active_energy_kcal!)

      const avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60)
        : 0

      const avgCalories = calories.length > 0
        ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length)
        : 0

      // Calculate workout type distribution
      const typeCounts: Record<string, number> = {}
      for (const workout of workouts) {
        const type = workout.workout_type || 'Other'
        typeCounts[type] = (typeCounts[type] || 0) + 1
      }

      const workoutTypes: WorkoutTypePieData[] = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / workouts.length) * 100),
      }))

      return {
        totalWorkouts: workouts.length,
        avgDuration,
        avgCalories,
        workoutTypes,
      }
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Strain vs Recovery Hook (14 days for coach view)
// ============================================================================

export function useClientStrainRecovery(clientId?: string, days: number = 14) {
  return useQuery({
    queryKey: ['client-strain-recovery', clientId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_readiness_summaries')
        .select('date, strain_score, recovery_score, mode')
        .eq('user_id', clientId!)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching client strain/recovery:', error)
        return { data: [], alerts: [], insights: [] }
      }

      const strainRecoveryData = (data || []) as Pick<DailyReadinessSummary, 'date' | 'strain_score' | 'recovery_score' | 'mode'>[]

      // Generate alerts
      const alerts: RecoveryAlert[] = []
      const insights: string[] = []

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
          title: 'Deload Recommended',
          message: `Client's strain has exceeded recovery for ${consecutiveHighStrain} consecutive days. Consider prescribing a deload week.`,
          metric: 'strain',
        })
        insights.push('Strain consistently exceeding recovery - risk of overtraining')
      }

      // Check for low recovery on training days
      const lowRecoveryTrainingDays = strainRecoveryData.filter(
        d => d.mode === 'training_day' && (d.recovery_score || 0) < 60
      ).length

      if (lowRecoveryTrainingDays >= 2) {
        alerts.push({
          type: 'warning',
          title: 'Poor Recovery on Training Days',
          message: `Client has had ${lowRecoveryTrainingDays} training days with recovery below 60%. Consider adjusting training volume.`,
          metric: 'recovery',
        })
        insights.push('Multiple training days with inadequate recovery')
      }

      // Check for optimal recovery
      const optimalDays = strainRecoveryData.filter(
        d => (d.recovery_score || 0) >= 80
      ).length

      if (optimalDays >= Math.floor(strainRecoveryData.length * 0.7)) {
        insights.push('Client is recovering well - can consider increasing training load')
      }

      return { data: strainRecoveryData, alerts, insights }
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Weight Trends Hook
// ============================================================================

export function useClientWeightTrends(clientId?: string, days: number = 90) {
  return useQuery({
    queryKey: ['client-weight-trends', clientId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_readiness_summaries')
        .select('date, weight_kg')
        .eq('user_id', clientId!)
        .not('weight_kg', 'is', null)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching client weight trends:', error)
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
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Activity Trends Hook
// ============================================================================

export function useClientActivityTrends(clientId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['client-activity-trends', clientId, days],
    queryFn: async () => {
      const startDate = getDaysAgo(days)

      const { data, error } = await supabase
        .from('daily_readiness_summaries')
        .select('date, steps, active_energy_kcal, exercise_minutes')
        .eq('user_id', clientId!)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching client activity trends:', error)
        return { data: [], summary: null }
      }

      const activityData = (data || []) as Pick<DailyReadinessSummary, 'date' | 'steps' | 'active_energy_kcal' | 'exercise_minutes'>[]

      if (activityData.length === 0) {
        return { data: activityData, summary: null }
      }

      // Calculate summary
      const steps = activityData.filter(d => d.steps).map(d => d.steps!)
      const energy = activityData.filter(d => d.active_energy_kcal).map(d => d.active_energy_kcal!)
      const exercise = activityData.filter(d => d.exercise_minutes).map(d => d.exercise_minutes!)

      const summary: WeeklyActivitySummary = {
        totalSteps: steps.reduce((a, b) => a + b, 0),
        totalActiveEnergy: Math.round(energy.reduce((a, b) => a + b, 0)),
        totalExerciseMinutes: Math.round(exercise.reduce((a, b) => a + b, 0)),
        workoutsCompleted: 0, // This would need separate query
        averageSteps: steps.length > 0 ? Math.round(steps.reduce((a, b) => a + b, 0) / steps.length) : 0,
        averageExerciseMinutes: exercise.length > 0 ? Math.round(exercise.reduce((a, b) => a + b, 0) / exercise.length) : 0,
      }

      return { data: activityData, summary }
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Client Blood Work Hooks
// ============================================================================

export interface BloodMarker {
  id: string
  name: string
  code: string
  value: number
  unit: string
  refLow: number | null
  refHigh: number | null
  status: 'normal' | 'low' | 'high'
}

export interface BloodPanel {
  id: string
  date: string
  labName: string | null
  notes: string | null
  markers: BloodMarker[]
}

export function useClientBloodWork(clientId?: string) {
  return useQuery({
    queryKey: ['client-blood-work', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_panels')
        .select(`
          *,
          blood_markers(*)
        `)
        .eq('user_id', clientId!)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching client blood work:', error)
        return []
      }

      // Transform to frontend format
      const panels: BloodPanel[] = (data || []).map(panel => {
        const markers: BloodMarker[] = (panel.blood_markers || []).map((marker: {
          id: string
          name: string
          code: string
          value: number
          unit: string
          reference_low: number | null
          reference_high: number | null
        }) => {
          // Determine status based on reference ranges
          let status: 'normal' | 'low' | 'high' = 'normal'
          if (marker.reference_low != null && marker.value < marker.reference_low) {
            status = 'low'
          } else if (marker.reference_high != null && marker.value > marker.reference_high) {
            status = 'high'
          }

          return {
            id: marker.id,
            name: marker.name,
            code: marker.code,
            value: marker.value,
            unit: marker.unit,
            refLow: marker.reference_low,
            refHigh: marker.reference_high,
            status,
          }
        })

        return {
          id: panel.id,
          date: panel.date,
          labName: panel.lab_name,
          notes: panel.notes,
          markers,
        }
      })

      return panels
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  })
}
