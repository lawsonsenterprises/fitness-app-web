-- Migration: Create platform_metrics table
-- Description: Stores aggregated platform-wide metrics for admin dashboard
-- Author: Synced Momentum
-- Date: 2025-12-31

-- Create metric_type enum for categorising metrics
DO $$ BEGIN
    CREATE TYPE metric_type AS ENUM (
        'user_count',
        'active_users',
        'new_signups',
        'coach_count',
        'athlete_count',
        'check_ins_submitted',
        'programmes_created',
        'meal_plans_created',
        'messages_sent',
        'revenue',
        'churn_rate',
        'retention_rate'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create metric_period enum for time granularity
DO $$ BEGIN
    CREATE TYPE metric_period AS ENUM ('hourly', 'daily', 'weekly', 'monthly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create platform_metrics table
CREATE TABLE IF NOT EXISTS platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Metric identification
    metric_type metric_type NOT NULL,
    period metric_period NOT NULL DEFAULT 'daily',
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Metric values
    value NUMERIC NOT NULL DEFAULT 0,
    previous_value NUMERIC, -- For comparison/trend calculation
    change_percentage NUMERIC GENERATED ALWAYS AS (
        CASE
            WHEN previous_value IS NOT NULL AND previous_value != 0
            THEN ROUND(((value - previous_value) / previous_value) * 100, 2)
            ELSE NULL
        END
    ) STORED,

    -- Additional metadata
    breakdown JSONB DEFAULT '{}', -- For storing detailed breakdowns
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Ensure unique metrics per period
    CONSTRAINT unique_metric_period UNIQUE (metric_type, period, period_start)
);

-- Enable Row Level Security
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_metrics_type ON platform_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_period ON platform_metrics(period);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_period_start ON platform_metrics(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_lookup ON platform_metrics(metric_type, period, period_start DESC);

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_platform_metrics_updated_at ON platform_metrics;
CREATE TRIGGER update_platform_metrics_updated_at
    BEFORE UPDATE ON platform_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies: Only admins can read/write platform metrics
CREATE POLICY "Admins can read platform metrics"
    ON platform_metrics
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

CREATE POLICY "Admins can insert platform metrics"
    ON platform_metrics
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

CREATE POLICY "Admins can update platform metrics"
    ON platform_metrics
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Add comments for documentation
COMMENT ON TABLE platform_metrics IS 'Aggregated platform-wide metrics for admin analytics dashboard';
COMMENT ON COLUMN platform_metrics.metric_type IS 'Type of metric being tracked';
COMMENT ON COLUMN platform_metrics.period IS 'Time granularity of the metric';
COMMENT ON COLUMN platform_metrics.period_start IS 'Start of the measurement period';
COMMENT ON COLUMN platform_metrics.period_end IS 'End of the measurement period';
COMMENT ON COLUMN platform_metrics.value IS 'Current metric value';
COMMENT ON COLUMN platform_metrics.previous_value IS 'Previous period value for trend calculation';
COMMENT ON COLUMN platform_metrics.breakdown IS 'JSON breakdown of metric details (e.g., by role, region)';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_platform_metrics_updated_at ON platform_metrics;
-- DROP TABLE IF EXISTS platform_metrics;
-- DROP TYPE IF EXISTS metric_period;
-- DROP TYPE IF EXISTS metric_type;
