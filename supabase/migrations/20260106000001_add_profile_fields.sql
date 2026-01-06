-- Migration: Add missing profile fields
-- Description: Add first_name, last_name, email, date_of_birth, and height to profiles table
-- Author: Claude Code
-- Date: 2026-01-06

-- Add first_name column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;

-- Add last_name column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add email column (for caching from auth.users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add date_of_birth column (for athletes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add height column in cm (for athletes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height INTEGER;

-- Add comments
COMMENT ON COLUMN profiles.first_name IS 'User first name (synced from auth.users metadata)';
COMMENT ON COLUMN profiles.last_name IS 'User last name (synced from auth.users metadata)';
COMMENT ON COLUMN profiles.email IS 'User email (cached from auth.users)';
COMMENT ON COLUMN profiles.date_of_birth IS 'User date of birth (athlete-specific)';
COMMENT ON COLUMN profiles.height IS 'User height in centimeters (athlete-specific)';
