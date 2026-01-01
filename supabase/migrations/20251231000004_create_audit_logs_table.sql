-- Migration: Create audit_logs table
-- Description: Comprehensive audit logging for security and compliance
-- Author: Synced Momentum
-- Date: 2025-12-31

-- Create audit_action enum
DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM (
        -- Authentication
        'auth.login',
        'auth.logout',
        'auth.password_change',
        'auth.password_reset',
        'auth.mfa_enable',
        'auth.mfa_disable',

        -- User management
        'user.create',
        'user.update',
        'user.delete',
        'user.role_change',
        'user.suspend',
        'user.reactivate',

        -- Subscription
        'subscription.create',
        'subscription.update',
        'subscription.cancel',
        'subscription.payment',
        'subscription.refund',

        -- Coach actions
        'coach.client_add',
        'coach.client_remove',
        'coach.programme_create',
        'coach.programme_assign',
        'coach.meal_plan_create',
        'coach.meal_plan_assign',
        'coach.check_in_review',

        -- Admin actions
        'admin.user_view',
        'admin.subscription_modify',
        'admin.ticket_assign',
        'admin.ticket_resolve',
        'admin.settings_change',
        'admin.data_export',
        'admin.data_delete',

        -- System events
        'system.error',
        'system.maintenance',
        'system.migration'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create audit_severity enum
DO $$ BEGIN
    CREATE TYPE audit_severity AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who performed the action
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL DEFAULT 'user', -- 'user', 'system', 'webhook', 'cron'
    actor_email TEXT, -- Denormalized for historical reference
    actor_ip INET,
    actor_user_agent TEXT,

    -- What action was performed
    action audit_action NOT NULL,
    severity audit_severity NOT NULL DEFAULT 'info',

    -- On what resource
    resource_type TEXT, -- 'user', 'subscription', 'programme', etc.
    resource_id UUID,
    resource_name TEXT, -- Denormalized for readability

    -- Target user (if different from actor)
    target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_user_email TEXT, -- Denormalized

    -- Details
    description TEXT,
    old_values JSONB, -- State before change
    new_values JSONB, -- State after change
    metadata JSONB DEFAULT '{}', -- Additional context

    -- Request context
    request_id TEXT, -- For tracing
    session_id TEXT,

    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    error_code TEXT,

    -- Timestamp (not using updated_at as logs are immutable)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success) WHERE success = FALSE;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_action_time ON audit_logs(actor_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_time ON audit_logs(resource_type, resource_id, created_at DESC);

-- Full text search on description
CREATE INDEX IF NOT EXISTS idx_audit_logs_description_search ON audit_logs USING GIN (to_tsvector('english', COALESCE(description, '')));

-- RLS Policies: Only admins can read audit logs

CREATE POLICY "Admins can read audit logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Service role can insert audit logs (for system events)
CREATE POLICY "Service role can insert audit logs"
    ON audit_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Authenticated users can insert audit logs (for user actions)
CREATE POLICY "Users can create audit logs for own actions"
    ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- Prevent updates and deletes (audit logs are immutable)
-- No UPDATE or DELETE policies = no one can modify logs

-- Create function to log audit events (convenience wrapper)
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action audit_action,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_resource_name TEXT DEFAULT NULL,
    p_target_user_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_severity audit_severity DEFAULT 'info',
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_actor_email TEXT;
    v_target_email TEXT;
    v_log_id UUID;
BEGIN
    -- Get actor email
    SELECT email INTO v_actor_email
    FROM profiles
    WHERE id = auth.uid();

    -- Get target email if applicable
    IF p_target_user_id IS NOT NULL THEN
        SELECT email INTO v_target_email
        FROM profiles
        WHERE id = p_target_user_id;
    END IF;

    -- Insert audit log
    INSERT INTO audit_logs (
        actor_id,
        actor_email,
        action,
        severity,
        resource_type,
        resource_id,
        resource_name,
        target_user_id,
        target_user_email,
        description,
        old_values,
        new_values,
        metadata,
        success,
        error_message
    ) VALUES (
        auth.uid(),
        v_actor_email,
        p_action,
        p_severity,
        p_resource_type,
        p_resource_id,
        p_resource_name,
        p_target_user_id,
        v_target_email,
        p_description,
        p_old_values,
        p_new_values,
        p_metadata,
        p_success,
        p_error_message
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for security, compliance, and debugging';
COMMENT ON COLUMN audit_logs.actor_id IS 'User who performed the action (NULL for system events)';
COMMENT ON COLUMN audit_logs.actor_type IS 'Type of actor: user, system, webhook, cron';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., user, subscription)';
COMMENT ON COLUMN audit_logs.old_values IS 'JSON snapshot of state before change';
COMMENT ON COLUMN audit_logs.new_values IS 'JSON snapshot of state after change';
COMMENT ON COLUMN audit_logs.request_id IS 'Unique request ID for distributed tracing';
COMMENT ON FUNCTION log_audit_event IS 'Convenience function to create audit log entries';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP FUNCTION IF EXISTS log_audit_event;
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TYPE IF EXISTS audit_severity;
-- DROP TYPE IF EXISTS audit_action;
