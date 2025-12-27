-- Migration: Create coach_notes table
-- Description: Private notes coaches can write about their clients (not visible to clients)
-- Author: Synced Momentum
-- Date: 2025-12-27

-- Create note category enum
DO $$ BEGIN
    CREATE TYPE note_category AS ENUM ('general', 'progress', 'concern', 'goal', 'medical', 'behaviour', 'reminder');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create coach_notes table
CREATE TABLE IF NOT EXISTS coach_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Note content
    title TEXT,
    content TEXT NOT NULL,
    category note_category DEFAULT 'general',

    -- Importance and follow-up
    is_pinned BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false, -- For notes requiring action
    follow_up_date DATE, -- Optional reminder date

    -- Linked entities (optional references)
    linked_check_in_id UUID, -- Can reference a check-in
    linked_programme_id UUID, -- Can reference a programme assignment
    linked_meal_plan_id UUID, -- Can reference a meal plan assignment

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_notes_coach_id ON coach_notes(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_notes_client_id ON coach_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_coach_notes_category ON coach_notes(category);
CREATE INDEX IF NOT EXISTS idx_coach_notes_pinned ON coach_notes(coach_id, client_id, is_pinned)
    WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_coach_notes_flagged ON coach_notes(coach_id, is_flagged)
    WHERE is_flagged = true;
CREATE INDEX IF NOT EXISTS idx_coach_notes_follow_up ON coach_notes(follow_up_date)
    WHERE follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coach_notes_created_at ON coach_notes(created_at DESC);

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_coach_notes_updated_at ON coach_notes;
CREATE TRIGGER update_coach_notes_updated_at
    BEFORE UPDATE ON coach_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE coach_notes IS 'Private notes coaches write about clients (not visible to clients)';
COMMENT ON COLUMN coach_notes.coach_id IS 'The coach who wrote the note';
COMMENT ON COLUMN coach_notes.client_id IS 'The client the note is about';
COMMENT ON COLUMN coach_notes.category IS 'Category for organising notes';
COMMENT ON COLUMN coach_notes.is_pinned IS 'Pinned notes appear at top of client view';
COMMENT ON COLUMN coach_notes.is_flagged IS 'Flagged notes require coach attention';
COMMENT ON COLUMN coach_notes.follow_up_date IS 'Reminder date for follow-up action';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_coach_notes_updated_at ON coach_notes;
-- DROP TABLE IF EXISTS coach_notes;
-- DROP TYPE IF EXISTS note_category;
