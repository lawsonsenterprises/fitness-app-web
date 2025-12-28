-- Migration: Create notification preferences table
-- Description: Stores coach notification preferences for different channels
-- Author: Synced Momentum
-- Date: 2025-12-28

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Email digest frequency
    email_digest VARCHAR(20) DEFAULT 'realtime' CHECK (email_digest IN ('realtime', 'daily', 'weekly')),

    -- Check-in notifications
    check_ins_email BOOLEAN DEFAULT true,
    check_ins_push BOOLEAN DEFAULT true,
    check_ins_in_app BOOLEAN DEFAULT true,

    -- Message notifications
    messages_email BOOLEAN DEFAULT true,
    messages_push BOOLEAN DEFAULT true,
    messages_in_app BOOLEAN DEFAULT true,

    -- Client activity notifications
    client_activity_email BOOLEAN DEFAULT true,
    client_activity_push BOOLEAN DEFAULT false,
    client_activity_in_app BOOLEAN DEFAULT true,

    -- Reminder notifications
    reminders_email BOOLEAN DEFAULT true,
    reminders_push BOOLEAN DEFAULT false,
    reminders_in_app BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
    ON notification_preferences(user_id);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read own notification preferences"
    ON notification_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
    ON notification_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
    ON notification_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Add comments
COMMENT ON TABLE notification_preferences IS 'Stores user notification preferences for different channels';
COMMENT ON COLUMN notification_preferences.email_digest IS 'Frequency of email digest: realtime, daily, or weekly';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TABLE IF EXISTS notification_preferences;
-- DROP FUNCTION IF EXISTS update_notification_preferences_updated_at();
