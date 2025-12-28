# Brief for Claude Code: Complete Coach Platform - All Remaining Features

**Date:** 2025-12-27  
**Project:** Synced Momentum Coach Platform (Web)  
**Branch:** Create new branch `feat/complete-coach-platform`  
**Current State:** Authentication and basic dashboard complete

---

## Overview

Build the **complete** Synced Momentum coach platform with ALL remaining features. This is the final build - everything gets implemented now.

**Quality Standard:** Apple++ (no compromises)  
**Language:** British English throughout  
**Reference:** Full specification in `/docs/briefs/brief-2025-12-27-coach-platform-complete.md`

---

## What's Already Done ✅

- Next.js 14 with TypeScript, Tailwind, shadcn/ui
- Database schema with RLS policies
- Supabase clients (browser, server, middleware)
- Email authentication (login, register, password reset)
- Basic dashboard layout with sidebar
- Dashboard widgets (stats placeholders)

---

## What You Need to Build (EVERYTHING)

### 1. Apple Sign In Integration

**Note:** Apple OAuth is **already configured** in Supabase for the iOS app. You just need to add the web UI.

**Supabase Configuration:**
- ✅ Apple OAuth provider already configured (from iOS app)
- **Check redirect URLs** in Supabase dashboard:
  - Ensure web domain is added (e.g., `https://syncedmomentum.com/auth/callback`)
  - Add localhost for development: `http://localhost:3000/auth/callback`
- If redirect URLs need updating, add them in Supabase dashboard → Authentication → Providers → Apple

**UI Components:**
- Add "Continue with Apple" button to login page
- Add "Continue with Apple" button to register page
- Style with Apple branding guidelines (black button, white Apple logo)
- Handle OAuth callback at `app/auth/callback/route.ts`
- Merge accounts if email already exists (Supabase handles this automatically)

**Implementation:**
```typescript
// Example: components/auth/apple-sign-in-button.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function AppleSignInButton() {
  const supabase = createClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <Button 
      onClick={handleSignIn}
      className="w-full bg-black hover:bg-gray-800 text-white"
    >
      <AppleIcon className="mr-2 h-5 w-5" />
      Continue with Apple
    </Button>
  )
}
```

**Files:**
- Update `app/(auth)/login/page.tsx` - add Apple Sign In button
- Update `app/(auth)/register/page.tsx` - add Apple Sign In button
- Create `app/auth/callback/route.ts` - OAuth callback handler
- Create `components/auth/apple-sign-in-button.tsx`

---

### 2. Client Management (Complete)

#### 2.1 Client List Page

**Route:** `app/(dashboard)/clients/page.tsx`

**Features:**
- Data table with TanStack Table
- Columns: Name, Email, Status, Subscription, Last Active, Sessions This Week, Actions
- Filters: Status (Active, Pending, Paused, Ended), Subscription Status
- Search by name or email
- Sort by any column
- Pagination (20 per page)
- Click row to view client detail
- "Invite Client" button (top right)

**Components to Create:**
- `components/clients/clients-table.tsx`
- `components/clients/client-status-badge.tsx` (colour-coded: pending=yellow, active=green, paused=orange, ended=grey)
- `components/clients/client-row-actions.tsx` (dropdown menu: View, Message, Pause/Resume, End Relationship)

**Data:**
- Fetch from `coach_clients` table joined with `profiles`
- Include relationship status and subscription info
- Real-time updates when new clients join

#### 2.2 Invite Client Flow

**Route:** `app/(dashboard)/clients/invite/page.tsx`

**Features:**
- Form with email input (with validation)
- Optional custom message textarea
- Preview invitation email
- Send invitation button
- Success: redirect to clients list with toast
- Creates pending relationship in `coach_clients` table
- Sends invitation email via Supabase (or Resend API if configured)

**Components:**
- `components/clients/invite-client-form.tsx`

#### 2.3 Client Detail Page

**Route:** `app/(dashboard)/clients/[clientId]/page.tsx`

**Layout:**
- Client header (name, email, joined date, status badge)
- Tab navigation (Overview, Training, Nutrition, Check-Ins, Health, Messages, Settings)
- Each tab is a separate route group for better performance

**Tab Routes:**
- `app/(dashboard)/clients/[clientId]/overview/page.tsx`
- `app/(dashboard)/clients/[clientId]/training/page.tsx`
- `app/(dashboard)/clients/[clientId]/nutrition/page.tsx`
- `app/(dashboard)/clients/[clientId]/check-ins/page.tsx`
- `app/(dashboard)/clients/[clientId]/health/page.tsx`
- `app/(dashboard)/clients/[clientId]/messages/page.tsx`
- `app/(dashboard)/clients/[clientId]/settings/page.tsx`

#### Overview Tab

**Content:**
- Client info card (email, joined date, status, subscription)
- Current programme card (if assigned)
- Current meal plan card (if assigned)
- Recent check-ins (last 4) with quick view
- Adherence trends chart (7-day, 30-day) - training and nutrition
- Weight chart (30 days, line chart with Recharts)
- Quick actions: Send Message, Add Note, Assign Programme, Assign Meal Plan

**Components:**
- `components/clients/client-overview.tsx`
- `components/clients/client-info-card.tsx`
- `components/clients/current-programme-card.tsx`
- `components/clients/current-meal-plan-card.tsx`
- `components/clients/adherence-chart.tsx` (Recharts area chart)
- `components/clients/weight-chart.tsx` (Recharts line chart)

#### Training Tab

**Content:**
- Current programme section (if assigned)
  - Programme name, start/end dates, completion %
  - Weekly view of scheduled sessions
  - Button to modify programme
- Session history table
  - Columns: Date, Type (Push/Pull/Legs), Duration, Exercises, Volume (sets x reps x weight), Notes
  - Sortable and filterable
  - Click to expand and see exercise details
- Personal records timeline
  - List of PRs with exercise, previous record, new record, date
- Programme assignment history
  - All past programmes with dates and completion status

**Components:**
- `components/training/current-programme-display.tsx`
- `components/training/session-history-table.tsx`
- `components/training/session-detail-modal.tsx`
- `components/training/personal-records-list.tsx`

#### Nutrition Tab

**Content:**
- Current meal plan section (if assigned)
  - Meal plan name, start/end dates
  - Training day vs non-training day macros
  - Button to modify meal plan
- Daily logs table
  - Columns: Date, Calories, Protein, Carbs, Fat, Adherence %
  - Colour-coded adherence (green >90%, yellow 70-90%, red <70%)
- Macro trend charts (7-day, 30-day)
  - Stacked area chart showing protein/carbs/fat over time
  - Target lines for comparison
- Meal plan assignment history

**Components:**
- `components/nutrition/current-meal-plan-display.tsx`
- `components/nutrition/daily-logs-table.tsx`
- `components/nutrition/macro-trends-chart.tsx` (Recharts)

#### Check-Ins Tab

**Content:**
- Check-in timeline (newest first)
- Each check-in card shows:
  - Date
  - Weight (with week-over-week change indicator)
  - Steps (with target comparison)
  - Sleep hours (with quality grade)
  - Supplement compliance %
  - Review status (reviewed badge or "Pending Review")
  - Click to expand for full details
- Expanded check-in shows:
  - All metrics above in detail
  - Daily step breakdown (bar chart)
  - Coach feedback field (if already reviewed, show feedback; if pending, allow editing)
  - Rating selector (1-5 stars)
  - "Mark as Reviewed" button (if pending)
- Filter by date range, review status
- Export to PDF button

**Components:**
- `components/check-ins/check-in-timeline.tsx`
- `components/check-ins/check-in-card.tsx`
- `components/check-ins/check-in-detail-modal.tsx`
- `components/check-ins/steps-breakdown-chart.tsx` (Recharts bar chart)
- `components/check-ins/coach-feedback-editor.tsx`
- `components/check-ins/rating-selector.tsx` (star rating)

#### Health Tab

**Content:**
- Blood work tests list
  - Table with: Date, Lab Provider, Tags, View button
  - Click to view test details
- Blood work test detail modal
  - All markers in a table (Marker, Value, Unit, Reference Range, Status)
  - Colour-coded status (low=yellow, normal=green, high=red)
  - Charts for selected markers (line chart showing trend over time)
  - Ability to tag tests (e.g., "GH Cycle 2024")
- Sleep quality trends chart (30 days)
- HRV trends chart (if available)
- Strain/recovery trends chart
- Hydration trends chart

**Components:**
- `components/health/blood-work-tests-table.tsx`
- `components/health/blood-work-test-modal.tsx`
- `components/health/marker-trend-chart.tsx` (Recharts)
- `components/health/sleep-trends-chart.tsx`
- `components/health/hrv-trends-chart.tsx`
- `components/health/strain-recovery-chart.tsx`

#### Messages Tab

**Content:**
- Chat-style message thread
- All messages between coach and this client
- Text input at bottom
- Send button
- Messages grouped by date
- Read receipts
- Auto-scroll to latest message
- Real-time updates (Supabase Realtime)

**Components:**
- `components/messages/message-thread.tsx`
- `components/messages/message-bubble.tsx`
- `components/messages/message-input.tsx`

#### Settings Tab

**Content:**
- Client goals and preferences (read-only display)
  - TDEE, goal (cut/bulk/maintain), target macros
- Subscription details
  - Status, start date, next billing date (if applicable)
- Relationship management
  - Pause relationship button (with reason textarea)
  - End relationship button (with reason textarea and confirmation)
- Danger zone (red section)
  - Remove client button (with confirmation modal)

**Components:**
- `components/clients/client-settings.tsx`
- `components/clients/subscription-details.tsx`
- `components/clients/relationship-management.tsx`

---

### 3. Check-In Review Dashboard

**Route:** `app/(dashboard)/check-ins/page.tsx`

**Features:**
- List of ALL check-ins (across all clients)
- Filters: 
  - Status (Pending Review, Reviewed, All)
  - Date range
  - Client (dropdown)
- Sort by submission date (newest first default)
- Table columns: Client Name, Submitted, Weight Change, Steps, Sleep, Compliance, Status, Actions
- Click row to view full check-in detail
- Bulk actions: Mark selected as reviewed (if implementing)

**Route:** `app/(dashboard)/check-ins/[checkInId]/page.tsx`

**Full check-in detail view** (same as in client detail, but standalone page)

**Components:**
- `components/check-ins/check-ins-list.tsx`
- (Reuse check-in detail components from client view)

---

### 4. Programme Management

#### 4.1 Programme Templates List

**Route:** `app/(dashboard)/programmes/page.tsx`

**Features:**
- Grid or table of programme templates
- Filters: Type (strength, hypertrophy, powerlifting, etc.), Duration (4-week, 6-week, 12-week), Difficulty
- Search by name
- Each card shows: Name, Description, Duration, Type, Difficulty, Times Assigned, Actions
- Actions: View, Edit, Duplicate, Delete, Assign to Client
- "Create Programme" button (top right)

**Components:**
- `components/programmes/programme-templates-grid.tsx`
- `components/programmes/programme-template-card.tsx`
- `components/programmes/programme-filters.tsx`

#### 4.2 Create/Edit Programme Template

**Route:** `app/(dashboard)/programmes/new/page.tsx`  
**Route:** `app/(dashboard)/programmes/[templateId]/edit/page.tsx`

**Multi-step form:**

**Step 1: Template Metadata**
- Name (text input)
- Description (textarea)
- Duration in weeks (number input)
- Programme type (select: strength, hypertrophy, powerlifting, bodybuilding, general fitness)
- Difficulty level (select: beginner, intermediate, advanced)

**Step 2: Week Builder**
- Define how many training days per week
- For each week in the duration:
  - Add training days
  - Name each day (e.g., "Push A", "Pull B", "Legs")
  - Ability to copy week to another week

**Step 3: Exercise Builder (for each training day)**
- Add exercises from MuscleWiki library
  - Exercise search/select modal (search by name, filter by muscle group)
  - Display: Exercise name, muscle group, difficulty, equipment
  - MuscleWiki API integration: `https://musclewiki.com/api/exercises/` (if available) OR use local database of 921 exercises
- For each exercise:
  - Sets (number)
  - Reps (text, allows ranges like "8-10")
  - RPE target (number 1-10)
  - Rest seconds (number)
  - Notes (text, e.g., "Tempo 3-0-1-0")
- Drag-and-drop reordering of exercises
- Ability to add supersets

**Step 4: Review & Save**
- Preview entire programme in readable format
- Save as draft or publish
- On save: redirects to template detail view

**Components:**
- `components/programmes/programme-form.tsx` (multi-step wizard)
- `components/programmes/template-metadata-form.tsx`
- `components/programmes/week-builder.tsx`
- `components/programmes/training-day-card.tsx`
- `components/programmes/exercise-builder.tsx`
- `components/programmes/exercise-selector-modal.tsx` (MuscleWiki search)
- `components/programmes/exercise-card.tsx`
- `components/programmes/programme-preview.tsx`

#### 4.3 View Programme Template

**Route:** `app/(dashboard)/programmes/[templateId]/page.tsx`

**Features:**
- Full programme display (week-by-week, day-by-day, exercise-by-exercise)
- Edit button
- Duplicate button (creates a copy)
- Delete button (with confirmation)
- Assignment history: List of clients who have been assigned this programme (with dates and completion status)
- "Assign to Client" button

**Components:**
- `components/programmes/programme-detail-view.tsx`
- `components/programmes/assignment-history-table.tsx`

#### 4.4 Assign Programme to Client

**Route:** `app/(dashboard)/programmes/assign/page.tsx`

**Features:**
- Step 1: Select client (dropdown with search)
- Step 2: Select template (dropdown with preview on select)
- Step 3: Set start date (date picker)
- Step 4: Option to modify programme for this specific client
  - If yes: opens exercise builder to make client-specific changes
  - If no: proceeds with template as-is
- Step 5: Preview before assignment
- Assign button
- On assign: Creates entry in `programme_assignments` table with programme_data snapshot
- Redirects to client detail > training tab

**Components:**
- `components/programmes/assign-programme-form.tsx` (multi-step)
- `components/programmes/client-selector.tsx`
- `components/programmes/template-selector-with-preview.tsx`
- `components/programmes/programme-modification-editor.tsx`

---

### 5. Meal Plan Management

#### 5.1 Meal Plan Templates List

**Route:** `app/(dashboard)/meal-plans/page.tsx`

**Features:**
- Grid or table of meal plan templates
- Filters: Type (cutting, bulking, maintenance, contest prep), Calorie range
- Search by name
- Each card shows: Name, Description, Type, Training Day Cals, Non-Training Day Cals, Times Assigned, Actions
- Actions: View, Edit, Duplicate, Delete, Assign to Client
- "Create Meal Plan" button

**Components:**
- `components/meal-plans/meal-plan-templates-grid.tsx`
- `components/meal-plans/meal-plan-template-card.tsx`

#### 5.2 Create/Edit Meal Plan Template

**Route:** `app/(dashboard)/meal-plans/new/page.tsx`  
**Route:** `app/(dashboard)/meal-plans/[templateId]/edit/page.tsx`

**Multi-step form:**

**Step 1: Template Metadata**
- Name
- Description
- Plan type (select: cutting, bulking, maintenance, contest prep)

**Step 2: Macro Targets**
- Training Day: Calories, Protein (g), Carbs (g), Fat (g)
- Non-Training Day: Calories, Protein (g), Carbs (g), Fat (g)

**Step 3: Meal Builder (Training Day)**
- Add meals (Meal 1, Meal 2, etc.)
- For each meal:
  - Name (e.g., "Breakfast")
  - Time (e.g., "07:00")
  - Foods:
    - Search food database (500+ items covering coach-provided meals)
    - Select food
    - Quantity and unit (g, oz, serving)
    - Auto-calculate macros
- Real-time macro totals at bottom
- Visual indicator when hitting targets (green when within 5% of target)
- Drag-and-drop reordering of meals

**Step 4: Meal Builder (Non-Training Day)**
- Same as Step 3 but for non-training days

**Step 5: Review & Save**
- Preview both training and non-training day meal plans
- Show calculated macro totals vs targets
- Save as draft or publish

**Components:**
- `components/meal-plans/meal-plan-form.tsx` (multi-step wizard)
- `components/meal-plans/template-metadata-form.tsx`
- `components/meal-plans/macro-targets-form.tsx`
- `components/meal-plans/meal-builder.tsx`
- `components/meal-plans/food-selector-modal.tsx` (search food database)
- `components/meal-plans/meal-card.tsx`
- `components/meal-plans/macro-summary.tsx` (real-time totals)
- `components/meal-plans/meal-plan-preview.tsx`

#### 5.3 View Meal Plan Template

**Route:** `app/(dashboard)/meal-plans/[templateId]/page.tsx`

**Features:**
- Full meal plan display (training day and non-training day side-by-side)
- Edit button
- Duplicate button
- Delete button
- Assignment history
- "Assign to Client" button

**Components:**
- `components/meal-plans/meal-plan-detail-view.tsx`

#### 5.4 Assign Meal Plan to Client

**Route:** `app/(dashboard)/meal-plans/assign/page.tsx`

**Features:**
- Select client
- Select template
- Set start date
- Option to modify meal plan
- Preview
- Assign button
- Redirects to client detail > nutrition tab

**Components:**
- `components/meal-plans/assign-meal-plan-form.tsx`

---

### 6. Analytics Dashboard

**Route:** `app/(dashboard)/analytics/page.tsx`

**Features:**

**Overview Section:**
- Total active clients (number card)
- Total sessions logged this week (across all clients)
- Total meals logged this week (across all clients)
- Avg training adherence % (across all clients)
- Avg nutrition adherence % (across all clients)
- Check-in submission rate (% of clients who submitted this week)

**Engagement Section:**
- Client login frequency chart (bar chart, last 30 days)
- At-risk clients list (7+ days inactive)
  - Table: Client Name, Last Active, Days Inactive, Action (Send Message)

**Progress Section:**
- Aggregate weight change chart (average across all clients, line chart)
- Client success stories (clients who hit their goals)
  - Cards with: Client name, Goal achieved, Date

**Leaderboard Section (optional but nice):**
- Top clients by adherence
- Top clients by PRs this month
- Top clients by check-in consistency

**Export Section:**
- Date range selector
- Export button (PDF or CSV)
- Generates report with all metrics above

**Components:**
- `components/analytics/analytics-dashboard.tsx`
- `components/analytics/metric-card.tsx`
- `components/analytics/engagement-chart.tsx` (Recharts)
- `components/analytics/at-risk-clients-table.tsx`
- `components/analytics/weight-trends-chart.tsx` (Recharts)
- `components/analytics/client-leaderboard.tsx`
- `components/analytics/report-exporter.tsx`

---

### 7. Notifications

**Route:** `app/(dashboard)/notifications/page.tsx`

**Features:**
- List of all notifications
- Types:
  - New check-in submitted
  - New message received
  - Client accepted invitation
  - Client login after 7+ days inactive
- Each notification shows:
  - Icon (based on type)
  - Title
  - Description
  - Timestamp (relative, e.g., "2 hours ago")
  - Read/unread indicator
  - Link to relevant page (e.g., check-in detail, message thread)
- Mark as read/unread actions
- Mark all as read button
- Filter by type
- Delete notification (archive)

**Notification Badge:**
- Add unread count badge to top bar (bell icon)
- Real-time updates via Supabase Realtime

**Components:**
- `components/notifications/notification-list.tsx`
- `components/notifications/notification-item.tsx`
- `components/notifications/notification-badge.tsx` (in top bar)

**Real-Time:**
- Subscribe to `coach_client_messages` (INSERT where sender != coach)
- Subscribe to `check_in_days` (INSERT/UPDATE where was_sent_to_coach = true)
- Subscribe to `coach_clients` (UPDATE where status changed to 'active')

---

### 8. Settings Pages

#### 8.1 Profile Settings

**Route:** `app/(dashboard)/settings/profile/page.tsx`

**Features:**
- Upload coach logo (Supabase Storage)
  - Image preview
  - File size limit (2MB)
  - Accepted formats: PNG, JPG, SVG
- Coach bio (textarea, max 500 chars)
- Credentials (textarea, max 200 chars)
- Choose brand colour (colour picker)
  - Updates primary colour in app for this coach
- Website URL
- Instagram handle
- Save button
- Success toast on save

**Components:**
- `components/settings/profile-settings-form.tsx`
- `components/settings/logo-uploader.tsx`
- `components/settings/colour-picker.tsx`

#### 8.2 Account Settings

**Route:** `app/(dashboard)/settings/account/page.tsx`

**Features:**
- Change email
  - Current email (read-only)
  - New email input
  - Confirmation required
- Change password
  - Current password input
  - New password input
  - Confirm new password input
  - Password strength indicator
- Two-factor authentication (optional - can be placeholder for now)
- Delete account
  - Danger zone (red section)
  - "Delete Account" button
  - Confirmation modal with password re-entry
  - Warning about data deletion

**Components:**
- `components/settings/account-settings.tsx`
- `components/settings/change-email-form.tsx`
- `components/settings/change-password-form.tsx`
- `components/settings/delete-account-modal.tsx`

#### 8.3 Notification Settings

**Route:** `app/(dashboard)/settings/notifications/page.tsx`

**Features:**
- Email notification preferences (toggle switches):
  - New check-in submitted
  - New message received
  - Client accepted invitation
  - Client inactive for 7+ days
  - Weekly summary (summary of all activity)
- Notification frequency (radio buttons):
  - Instant (as they happen)
  - Daily digest (once per day)
  - Weekly digest (once per week)
- Save button

**Components:**
- `components/settings/notification-settings-form.tsx`

---

### 9. Messaging System (Global)

**Real-Time Integration:**
- Use Supabase Realtime to subscribe to `coach_client_messages` table
- When new message arrives:
  - If on messages tab: append to thread immediately
  - If elsewhere: show toast notification with sender name and preview
  - Update unread count in notification badge

**Message Components (reusable):**
- Already created for client detail > messages tab
- Use same components throughout

---

### 10. PDF Exports

#### 10.1 Check-In PDF Export

**Functionality:**
- Generate PDF report for a single check-in
- Include:
  - Client name, check-in date
  - Weight (with week-over-week change)
  - Steps (with target, daily breakdown chart)
  - Sleep (hours, quality grade)
  - Supplement compliance
  - Coach feedback and rating
- Professional formatting
- Synced Momentum branding (logo if uploaded, brand colour)

**Library:** Use `jsPDF` or `react-pdf` (your choice based on what works best)

**Components:**
- `components/exports/check-in-pdf-generator.tsx`
- Button in check-in detail view: "Export to PDF"

#### 10.2 Client Report PDF Export

**Functionality:**
- Generate comprehensive client report
- Include:
  - Client info
  - Current programme summary
  - Current meal plan summary
  - Recent check-ins (last 4-8 weeks)
  - Weight trend chart
  - Adherence trends (training and nutrition)
  - PR timeline
- Date range selector

**Components:**
- `components/exports/client-report-pdf-generator.tsx`
- Button in client detail > overview tab: "Export Report"

#### 10.3 Analytics Report PDF Export

**Functionality:**
- Generate analytics report (from analytics dashboard)
- Include all metrics and charts
- Date range selector

**Components:**
- `components/exports/analytics-pdf-generator.tsx`

---

### 11. Additional UI Components & Enhancements

#### 11.1 Loading States

- Create skeleton loaders for:
  - Tables (clients, check-ins, programmes, meal plans)
  - Cards (dashboard widgets, client cards, etc.)
  - Charts
- Use throughout app for better UX

**Components:**
- `components/ui/skeleton.tsx` (if not already from shadcn)
- `components/ui/table-skeleton.tsx`
- `components/ui/card-skeleton.tsx`

#### 11.2 Empty States

- Create empty state components for:
  - No clients yet (with "Invite Client" CTA)
  - No check-ins yet
  - No programmes created
  - No meal plans created
  - No messages yet
- Professional illustrations or simple icons

**Components:**
- `components/ui/empty-state.tsx`

#### 11.3 Error States

- Create error boundary components
- Create error state displays for:
  - Failed data fetches
  - Network errors
  - Permission errors
- Include retry buttons where applicable

**Components:**
- Already have error boundaries, ensure they're used throughout
- `components/ui/error-state.tsx`

#### 11.4 Toast Notifications

- Use for all success/error feedback:
  - Client invited successfully
  - Programme created successfully
  - Check-in reviewed
  - Message sent
  - Settings saved
  - Errors (failed to save, network error, etc.)
- Use `sonner` or `react-hot-toast` (consistent with shadcn ecosystem)

**Setup:**
- Install toast library
- Add toast provider to root layout
- Use throughout app

#### 11.5 Confirmation Modals

- Create reusable confirmation dialog
- Use for destructive actions:
  - Delete programme template
  - Delete meal plan template
  - End client relationship
  - Delete account

**Components:**
- `components/ui/confirmation-dialog.tsx`

---

### 12. Data Integration & State Management

#### 12.1 React Query Hooks

Create custom hooks for all data operations:

**Client Hooks:**
- `hooks/use-clients.ts` - fetch all clients
- `hooks/use-client.ts` - fetch single client
- `hooks/use-invite-client.ts` - invite mutation
- `hooks/use-update-client-relationship.ts` - pause/end relationship

**Check-In Hooks:**
- `hooks/use-check-ins.ts` - fetch check-ins (with filters)
- `hooks/use-check-in.ts` - fetch single check-in
- `hooks/use-review-check-in.ts` - review mutation

**Programme Hooks:**
- `hooks/use-programme-templates.ts`
- `hooks/use-programme-template.ts`
- `hooks/use-create-programme-template.ts`
- `hooks/use-update-programme-template.ts`
- `hooks/use-delete-programme-template.ts`
- `hooks/use-assign-programme.ts`
- `hooks/use-programme-assignments.ts`

**Meal Plan Hooks:**
- `hooks/use-meal-plan-templates.ts`
- `hooks/use-meal-plan-template.ts`
- `hooks/use-create-meal-plan-template.ts`
- `hooks/use-update-meal-plan-template.ts`
- `hooks/use-delete-meal-plan-template.ts`
- `hooks/use-assign-meal-plan.ts`
- `hooks/use-meal-plan-assignments.ts`

**Message Hooks:**
- `hooks/use-messages.ts` - fetch messages for relationship
- `hooks/use-send-message.ts` - send mutation
- `hooks/use-mark-message-read.ts`

**Analytics Hooks:**
- `hooks/use-coach-analytics.ts` - fetch all analytics metrics

**Settings Hooks:**
- `hooks/use-update-profile.ts`
- `hooks/use-upload-logo.ts`
- `hooks/use-update-notification-settings.ts`

#### 12.2 Zustand Stores (if needed)

- `stores/use-sidebar-store.ts` - sidebar collapsed state
- `stores/use-filter-store.ts` - persist filter selections across navigations (optional)

---

### 13. MuscleWiki Exercise Integration

**Data Source:**
- If MuscleWiki API is available: use it
- If not: create local database/JSON file with 921 exercises
- Exercise fields: id, name, muscle_group, difficulty, equipment, instructions, video_url (if available)

**Implementation:**
- `lib/exercises/musclewiki-client.ts` - fetch exercises
- `lib/exercises/exercises-data.json` - local data (if API unavailable)
- `lib/exercises/search-exercises.ts` - search/filter logic

**Components:**
- Exercise selector modal (already specified in programme builder)
- Exercise card with: name, muscle group icon, difficulty badge, equipment required

---

### 14. Food Database Integration

**Data Source:**
- Create local database/JSON file with 500+ foods
- Food fields: id, name, serving_size, serving_unit, calories, protein, carbs, fat, category, is_vegetarian, is_vegan, is_gluten_free

**Implementation:**
- `lib/foods/food-database.json`
- `lib/foods/search-foods.ts` - search/filter logic

**Components:**
- Food selector modal (already specified in meal plan builder)
- Food card with: name, macros per serving, dietary tags

---

### 15. Deployment & Production Readiness

#### 15.1 Environment Variables

- Ensure all required env vars are documented in `.env.example`
- Add to Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Any additional API keys (Resend for emails, etc.)

#### 15.2 Vercel Configuration

- Create `vercel.json` if needed
- Configure redirects (if any)
- Set up preview deployments for PRs
- Set up production deployment from `main` branch

#### 15.3 Performance Optimisations

- Ensure images are optimised (use Next.js Image component)
- Code splitting is automatic with App Router, but verify
- Lazy load heavy components (charts, modals)
- Use React Query caching effectively (staleTime, cacheTime)
- Add loading skeletons for better perceived performance

#### 15.4 SEO & Metadata

- Update metadata in each page's layout
- Add proper page titles
- Add Open Graph tags for sharing (optional)

#### 15.5 Error Monitoring

- Set up Sentry (optional but recommended)
- Add error tracking to API routes and client components

---

### 16. Testing & Quality Assurance

Before marking as complete, verify:

**Functionality:**
- [ ] Can invite clients
- [ ] Can view client list with filters
- [ ] Can view client detail with all tabs working
- [ ] Can review check-ins and add feedback
- [ ] Can create programme templates
- [ ] Can assign programmes to clients
- [ ] Can create meal plan templates
- [ ] Can assign meal plans to clients
- [ ] Can send/receive messages (test real-time)
- [ ] Analytics dashboard shows metrics
- [ ] Notifications work and update in real-time
- [ ] Settings can be updated (profile, account, notifications)
- [ ] PDF exports generate correctly
- [ ] Apple Sign In works

**Data Integrity:**
- [ ] RLS policies prevent unauthorised access (test by creating a second coach account)
- [ ] All mutations update database correctly
- [ ] Real-time subscriptions work
- [ ] No N+1 query issues (use Supabase dashboard to monitor)

**UI/UX:**
- [ ] All pages are responsive (test on mobile, tablet, desktop)
- [ ] Loading states appear for async operations
- [ ] Error states handle failures gracefully
- [ ] Toast notifications appear for user actions
- [ ] No console errors or warnings
- [ ] Colour contrast meets accessibility standards
- [ ] Keyboard navigation works

**Performance:**
- [ ] Lighthouse score > 90 on key pages
- [ ] Images are optimised
- [ ] Bundle size is reasonable
- [ ] No unnecessary re-renders (React DevTools)

**Code Quality:**
- [ ] TypeScript strict mode passes with no errors
- [ ] ESLint passes with no errors
- [ ] Prettier formatting is consistent
- [ ] British English used throughout

---

## Implementation Checklist

Complete these in order:

### Phase 1: Core Features
- [ ] Add Apple Sign In to auth pages
- [ ] Build client management (list, invite, detail with all tabs)
- [ ] Build check-in review system
- [ ] Implement messaging with real-time updates

### Phase 2: Templates & Assignments
- [ ] Build programme template system (create, edit, view, delete)
- [ ] Integrate MuscleWiki exercises
- [ ] Build programme assignment flow
- [ ] Build meal plan template system (create, edit, view, delete)
- [ ] Integrate food database
- [ ] Build meal plan assignment flow

### Phase 3: Analytics & Notifications
- [ ] Build analytics dashboard with charts
- [ ] Build notifications system with real-time updates
- [ ] Add notification badge to top bar

### Phase 4: Settings & Exports
- [ ] Build all settings pages (profile, account, notifications)
- [ ] Implement PDF exports (check-ins, client reports, analytics)
- [ ] Add logo upload to Supabase Storage

### Phase 5: Polish & Deploy
- [ ] Add loading skeletons everywhere
- [ ] Add empty states
- [ ] Add error states
- [ ] Add confirmation modals for destructive actions
- [ ] Implement toast notifications throughout
- [ ] Verify all real-time subscriptions work
- [ ] Performance audit and optimisations
- [ ] Accessibility audit
- [ ] Deploy to Vercel
- [ ] Test production build

---

## Acceptance Criteria

### Must Have (Blocking Launch):
- ✅ All features from original brief implemented
- ✅ Apple Sign In working
- ✅ Can invite and manage clients
- ✅ Can review check-ins
- ✅ Can create and assign programmes
- ✅ Can create and assign meal plans
- ✅ Messaging works with real-time updates
- ✅ Analytics dashboard functional
- ✅ Settings pages working
- ✅ PDF exports working
- ✅ Deployed to Vercel and accessible
- ✅ No critical bugs
- ✅ Responsive on all devices
- ✅ TypeScript compiles with no errors
- ✅ RLS policies prevent unauthorised access

### Nice to Have (Can Iterate Post-Launch):
- 🔲 Passkeys authentication
- 🔲 Advanced analytics (predictive, benchmarking)
- 🔲 Email notifications (requires Resend API setup)
- 🔲 Two-factor authentication
- 🔲 Sentry error monitoring

---

## Notes

**British English:**
- colour, organise, realise, analyse, programme (not program when referring to training programmes)

**Apple++ Quality:**
- Use frontend-design skill for all UI
- No generic templates
- Professional spacing, typography, animations
- Thoughtful interactions
- Delightful micro-interactions where appropriate
- Premium feel throughout

**Data Sources:**
- MuscleWiki: 921 exercises (use API if available, otherwise local JSON)
- Food database: 500+ items (local JSON for now, can integrate API later)

**Real-Time:**
- Check-ins: new submissions
- Messages: new messages
- Clients: status changes (pending → active)

**Security:**
- All data access controlled by RLS
- Service role key never exposed to client
- File uploads validated (size, type)
- User input sanitised

---

## Final Deliverables

When you report completion, the platform should:

1. **Be fully functional** - every feature works end-to-end
2. **Be deployed to Vercel** - accessible at a URL
3. **Be production-ready** - no placeholders, no TODOs
4. **Be tested** - all acceptance criteria verified
5. **Be polished** - Apple++ quality throughout
6. **Be documented** - README updated with setup instructions

---

## Ready to Build! 🚀

**This is it - the final build. Everything gets implemented now.**

Read the full specification in `/docs/briefs/brief-2025-12-27-coach-platform-complete.md` for additional context, but this brief contains all the implementation details you need.

Use the frontend-design skill liberally. Make this platform **extraordinary**.

When complete, commit with message:
```
feat: Complete coach platform implementation

- Apple Sign In integration
- Client management (list, invite, detail with 7 tabs)
- Check-in review system with real-time updates
- Programme templates (create, edit, assign) with MuscleWiki integration
- Meal plan templates (create, edit, assign) with food database
- Analytics dashboard with charts and metrics
- Messaging system with real-time updates
- Notifications system with real-time updates
- Settings pages (profile, account, notifications)
- PDF exports (check-ins, client reports, analytics)
- Loading states, empty states, error states
- Toast notifications throughout
- Confirmation modals for destructive actions
- Deployed to Vercel
- Production-ready
```

**Let's build something extraordinary!**
