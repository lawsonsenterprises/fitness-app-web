-- ============================================================================
-- HealthKit Tables and RLS Policies
-- Creates missing tables and enables RLS for athlete access
-- ============================================================================

-- ============================================================================
-- Create daily_workouts table (other tables already exist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type TEXT NOT NULL,
  name TEXT,
  duration_seconds INTEGER,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  active_energy_kcal NUMERIC(8,2),
  distance_meters NUMERIC(10,2),
  avg_heart_rate NUMERIC(5,2),
  max_heart_rate NUMERIC(5,2),
  source_name TEXT,
  healthkit_uuid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for daily_workouts
CREATE INDEX IF NOT EXISTS idx_daily_workouts_user_date ON daily_workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_workouts_user_start ON daily_workouts(user_id, start_time DESC);

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================
ALTER TABLE daily_readiness_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sleep_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_recovery_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_workouts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for daily_readiness_summaries
-- ============================================================================
DROP POLICY IF EXISTS "Athletes can read own readiness data" ON daily_readiness_summaries;
CREATE POLICY "Athletes can read own readiness data"
  ON daily_readiness_summaries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can insert own readiness data" ON daily_readiness_summaries;
CREATE POLICY "Athletes can insert own readiness data"
  ON daily_readiness_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can update own readiness data" ON daily_readiness_summaries;
CREATE POLICY "Athletes can update own readiness data"
  ON daily_readiness_summaries FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for daily_sleep_summaries
-- ============================================================================
DROP POLICY IF EXISTS "Athletes can read own sleep data" ON daily_sleep_summaries;
CREATE POLICY "Athletes can read own sleep data"
  ON daily_sleep_summaries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can insert own sleep data" ON daily_sleep_summaries;
CREATE POLICY "Athletes can insert own sleep data"
  ON daily_sleep_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can update own sleep data" ON daily_sleep_summaries;
CREATE POLICY "Athletes can update own sleep data"
  ON daily_sleep_summaries FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for daily_recovery_summaries
-- ============================================================================
DROP POLICY IF EXISTS "Athletes can read own recovery data" ON daily_recovery_summaries;
CREATE POLICY "Athletes can read own recovery data"
  ON daily_recovery_summaries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can insert own recovery data" ON daily_recovery_summaries;
CREATE POLICY "Athletes can insert own recovery data"
  ON daily_recovery_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can update own recovery data" ON daily_recovery_summaries;
CREATE POLICY "Athletes can update own recovery data"
  ON daily_recovery_summaries FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for daily_workouts
-- ============================================================================
DROP POLICY IF EXISTS "Athletes can read own workout data" ON daily_workouts;
CREATE POLICY "Athletes can read own workout data"
  ON daily_workouts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can insert own workout data" ON daily_workouts;
CREATE POLICY "Athletes can insert own workout data"
  ON daily_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can update own workout data" ON daily_workouts;
CREATE POLICY "Athletes can update own workout data"
  ON daily_workouts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can delete own workout data" ON daily_workouts;
CREATE POLICY "Athletes can delete own workout data"
  ON daily_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Grant access to authenticated users
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON daily_readiness_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_sleep_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_recovery_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_workouts TO authenticated;
