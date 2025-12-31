-- Migration: Extend check_ins table with review fields
-- Description: Adds coach review functionality to existing check-in records
-- Author: Synced Momentum
-- Date: 2025-12-27
-- FIXED: Changed check_in_days to check_ins (correct table name)

-- Create review status enum
DO $$ BEGIN
    CREATE TYPE check_in_review_status AS ENUM ('pending', 'reviewed', 'flagged', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add coach review fields to check_ins table
ALTER TABLE check_ins
    ADD COLUMN IF NOT EXISTS review_status check_in_review_status DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS coach_feedback TEXT,
    ADD COLUMN IF NOT EXISTS coach_rating INTEGER, -- 1-5 rating for client adherence/effort
    ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false, -- Flag concerning check-ins
    ADD COLUMN IF NOT EXISTS flag_reason TEXT,
    ADD COLUMN IF NOT EXISTS requires_follow_up BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS follow_up_completed_at TIMESTAMPTZ;

-- Create indexes for coach review workflow
CREATE INDEX IF NOT EXISTS idx_check_ins_review_status ON check_ins(review_status);
CREATE INDEX IF NOT EXISTS idx_check_ins_reviewed_by ON check_ins(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_check_ins_flagged ON check_ins(is_flagged)
    WHERE is_flagged = true;
CREATE INDEX IF NOT EXISTS idx_check_ins_requires_follow_up ON check_ins(requires_follow_up)
    WHERE requires_follow_up = true AND follow_up_completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_check_ins_pending_review
    ON check_ins(review_status, created_at)
    WHERE review_status = 'pending';

-- Add constraint for coach rating
ALTER TABLE check_ins
    DROP CONSTRAINT IF EXISTS valid_coach_rating;
ALTER TABLE check_ins
    ADD CONSTRAINT valid_coach_rating CHECK (coach_rating IS NULL OR (coach_rating >= 1 AND coach_rating <= 5));

-- Add comments for documentation
COMMENT ON COLUMN check_ins.review_status IS 'Status of coach review: pending, reviewed, flagged, archived';
COMMENT ON COLUMN check_ins.reviewed_by IS 'Coach who reviewed this check-in';
COMMENT ON COLUMN check_ins.reviewed_at IS 'When the check-in was reviewed';
COMMENT ON COLUMN check_ins.coach_feedback IS 'Feedback from coach to client about this check-in';
COMMENT ON COLUMN check_ins.coach_rating IS 'Coach rating of client adherence/effort (1-5)';
COMMENT ON COLUMN check_ins.is_flagged IS 'Whether this check-in has been flagged for concern';
COMMENT ON COLUMN check_ins.flag_reason IS 'Reason for flagging the check-in';
COMMENT ON COLUMN check_ins.requires_follow_up IS 'Whether coach action is required';
COMMENT ON COLUMN check_ins.follow_up_completed_at IS 'When follow-up was completed';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- ALTER TABLE check_ins
--     DROP COLUMN IF EXISTS review_status,
--     DROP COLUMN IF EXISTS reviewed_by,
--     DROP COLUMN IF EXISTS reviewed_at,
--     DROP COLUMN IF EXISTS coach_feedback,
--     DROP COLUMN IF EXISTS coach_rating,
--     DROP COLUMN IF EXISTS is_flagged,
--     DROP COLUMN IF EXISTS flag_reason,
--     DROP COLUMN IF EXISTS requires_follow_up,
--     DROP COLUMN IF EXISTS follow_up_completed_at;
--
-- DROP INDEX IF EXISTS idx_check_ins_review_status;
-- DROP INDEX IF EXISTS idx_check_ins_reviewed_by;
-- DROP INDEX IF EXISTS idx_check_ins_flagged;
-- DROP INDEX IF EXISTS idx_check_ins_requires_follow_up;
-- DROP INDEX IF EXISTS idx_check_ins_pending_review;
-- DROP TYPE IF EXISTS check_in_review_status;
