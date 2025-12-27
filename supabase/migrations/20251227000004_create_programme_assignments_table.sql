-- Migration: Create programme_assignments table
-- Description: Assigns programme templates to specific clients with customisation
-- Author: Synced Momentum
-- Date: 2025-12-27

-- Create assignment status enum
DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('scheduled', 'active', 'paused', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create programme_assignments table
CREATE TABLE IF NOT EXISTS programme_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES programme_templates(id) ON DELETE SET NULL,
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Assignment details
    name TEXT NOT NULL, -- Can differ from template name
    status assignment_status DEFAULT 'scheduled',

    -- Timing
    start_date DATE NOT NULL,
    end_date DATE,
    current_week INTEGER DEFAULT 1,
    current_day INTEGER DEFAULT 1,

    -- Customised content (copied from template, can be modified)
    content JSONB NOT NULL DEFAULT '{"weeks": []}',

    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0,
    last_workout_at TIMESTAMPTZ,

    -- Coach notes specific to this assignment
    coach_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT valid_week CHECK (current_week > 0),
    CONSTRAINT valid_day CHECK (current_day > 0 AND current_day <= 7)
);

-- Enable Row Level Security
ALTER TABLE programme_assignments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programme_assignments_template_id ON programme_assignments(template_id);
CREATE INDEX IF NOT EXISTS idx_programme_assignments_coach_id ON programme_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_programme_assignments_client_id ON programme_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_programme_assignments_status ON programme_assignments(status);
CREATE INDEX IF NOT EXISTS idx_programme_assignments_start_date ON programme_assignments(start_date);
CREATE INDEX IF NOT EXISTS idx_programme_assignments_active
    ON programme_assignments(client_id, status)
    WHERE status = 'active';

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_programme_assignments_updated_at ON programme_assignments;
CREATE TRIGGER update_programme_assignments_updated_at
    BEFORE UPDATE ON programme_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE programme_assignments IS 'Programmes assigned to clients, derived from templates';
COMMENT ON COLUMN programme_assignments.template_id IS 'Original template (null if template deleted)';
COMMENT ON COLUMN programme_assignments.content IS 'Customised programme content for this client';
COMMENT ON COLUMN programme_assignments.progress_percentage IS 'Overall completion percentage';
COMMENT ON COLUMN programme_assignments.current_week IS 'Current week in the programme';
COMMENT ON COLUMN programme_assignments.current_day IS 'Current day within the week';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_programme_assignments_updated_at ON programme_assignments;
-- DROP TABLE IF EXISTS programme_assignments;
-- DROP TYPE IF EXISTS assignment_status;
