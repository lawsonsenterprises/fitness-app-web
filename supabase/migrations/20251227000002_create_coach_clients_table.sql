-- Migration: Create coach_clients relationship table
-- Description: Links coaches to their clients with status tracking
-- Author: Synced Momentum
-- Date: 2025-12-27

-- Create status enum for coach-client relationships
DO $$ BEGIN
    CREATE TYPE coach_client_status AS ENUM ('pending', 'active', 'paused', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create coach_clients junction table
CREATE TABLE IF NOT EXISTS coach_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status coach_client_status DEFAULT 'pending',

    -- Relationship metadata
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    notes TEXT,

    -- Client-specific settings (coach can customise per client)
    check_in_frequency INTEGER DEFAULT 7, -- days between check-ins
    next_check_in_due TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Ensure a client can only have one active relationship with a coach
    CONSTRAINT unique_coach_client UNIQUE (coach_id, client_id)
);

-- Enable Row Level Security
ALTER TABLE coach_clients ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_clients_coach_id ON coach_clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_client_id ON coach_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_status ON coach_clients(status);
CREATE INDEX IF NOT EXISTS idx_coach_clients_next_check_in ON coach_clients(next_check_in_due)
    WHERE status = 'active';

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_coach_clients_updated_at ON coach_clients;
CREATE TRIGGER update_coach_clients_updated_at
    BEFORE UPDATE ON coach_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE coach_clients IS 'Relationship table linking coaches to their clients';
COMMENT ON COLUMN coach_clients.coach_id IS 'Reference to the coach profile';
COMMENT ON COLUMN coach_clients.client_id IS 'Reference to the client profile';
COMMENT ON COLUMN coach_clients.status IS 'Current status of the coaching relationship';
COMMENT ON COLUMN coach_clients.check_in_frequency IS 'Days between client check-ins';
COMMENT ON COLUMN coach_clients.next_check_in_due IS 'When the next check-in is expected';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_coach_clients_updated_at ON coach_clients;
-- DROP TABLE IF EXISTS coach_clients;
-- DROP TYPE IF EXISTS coach_client_status;
