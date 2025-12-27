-- Migration: Add coach roles and branding fields to profiles
-- Description: Extends the existing profiles table with role-based access and coach branding
-- Author: Synced Momentum
-- Date: 2025-12-27

-- Add role enum type for user roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'coach', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add coach-specific fields to profiles table
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'client',
    ADD COLUMN IF NOT EXISTS business_name TEXT,
    ADD COLUMN IF NOT EXISTS business_logo_url TEXT,
    ADD COLUMN IF NOT EXISTS brand_colour TEXT DEFAULT '#F59E0B',
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS qualifications TEXT[],
    ADD COLUMN IF NOT EXISTS specialisations TEXT[],
    ADD COLUMN IF NOT EXISTS contact_email TEXT,
    ADD COLUMN IF NOT EXISTS contact_phone TEXT,
    ADD COLUMN IF NOT EXISTS website_url TEXT,
    ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_accepting_clients BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS max_clients INTEGER DEFAULT 50,
    ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/London';

-- Create index for role-based queries (coaches listing, etc.)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create index for coaches accepting clients
CREATE INDEX IF NOT EXISTS idx_profiles_accepting_clients
    ON profiles(is_accepting_clients)
    WHERE role = 'coach';

-- Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: client, coach, or admin';
COMMENT ON COLUMN profiles.business_name IS 'Coach business/brand name';
COMMENT ON COLUMN profiles.business_logo_url IS 'URL to coach business logo';
COMMENT ON COLUMN profiles.brand_colour IS 'Primary brand colour (hex format)';
COMMENT ON COLUMN profiles.bio IS 'Coach biography/about text';
COMMENT ON COLUMN profiles.qualifications IS 'Array of professional qualifications';
COMMENT ON COLUMN profiles.specialisations IS 'Array of coaching specialisations';
COMMENT ON COLUMN profiles.is_accepting_clients IS 'Whether coach is accepting new clients';
COMMENT ON COLUMN profiles.max_clients IS 'Maximum number of clients coach can manage';
COMMENT ON COLUMN profiles.timezone IS 'Coach timezone for scheduling';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- ALTER TABLE profiles
--     DROP COLUMN IF EXISTS role,
--     DROP COLUMN IF EXISTS business_name,
--     DROP COLUMN IF EXISTS business_logo_url,
--     DROP COLUMN IF EXISTS brand_colour,
--     DROP COLUMN IF EXISTS bio,
--     DROP COLUMN IF EXISTS qualifications,
--     DROP COLUMN IF EXISTS specialisations,
--     DROP COLUMN IF EXISTS contact_email,
--     DROP COLUMN IF EXISTS contact_phone,
--     DROP COLUMN IF EXISTS website_url,
--     DROP COLUMN IF EXISTS social_links,
--     DROP COLUMN IF EXISTS is_accepting_clients,
--     DROP COLUMN IF EXISTS max_clients,
--     DROP COLUMN IF EXISTS timezone;
--
-- DROP INDEX IF EXISTS idx_profiles_role;
-- DROP INDEX IF EXISTS idx_profiles_accepting_clients;
-- DROP TYPE IF EXISTS user_role;
