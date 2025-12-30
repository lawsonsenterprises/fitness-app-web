-- Add postcode column to profiles table for weather location
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postcode TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.postcode IS 'UK postcode for weather location lookup';
