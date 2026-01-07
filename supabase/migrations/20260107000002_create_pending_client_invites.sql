-- Migration: Create pending_client_invites table
-- Description: Store coach invitations to new clients who haven't signed up yet
-- Author: Synced Momentum
-- Date: 2026-01-07

-- Create the pending_client_invites table
CREATE TABLE IF NOT EXISTS pending_client_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

    -- Ensure unique invite per coach-email combination
    UNIQUE(coach_id, email)
);

-- Create index for faster lookups by email (used during signup)
CREATE INDEX IF NOT EXISTS idx_pending_client_invites_email ON pending_client_invites(email);

-- Create index for coach lookups
CREATE INDEX IF NOT EXISTS idx_pending_client_invites_coach ON pending_client_invites(coach_id);

-- RLS policies
ALTER TABLE pending_client_invites ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own pending invites
CREATE POLICY "Coaches can view own pending invites" ON pending_client_invites
    FOR SELECT USING (coach_id = auth.uid());

-- Coaches can create invites
CREATE POLICY "Coaches can create invites" ON pending_client_invites
    FOR INSERT WITH CHECK (coach_id = auth.uid() AND is_coach());

-- Coaches can delete their own invites
CREATE POLICY "Coaches can delete own invites" ON pending_client_invites
    FOR DELETE USING (coach_id = auth.uid());

-- Admins can view all invites
CREATE POLICY "Admins can view all pending invites" ON pending_client_invites
    FOR SELECT USING (is_admin());

COMMENT ON TABLE pending_client_invites IS 'Stores pending invitations from coaches to clients who have not yet signed up';
