-- Migration: Add roles array to profiles table
-- Description: Adds role-based access control with support for multiple roles per user
-- Author: Synced Momentum
-- Date: 2025-12-28

-- Add roles column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['athlete']::TEXT[];

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING GIN (roles);

-- Add constraint to ensure valid roles
ALTER TABLE profiles
ADD CONSTRAINT valid_roles CHECK (
    roles <@ ARRAY['athlete', 'coach', 'admin']::TEXT[]
);

-- Update existing coaches to have coach role
UPDATE profiles
SET roles = ARRAY['coach']::TEXT[]
WHERE id IN (
    SELECT DISTINCT coach_id FROM clients WHERE coach_id IS NOT NULL
);

-- Add comment
COMMENT ON COLUMN profiles.roles IS 'Array of user roles: athlete, coach, admin. Users can have multiple roles.';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_roles;
-- DROP INDEX IF EXISTS idx_profiles_roles;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS roles;
