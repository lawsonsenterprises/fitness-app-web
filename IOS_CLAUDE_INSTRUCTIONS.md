# iOS Claude Code Instructions

## Current Database State (as of 31 Dec 2025)

### What EXISTS in Production Supabase

**Tables (44 total):**
- `profiles` - Has `roles` and `postcode` columns (iOS app added these)
- `check_ins` - Has `snooze_count`, `snoozed_at`, `snoozed_until` (iOS added)
- `notification_preferences` - Table exists with all notification settings
- All HealthKit tables: `daily_readiness_summaries`, `daily_sleep_summaries`, `daily_recovery_summaries`, `daily_workouts`
- All athlete data tables working correctly

**Profiles table structure:**
```typescript
profiles: {
  id: string
  display_name: string | null
  avatar_url: string | null
  apple_sub: string | null
  onboarding_completed: boolean | null
  postcode: string | null
  roles: string[] | null  // ← EXISTS! Default should be ['athlete']
  created_at: string | null
  updated_at: string | null
}
```

### What DOES NOT EXIST in Production

The following tables have migration files in the web repo but were **never applied**:

1. `coach_clients` - Links coaches to athletes
2. `programme_templates` - Reusable programme templates created by coaches
3. `programme_assignments` - Assigns templates to specific clients
4. `meal_plan_templates` - Reusable meal plan templates
5. `meal_plan_assignments` - Assigns meal plans to clients
6. `coach_messages` - Private messaging between coach and client
7. `coach_notes` - Private notes coaches write about clients

---

## CRITICAL: Migrations Must Be Applied

The web repo has these migrations that need to be pushed to Supabase:

```
20251227000001_add_coach_roles_to_profiles.sql  ← May conflict, roles already exists
20251227000002_create_coach_clients_table.sql   ← NEEDED
20251227000003_create_programme_templates_table.sql  ← NEEDED
20251227000004_create_programme_assignments_table.sql  ← NEEDED
20251227000005_create_meal_plan_templates_table.sql  ← NEEDED
20251227000006_create_meal_plan_assignments_table.sql  ← NEEDED
20251227000007_create_coach_messages_table.sql  ← NEEDED
20251227000008_create_coach_notes_table.sql  ← NEEDED
20251227000009_extend_check_in_days_table.sql  ← Check if needed
20251227000010_create_rls_policies.sql  ← NEEDED for coach access
20251228000001_create_notification_preferences_table.sql  ← Already exists
20251228000002_add_roles_to_profiles.sql  ← Already applied by iOS
```

### How to Apply Missing Migrations

Option 1: From web repo directory
```bash
# Mark already-applied migrations as applied
supabase migration repair --status applied 20251228000001
supabase migration repair --status applied 20251228000002

# Push remaining migrations
supabase db push
```

Option 2: Run SQL directly in Supabase Dashboard
Copy the contents of each needed migration file and run in SQL Editor.

---

## iOS App Changes Required

### 1. Set Default Role on Profile Creation

When creating a new profile, set `roles` to `['athlete']`:

```swift
// When inserting profile
let profile = [
    "id": userId,
    "display_name": displayName,
    "roles": ["athlete"],  // ← Add this
    // ... other fields
]
```

### 2. Check User Role for Coach Features

```swift
// Check if user is a coach
func isCoach() async throws -> Bool {
    let response = try await supabase
        .from("profiles")
        .select("roles")
        .eq("id", value: userId)
        .single()
        .execute()

    let roles = response.value?.roles ?? []
    return roles.contains("coach")
}
```

### 3. Programme Flow Must Change (When coach_clients exists)

**Current (athlete creates own):**
```swift
// Athlete creates programme directly
try await supabase.from("programmes").insert([
    "user_id": athleteId,
    "name": "My Programme"
])
```

**Future (coach creates and assigns):**
```swift
// 1. Coach creates template
let template = try await supabase.from("programme_templates").insert([
    "coach_id": coachId,
    "name": "8-Week Strength",
    "duration_weeks": 8
]).select().single().execute()

// 2. Coach assigns to client
try await supabase.from("programme_assignments").insert([
    "template_id": template.value.id,
    "client_id": athleteId,
    "started_at": Date(),
    "status": "active"
])

// 3. Athlete queries their assigned programme
let assignment = try await supabase
    .from("programme_assignments")
    .select("*, programme_templates(*)")
    .eq("client_id", value: athleteId)
    .eq("status", value: "active")
    .single()
    .execute()
```

### 4. Check-In Coach Review (When fields exist)

The web UI expects these fields on `check_ins` that don't exist yet:

```sql
-- Need to add to check_ins table:
ALTER TABLE check_ins ADD COLUMN coach_id UUID REFERENCES profiles(id);
ALTER TABLE check_ins ADD COLUMN coach_feedback TEXT;
ALTER TABLE check_ins ADD COLUMN coach_rating INTEGER CHECK (coach_rating >= 1 AND coach_rating <= 5);
ALTER TABLE check_ins ADD COLUMN reviewed_at TIMESTAMPTZ;
ALTER TABLE check_ins ADD COLUMN review_status TEXT DEFAULT 'pending'; -- pending, submitted, reviewed
```

---

## RLS Policies Needed for Coach Access

Once `coach_clients` table exists, these policies enable coaches to see client data:

```sql
-- Allow coaches to read their clients' check-ins
CREATE POLICY "Coaches can read client check-ins"
ON check_ins FOR SELECT
USING (
    auth.uid() = user_id
    OR
    EXISTS (
        SELECT 1 FROM coach_clients
        WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = check_ins.user_id
        AND coach_clients.status = 'active'
    )
);

-- Same pattern for all athlete tables:
-- weight_logs, nutrition_daily_summaries, programmes, etc.
```

---

## Data Flow Diagram

### Current (Broken for Multi-User)
```
Athlete → creates → programmes (user_id = athlete)
Athlete → creates → meal_plans (user_id = athlete)
Athlete → creates → check_ins (user_id = athlete)
Coach → ??? (no access to client data)
```

### Required (After Migrations)
```
Coach → creates → programme_templates (coach_id = coach)
Coach → creates → programme_assignments (client_id = athlete)
Athlete → reads → programmes via assignment join
Coach → reads → athlete data via coach_clients join
Coach → writes → coach_feedback on check_ins
```

---

## Summary of What iOS Needs to Do

1. **Immediate:** Ensure `roles: ['athlete']` is set on new profile creation
2. **When ready:** Apply the pending migrations (coach_clients, templates, assignments)
3. **After migrations:**
   - Update programme/meal plan creation to use templates + assignments
   - Add coach role checking
   - Update check-in flow for coach review

---

## Files in Web Repo for Reference

- Migration files: `/supabase/migrations/`
- Database types: `/types/database.types.ts` (regenerated from remote)
- Portal status doc: `/PORTAL_STATUS.md`
