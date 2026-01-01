// ============================================================================
// Coach Hooks Index
// Exports all hooks for coach-side functionality
// ============================================================================

export {
  useClientReadiness,
  useClientReadinessHistory,
  useClientSleepData,
  useClientRecoveryData,
  useClientWorkouts,
  useClientWorkoutStats,
  useClientStrainRecovery,
  useClientWeightTrends,
  useClientActivityTrends,
  useClientBloodWork,
} from './use-client-healthkit'

export type { BloodPanel, BloodMarker } from './use-client-healthkit'
