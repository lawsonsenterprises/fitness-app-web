-- ============================================================================
-- HealthKit Tables RLS Policies
-- Allows athletes to read/write their own data, coaches to read client data
-- ============================================================================

-- Enable RLS on HealthKit tables (if not already enabled)
ALTER TABLE IF EXISTS daily_readiness_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_sleep_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_recovery_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_workouts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Daily Readiness Summaries
-- ============================================================================

-- Athletes can read their own readiness data
CREATE POLICY IF NOT EXISTS "Athletes can read own readiness data"
  ON daily_readiness_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Athletes can insert their own readiness data
CREATE POLICY IF NOT EXISTS "Athletes can insert own readiness data"
  ON daily_readiness_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Athletes can update their own readiness data
CREATE POLICY IF NOT EXISTS "Athletes can update own readiness data"
  ON daily_readiness_summaries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Coaches can read their clients' readiness data
CREATE POLICY IF NOT EXISTS "Coaches can read client readiness data"
  ON daily_readiness_summaries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.athlete_id = daily_readiness_summaries.user_id
        AND coach_clients.status = 'active'
    )
  );

-- ============================================================================
-- Daily Sleep Summaries
-- ============================================================================

-- Athletes can read their own sleep data
CREATE POLICY IF NOT EXISTS "Athletes can read own sleep data"
  ON daily_sleep_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Athletes can insert their own sleep data
CREATE POLICY IF NOT EXISTS "Athletes can insert own sleep data"
  ON daily_sleep_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Athletes can update their own sleep data
CREATE POLICY IF NOT EXISTS "Athletes can update own sleep data"
  ON daily_sleep_summaries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Coaches can read their clients' sleep data
CREATE POLICY IF NOT EXISTS "Coaches can read client sleep data"
  ON daily_sleep_summaries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.athlete_id = daily_sleep_summaries.user_id
        AND coach_clients.status = 'active'
    )
  );

-- ============================================================================
-- Daily Recovery Summaries
-- ============================================================================

-- Athletes can read their own recovery data
CREATE POLICY IF NOT EXISTS "Athletes can read own recovery data"
  ON daily_recovery_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Athletes can insert their own recovery data
CREATE POLICY IF NOT EXISTS "Athletes can insert own recovery data"
  ON daily_recovery_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Athletes can update their own recovery data
CREATE POLICY IF NOT EXISTS "Athletes can update own recovery data"
  ON daily_recovery_summaries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Coaches can read their clients' recovery data
CREATE POLICY IF NOT EXISTS "Coaches can read client recovery data"
  ON daily_recovery_summaries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.athlete_id = daily_recovery_summaries.user_id
        AND coach_clients.status = 'active'
    )
  );

-- ============================================================================
-- Daily Workouts
-- ============================================================================

-- Athletes can read their own workout data
CREATE POLICY IF NOT EXISTS "Athletes can read own workout data"
  ON daily_workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Athletes can insert their own workout data
CREATE POLICY IF NOT EXISTS "Athletes can insert own workout data"
  ON daily_workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Athletes can update their own workout data
CREATE POLICY IF NOT EXISTS "Athletes can update own workout data"
  ON daily_workouts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Athletes can delete their own workout data
CREATE POLICY IF NOT EXISTS "Athletes can delete own workout data"
  ON daily_workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Coaches can read their clients' workout data
CREATE POLICY IF NOT EXISTS "Coaches can read client workout data"
  ON daily_workouts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.athlete_id = daily_workouts.user_id
        AND coach_clients.status = 'active'
    )
  );

-- ============================================================================
-- Grant access to authenticated users
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON daily_readiness_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_sleep_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_recovery_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_workouts TO authenticated;

-- Add comments
COMMENT ON POLICY "Athletes can read own readiness data" ON daily_readiness_summaries IS 'Athletes can view their own daily readiness summaries';
COMMENT ON POLICY "Coaches can read client readiness data" ON daily_readiness_summaries IS 'Coaches can view their active clients readiness data';
