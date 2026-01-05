-- Migration: Create RLS policies for programme builder tables
-- Description: Add Row Level Security policies for programmes, programme_days, and workout_items
-- Author: Synced Momentum
-- Date: 2026-01-05
--
-- Purpose:
-- - Enforce user-level access control for training programmes
-- - Allow users to view/edit only their own programmes
-- - Ensure programme_days and workout_items inherit access from parent programme

-- Enable Row Level Security
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROGRAMMES TABLE POLICIES
-- ============================================================================

-- Users can view their own programmes
CREATE POLICY "Users can view own programmes"
    ON programmes
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can create programmes
CREATE POLICY "Users can create programmes"
    ON programmes
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own programmes
CREATE POLICY "Users can update own programmes"
    ON programmes
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own programmes (soft delete via deleted_at)
CREATE POLICY "Users can delete own programmes"
    ON programmes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- PROGRAMME_DAYS TABLE POLICIES
-- ============================================================================

-- Users can view days of their programmes
CREATE POLICY "Users can view own programme days"
    ON programme_days
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM programmes
            WHERE programmes.id = programme_days.programme_id
            AND programmes.user_id = auth.uid()
        )
    );

-- Users can create days for their programmes
CREATE POLICY "Users can create programme days"
    ON programme_days
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM programmes
            WHERE programmes.id = programme_days.programme_id
            AND programmes.user_id = auth.uid()
        )
    );

-- Users can update days of their programmes
CREATE POLICY "Users can update own programme days"
    ON programme_days
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM programmes
            WHERE programmes.id = programme_days.programme_id
            AND programmes.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM programmes
            WHERE programmes.id = programme_days.programme_id
            AND programmes.user_id = auth.uid()
        )
    );

-- Users can delete days of their programmes
CREATE POLICY "Users can delete own programme days"
    ON programme_days
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM programmes
            WHERE programmes.id = programme_days.programme_id
            AND programmes.user_id = auth.uid()
        )
    );

-- ============================================================================
-- WORKOUT_ITEMS TABLE POLICIES
-- ============================================================================

-- Users can view workout items of their programmes
CREATE POLICY "Users can view own workout items"
    ON workout_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM programme_days pd
            JOIN programmes p ON p.id = pd.programme_id
            WHERE pd.id = workout_items.programme_day_id
            AND p.user_id = auth.uid()
        )
    );

-- Users can create workout items for their programmes
CREATE POLICY "Users can create workout items"
    ON workout_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM programme_days pd
            JOIN programmes p ON p.id = pd.programme_id
            WHERE pd.id = workout_items.programme_day_id
            AND p.user_id = auth.uid()
        )
    );

-- Users can update workout items of their programmes
CREATE POLICY "Users can update own workout items"
    ON workout_items
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM programme_days pd
            JOIN programmes p ON p.id = pd.programme_id
            WHERE pd.id = workout_items.programme_day_id
            AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM programme_days pd
            JOIN programmes p ON p.id = pd.programme_id
            WHERE pd.id = workout_items.programme_day_id
            AND p.user_id = auth.uid()
        )
    );

-- Users can delete workout items of their programmes
CREATE POLICY "Users can delete own workout items"
    ON workout_items
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM programme_days pd
            JOIN programmes p ON p.id = pd.programme_id
            WHERE pd.id = workout_items.programme_day_id
            AND p.user_id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON POLICY "Users can view own programmes" ON programmes IS 'Users can only view their own training programmes';
COMMENT ON POLICY "Users can view own programme days" ON programme_days IS 'Users can only view days from their own programmes';
COMMENT ON POLICY "Users can view own workout items" ON workout_items IS 'Users can only view workout items from their own programmes';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for programme ownership lookups (used in RLS policies)
CREATE INDEX IF NOT EXISTS idx_programmes_user_id_active
    ON programmes(user_id, is_active);

-- Index for programme_days lookups
CREATE INDEX IF NOT EXISTS idx_programme_days_programme_id
    ON programme_days(programme_id);

-- Index for workout_items lookups
CREATE INDEX IF NOT EXISTS idx_workout_items_programme_day_id
    ON workout_items(programme_day_id);

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP POLICY IF EXISTS "Users can view own programmes" ON programmes;
-- DROP POLICY IF EXISTS "Users can create programmes" ON programmes;
-- DROP POLICY IF EXISTS "Users can update own programmes" ON programmes;
-- DROP POLICY IF EXISTS "Users can delete own programmes" ON programmes;
-- DROP POLICY IF EXISTS "Users can view own programme days" ON programme_days;
-- DROP POLICY IF EXISTS "Users can create programme days" ON programme_days;
-- DROP POLICY IF EXISTS "Users can update own programme days" ON programme_days;
-- DROP POLICY IF EXISTS "Users can delete own programme days" ON programme_days;
-- DROP POLICY IF EXISTS "Users can view own workout items" ON workout_items;
-- DROP POLICY IF EXISTS "Users can create workout items" ON workout_items;
-- DROP POLICY IF EXISTS "Users can update own workout items" ON workout_items;
-- DROP POLICY IF EXISTS "Users can delete own workout items" ON workout_items;
--
-- ALTER TABLE programmes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE programme_days DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE workout_items DISABLE ROW LEVEL SECURITY;
