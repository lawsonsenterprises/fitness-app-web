-- Migration: Add fitness_goals JSONB column to profiles
-- Description: Stores athlete fitness goals (weight, macros, activity level, etc.)

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS fitness_goals JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN profiles.fitness_goals IS 'JSON object containing athlete fitness goals: currentWeight, goalWeight, goalType, activityLevel, trainingDaysPerWeek, macro targets, etc.';

-- Example structure:
-- {
--   "currentWeight": 76.2,
--   "goalWeight": 74,
--   "goalType": "cut",
--   "activityLevel": "moderate",
--   "trainingDaysPerWeek": 4,
--   "trainingDay": { "calories": 2400, "protein": 180, "carbs": 250, "fat": 70 },
--   "restDay": { "calories": 2000, "protein": 180, "carbs": 150, "fat": 75 }
-- }
