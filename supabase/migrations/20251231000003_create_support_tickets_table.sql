-- Migration: Create support_tickets table
-- Description: Support ticket system for user issues and admin management
-- Author: Synced Momentum
-- Date: 2025-12-31

-- Create ticket_status enum
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM (
        'open',
        'in_progress',
        'waiting_on_user',
        'waiting_on_admin',
        'resolved',
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ticket_priority enum
DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ticket_category enum
DO $$ BEGIN
    CREATE TYPE ticket_category AS ENUM (
        'account',
        'billing',
        'technical',
        'feature_request',
        'bug_report',
        'coaching',
        'data_privacy',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number SERIAL UNIQUE, -- Human-readable ticket number

    -- Ticket ownership
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Ticket details
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category ticket_category NOT NULL DEFAULT 'other',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    status ticket_status NOT NULL DEFAULT 'open',

    -- Tags for filtering
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Attachments (stored as URLs or file references)
    attachments JSONB DEFAULT '[]',

    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- User satisfaction
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_feedback TEXT,

    -- Internal notes (admin only)
    internal_notes TEXT,

    -- SLA tracking
    first_response_at TIMESTAMPTZ,
    sla_deadline TIMESTAMPTZ,
    sla_breached BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMPTZ
);

-- Create support_ticket_messages table for conversation thread
CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Message content
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to user

    -- Attachments
    attachments JSONB DEFAULT '[]',

    -- Read status
    read_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_open ON support_tickets(status, priority, created_at)
    WHERE status NOT IN ('resolved', 'closed');
CREATE INDEX IF NOT EXISTS idx_support_tickets_tags ON support_tickets USING GIN (tags);

-- Create indexes for support_ticket_messages
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_sender_id ON support_ticket_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_created_at ON support_ticket_messages(ticket_id, created_at);

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for support_tickets

-- Users can read their own tickets
CREATE POLICY "Users can read own tickets"
    ON support_tickets
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets"
    ON support_tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update own tickets"
    ON support_tickets
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can read all tickets
CREATE POLICY "Admins can read all tickets"
    ON support_tickets
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Admins can update all tickets
CREATE POLICY "Admins can update all tickets"
    ON support_tickets
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- RLS Policies for support_ticket_messages

-- Users can read messages on their tickets (non-internal only)
CREATE POLICY "Users can read messages on own tickets"
    ON support_ticket_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_id
            AND support_tickets.user_id = auth.uid()
        )
        AND is_internal = FALSE
    );

-- Users can send messages on their tickets
CREATE POLICY "Users can send messages on own tickets"
    ON support_ticket_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid()
        AND is_internal = FALSE
        AND EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Admins can read all messages
CREATE POLICY "Admins can read all messages"
    ON support_ticket_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Admins can send messages (including internal)
CREATE POLICY "Admins can send messages"
    ON support_ticket_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Add comments for documentation
COMMENT ON TABLE support_tickets IS 'Support ticket system for user issues and requests';
COMMENT ON COLUMN support_tickets.ticket_number IS 'Human-readable sequential ticket number';
COMMENT ON COLUMN support_tickets.assigned_to IS 'Admin user assigned to handle this ticket';
COMMENT ON COLUMN support_tickets.sla_deadline IS 'Deadline for first response based on priority';
COMMENT ON COLUMN support_tickets.internal_notes IS 'Admin-only notes not visible to users';
COMMENT ON TABLE support_ticket_messages IS 'Conversation thread for support tickets';
COMMENT ON COLUMN support_ticket_messages.is_internal IS 'If true, message is only visible to admins';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TABLE IF EXISTS support_ticket_messages;
-- DROP TABLE IF EXISTS support_tickets;
-- DROP TYPE IF EXISTS ticket_category;
-- DROP TYPE IF EXISTS ticket_priority;
-- DROP TYPE IF EXISTS ticket_status;
