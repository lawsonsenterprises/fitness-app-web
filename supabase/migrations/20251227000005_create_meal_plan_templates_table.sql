-- Migration: Create meal_plan_templates table
-- Description: Reusable meal plan templates created by coaches
-- Author: Synced Momentum
-- Date: 2025-12-27

-- Create meal plan goal enum
DO $$ BEGIN
    CREATE TYPE meal_plan_goal AS ENUM ('weight_loss', 'muscle_gain', 'maintenance', 'performance', 'health', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create meal_plan_templates table
CREATE TABLE IF NOT EXISTS meal_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Plan details
    name TEXT NOT NULL,
    description TEXT,
    goal meal_plan_goal DEFAULT 'custom',

    -- Nutritional targets
    target_calories INTEGER,
    target_protein_g INTEGER,
    target_carbs_g INTEGER,
    target_fat_g INTEGER,
    target_fibre_g INTEGER,

    -- Duration
    duration_weeks INTEGER DEFAULT 4,

    -- Meal plan content (structured JSON)
    -- Contains days > meals > foods with portions, macros, alternatives
    content JSONB NOT NULL DEFAULT '{"days": []}',

    -- Dietary requirements and preferences
    dietary_requirements TEXT[] DEFAULT '{}', -- e.g., 'vegetarian', 'gluten_free', 'dairy_free'
    allergies TEXT[] DEFAULT '{}',
    cuisine_preferences TEXT[] DEFAULT '{}',

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    is_template BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_calories CHECK (target_calories IS NULL OR target_calories > 0),
    CONSTRAINT valid_protein CHECK (target_protein_g IS NULL OR target_protein_g >= 0),
    CONSTRAINT valid_carbs CHECK (target_carbs_g IS NULL OR target_carbs_g >= 0),
    CONSTRAINT valid_fat CHECK (target_fat_g IS NULL OR target_fat_g >= 0),
    CONSTRAINT valid_fibre CHECK (target_fibre_g IS NULL OR target_fibre_g >= 0)
);

-- Enable Row Level Security
ALTER TABLE meal_plan_templates ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_coach_id ON meal_plan_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_goal ON meal_plan_templates(goal);
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_public ON meal_plan_templates(is_public)
    WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_tags ON meal_plan_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_dietary ON meal_plan_templates USING GIN(dietary_requirements);

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_meal_plan_templates_updated_at ON meal_plan_templates;
CREATE TRIGGER update_meal_plan_templates_updated_at
    BEFORE UPDATE ON meal_plan_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE meal_plan_templates IS 'Reusable meal plan templates created by coaches';
COMMENT ON COLUMN meal_plan_templates.coach_id IS 'The coach who created this template';
COMMENT ON COLUMN meal_plan_templates.content IS 'Structured JSON containing days, meals, and foods';
COMMENT ON COLUMN meal_plan_templates.dietary_requirements IS 'Array of dietary requirements (vegetarian, vegan, etc.)';
COMMENT ON COLUMN meal_plan_templates.is_public IS 'Whether this template is visible to other coaches';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_meal_plan_templates_updated_at ON meal_plan_templates;
-- DROP TABLE IF EXISTS meal_plan_templates;
-- DROP TYPE IF EXISTS meal_plan_goal;
