-- Migration: Fix is_coach_of function to include pending status
-- Description: Coaches need to see client profiles for pending relationships too
-- Author: Synced Momentum
-- Date: 2026-01-07

-- Update the is_coach_of function to include 'pending' status
-- This allows coaches to see profiles of clients they've just invited
CREATE OR REPLACE FUNCTION is_coach_of(client_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM coach_clients
        WHERE coach_id = auth.uid()
        AND client_id = client_uuid
        AND status IN ('active', 'paused', 'pending')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_coach_of(UUID) IS 'Returns true if current user is coach of specified client (including pending relationships)';
