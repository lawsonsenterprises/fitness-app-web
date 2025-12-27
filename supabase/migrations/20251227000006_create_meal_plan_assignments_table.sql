-- Migration: Create meal_plan_assignments table
-- Description: Assigns meal plan templates to specific clients with customisation
-- Author: Synced Momentum
-- Date: 2025-12-27

-- Create meal_plan_assignments table
CREATE TABLE IF NOT EXISTS meal_plan_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES meal_plan_templates(id) ON DELETE SET NULL,
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Assignment details
    name TEXT NOT NULL, -- Can differ from template name
    status assignment_status DEFAULT 'scheduled', -- Reusing enum from programme_assignments

    -- Timing
    start_date DATE NOT NULL,
    end_date DATE,

    -- Customised nutritional targets (can override template)
    target_calories INTEGER,
    target_protein_g INTEGER,
    target_carbs_g INTEGER,
    target_fat_g INTEGER,
    target_fibre_g INTEGER,

    -- Customised content (copied from template, can be modified)
    content JSONB NOT NULL DEFAULT '{"days": []}',

    -- Client-specific adjustments
    dietary_requirements TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',

    -- Adherence tracking
    adherence_percentage INTEGER DEFAULT 0,

    -- Coach notes specific to this assignment
    coach_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_adherence CHECK (adherence_percentage >= 0 AND adherence_percentage <= 100)
);

-- Enable Row Level Security
ALTER TABLE meal_plan_assignments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_plan_assignments_template_id ON meal_plan_assignments(template_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_assignments_coach_id ON meal_plan_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_assignments_client_id ON meal_plan_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_assignments_status ON meal_plan_assignments(status);
CREATE INDEX IF NOT EXISTS idx_meal_plan_assignments_start_date ON meal_plan_assignments(start_date);
CREATE INDEX IF NOT EXISTS idx_meal_plan_assignments_active
    ON meal_plan_assignments(client_id, status)
    WHERE status = 'active';

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_meal_plan_assignments_updated_at ON meal_plan_assignments;
CREATE TRIGGER update_meal_plan_assignments_updated_at
    BEFORE UPDATE ON meal_plan_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE meal_plan_assignments IS 'Meal plans assigned to clients, derived from templates';
COMMENT ON COLUMN meal_plan_assignments.template_id IS 'Original template (null if template deleted)';
COMMENT ON COLUMN meal_plan_assignments.content IS 'Customised meal plan content for this client';
COMMENT ON COLUMN meal_plan_assignments.adherence_percentage IS 'Client adherence to the meal plan';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_meal_plan_assignments_updated_at ON meal_plan_assignments;
-- DROP TABLE IF EXISTS meal_plan_assignments;
