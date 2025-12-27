-- Migration: Create coach_messages table
-- Description: Private messaging between coaches and clients
-- Author: Synced Momentum
-- Date: 2025-12-27

-- Create message type enum
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'voice', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create coach_messages table
CREATE TABLE IF NOT EXISTS coach_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_client_id UUID NOT NULL REFERENCES coach_clients(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Message content
    type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For file URLs, image dimensions, voice duration, etc.

    -- Read status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    -- Reply threading
    reply_to_id UUID REFERENCES coach_messages(id) ON DELETE SET NULL,

    -- Soft delete (messages can be hidden but not permanently deleted for compliance)
    is_deleted_by_sender BOOLEAN DEFAULT false,
    is_deleted_by_recipient BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_messages_coach_client_id ON coach_messages(coach_client_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_sender_id ON coach_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_created_at ON coach_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_messages_unread
    ON coach_messages(coach_client_id, is_read)
    WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_coach_messages_reply_to ON coach_messages(reply_to_id)
    WHERE reply_to_id IS NOT NULL;

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_coach_messages_updated_at ON coach_messages;
CREATE TRIGGER update_coach_messages_updated_at
    BEFORE UPDATE ON coach_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE coach_messages IS 'Private messages between coaches and their clients';
COMMENT ON COLUMN coach_messages.coach_client_id IS 'Reference to the coach-client relationship';
COMMENT ON COLUMN coach_messages.sender_id IS 'The user who sent the message';
COMMENT ON COLUMN coach_messages.type IS 'Type of message content';
COMMENT ON COLUMN coach_messages.metadata IS 'Additional data for non-text messages';
COMMENT ON COLUMN coach_messages.reply_to_id IS 'Reference to parent message for threading';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_coach_messages_updated_at ON coach_messages;
-- DROP TABLE IF EXISTS coach_messages;
-- DROP TYPE IF EXISTS message_type;
