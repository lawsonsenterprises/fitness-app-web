# Web UI Implementation Plan

All database migrations have been applied. iOS app is complete. This plan covers all remaining Web UI work.

---

## Phase 1: Fix Hooks to Query Real Data

### 1.1 Update `use-clients.ts`
- [ ] **1.1.1** Query `coach_clients` joined with `profiles` for client data
- [ ] **1.1.2** Implement `fetchClients()` with pagination, status filter, search
- [ ] **1.1.3** Implement `fetchClient()` for single client detail
- [ ] **1.1.4** Implement `inviteClient()` to create coach_clients record
- [ ] **1.1.5** Implement `updateClientStatus()` to change relationship status
- [ ] **1.1.6** Implement `removeClient()` to end relationship
- [ ] **1.1.7** Test all mutations work correctly

### 1.2 Update `use-messages.ts`
- [ ] **1.2.1** Query `coach_messages` via `coach_client_id`
- [ ] **1.2.2** Implement `fetchMessages()` for conversation history
- [ ] **1.2.3** Implement `sendMessage()` to insert new message
- [ ] **1.2.4** Implement `markMessagesRead()` to update read status
- [ ] **1.2.5** Implement `fetchUnreadCount()` for notification badge
- [ ] **1.2.6** Add Supabase Realtime subscription for live updates

### 1.3 Update `use-programmes.ts`
- [ ] **1.3.1** Query `programme_templates` for coach's template library
- [ ] **1.3.2** Query `programme_assignments` for client assignments
- [ ] **1.3.3** Implement `createTemplate()` to save new template
- [ ] **1.3.4** Implement `updateTemplate()` to edit existing template
- [ ] **1.3.5** Implement `deleteTemplate()` to remove template
- [ ] **1.3.6** Implement `assignProgramme()` to create assignment for client
- [ ] **1.3.7** Implement `unassignProgramme()` to end assignment

### 1.4 Update `use-meal-plans.ts`
- [ ] **1.4.1** Query `meal_plan_templates` for coach's template library
- [ ] **1.4.2** Query `meal_plan_assignments` for client assignments
- [ ] **1.4.3** Implement `createTemplate()` to save new meal plan template
- [ ] **1.4.4** Implement `updateTemplate()` to edit existing template
- [ ] **1.4.5** Implement `deleteTemplate()` to remove template
- [ ] **1.4.6** Implement `assignMealPlan()` to create assignment for client
- [ ] **1.4.7** Implement `unassignMealPlan()` to end assignment

### 1.5 Update `use-check-ins.ts`
- [ ] **1.5.1** Query `check_ins` for all clients (via coach_clients join)
- [ ] **1.5.2** Include new review fields in query (review_status, coach_feedback, etc.)
- [ ] **1.5.3** Implement `fetchCheckIns()` with filters (status, client, date range)
- [ ] **1.5.4** Implement `fetchCheckIn()` for single check-in detail
- [ ] **1.5.5** Implement `reviewCheckIn()` to update coach_feedback, coach_rating, review_status
- [ ] **1.5.6** Implement `flagCheckIn()` to set is_flagged and flag_reason
- [ ] **1.5.7** Implement `markFollowUpComplete()` to update follow_up_completed_at

### 1.6 Update `use-notifications.ts`
- [ ] **1.6.1** Decide on notification approach (table vs realtime vs on-the-fly)
- [ ] **1.6.2** Create `notifications` table migration if needed
- [ ] **1.6.3** Implement `fetchNotifications()` to get recent notifications
- [ ] **1.6.4** Implement `markAsRead()` to update notification status
- [ ] **1.6.5** Implement `markAllAsRead()` for bulk update
- [ ] **1.6.6** Add Supabase Realtime subscription for live notifications

### 1.7 Update `use-analytics.ts`
- [ ] **1.7.1** Query `coach_clients` for total/active client counts
- [ ] **1.7.2** Query `check_ins` for pending check-in count
- [ ] **1.7.3** Query `programme_assignments` for active programme count
- [ ] **1.7.4** Calculate training adherence from client data
- [ ] **1.7.5** Calculate nutrition adherence from client data
- [ ] **1.7.6** Implement `fetchDashboardStats()` with all metrics
- [ ] **1.7.7** Implement `fetchClientActivity()` for activity chart data

### 1.8 Fix `use-pdf-export.ts`
- [ ] **1.8.1** Remove mock data fallback
- [ ] **1.8.2** Fetch real client data for export
- [ ] **1.8.3** Fetch real programme/meal plan data for export
- [ ] **1.8.4** Test PDF generation with real data

---

## Phase 2: Fix TypeScript Types

### 2.1 Update `types/index.ts`
- [ ] **2.1.1** Update `Client` interface to match `coach_clients` + `profiles` join
- [ ] **2.1.2** Update `CheckIn` interface to match `check_ins` table schema
- [ ] **2.1.3** Update `Programme` interface to match `programme_templates` schema
- [ ] **2.1.4** Update `ProgrammeAssignment` interface to match `programme_assignments`
- [ ] **2.1.5** Update `MealPlan` interface to match `meal_plan_templates` schema
- [ ] **2.1.6** Update `MealPlanAssignment` interface to match `meal_plan_assignments`
- [ ] **2.1.7** Update `Message` interface to match `coach_messages` schema
- [ ] **2.1.8** Add any missing types from database schema
- [ ] **2.1.9** Run type-check to verify no type errors

---

## Phase 3: Remove Inline Mock Data from Pages

### 3.1 Athlete Portal Pages
- [ ] **3.1.1** `/athlete/check-ins/[checkInId]/page.tsx` - Remove `mockCheckIn`, use real data
- [ ] **3.1.2** `/athlete/nutrition/meal-plans/[mealPlanId]/page.tsx` - Remove mock, query assignment
- [ ] **3.1.3** `/athlete/training/programmes/[programmeId]/page.tsx` - Remove mock, query assignment

### 3.2 Coach Portal Pages
- [ ] **3.2.1** `/dashboard/page.tsx` - Connect to real analytics hook
- [ ] **3.2.2** `/clients/page.tsx` - Connect to real clients hook
- [ ] **3.2.3** `/clients/[clientId]/page.tsx` - Connect to real client data
- [ ] **3.2.4** `/clients/[clientId]/check-ins/page.tsx` - Connect to real check-ins
- [ ] **3.2.5** `/clients/[clientId]/messages/page.tsx` - Connect to real messages
- [ ] **3.2.6** `/clients/[clientId]/training/page.tsx` - Connect to real programmes
- [ ] **3.2.7** `/clients/[clientId]/nutrition/page.tsx` - Connect to real meal plans
- [ ] **3.2.8** `/check-ins/page.tsx` - Connect to real check-ins list
- [ ] **3.2.9** `/check-ins/[checkInId]/page.tsx` - Connect to real check-in detail
- [ ] **3.2.10** `/programmes/page.tsx` - Connect to real templates
- [ ] **3.2.11** `/programmes/[templateId]/page.tsx` - Connect to real template editor
- [ ] **3.2.12** `/meal-plans/page.tsx` - Connect to real meal plan templates
- [ ] **3.2.13** `/notifications/page.tsx` - Connect to real notifications

---

## Phase 4: Build Coach Workflows

### 4.1 Client Management
- [ ] **4.1.1** Build invite client form/modal
- [ ] **4.1.2** Implement email-based invite flow (or direct add)
- [ ] **4.1.3** Build client status change UI (pause, end relationship)
- [ ] **4.1.4** Add confirmation dialogs for destructive actions

### 4.2 Programme Assignment
- [ ] **4.2.1** Build programme template editor (save to `programme_templates`)
- [ ] **4.2.2** Build assign programme modal (select client, select template)
- [ ] **4.2.3** Implement template duplication for customisation
- [ ] **4.2.4** Build progress tracking view for assigned programmes

### 4.3 Meal Plan Assignment
- [ ] **4.3.1** Build meal plan template editor (save to `meal_plan_templates`)
- [ ] **4.3.2** Build assign meal plan modal (select client, select template)
- [ ] **4.3.3** Implement template duplication for customisation
- [ ] **4.3.4** Build adherence tracking view for assigned meal plans

### 4.4 Check-in Review
- [ ] **4.4.1** Build check-in review form (feedback, rating, flag options)
- [ ] **4.4.2** Implement review submission (update check_ins record)
- [ ] **4.4.3** Build flagged check-ins view with filter
- [ ] **4.4.4** Build follow-up tracking UI

### 4.5 Messaging
- [ ] **4.5.1** Build real-time chat UI component
- [ ] **4.5.2** Implement Supabase Realtime subscription
- [ ] **4.5.3** Add typing indicators (optional)
- [ ] **4.5.4** Add read receipts display
- [ ] **4.5.5** Build unread message badge on navigation

---

## Phase 5: Admin Portal (Future)

### 5.1 Database Setup
- [ ] **5.1.1** Create `platform_metrics` table migration
- [ ] **5.1.2** Create `subscriptions` table migration
- [ ] **5.1.3** Create `support_tickets` table migration
- [ ] **5.1.4** Create `audit_logs` table migration
- [ ] **5.1.5** Apply migrations to Supabase

### 5.2 Route Protection
- [ ] **5.2.1** Add admin role check middleware
- [ ] **5.2.2** Redirect non-admins from /admin routes
- [ ] **5.2.3** Add role-based navigation visibility

### 5.3 Admin Features
- [ ] **5.3.1** Build user management (view all users, change roles)
- [ ] **5.3.2** Build subscription management (Stripe integration)
- [ ] **5.3.3** Build platform analytics dashboard
- [ ] **5.3.4** Build support ticket system

---

## Progress Tracking

| Phase | Status | Subtasks Complete |
|-------|--------|-------------------|
| Phase 1: Fix Hooks | Not Started | 0/48 |
| Phase 2: Fix Types | Not Started | 0/9 |
| Phase 3: Remove Mock Data | Not Started | 0/16 |
| Phase 4: Build Workflows | Not Started | 0/18 |
| Phase 5: Admin Portal | Not Started | 0/12 |

**Total Tasks: 103**
**Completed: 0**

---

## Notes

- All database tables and RLS policies are already in place
- iOS app is complete and tested
- Focus on Phase 1-3 first to get coach portal functional
- Phase 4 adds polish and complete workflows
- Phase 5 is future work for admin functionality
