# Outstanding Items - Web UI

After applying all database migrations, here's everything that still needs to be done.

---

## Database Status: COMPLETE

All coach infrastructure tables now exist in production:
- `coach_clients`
- `coach_messages`
- `coach_notes`
- `programme_templates`
- `programme_assignments`
- `meal_plan_templates`
- `meal_plan_assignments`
- `check_ins` (with review fields)
- `notification_preferences`

Helper functions: `is_coach()`, `is_admin()`, `is_coach_of()`, `get_coach_client_ids()`

---

## 1. HOOKS TO UPDATE (Priority: High)

These hooks currently return empty data and need to query the new tables:

### 1.1 `hooks/use-clients.ts`
**Status:** Returns empty array with console.warn
**Needs:** Query `coach_clients` joined with `profiles`

```typescript
// Current: Returns []
// Needed: Query coach_clients where coach_id = current user
const { data } = await supabase
  .from('coach_clients')
  .select(`
    *,
    client:profiles!client_id (
      id, display_name, avatar_url, roles
    )
  `)
  .eq('coach_id', userId)
  .eq('status', 'active')
```

**Database schema:**
- `coach_clients.coach_id` → current user
- `coach_clients.client_id` → references `profiles.id`
- `coach_clients.status` → enum: pending, active, paused, completed

---

### 1.2 `hooks/use-messages.ts`
**Status:** Returns empty array
**Needs:** Query `coach_messages` via `coach_clients`

```typescript
// Needed: Get messages for a coach-client relationship
const { data } = await supabase
  .from('coach_messages')
  .select('*')
  .eq('coach_client_id', coachClientId)
  .order('created_at', { ascending: true })
```

**Database schema:**
- `coach_messages.coach_client_id` → references `coach_clients.id`
- `coach_messages.sender_id` → who sent it
- `coach_messages.content` → message text
- `coach_messages.is_read`, `read_at` → read status

---

### 1.3 `hooks/use-programmes.ts`
**Status:** Returns empty array
**Needs:** Query `programme_templates` for coach's templates AND `programme_assignments` for assigned programmes

```typescript
// For coach's template library
const { data: templates } = await supabase
  .from('programme_templates')
  .select('*')
  .eq('coach_id', userId)

// For a specific client's assigned programme
const { data: assignment } = await supabase
  .from('programme_assignments')
  .select('*, template:programme_templates(*)')
  .eq('client_id', clientId)
  .eq('status', 'active')
  .single()
```

**Database schema:**
- `programme_templates.coach_id` → template creator
- `programme_templates.content` → JSON blob with programme structure
- `programme_assignments.template_id` → optional link to template
- `programme_assignments.content` → JSON blob (may be customised from template)

---

### 1.4 `hooks/use-meal-plans.ts`
**Status:** Returns empty array
**Needs:** Same pattern as programmes

```typescript
// For coach's meal plan templates
const { data: templates } = await supabase
  .from('meal_plan_templates')
  .select('*')
  .eq('coach_id', userId)

// For client's assigned meal plan
const { data: assignment } = await supabase
  .from('meal_plan_assignments')
  .select('*, template:meal_plan_templates(*)')
  .eq('client_id', clientId)
  .eq('status', 'active')
  .single()
```

---

### 1.5 `hooks/use-check-ins.ts`
**Status:** Returns empty array
**Needs:** Query `check_ins` with new review fields

```typescript
// For coach view - all client check-ins
const { data } = await supabase
  .from('check_ins')
  .select(`
    *,
    user:profiles!user_id (display_name, avatar_url)
  `)
  .in('user_id', clientIds)  // get from coach_clients
  .order('created_at', { ascending: false })

// New fields available:
// - review_status: 'pending' | 'reviewed' | 'flagged' | 'archived'
// - reviewed_by: UUID (coach who reviewed)
// - reviewed_at: timestamp
// - coach_feedback: text
// - coach_rating: 1-5
// - is_flagged, flag_reason
// - requires_follow_up, follow_up_completed_at
```

---

### 1.6 `hooks/use-notifications.ts`
**Status:** Returns empty array
**Needs:** Create notifications table OR use real-time subscriptions

**Note:** There's no `notifications` table - only `notification_preferences`.
Options:
1. Create a `notifications` table for persistent notifications
2. Use Supabase Realtime to push notifications
3. Generate notifications on-the-fly from recent activity

---

### 1.7 `hooks/use-analytics.ts`
**Status:** Returns zeros
**Needs:** Aggregate queries across tables

```typescript
// Total clients
const { count: totalClients } = await supabase
  .from('coach_clients')
  .select('*', { count: 'exact', head: true })
  .eq('coach_id', userId)
  .eq('status', 'active')

// Pending check-ins
const { count: pendingCheckIns } = await supabase
  .from('check_ins')
  .select('*', { count: 'exact', head: true })
  .in('user_id', clientIds)
  .eq('review_status', 'pending')
```

---

### 1.8 `hooks/use-pdf-export.ts`
**Status:** Throws error without real data
**Needs:** Actual data from database to generate PDFs

---

## 2. TYPE MISMATCHES TO FIX

The TypeScript interfaces in `types/index.ts` don't match the database schema:

### Client type mismatch
```typescript
// Current types/index.ts expects:
interface Client {
  id: string
  coachId: string
  firstName: string  // ❌ Doesn't exist
  lastName: string   // ❌ Doesn't exist
  email: string      // ❌ Doesn't exist
  // ...
}

// Database has:
coach_clients {
  id, coach_id, client_id, status, ...
}
profiles {
  id, display_name, avatar_url, roles, ...  // No email, firstName, lastName!
}
```

**Fix needed:** Update `Client` interface to match joined query result or add missing fields to `profiles` table.

---

### CheckIn type mismatch
```typescript
// Current types/index.ts expects:
interface CheckIn {
  clientId: string      // ❌ DB has user_id
  coachId: string       // ❌ DB doesn't have this
  weekStartDate: string // ❌ DB has date
  // ...
}

// Database check_ins has:
check_ins {
  user_id, date, check_in_type, weight, sleep_hours, ...
  review_status, reviewed_by, coach_feedback, coach_rating, ...
}
```

---

## 3. PAGES STILL USING MOCK DATA

Even with hooks fixed, some pages have inline mock data:

### Athlete Portal
- `/athlete/check-ins/[checkInId]/page.tsx` - Line 34: `const mockCheckIn = {...}`
- `/athlete/nutrition/meal-plans/[mealPlanId]/page.tsx` - Uses mock meal plan data
- `/athlete/training/programmes/[programmeId]/page.tsx` - Uses mock programme data

### Coach Portal (Dashboard)
- `/dashboard/page.tsx` - Dashboard stats still mock
- `/clients/[clientId]/*` - All client detail pages

### Admin Portal
- ALL pages use 100% mock data - no database tables for admin features

---

## 4. MISSING FUNCTIONALITY

### No way to create coach-client relationships
- UI for inviting clients exists but doesn't work
- Need to implement invite flow (email? code? direct add?)

### No way to assign programmes/meal plans
- Programme editor exists but can't save to `programme_templates`
- No UI to create `programme_assignments`

### No real-time messaging
- `coach_messages` table exists
- Need Supabase Realtime subscription for live chat

### No notification system
- `notification_preferences` exists
- No `notifications` table
- No push notification integration

---

## 5. ADMIN PORTAL - NOT STARTED

The admin portal has UI but zero database backing:

**Missing tables:**
- `platform_metrics` - for revenue/user dashboards
- `subscriptions` - Stripe integration
- `support_tickets` - customer support
- `audit_logs` - admin actions

**Missing functionality:**
- Role-based route protection (anyone can access /admin)
- User management (promote to coach, ban users)
- Subscription management
- Platform analytics

---

## 6. PRIORITY ORDER

### Phase 1: Make Coach Portal Functional
1. Fix `use-clients.ts` to query `coach_clients + profiles`
2. Fix `use-check-ins.ts` to show client check-ins with review workflow
3. Fix `use-programmes.ts` for template library
4. Fix `use-meal-plans.ts` for meal plan library
5. Update TypeScript interfaces to match database

### Phase 2: Communication
1. Fix `use-messages.ts` for coach-client chat
2. Add Supabase Realtime for live messaging
3. Implement notification system

### Phase 3: Athlete Portal Fixes
1. Remove remaining mock data from detail pages
2. Connect to real programme/meal plan assignments
3. Show coach feedback on check-ins

### Phase 4: Admin Portal
1. Add role-based route protection
2. Create admin tables
3. Integrate Stripe for subscriptions
4. Build real dashboards

---

## Quick Reference: Table Relationships

```
profiles (id, display_name, avatar_url, roles[])
    │
    ├── coach_clients (coach_id → profiles, client_id → profiles)
    │       │
    │       ├── coach_messages (coach_client_id → coach_clients)
    │       └── coach_notes (coach_client_id → coach_clients)
    │
    ├── programme_templates (coach_id → profiles)
    │       │
    │       └── programme_assignments (template_id → programme_templates, client_id → profiles)
    │
    ├── meal_plan_templates (coach_id → profiles)
    │       │
    │       └── meal_plan_assignments (template_id → meal_plan_templates, client_id → profiles)
    │
    └── check_ins (user_id → profiles, reviewed_by → profiles)
```
