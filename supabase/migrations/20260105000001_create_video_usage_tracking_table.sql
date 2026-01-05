-- Migration: Create video_usage_tracking table
-- Description: Track exercise video plays for tier-based daily limits
-- Author: Synced Momentum
-- Date: 2026-01-05
--
-- Purpose:
-- - Track MuscleWiki video API usage (counts toward tier limits)
-- - Track YouTube video plays (unlimited, for analytics only)
-- - Enforce tier-based daily limits: Logger (3), Premium (10), Global (80)
-- - Prevent duplicate tracking per user/exercise/day

-- Create video_type enum
DO $$ BEGIN
    CREATE TYPE video_type AS ENUM ('musclewiki', 'youtube');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create platform enum
DO $$ BEGIN
    CREATE TYPE platform_type AS ENUM ('ios', 'web');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create video_usage_tracking table
CREATE TABLE IF NOT EXISTS video_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User and exercise tracking
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

    -- Video type and platform
    video_type video_type NOT NULL,
    platform platform_type NOT NULL,

    -- Timestamp
    watched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Prevent duplicate tracking per user/exercise/day
    CONSTRAINT unique_video_per_user_exercise_day
        UNIQUE (user_id, exercise_id, video_type, DATE(watched_at))
);

-- Enable Row Level Security
ALTER TABLE video_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_usage_user_id
    ON video_usage_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_video_usage_exercise_id
    ON video_usage_tracking(exercise_id);

CREATE INDEX IF NOT EXISTS idx_video_usage_video_type
    ON video_usage_tracking(video_type);

CREATE INDEX IF NOT EXISTS idx_video_usage_watched_at
    ON video_usage_tracking(watched_at DESC);

-- Index for daily limit checks (most common query)
CREATE INDEX IF NOT EXISTS idx_video_usage_user_date_type
    ON video_usage_tracking(user_id, DATE(watched_at), video_type);

-- Index for global daily limit checks
CREATE INDEX IF NOT EXISTS idx_video_usage_date_type
    ON video_usage_tracking(DATE(watched_at), video_type);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_video_usage_platform
    ON video_usage_tracking(platform, watched_at DESC);

-- RLS Policies

-- Users can insert their own video tracking records
CREATE POLICY "Users can track own video plays"
    ON video_usage_tracking
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can read their own video tracking records
CREATE POLICY "Users can read own video tracking"
    ON video_usage_tracking
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Admins can read all video tracking records (for analytics and monitoring)
CREATE POLICY "Admins can read all video tracking"
    ON video_usage_tracking
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Admins can delete records (for data management)
CREATE POLICY "Admins can delete video tracking"
    ON video_usage_tracking
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Add comments for documentation
COMMENT ON TABLE video_usage_tracking IS 'Tracks exercise video plays for tier-based daily limits and analytics';
COMMENT ON COLUMN video_usage_tracking.user_id IS 'User who watched the video';
COMMENT ON COLUMN video_usage_tracking.exercise_id IS 'Exercise associated with the video';
COMMENT ON COLUMN video_usage_tracking.video_type IS 'MuscleWiki (counts toward limits) or YouTube (unlimited)';
COMMENT ON COLUMN video_usage_tracking.platform IS 'iOS app or web app';
COMMENT ON COLUMN video_usage_tracking.watched_at IS 'Timestamp when video was played';
COMMENT ON CONSTRAINT unique_video_per_user_exercise_day ON video_usage_tracking IS 'Prevents duplicate tracking of same video per day';

-- ============================================================================
-- TIER LIMITS REFERENCE
-- ============================================================================
-- Logger tier:      3 MuscleWiki videos per day
-- Premium tiers:   10 MuscleWiki videos per day
-- Global limit:    80 MuscleWiki videos per day (across all users)
-- YouTube videos:  Unlimited (no API cost)
--
-- Usage example query (check user's daily MuscleWiki video count):
-- SELECT COUNT(*) FROM video_usage_tracking
-- WHERE user_id = 'xxx'
--   AND video_type = 'musclewiki'
--   AND DATE(watched_at) = CURRENT_DATE;
--
-- Global daily count:
-- SELECT COUNT(*) FROM video_usage_tracking
-- WHERE video_type = 'musclewiki'
--   AND DATE(watched_at) = CURRENT_DATE;
-- ============================================================================

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TABLE IF EXISTS video_usage_tracking;
-- DROP TYPE IF EXISTS platform_type;
-- DROP TYPE IF EXISTS video_type;
