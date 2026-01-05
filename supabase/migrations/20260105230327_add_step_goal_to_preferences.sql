-- Migration: Add step_goal column to preferences table
-- Description: Add step goal tracking to user preferences for iOS sync
-- Author: Synced Momentum
-- Date: 2026-01-05

ALTER TABLE preferences 
ADD COLUMN IF NOT EXISTS step_goal INTEGER NOT NULL DEFAULT 10000;

COMMENT ON COLUMN preferences.step_goal IS 'Daily step goal for the user';
