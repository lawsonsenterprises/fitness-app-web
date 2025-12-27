-- Migration: Create Row Level Security policies for coach access
-- Description: Comprehensive RLS policies ensuring proper data isolation and coach access
-- Author: Synced Momentum
-- Date: 2025-12-27

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if current user is a coach
CREATE OR REPLACE FUNCTION is_coach()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'coach'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is coach of a specific client
CREATE OR REPLACE FUNCTION is_coach_of(client_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM coach_clients
        WHERE coach_id = auth.uid()
        AND client_id = client_uuid
        AND status IN ('active', 'paused')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all client IDs for current coach
CREATE OR REPLACE FUNCTION get_coach_client_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT client_id FROM coach_clients
    WHERE coach_id = auth.uid()
    AND status IN ('active', 'paused');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Coaches can view their clients' profiles
DROP POLICY IF EXISTS "Coaches can view client profiles" ON profiles;
CREATE POLICY "Coaches can view client profiles" ON profiles
    FOR SELECT USING (
        id = auth.uid()
        OR is_coach_of(id)
    );

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin());

-- ============================================================================
-- COACH_CLIENTS TABLE POLICIES
-- ============================================================================

-- Coaches can view their own relationships
DROP POLICY IF EXISTS "Coaches can view own relationships" ON coach_clients;
CREATE POLICY "Coaches can view own relationships" ON coach_clients
    FOR SELECT USING (coach_id = auth.uid());

-- Clients can view relationships where they are the client
DROP POLICY IF EXISTS "Clients can view own relationships" ON coach_clients;
CREATE POLICY "Clients can view own relationships" ON coach_clients
    FOR SELECT USING (client_id = auth.uid());

-- Coaches can create relationships
DROP POLICY IF EXISTS "Coaches can create relationships" ON coach_clients;
CREATE POLICY "Coaches can create relationships" ON coach_clients
    FOR INSERT WITH CHECK (
        coach_id = auth.uid()
        AND is_coach()
    );

-- Coaches can update their relationships
DROP POLICY IF EXISTS "Coaches can update relationships" ON coach_clients;
CREATE POLICY "Coaches can update relationships" ON coach_clients
    FOR UPDATE USING (coach_id = auth.uid());

-- Coaches can delete their relationships
DROP POLICY IF EXISTS "Coaches can delete relationships" ON coach_clients;
CREATE POLICY "Coaches can delete relationships" ON coach_clients
    FOR DELETE USING (coach_id = auth.uid());

-- ============================================================================
-- PROGRAMME_TEMPLATES TABLE POLICIES
-- ============================================================================

-- Coaches can view their own templates
DROP POLICY IF EXISTS "Coaches can view own templates" ON programme_templates;
CREATE POLICY "Coaches can view own templates" ON programme_templates
    FOR SELECT USING (coach_id = auth.uid());

-- Coaches can view public templates
DROP POLICY IF EXISTS "Coaches can view public templates" ON programme_templates;
CREATE POLICY "Coaches can view public templates" ON programme_templates
    FOR SELECT USING (is_public = true AND is_coach());

-- Coaches can create templates
DROP POLICY IF EXISTS "Coaches can create templates" ON programme_templates;
CREATE POLICY "Coaches can create templates" ON programme_templates
    FOR INSERT WITH CHECK (
        coach_id = auth.uid()
        AND is_coach()
    );

-- Coaches can update own templates
DROP POLICY IF EXISTS "Coaches can update own templates" ON programme_templates;
CREATE POLICY "Coaches can update own templates" ON programme_templates
    FOR UPDATE USING (coach_id = auth.uid());

-- Coaches can delete own templates
DROP POLICY IF EXISTS "Coaches can delete own templates" ON programme_templates;
CREATE POLICY "Coaches can delete own templates" ON programme_templates
    FOR DELETE USING (coach_id = auth.uid());

-- ============================================================================
-- PROGRAMME_ASSIGNMENTS TABLE POLICIES
-- ============================================================================

-- Coaches can view their assignments
DROP POLICY IF EXISTS "Coaches can view own assignments" ON programme_assignments;
CREATE POLICY "Coaches can view own assignments" ON programme_assignments
    FOR SELECT USING (coach_id = auth.uid());

-- Clients can view their assigned programmes
DROP POLICY IF EXISTS "Clients can view assigned programmes" ON programme_assignments;
CREATE POLICY "Clients can view assigned programmes" ON programme_assignments
    FOR SELECT USING (client_id = auth.uid());

-- Coaches can create assignments for their clients
DROP POLICY IF EXISTS "Coaches can create assignments" ON programme_assignments;
CREATE POLICY "Coaches can create assignments" ON programme_assignments
    FOR INSERT WITH CHECK (
        coach_id = auth.uid()
        AND is_coach()
        AND is_coach_of(client_id)
    );

-- Coaches can update their assignments
DROP POLICY IF EXISTS "Coaches can update assignments" ON programme_assignments;
CREATE POLICY "Coaches can update assignments" ON programme_assignments
    FOR UPDATE USING (coach_id = auth.uid());

-- Clients can update progress on their assignments
DROP POLICY IF EXISTS "Clients can update assignment progress" ON programme_assignments;
CREATE POLICY "Clients can update assignment progress" ON programme_assignments
    FOR UPDATE USING (client_id = auth.uid());

-- Coaches can delete assignments
DROP POLICY IF EXISTS "Coaches can delete assignments" ON programme_assignments;
CREATE POLICY "Coaches can delete assignments" ON programme_assignments
    FOR DELETE USING (coach_id = auth.uid());

-- ============================================================================
-- MEAL_PLAN_TEMPLATES TABLE POLICIES
-- ============================================================================

-- Coaches can view their own meal plan templates
DROP POLICY IF EXISTS "Coaches can view own meal templates" ON meal_plan_templates;
CREATE POLICY "Coaches can view own meal templates" ON meal_plan_templates
    FOR SELECT USING (coach_id = auth.uid());

-- Coaches can view public meal plan templates
DROP POLICY IF EXISTS "Coaches can view public meal templates" ON meal_plan_templates;
CREATE POLICY "Coaches can view public meal templates" ON meal_plan_templates
    FOR SELECT USING (is_public = true AND is_coach());

-- Coaches can create meal plan templates
DROP POLICY IF EXISTS "Coaches can create meal templates" ON meal_plan_templates;
CREATE POLICY "Coaches can create meal templates" ON meal_plan_templates
    FOR INSERT WITH CHECK (
        coach_id = auth.uid()
        AND is_coach()
    );

-- Coaches can update own meal plan templates
DROP POLICY IF EXISTS "Coaches can update own meal templates" ON meal_plan_templates;
CREATE POLICY "Coaches can update own meal templates" ON meal_plan_templates
    FOR UPDATE USING (coach_id = auth.uid());

-- Coaches can delete own meal plan templates
DROP POLICY IF EXISTS "Coaches can delete own meal templates" ON meal_plan_templates;
CREATE POLICY "Coaches can delete own meal templates" ON meal_plan_templates
    FOR DELETE USING (coach_id = auth.uid());

-- ============================================================================
-- MEAL_PLAN_ASSIGNMENTS TABLE POLICIES
-- ============================================================================

-- Coaches can view their meal plan assignments
DROP POLICY IF EXISTS "Coaches can view own meal assignments" ON meal_plan_assignments;
CREATE POLICY "Coaches can view own meal assignments" ON meal_plan_assignments
    FOR SELECT USING (coach_id = auth.uid());

-- Clients can view their assigned meal plans
DROP POLICY IF EXISTS "Clients can view assigned meal plans" ON meal_plan_assignments;
CREATE POLICY "Clients can view assigned meal plans" ON meal_plan_assignments
    FOR SELECT USING (client_id = auth.uid());

-- Coaches can create meal plan assignments
DROP POLICY IF EXISTS "Coaches can create meal assignments" ON meal_plan_assignments;
CREATE POLICY "Coaches can create meal assignments" ON meal_plan_assignments
    FOR INSERT WITH CHECK (
        coach_id = auth.uid()
        AND is_coach()
        AND is_coach_of(client_id)
    );

-- Coaches can update their meal plan assignments
DROP POLICY IF EXISTS "Coaches can update meal assignments" ON meal_plan_assignments;
CREATE POLICY "Coaches can update meal assignments" ON meal_plan_assignments
    FOR UPDATE USING (coach_id = auth.uid());

-- Coaches can delete meal plan assignments
DROP POLICY IF EXISTS "Coaches can delete meal assignments" ON meal_plan_assignments;
CREATE POLICY "Coaches can delete meal assignments" ON meal_plan_assignments
    FOR DELETE USING (coach_id = auth.uid());

-- ============================================================================
-- COACH_MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view messages in their conversations
DROP POLICY IF EXISTS "Users can view own messages" ON coach_messages;
CREATE POLICY "Users can view own messages" ON coach_messages
    FOR SELECT USING (
        sender_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM coach_clients cc
            WHERE cc.id = coach_client_id
            AND (cc.coach_id = auth.uid() OR cc.client_id = auth.uid())
        )
    );

-- Users can send messages in their conversations
DROP POLICY IF EXISTS "Users can send messages" ON coach_messages;
CREATE POLICY "Users can send messages" ON coach_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM coach_clients cc
            WHERE cc.id = coach_client_id
            AND (cc.coach_id = auth.uid() OR cc.client_id = auth.uid())
            AND cc.status = 'active'
        )
    );

-- Users can update their own messages (mark as read, soft delete)
DROP POLICY IF EXISTS "Users can update messages" ON coach_messages;
CREATE POLICY "Users can update messages" ON coach_messages
    FOR UPDATE USING (
        sender_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM coach_clients cc
            WHERE cc.id = coach_client_id
            AND (cc.coach_id = auth.uid() OR cc.client_id = auth.uid())
        )
    );

-- ============================================================================
-- COACH_NOTES TABLE POLICIES (Coach-only, never visible to clients)
-- ============================================================================

-- Coaches can only view their own notes
DROP POLICY IF EXISTS "Coaches can view own notes" ON coach_notes;
CREATE POLICY "Coaches can view own notes" ON coach_notes
    FOR SELECT USING (coach_id = auth.uid());

-- Coaches can create notes
DROP POLICY IF EXISTS "Coaches can create notes" ON coach_notes;
CREATE POLICY "Coaches can create notes" ON coach_notes
    FOR INSERT WITH CHECK (
        coach_id = auth.uid()
        AND is_coach()
    );

-- Coaches can update their own notes
DROP POLICY IF EXISTS "Coaches can update own notes" ON coach_notes;
CREATE POLICY "Coaches can update own notes" ON coach_notes
    FOR UPDATE USING (coach_id = auth.uid());

-- Coaches can delete their own notes
DROP POLICY IF EXISTS "Coaches can delete own notes" ON coach_notes;
CREATE POLICY "Coaches can delete own notes" ON coach_notes
    FOR DELETE USING (coach_id = auth.uid());

-- ============================================================================
-- CHECK_IN_DAYS TABLE POLICIES
-- ============================================================================

-- Users can view their own check-ins
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_in_days;
CREATE POLICY "Users can view own check-ins" ON check_in_days
    FOR SELECT USING (user_id = auth.uid());

-- Coaches can view their clients' check-ins
DROP POLICY IF EXISTS "Coaches can view client check-ins" ON check_in_days;
CREATE POLICY "Coaches can view client check-ins" ON check_in_days
    FOR SELECT USING (is_coach_of(user_id));

-- Coaches can update review fields on client check-ins
DROP POLICY IF EXISTS "Coaches can review client check-ins" ON check_in_days;
CREATE POLICY "Coaches can review client check-ins" ON check_in_days
    FOR UPDATE USING (is_coach_of(user_id));

-- ============================================================================
-- EXISTING TABLE POLICIES (Extend for coach access)
-- These assume existing tables: sessions, meals, blood_work, sleep_records, etc.
-- ============================================================================

-- Sessions: Coaches can view client sessions
DROP POLICY IF EXISTS "Coaches can view client sessions" ON sessions;
CREATE POLICY "Coaches can view client sessions" ON sessions
    FOR SELECT USING (
        user_id = auth.uid()
        OR is_coach_of(user_id)
    );

-- Meals: Coaches can view client meals
DROP POLICY IF EXISTS "Coaches can view client meals" ON meals;
CREATE POLICY "Coaches can view client meals" ON meals
    FOR SELECT USING (
        user_id = auth.uid()
        OR is_coach_of(user_id)
    );

-- Blood work: Coaches can view client blood work
DROP POLICY IF EXISTS "Coaches can view client blood work" ON blood_work;
CREATE POLICY "Coaches can view client blood work" ON blood_work
    FOR SELECT USING (
        user_id = auth.uid()
        OR is_coach_of(user_id)
    );

-- Sleep records: Coaches can view client sleep data
DROP POLICY IF EXISTS "Coaches can view client sleep" ON sleep_records;
CREATE POLICY "Coaches can view client sleep" ON sleep_records
    FOR SELECT USING (
        user_id = auth.uid()
        OR is_coach_of(user_id)
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION is_coach() IS 'Returns true if current user has coach role';
COMMENT ON FUNCTION is_admin() IS 'Returns true if current user has admin role';
COMMENT ON FUNCTION is_coach_of(UUID) IS 'Returns true if current user is coach of specified client';
COMMENT ON FUNCTION get_coach_client_ids() IS 'Returns all client IDs for current coach';

-- ============================================================================
-- ROLLBACK (uncomment to revert)
-- ============================================================================
-- -- Drop all policies
-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- DROP POLICY IF EXISTS "Coaches can view client profiles" ON profiles;
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
-- -- ... (continue for all policies)
--
-- -- Drop helper functions
-- DROP FUNCTION IF EXISTS is_coach();
-- DROP FUNCTION IF EXISTS is_admin();
-- DROP FUNCTION IF EXISTS is_coach_of(UUID);
-- DROP FUNCTION IF EXISTS get_coach_client_ids();
