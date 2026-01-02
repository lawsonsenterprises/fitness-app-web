-- Migration: Add super_admin role
-- Description: Adds super_admin as a valid role for platform owners
-- Author: Synced Momentum
-- Date: 2026-01-02

-- Update the valid_roles constraint to include super_admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_roles;
ALTER TABLE profiles
ADD CONSTRAINT valid_roles CHECK (
    roles <@ ARRAY['athlete', 'coach', 'admin', 'super_admin']::TEXT[]
);

-- Update comment
COMMENT ON COLUMN profiles.roles IS 'Array of user roles: athlete, coach, admin, super_admin. Users can have multiple roles. Super admins have full platform control and cannot be deleted.';
