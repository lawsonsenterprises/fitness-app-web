-- Migration: Create programme_templates table
-- Description: Reusable training programme templates created by coaches
-- Author: Synced Momentum
-- Date: 2025-12-27

-- Create difficulty level enum
DO $$ BEGIN
    CREATE TYPE programme_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create programme type enum
DO $$ BEGIN
    CREATE TYPE programme_type AS ENUM ('strength', 'hypertrophy', 'endurance', 'weight_loss', 'sport_specific', 'rehabilitation', 'general_fitness', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create programme_templates table
CREATE TABLE IF NOT EXISTS programme_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Programme details
    name TEXT NOT NULL,
    description TEXT,
    type programme_type DEFAULT 'custom',
    difficulty programme_difficulty DEFAULT 'intermediate',

    -- Duration and structure
    duration_weeks INTEGER NOT NULL DEFAULT 4,
    days_per_week INTEGER NOT NULL DEFAULT 4,

    -- Programme content (structured JSON)
    -- Contains weeks > days > exercises with sets, reps, rest, notes
    content JSONB NOT NULL DEFAULT '{"weeks": []}',

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    is_template BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false, -- Allow sharing between coaches

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_duration CHECK (duration_weeks > 0 AND duration_weeks <= 52),
    CONSTRAINT valid_days_per_week CHECK (days_per_week > 0 AND days_per_week <= 7)
);

-- Enable Row Level Security
ALTER TABLE programme_templates ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programme_templates_coach_id ON programme_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_programme_templates_type ON programme_templates(type);
CREATE INDEX IF NOT EXISTS idx_programme_templates_difficulty ON programme_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_programme_templates_public ON programme_templates(is_public)
    WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_programme_templates_tags ON programme_templates USING GIN(tags);

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_programme_templates_updated_at ON programme_templates;
CREATE TRIGGER update_programme_templates_updated_at
    BEFORE UPDATE ON programme_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE programme_templates IS 'Reusable training programme templates created by coaches';
COMMENT ON COLUMN programme_templates.coach_id IS 'The coach who created this template';
COMMENT ON COLUMN programme_templates.content IS 'Structured JSON containing weeks, days, and exercises';
COMMENT ON COLUMN programme_templates.is_template IS 'Whether this is a reusable template';
COMMENT ON COLUMN programme_templates.is_public IS 'Whether this template is visible to other coaches';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_programme_templates_updated_at ON programme_templates;
-- DROP TABLE IF EXISTS programme_templates;
-- DROP TYPE IF EXISTS programme_type;
-- DROP TYPE IF EXISTS programme_difficulty;
