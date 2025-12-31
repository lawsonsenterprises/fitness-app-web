# Portal Implementation Status

A comprehensive analysis of what's implemented, partially implemented, and missing across all three portals.

---

## Database Schema Analysis

### Current State
The database schema is **athlete-focused** - all tables use `user_id` referencing the athlete directly. There is no coach-client relationship infrastructure in production.

### Tables That Exist (Production)
| Table | Purpose | Coach Access |
|-------|---------|--------------|
| `profiles` | Basic user info (id, display_name, avatar_url, apple_sub, onboarding_completed) | No roles column |
| `check_ins` | Daily/weekly check-ins | No coach_id |
| `programmes`, `programme_days`, `workout_items` | Training programmes | Athlete-only |
| `meal_plans`, `meals`, `food_items`, `food_database` | Nutrition planning | Athlete-only |
| `blood_panels`, `blood_markers`, `blood_tests_v2` | Blood work tracking | Athlete-only |
| `weight_logs`, `sleep_records`, `water_logs` | Health tracking | Athlete-only |
| `supplements`, `supplement_intakes` | Supplement compliance | Athlete-only |
| `exercises`, `training_days`, `training_sessions` | Workout tracking | Athlete-only |
| `user_dietary_profiles` | Macro targets & TDEE | Athlete-only |
| `daily_readiness_summaries`, `daily_sleep_summaries`, `daily_recovery_summaries`, `daily_workouts` | HealthKit data | Athlete-only (RLS enabled) |

### Migration Files Exist But NOT Applied to Production
| Migration | Purpose | Status |
|-----------|---------|--------|
| `20251227000001_add_coach_roles_to_profiles.sql` | Add role support to profiles | NOT APPLIED |
| `20251227000002_create_coach_clients_table.sql` | Coach-athlete relationships | NOT APPLIED |
| `20251227000003_create_programme_templates_table.sql` | Reusable programme templates | NOT APPLIED |
| `20251227000004_create_programme_assignments_table.sql` | Assign programmes to clients | NOT APPLIED |
| `20251227000005_create_meal_plan_templates_table.sql` | Reusable meal plan templates | NOT APPLIED |
| `20251227000006_create_meal_plan_assignments_table.sql` | Assign meal plans to clients | NOT APPLIED |
| `20251227000007_create_coach_messages_table.sql` | Coach-client messaging | NOT APPLIED |
| `20251227000008_create_coach_notes_table.sql` | Private coach notes on clients | NOT APPLIED |
| `20251228000001_create_notification_preferences_table.sql` | Notification settings | NOT APPLIED |
| `20251228000002_add_roles_to_profiles.sql` | Alternative roles approach | NOT APPLIED |

---

## 1. ATHLETE PORTAL

**Route Group**: `/app/(athlete)/athlete/*`

### WORKING (Database Connected)

| Feature | Page | Status | Notes |
|---------|------|--------|-------|
| Dashboard | `/athlete` | WORKING | Shows HealthKit data, macros, weight, workouts |
| HealthKit Integration | Dashboard | WORKING | Readiness, sleep, steps, workouts from iOS app |
| Blood Work List | `/athlete/blood-work` | WORKING | Lists blood panels from database |
| Blood Work Detail | `/athlete/blood-work/[id]` | WORKING | Shows markers with trends |
| Blood Work Upload | `/athlete/blood-work/upload` | WORKING | PDF parsing via external service |
| Blood Work Trends | `/athlete/blood-work/trends` | WORKING | Historical marker charts |
| Nutrition Log | `/athlete/nutrition/log` | WORKING | Food logging to `nutrition_food_entries` |
| Nutrition Overview | `/athlete/nutrition` | WORKING | Daily macro summaries |
| Recovery Dashboard | `/athlete/recovery` | WORKING | HealthKit recovery/sleep data |
| Training Overview | `/athlete/training` | WORKING | Lists training sessions |
| Exercises Database | `/athlete/training/exercises` | WORKING | Exercise library |
| Settings | `/athlete/settings/*` | WORKING | User preferences |

### PARTIALLY WORKING (UI exists, needs backend alignment)

| Feature | Page | Issue |
|---------|------|-------|
| Programme Detail | `/athlete/training/programmes/[programmeId]` | Schema mismatch - UI expects different structure |
| Meal Plan Detail | `/athlete/nutrition/meal-plans/[mealPlanId]` | Schema mismatch - no `meal_plan_templates` table |
| Check-ins List | `/athlete/check-ins` | UI expects coach review status fields not in schema |
| Check-in Detail | `/athlete/check-ins/[checkInId]` | Schema mismatch - mock data structure differs from DB |
| New Check-in | `/athlete/check-ins/new` | Submission works but review workflow missing |

### NOT IMPLEMENTED (UI exists, no database support)

| Feature | Page | Missing |
|---------|------|---------|
| Messages | `/athlete/messages` | No `messages` or `coach_messages` table |
| Progress Photos | `/athlete/progress` | No `progress_photos` table |
| Body Measurements | `/athlete/progress` | No `body_measurements` table |

---

## 2. COACH PORTAL (Dashboard)

**Route Group**: `/app/(dashboard)/*`

### CRITICAL BLOCKERS
1. **No `coach_clients` table** - Cannot link coaches to athletes
2. **No `roles` column in profiles** - Cannot identify who is a coach
3. **No RLS policies for coach access** - Coaches can't see client data

### PAGES THAT EXIST (All using mock data or empty)

| Feature | Page | Status | Blocking Issue |
|---------|------|--------|----------------|
| Dashboard | `/dashboard` | UI ONLY | Uses `useAnalytics`, `useDashboardStats` - all return empty/zeros |
| Clients List | `/clients` | UI ONLY | No `coach_clients` table |
| Client Detail | `/clients/[clientId]` | UI ONLY | No coach-client relationship |
| Client Health | `/clients/[clientId]/health` | UI ONLY | No access to client's health data |
| Client Messages | `/clients/[clientId]/messages` | UI ONLY | No `coach_messages` table |
| Client Nutrition | `/clients/[clientId]/nutrition` | UI ONLY | No assignment tables |
| Client Training | `/clients/[clientId]/training` | UI ONLY | No `programme_assignments` table |
| Client Check-ins | `/clients/[clientId]/check-ins` | UI ONLY | No coach review workflow |
| Client Settings | `/clients/[clientId]/settings` | UI ONLY | No coach-client config |
| Check-ins Review | `/check-ins` | UI ONLY | No coach review fields in check_ins |
| Check-in Detail | `/check-ins/[checkInId]` | UI ONLY | No coach_feedback columns |
| Programmes | `/programmes` | UI ONLY | No `programme_templates` table |
| Programme Editor | `/programmes/[templateId]` | UI ONLY | No template infrastructure |
| Meal Plans | `/meal-plans` | UI ONLY | No `meal_plan_templates` table |
| Notifications | `/notifications` | UI ONLY | No `notifications` table |
| Settings | `/settings/*` | PARTIAL | Some user prefs work, billing mock |

### DATABASE REQUIREMENTS FOR COACH PORTAL

To make the coach portal functional, the following must be applied:

```sql
-- 1. Add roles to profiles
ALTER TABLE profiles ADD COLUMN roles TEXT[] DEFAULT ARRAY['athlete']::TEXT[];

-- 2. Create coach_clients table
CREATE TABLE coach_clients (
  id UUID PRIMARY KEY,
  coach_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES profiles(id),
  status TEXT, -- pending, active, paused, completed
  started_at TIMESTAMPTZ,
  check_in_frequency INTEGER DEFAULT 7,
  next_check_in_due TIMESTAMPTZ
);

-- 3. Create programme_templates (coach creates once, assigns many)
CREATE TABLE programme_templates (
  id UUID PRIMARY KEY,
  coach_id UUID REFERENCES profiles(id),
  name TEXT,
  description TEXT,
  duration_weeks INTEGER,
  difficulty TEXT,
  focus TEXT[]
);

-- 4. Create programme_assignments (link template to client)
CREATE TABLE programme_assignments (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES programme_templates(id),
  client_id UUID REFERENCES profiles(id),
  current_week INTEGER,
  started_at TIMESTAMPTZ,
  status TEXT -- active, completed, paused
);

-- 5. Add coach review fields to check_ins
ALTER TABLE check_ins ADD COLUMN coach_id UUID REFERENCES profiles(id);
ALTER TABLE check_ins ADD COLUMN coach_feedback TEXT;
ALTER TABLE check_ins ADD COLUMN coach_rating INTEGER;
ALTER TABLE check_ins ADD COLUMN reviewed_at TIMESTAMPTZ;

-- 6. Create coach_messages table for chat
-- 7. Create coach_notes table for private notes
-- 8. Add RLS policies for coach access to client data
```

---

## 3. ADMIN PORTAL

**Route Group**: `/app/(admin)/admin/*`

### CRITICAL BLOCKERS
1. **No admin role validation** - Anyone can access `/admin` routes
2. **No platform analytics tables** - Revenue, user counts, etc.
3. **No subscription/billing integration** - Stripe not connected

### PAGES THAT EXIST (100% Mock Data)

| Feature | Page | Status |
|---------|------|--------|
| Dashboard | `/admin` | ALL MOCK DATA |
| Athletes List | `/admin/athletes` | MOCK - no multi-tenant query |
| Athlete Detail | `/admin/athletes/[athleteId]` | MOCK |
| Coaches List | `/admin/coaches` | MOCK - no roles column |
| Coach Detail | `/admin/coaches/[coachId]` | MOCK |
| Messages/Support | `/admin/messages` | MOCK - no support ticket system |
| Subscriptions | `/admin/subscriptions` | MOCK - no billing tables |
| Analytics | `/admin/analytics` | MOCK - no analytics infrastructure |
| Settings | `/admin/settings` | MOCK |

### DATABASE REQUIREMENTS FOR ADMIN PORTAL

```sql
-- 1. Platform analytics
CREATE TABLE platform_metrics (
  id UUID PRIMARY KEY,
  date DATE,
  total_coaches INTEGER,
  total_athletes INTEGER,
  active_subscriptions INTEGER,
  monthly_revenue DECIMAL
);

-- 2. Subscription management
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT, -- 'pro_monthly', 'pro_annual', 'enterprise'
  status TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ
);

-- 3. Support tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  subject TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ
);

-- 4. Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ
);
```

---

## PRIORITY ORDER FOR IMPLEMENTATION

### Phase 1: Coach-Client Infrastructure (Highest Priority)
1. Apply `20251227000002_create_coach_clients_table.sql` migration
2. Apply `20251228000002_add_roles_to_profiles.sql` migration
3. Create RLS policies for coach access to client data
4. Update hooks: `use-clients.ts` to query real data

### Phase 2: Programme & Meal Plan Assignment
1. Apply programme_templates migration
2. Apply programme_assignments migration
3. Apply meal_plan_templates migration
4. Apply meal_plan_assignments migration
5. Update hooks to support template creation and assignment

### Phase 3: Check-in Review Workflow
1. Add coach review columns to check_ins table
2. Create coach_feedback mechanism
3. Update check-in hooks for coach view

### Phase 4: Messaging
1. Apply coach_messages migration
2. Implement real-time messaging with Supabase Realtime
3. Update message hooks

### Phase 5: Admin Portal
1. Implement role-based route protection
2. Create platform analytics tables
3. Integrate Stripe for subscriptions
4. Build admin dashboards with real data

---

## HOOKS STATUS SUMMARY

| Hook | Status | Issue |
|------|--------|-------|
| `use-clients.ts` | EMPTY | No coach_clients table |
| `use-messages.ts` | EMPTY | No messages table |
| `use-notifications.ts` | EMPTY | No notifications table |
| `use-programmes.ts` | EMPTY | Schema mismatch |
| `use-meal-plans.ts` | EMPTY | Schema mismatch |
| `use-check-ins.ts` | EMPTY | Schema mismatch |
| `use-analytics.ts` | ZEROS | No data source |
| `use-pdf-export.ts` | BROKEN | Requires real data |
| `hooks/athlete/*` | WORKING | Connected to database |

---

## FILES REFERENCE

### Athlete Pages
- [/app/(athlete)/athlete/page.tsx](app/(athlete)/athlete/page.tsx) - Dashboard
- [/app/(athlete)/athlete/check-ins/](app/(athlete)/athlete/check-ins/) - Check-ins
- [/app/(athlete)/athlete/messages/page.tsx](app/(athlete)/athlete/messages/page.tsx) - Messages (empty)
- [/app/(athlete)/athlete/progress/page.tsx](app/(athlete)/athlete/progress/page.tsx) - Progress (empty)

### Coach Pages
- [/app/(dashboard)/dashboard/page.tsx](app/(dashboard)/dashboard/page.tsx) - Coach Dashboard
- [/app/(dashboard)/clients/](app/(dashboard)/clients/) - Client management
- [/app/(dashboard)/programmes/](app/(dashboard)/programmes/) - Programme templates
- [/app/(dashboard)/check-ins/](app/(dashboard)/check-ins/) - Check-in review

### Admin Pages
- [/app/(admin)/admin/page.tsx](app/(admin)/admin/page.tsx) - Admin Dashboard
- [/app/(admin)/admin/coaches/](app/(admin)/admin/coaches/) - Coach management
- [/app/(admin)/admin/athletes/](app/(admin)/admin/athletes/) - Athlete management

### Key Hooks
- [/hooks/use-clients.ts](hooks/use-clients.ts)
- [/hooks/use-messages.ts](hooks/use-messages.ts)
- [/hooks/use-programmes.ts](hooks/use-programmes.ts)
- [/hooks/athlete/](hooks/athlete/) - Working athlete hooks
