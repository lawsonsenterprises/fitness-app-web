-- Migration: Create subscriptions table
-- Description: Tracks user subscription status for Stripe integration
-- Author: Synced Momentum
-- Date: 2025-12-31

-- Create subscription_status enum
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM (
        'trialing',
        'active',
        'past_due',
        'canceled',
        'unpaid',
        'incomplete',
        'incomplete_expired',
        'paused'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create subscription_tier enum
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM (
        'free',
        'starter',
        'professional',
        'enterprise'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Stripe identifiers
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    stripe_product_id TEXT,

    -- Subscription details
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'trialing',

    -- Trial period
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,

    -- Cancellation
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,

    -- Feature limits based on tier
    max_clients INTEGER DEFAULT 3, -- free tier default
    max_programmes INTEGER DEFAULT 5,
    max_meal_plans INTEGER DEFAULT 5,
    features JSONB DEFAULT '{}', -- Additional feature flags

    -- Payment history summary
    total_revenue NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'gbp',
    last_payment_at TIMESTAMPTZ,
    last_payment_amount NUMERIC,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- One subscription per user
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end)
    WHERE status = 'trialing';

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
    ON subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Admins can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
    ON subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Admins can manage subscriptions
CREATE POLICY "Admins can insert subscriptions"
    ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

CREATE POLICY "Admins can update subscriptions"
    ON subscriptions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.roles)
        )
    );

-- Service role can manage all subscriptions (for Stripe webhooks)
CREATE POLICY "Service role manages subscriptions"
    ON subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'User subscription status and Stripe billing information';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe Customer ID for billing';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe Subscription ID';
COMMENT ON COLUMN subscriptions.tier IS 'Subscription tier: free, starter, professional, enterprise';
COMMENT ON COLUMN subscriptions.status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN subscriptions.max_clients IS 'Maximum number of clients allowed for this subscription';
COMMENT ON COLUMN subscriptions.features IS 'JSON object of additional feature flags enabled';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
-- DROP TABLE IF EXISTS subscriptions;
-- DROP TYPE IF EXISTS subscription_tier;
-- DROP TYPE IF EXISTS subscription_status;
