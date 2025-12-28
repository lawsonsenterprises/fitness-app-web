# Implementation Plan: Complete Synced Momentum Coach Platform

**Date:** 2025-12-27
**Brief:** `brief-2025-12-27-complete-platform.md`
**Branch:** `feat/complete-coach-platform`
**Quality Standard:** Apple++ (Nothing but perfection)
**Language:** British English throughout

---

## Executive Summary

This plan delivers the **complete** Synced Momentum coach platform - a premium web application enabling fitness coaches to manage clients, create training programmes, build meal plans, review check-ins, and track analytics. Every feature will be implemented to Apple++ standards with meticulous attention to detail, fluid animations, and a premium feel throughout.

---

## Current State Assessment

### Already Implemented ✅
- Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui
- Complete database schema with 50+ tables and RLS policies
- Supabase clients (browser, server, middleware)
- Email authentication (login, register, password reset)
- Basic dashboard layout with sidebar and top bar
- Dashboard widgets with mock data
- Protected route middleware
- Responsive design foundation

### To Be Built 🚀
Everything else - this is a comprehensive build covering 16 major feature areas.

---

## Implementation Phases

The build is organised into 5 sequential phases, each building upon the previous. Every phase must be completed to Apple++ standards before proceeding.

---

## Phase 1: Core Features (Foundation)

### 1.1 Apple Sign In Integration

**Priority:** High
**Complexity:** Low
**Dependencies:** None (OAuth already configured in Supabase)

#### Files to Create/Modify:
```
components/auth/apple-sign-in-button.tsx    [NEW]
app/auth/callback/route.ts                   [NEW]
app/(auth)/login/page.tsx                    [MODIFY]
app/(auth)/register/page.tsx                 [MODIFY]
```

#### Implementation Details:

**Apple Sign In Button Component:**
- Black background with white Apple logo (Apple branding guidelines)
- Subtle hover state with grey-800 background
- Loading state with spinner replacing text
- Full-width to match existing form buttons
- Accessible: proper aria labels, keyboard navigation

**OAuth Callback Handler:**
- Handle Supabase OAuth callback at `/auth/callback`
- Exchange code for session
- Redirect to dashboard on success
- Handle errors gracefully with toast notifications
- Support account linking if email already exists

**Auth Page Updates:**
- Add divider between email form and social login ("or continue with")
- Apple button below the divider
- Maintain visual hierarchy and spacing
- Ensure mobile responsiveness

#### Acceptance Criteria:
- [ ] Apple Sign In button renders on login and register pages
- [ ] Clicking button initiates OAuth flow
- [ ] Callback handles success and redirects to dashboard
- [ ] Callback handles errors and shows appropriate message
- [ ] Button follows Apple branding guidelines exactly
- [ ] Works on mobile and desktop

---

### 1.2 Client Management System

**Priority:** Critical
**Complexity:** High
**Dependencies:** Phase 1.1 (for full auth flow)

This is the heart of the platform - coaches need to manage their clients effectively.

#### 1.2.1 Client List Page

**Route:** `app/(dashboard)/clients/page.tsx`

**Files to Create:**
```
components/clients/clients-table.tsx           [NEW]
components/clients/client-status-badge.tsx     [MODIFY - enhance]
components/clients/client-row-actions.tsx      [NEW]
components/clients/client-filters.tsx          [NEW]
components/clients/invite-client-dialog.tsx    [NEW]
hooks/use-clients.ts                           [NEW]
hooks/use-invite-client.ts                     [NEW]
```

**Data Table Features:**
- TanStack Table integration with virtualisation for performance
- Columns: Name (with avatar), Email, Status, Subscription, Last Active, Sessions This Week, Actions
- Sortable columns (click header to sort)
- Filterable by: Status (Active, Pending, Paused, Ended), Subscription Status
- Search bar (debounced, searches name and email)
- Pagination with 20 items per page
- Row click navigates to client detail
- Skeleton loading states
- Empty state when no clients

**Status Badge Colours:**
- Pending: Amber/Yellow
- Active: Green
- Paused: Orange
- Ended: Grey

**Row Actions Dropdown:**
- View Client
- Send Message
- Pause/Resume Relationship
- End Relationship (with confirmation)

**Invite Client Button:**
- Primary button in top-right
- Opens slide-over panel or modal
- Form with email input (validated)
- Optional custom message textarea
- Preview invitation email
- Send button with loading state
- Success: close modal, refresh list, show toast
- Error: show error message, allow retry

#### 1.2.2 Client Detail Page

**Route:** `app/(dashboard)/clients/[clientId]/page.tsx`

This is a comprehensive client view with 7 tabs, each as a separate route for optimal performance.

**Files to Create:**
```
app/(dashboard)/clients/[clientId]/layout.tsx           [NEW]
app/(dashboard)/clients/[clientId]/page.tsx             [NEW] - redirects to overview
app/(dashboard)/clients/[clientId]/overview/page.tsx   [NEW]
app/(dashboard)/clients/[clientId]/training/page.tsx   [NEW]
app/(dashboard)/clients/[clientId]/nutrition/page.tsx  [NEW]
app/(dashboard)/clients/[clientId]/check-ins/page.tsx  [NEW]
app/(dashboard)/clients/[clientId]/health/page.tsx     [NEW]
app/(dashboard)/clients/[clientId]/messages/page.tsx   [NEW]
app/(dashboard)/clients/[clientId]/settings/page.tsx   [NEW]

components/clients/client-header.tsx                    [NEW]
components/clients/client-tabs.tsx                      [NEW]
components/clients/client-overview.tsx                  [NEW]
components/clients/client-info-card.tsx                 [NEW]
components/clients/current-programme-card.tsx           [NEW]
components/clients/current-meal-plan-card.tsx           [NEW]
components/clients/adherence-chart.tsx                  [NEW]
components/clients/weight-chart.tsx                     [NEW]
components/clients/quick-actions.tsx                    [NEW]

hooks/use-client.ts                                     [NEW]
hooks/use-client-stats.ts                               [NEW]
```

**Client Header:**
- Client name (large, bold)
- Email address
- Joined date (relative, e.g., "Joined 3 months ago")
- Status badge (colour-coded)
- Back button to clients list

**Tab Navigation:**
- Overview | Training | Nutrition | Check-Ins | Health | Messages | Settings
- Active tab indicator with subtle animation
- URL-based navigation for bookmarking/sharing
- Prefetch adjacent tabs on hover

**Overview Tab Content:**
- Client Info Card: email, joined date, status, subscription details
- Current Programme Card: name, progress %, start/end dates, "View" button
- Current Meal Plan Card: name, training/non-training macros, "View" button
- Recent Check-Ins: last 4 with quick summary, "View All" link
- Adherence Trends: dual-axis Recharts area chart (training + nutrition, 7-day/30-day toggle)
- Weight Chart: Recharts line chart with 30-day default, expandable
- Quick Actions: Send Message, Add Note, Assign Programme, Assign Meal Plan

**Training Tab Content:**
- Current Programme Section:
  - Programme name, type, difficulty
  - Start/end dates
  - Completion percentage with progress bar
  - Weekly calendar view of scheduled sessions
  - "Modify Programme" button
- Session History Table:
  - Columns: Date, Type (Push/Pull/Legs/etc.), Duration, Exercises, Volume, Notes
  - Expandable rows to show exercise details
  - Sortable and filterable
- Personal Records Timeline:
  - Chronological list of PRs
  - Exercise name, previous record, new record, date, % improvement
- Programme Assignment History:
  - All past programmes with dates and completion status

**Nutrition Tab Content:**
- Current Meal Plan Section:
  - Plan name, type (cutting/bulking/maintenance)
  - Training day macros: Cals/P/C/F
  - Non-training day macros: Cals/P/C/F
  - "Modify Meal Plan" button
- Daily Logs Table:
  - Columns: Date, Calories, Protein, Carbs, Fat, Adherence %
  - Colour-coded adherence (green >90%, yellow 70-90%, red <70%)
  - 7-day default view, expandable
- Macro Trend Charts:
  - Stacked area chart: protein/carbs/fat over time
  - Target lines for comparison
  - 7-day/30-day toggle
- Meal Plan Assignment History

**Check-Ins Tab Content:**
- Check-In Timeline (newest first):
  - Each card shows: Date, Weight (with Δ), Steps (vs target), Sleep, Supplement %, Review status
  - Click to expand
- Expanded Check-In:
  - All metrics in detail
  - Daily steps bar chart
  - Coach feedback field (editable if pending)
  - Star rating selector (1-5)
  - "Mark as Reviewed" button
- Filters: Date range, Review status
- Export to PDF button

**Health Tab Content:**
- Blood Work Tests Table:
  - Columns: Date, Lab Provider, Tags, Actions
  - Click to view details
- Blood Work Test Modal:
  - All markers in table format
  - Colour-coded: low (yellow), normal (green), high (red)
  - Marker trend charts (select marker to see history)
  - Ability to tag tests
- Sleep Quality Trends (30-day line chart)
- HRV Trends (if available)
- Strain/Recovery Trends
- Hydration Trends

**Messages Tab Content:**
- Real-time chat interface
- Messages grouped by date
- Coach messages on right, client on left
- Read receipts
- Text input with send button
- Auto-scroll to latest
- Supabase Realtime subscription

**Settings Tab Content:**
- Client Goals & Preferences (read-only):
  - TDEE, goal type, target macros
- Subscription Details:
  - Status, start date, next billing (if applicable)
- Relationship Management:
  - Pause relationship button (with reason textarea)
  - End relationship button (with confirmation)
- Danger Zone:
  - Remove client button (red, with confirmation modal)

---

### 1.3 Check-In Review System

**Priority:** Critical
**Complexity:** Medium
**Dependencies:** 1.2 (Client Management)

**Route:** `app/(dashboard)/check-ins/page.tsx`

**Files to Create:**
```
app/(dashboard)/check-ins/page.tsx                [MODIFY]
app/(dashboard)/check-ins/[checkInId]/page.tsx    [NEW]

components/check-ins/check-ins-list.tsx           [NEW]
components/check-ins/check-in-timeline.tsx        [NEW]
components/check-ins/check-in-card.tsx            [NEW]
components/check-ins/check-in-detail-modal.tsx    [NEW]
components/check-ins/steps-breakdown-chart.tsx    [NEW]
components/check-ins/coach-feedback-editor.tsx    [NEW]
components/check-ins/rating-selector.tsx          [NEW]
components/check-ins/check-in-filters.tsx         [NEW]

hooks/use-check-ins.ts                            [NEW]
hooks/use-check-in.ts                             [NEW]
hooks/use-review-check-in.ts                      [NEW]
```

**Check-Ins List Page:**
- All check-ins across all clients
- Table columns: Client Name, Submitted, Weight Change, Steps, Sleep, Compliance, Status, Actions
- Filters: Status (Pending/Reviewed/All), Date range, Client dropdown
- Sort by submission date (newest first default)
- Click row to view full detail
- Bulk actions: Mark selected as reviewed
- Real-time updates when new check-ins arrive

**Check-In Detail Page:**
- Standalone page for individual check-in
- Same content as expanded check-in in client detail
- Full editing capabilities for coach feedback
- Navigation to client profile
- Previous/Next check-in navigation

---

### 1.4 Real-Time Messaging System

**Priority:** High
**Complexity:** Medium
**Dependencies:** 1.2 (Client Management)

**Files to Create:**
```
components/messages/message-thread.tsx            [NEW]
components/messages/message-bubble.tsx            [NEW]
components/messages/message-input.tsx             [NEW]
components/messages/typing-indicator.tsx          [NEW]

hooks/use-messages.ts                             [NEW]
hooks/use-send-message.ts                         [NEW]
hooks/use-mark-message-read.ts                    [NEW]
hooks/use-message-subscription.ts                 [NEW]

lib/supabase/realtime.ts                          [NEW]
```

**Message Thread Component:**
- Virtualised list for performance with many messages
- Date separators between message groups
- Auto-scroll to bottom on new messages
- Scroll-to-bottom button when scrolled up
- Loading state for initial fetch
- Empty state for new conversations

**Message Bubble Component:**
- Coach messages: right-aligned, primary colour
- Client messages: left-aligned, secondary colour
- Timestamp below message (relative)
- Read receipt indicator (✓ or ✓✓)
- Long messages truncate with "Show more"

**Message Input Component:**
- Multi-line text input (auto-resize)
- Send button (primary, icon or text)
- Keyboard shortcut: Cmd/Ctrl + Enter to send
- Character limit indicator (if applicable)
- Disabled state while sending

**Real-Time Implementation:**
- Supabase Realtime subscription to `coach_client_messages`
- Optimistic updates for sent messages
- Error handling with retry
- Reconnection handling
- Presence indicators (optional)

---

## Phase 2: Templates & Assignments

### 2.1 Programme Template System

**Priority:** Critical
**Complexity:** Very High
**Dependencies:** Phase 1 complete

#### 2.1.1 Programme Templates List

**Route:** `app/(dashboard)/programmes/page.tsx`

**Files to Create:**
```
app/(dashboard)/programmes/page.tsx               [MODIFY]
app/(dashboard)/programmes/new/page.tsx           [NEW]
app/(dashboard)/programmes/[templateId]/page.tsx  [NEW]
app/(dashboard)/programmes/[templateId]/edit/page.tsx [NEW]
app/(dashboard)/programmes/assign/page.tsx        [NEW]

components/programmes/programme-templates-grid.tsx    [NEW]
components/programmes/programme-template-card.tsx     [NEW]
components/programmes/programme-filters.tsx           [NEW]
components/programmes/programme-form.tsx              [NEW]
components/programmes/template-metadata-form.tsx      [NEW]
components/programmes/week-builder.tsx                [NEW]
components/programmes/training-day-card.tsx           [NEW]
components/programmes/exercise-builder.tsx            [NEW]
components/programmes/exercise-selector-modal.tsx     [NEW]
components/programmes/exercise-card.tsx               [NEW]
components/programmes/programme-preview.tsx           [NEW]
components/programmes/programme-detail-view.tsx       [NEW]
components/programmes/assignment-history-table.tsx    [NEW]
components/programmes/assign-programme-form.tsx       [NEW]
components/programmes/client-selector.tsx             [NEW]
components/programmes/template-selector-with-preview.tsx [NEW]
components/programmes/programme-modification-editor.tsx  [NEW]

hooks/use-programme-templates.ts                      [NEW]
hooks/use-programme-template.ts                       [NEW]
hooks/use-create-programme-template.ts                [NEW]
hooks/use-update-programme-template.ts                [NEW]
hooks/use-delete-programme-template.ts                [NEW]
hooks/use-assign-programme.ts                         [NEW]
hooks/use-programme-assignments.ts                    [NEW]

lib/exercises/musclewiki-client.ts                    [NEW]
lib/exercises/exercises-data.json                     [NEW]
lib/exercises/search-exercises.ts                     [NEW]
```

**Templates List Page:**
- Grid layout (responsive: 1-3 columns)
- Each card shows: Name, Description preview, Duration, Type badge, Difficulty badge, Times Assigned
- Filters: Type (strength/hypertrophy/powerlifting/etc.), Duration, Difficulty
- Search by name
- "Create Programme" primary button
- Card actions: View, Edit, Duplicate, Delete, Assign

**Template Card Design (Apple++ Quality):**
- Elevated card with subtle shadow
- Type indicator stripe/badge
- Hover state with slight lift
- Quick action buttons on hover
- Difficulty shown as 1-3 filled circles or similar

#### 2.1.2 Create/Edit Programme Template

**Multi-Step Wizard:**

**Step 1: Metadata**
- Programme name (required)
- Description (optional, markdown support)
- Duration in weeks (1-52)
- Programme type (select dropdown)
- Difficulty level (beginner/intermediate/advanced)
- Progress indicator showing step 1 of 4

**Step 2: Week Builder**
- Visual week grid
- Set training days per week (1-7)
- For each week:
  - Add training days
  - Name each day (e.g., "Push A", "Pull B")
  - Day type selector (Push/Pull/Legs/Upper/Lower/Full Body/Rest)
- Copy week functionality (copy week 1 to weeks 2-4, etc.)
- Drag-and-drop reordering of days

**Step 3: Exercise Builder**
- Select a training day to edit
- Add exercises from MuscleWiki library:
  - Modal with search
  - Filter by muscle group, equipment, difficulty
  - Exercise preview with instructions/video
- For each exercise:
  - Sets (number input, 1-10)
  - Reps (text, supports ranges like "8-10")
  - RPE target (1-10 scale)
  - Rest seconds (15-300)
  - Notes (tempo, technique cues)
- Drag-and-drop reordering
- Superset grouping (drag exercises together)
- Delete exercise button

**Step 4: Review & Save**
- Full programme preview in readable format
- Week-by-week, day-by-day, exercise-by-exercise
- Save as Draft / Publish buttons
- On save: redirect to template detail view

#### 2.1.3 MuscleWiki Exercise Integration

**Data Source Strategy:**
- Create local JSON file with 921 exercises
- Fields: id, name, muscle_group, secondary_muscles, difficulty, equipment, instructions, video_url, image_url
- Search function with fuzzy matching
- Filter by: muscle group, equipment, difficulty

**Exercise Categories:**
- Muscle Groups: Chest, Back, Shoulders, Biceps, Triceps, Forearms, Abs, Obliques, Quads, Hamstrings, Glutes, Calves, Traps, Lower Back
- Equipment: Barbell, Dumbbell, Cable, Machine, Bodyweight, Kettlebell, Resistance Band, Other
- Difficulty: Beginner, Intermediate, Advanced

#### 2.1.4 Assign Programme to Client

**Multi-Step Flow:**

**Step 1: Select Client**
- Searchable dropdown of all active clients
- Show client name, email, current programme (if any)
- Warning if client already has active programme

**Step 2: Select Template**
- Searchable dropdown of published templates
- Preview panel shows template details on selection
- Option to create new template inline

**Step 3: Set Start Date**
- Date picker (default: next Monday)
- End date auto-calculated from duration
- Conflict check with existing programme

**Step 4: Customisation (Optional)**
- Toggle: "Customise for this client"
- If yes: opens full exercise builder with template pre-loaded
- Make client-specific modifications
- Changes saved only for this assignment, not template

**Step 5: Review & Assign**
- Full preview of assignment
- Client name, programme name, dates
- Assign button
- On assign: create entry in `programme_assignments` with snapshot
- Redirect to client detail > training tab

---

### 2.2 Meal Plan Template System

**Priority:** Critical
**Complexity:** Very High
**Dependencies:** Phase 1 complete

#### 2.2.1 Meal Plan Templates List

**Route:** `app/(dashboard)/meal-plans/page.tsx`

**Files to Create:**
```
app/(dashboard)/meal-plans/page.tsx               [MODIFY]
app/(dashboard)/meal-plans/new/page.tsx           [NEW]
app/(dashboard)/meal-plans/[templateId]/page.tsx  [NEW]
app/(dashboard)/meal-plans/[templateId]/edit/page.tsx [NEW]
app/(dashboard)/meal-plans/assign/page.tsx        [NEW]

components/meal-plans/meal-plan-templates-grid.tsx    [NEW]
components/meal-plans/meal-plan-template-card.tsx     [NEW]
components/meal-plans/meal-plan-form.tsx              [NEW]
components/meal-plans/template-metadata-form.tsx      [NEW]
components/meal-plans/macro-targets-form.tsx          [NEW]
components/meal-plans/meal-builder.tsx                [NEW]
components/meal-plans/food-selector-modal.tsx         [NEW]
components/meal-plans/meal-card.tsx                   [NEW]
components/meal-plans/food-item-row.tsx               [NEW]
components/meal-plans/macro-summary.tsx               [NEW]
components/meal-plans/meal-plan-preview.tsx           [NEW]
components/meal-plans/meal-plan-detail-view.tsx       [NEW]
components/meal-plans/assign-meal-plan-form.tsx       [NEW]
components/meal-plans/current-meal-plan-display.tsx   [NEW]
components/meal-plans/daily-logs-table.tsx            [NEW]
components/meal-plans/macro-trends-chart.tsx          [NEW]

hooks/use-meal-plan-templates.ts                      [NEW]
hooks/use-meal-plan-template.ts                       [NEW]
hooks/use-create-meal-plan-template.ts                [NEW]
hooks/use-update-meal-plan-template.ts                [NEW]
hooks/use-delete-meal-plan-template.ts                [NEW]
hooks/use-assign-meal-plan.ts                         [NEW]
hooks/use-meal-plan-assignments.ts                    [NEW]

lib/foods/food-database.json                          [NEW]
lib/foods/search-foods.ts                             [NEW]
```

**Templates List Page:**
- Similar layout to programmes
- Card shows: Name, Description, Type, Training Day Cals, Non-Training Day Cals, Times Assigned
- Filters: Type (cutting/bulking/maintenance/contest prep), Calorie range
- Actions: View, Edit, Duplicate, Delete, Assign

#### 2.2.2 Create/Edit Meal Plan Template

**Multi-Step Wizard:**

**Step 1: Metadata**
- Plan name (required)
- Description (optional)
- Plan type (cutting/bulking/maintenance/contest prep)

**Step 2: Macro Targets**
- Training Day section:
  - Calories (number)
  - Protein (grams)
  - Carbs (grams)
  - Fat (grams)
  - Auto-calculate calories from macros toggle
- Non-Training Day section (same fields)
- Visual macro ratio pie chart

**Step 3: Meal Builder (Training Day)**
- Add meals (Meal 1, Meal 2, etc.)
- For each meal:
  - Name (e.g., "Breakfast", "Pre-Workout")
  - Time (time picker)
  - Foods:
    - Search food database modal
    - Select food
    - Quantity input (number)
    - Unit selector (g, oz, serving, cup, etc.)
    - Auto-calculated macros displayed
    - Delete food button
  - Meal macro subtotal
- Drag-and-drop reorder meals
- Real-time total at bottom
- Visual indicator when within 5% of targets (green glow)
- Warning when over/under by >10%

**Step 4: Meal Builder (Non-Training Day)**
- Same interface as Step 3
- Option to "Copy from Training Day" and modify

**Step 5: Review & Save**
- Side-by-side preview: Training Day | Non-Training Day
- Macro comparison to targets
- Save as Draft / Publish

#### 2.2.3 Food Database

**Data Source:**
- Create local JSON with 500+ foods
- Categories: Proteins, Carbohydrates, Fats, Dairy, Vegetables, Fruits, Snacks, Beverages, Supplements
- Fields: id, name, serving_size, serving_unit, calories, protein, carbs, fat, fibre, category, is_vegetarian, is_vegan, is_gluten_free
- Include common bodybuilding foods (chicken breast, rice, oats, eggs, whey, etc.)

**Search Functionality:**
- Fuzzy search on name
- Filter by category
- Filter by dietary preference
- Recently used foods section
- Custom food creation (save to database)

---

## Phase 3: Analytics & Notifications

### 3.1 Analytics Dashboard

**Priority:** High
**Complexity:** Medium
**Dependencies:** Phases 1-2 complete

**Route:** `app/(dashboard)/analytics/page.tsx`

**Files to Create:**
```
app/(dashboard)/analytics/page.tsx                [NEW]

components/analytics/analytics-dashboard.tsx      [NEW]
components/analytics/metric-card.tsx              [NEW]
components/analytics/engagement-chart.tsx         [NEW]
components/analytics/at-risk-clients-table.tsx    [NEW]
components/analytics/weight-trends-chart.tsx      [NEW]
components/analytics/client-leaderboard.tsx       [NEW]
components/analytics/report-exporter.tsx          [NEW]
components/analytics/date-range-picker.tsx        [NEW]

hooks/use-coach-analytics.ts                      [NEW]
```

**Dashboard Sections:**

**Overview Metrics (Top Row):**
- Total Active Clients (number card with trend arrow)
- Total Sessions This Week (across all clients)
- Total Meals Logged This Week
- Avg Training Adherence % (with trend)
- Avg Nutrition Adherence % (with trend)
- Check-In Submission Rate %

**Engagement Section:**
- Client Login Frequency Chart (Recharts bar chart, 30 days)
- At-Risk Clients Table:
  - Clients inactive 7+ days
  - Columns: Name, Last Active, Days Inactive, Action (Send Message)
  - Sorted by days inactive (descending)
  - Quick message button per row

**Progress Section:**
- Aggregate Weight Change Chart:
  - Average weight change across all clients
  - Line chart with confidence band
  - Comparison to goal (cutting vs bulking)
- Client Success Stories:
  - Cards for clients who hit goals
  - Client name, goal achieved, date, before/after metrics

**Leaderboard Section:**
- Tabs: Adherence | PRs | Consistency
- Top 5 clients in each category
- Gamification elements (badges, ranks)

**Export Section:**
- Date range picker (preset: Last 7 days, Last 30 days, Last 90 days, Custom)
- Export button (PDF or CSV)
- Report includes all metrics and charts

---

### 3.2 Notifications System

**Priority:** High
**Complexity:** Medium
**Dependencies:** Phases 1-2 complete

**Route:** `app/(dashboard)/notifications/page.tsx`

**Files to Create:**
```
app/(dashboard)/notifications/page.tsx            [NEW]

components/notifications/notification-list.tsx    [NEW]
components/notifications/notification-item.tsx    [NEW]
components/notifications/notification-badge.tsx   [NEW]
components/notifications/notification-dropdown.tsx [NEW]
components/notifications/notification-filters.tsx [NEW]

hooks/use-notifications.ts                        [NEW]
hooks/use-mark-notification-read.ts               [NEW]
hooks/use-notification-subscription.ts            [NEW]

lib/notifications/notification-types.ts           [NEW]
```

**Notification Types:**
- New check-in submitted (📋)
- New message received (💬)
- Client accepted invitation (✅)
- Client login after 7+ days inactive (🔔)

**Notification Item Display:**
- Icon (based on type)
- Title (bold)
- Description (truncated)
- Timestamp (relative: "2 hours ago")
- Read/unread indicator (dot)
- Link to relevant page

**Notifications Page:**
- Full list of notifications
- Filter by type (multi-select)
- Mark as read/unread actions
- Mark all as read button
- Delete/archive notification
- Infinite scroll or pagination

**Notification Badge (Top Bar):**
- Bell icon in top bar
- Unread count badge (red, max "99+")
- Dropdown on click showing recent 5
- "View All" link to notifications page
- Real-time updates via Supabase Realtime

**Real-Time Subscriptions:**
- `coach_client_messages` (INSERT where sender ≠ coach)
- `check_ins` (INSERT/UPDATE where coach needs review)
- `coach_clients` (UPDATE where status → 'active')

---

## Phase 4: Settings & Exports

### 4.1 Settings Pages

**Priority:** Medium
**Complexity:** Medium
**Dependencies:** Core auth complete

#### 4.1.1 Profile Settings

**Route:** `app/(dashboard)/settings/profile/page.tsx`

**Files to Create:**
```
app/(dashboard)/settings/page.tsx                 [NEW] - redirects to profile
app/(dashboard)/settings/layout.tsx               [NEW] - settings layout with sidebar
app/(dashboard)/settings/profile/page.tsx         [NEW]
app/(dashboard)/settings/account/page.tsx         [NEW]
app/(dashboard)/settings/notifications/page.tsx   [NEW]

components/settings/settings-sidebar.tsx          [NEW]
components/settings/profile-settings-form.tsx     [NEW]
components/settings/logo-uploader.tsx             [NEW]
components/settings/colour-picker.tsx             [NEW]
components/settings/account-settings.tsx          [NEW]
components/settings/change-email-form.tsx         [NEW]
components/settings/change-password-form.tsx      [NEW]
components/settings/delete-account-modal.tsx      [NEW]
components/settings/notification-settings-form.tsx [NEW]

hooks/use-update-profile.ts                       [NEW]
hooks/use-upload-logo.ts                          [NEW]
hooks/use-update-notification-settings.ts         [NEW]
```

**Profile Settings:**
- Logo Upload:
  - Drag-and-drop or click to upload
  - Image preview (circular)
  - File size limit: 2MB
  - Accepted: PNG, JPG, SVG
  - Supabase Storage integration
  - Remove logo button
- Coach Bio (textarea, 500 char max, char counter)
- Credentials (textarea, 200 char max)
- Brand Colour Picker:
  - Visual colour picker component
  - Preset brand colours
  - Custom hex input
  - Live preview of UI with selected colour
- Website URL (input with validation)
- Instagram Handle (input with @ prefix)
- Save button (with loading state)
- Success toast on save

**Account Settings:**
- Current email (read-only display)
- Change Email:
  - New email input
  - Send confirmation button
  - Instructions about confirmation email
- Change Password:
  - Current password input
  - New password input
  - Confirm new password input
  - Password strength indicator (weak/medium/strong)
  - Requirements checklist (8+ chars, uppercase, number, symbol)
- Two-Factor Authentication (placeholder for now):
  - Enable 2FA toggle (disabled, "Coming Soon")
- Danger Zone:
  - Red-bordered section
  - "Delete Account" button
  - Confirmation modal requiring password
  - Warning text about irreversible action

**Notification Settings:**
- Email Notification Toggles:
  - New check-in submitted
  - New message received
  - Client accepted invitation
  - Client inactive 7+ days
  - Weekly summary digest
- Notification Frequency (radio buttons):
  - Instant (as they happen)
  - Daily digest (once per day at 9am)
  - Weekly digest (every Monday at 9am)
- In-App Notification Toggles:
  - Sound on new notification
  - Desktop notifications (request permission)
- Save button

---

### 4.2 PDF Export System

**Priority:** Medium
**Complexity:** Medium
**Dependencies:** All data views complete

**Files to Create:**
```
components/exports/check-in-pdf-generator.tsx     [NEW]
components/exports/client-report-pdf-generator.tsx [NEW]
components/exports/analytics-pdf-generator.tsx    [NEW]
components/exports/pdf-header.tsx                 [NEW]
components/exports/pdf-footer.tsx                 [NEW]

lib/exports/pdf-utils.ts                          [NEW]
lib/exports/chart-to-image.ts                     [NEW]
```

**Library Choice:** `@react-pdf/renderer` for React-native PDF generation

**Check-In PDF Export:**
- Triggered from check-in detail view
- Includes:
  - Header with Synced Momentum branding (coach logo if uploaded)
  - Client name, check-in date
  - Weight with week-over-week change
  - Steps table with daily breakdown
  - Sleep hours and quality
  - Supplement compliance
  - Coach feedback and rating
  - Footer with generation date
- Professional, clean layout
- Brand colour accents

**Client Report PDF Export:**
- Triggered from client detail > overview tab
- Date range selector before generation
- Includes:
  - Client info summary
  - Current programme overview
  - Current meal plan overview
  - Check-in summaries (4-8 weeks)
  - Weight trend chart (rendered as image)
  - Adherence trends chart (rendered as image)
  - PR timeline
  - Coach notes section
- Multi-page support
- Table of contents for long reports

**Analytics Report PDF Export:**
- Triggered from analytics dashboard
- Date range selector
- Includes:
  - All metric cards
  - Charts (rendered as images)
  - At-risk clients table
  - Leaderboards
- Summary statistics
- Professional formatting

---

## Phase 5: Polish & Deploy

### 5.1 Loading States

**Files to Create:**
```
components/ui/skeleton.tsx                        [NEW if not exists]
components/ui/table-skeleton.tsx                  [NEW]
components/ui/card-skeleton.tsx                   [NEW]
components/ui/chart-skeleton.tsx                  [NEW]
components/ui/form-skeleton.tsx                   [NEW]
```

**Implementation:**
- Every async data fetch has a skeleton
- Skeletons match exact layout of loaded content
- Subtle pulse animation
- Content-aware (tables show table skeleton, cards show card skeleton)

### 5.2 Empty States

**Files to Create:**
```
components/ui/empty-state.tsx                     [NEW]
```

**Empty State Designs:**
- No Clients Yet:
  - Illustration or icon
  - "You haven't added any clients yet"
  - "Invite your first client" button
- No Check-Ins:
  - "No check-ins to review"
  - "Check-ins will appear here when clients submit them"
- No Programmes:
  - "No programme templates yet"
  - "Create your first programme" button
- No Meal Plans:
  - "No meal plan templates yet"
  - "Create your first meal plan" button
- No Messages:
  - "Start the conversation"
  - Input field visible

### 5.3 Error States

**Files to Create:**
```
components/ui/error-state.tsx                     [NEW]
components/ui/error-boundary.tsx                  [NEW/ENHANCE]
```

**Error State Design:**
- Icon (warning/error indicator)
- "Something went wrong" title
- Error message (user-friendly)
- Retry button (where applicable)
- Report issue link (optional)

**Error Boundary:**
- Wrap major page sections
- Graceful degradation (error doesn't crash whole app)
- Error logging (console or Sentry)

### 5.4 Toast Notifications

**Setup:**
- Install `sonner` (shadcn-compatible)
- Add Toaster to root layout
- Create toast utility functions

**Files to Create:**
```
components/ui/sonner.tsx                          [NEW]
lib/toast.ts                                      [NEW]
```

**Toast Usage:**
- Success: "Client invited successfully", "Programme created", etc.
- Error: "Failed to save", "Network error", etc.
- Info: "Check-in submitted by [client]", etc.
- Warning: "This action cannot be undone"

### 5.5 Confirmation Modals

**Files to Create:**
```
components/ui/confirmation-dialog.tsx             [NEW]
```

**Reusable Confirmation Dialog:**
- Title
- Description (supports markdown)
- Confirm button (customisable text/colour)
- Cancel button
- Destructive variant (red confirm button)
- Loading state for async confirmations

**Used For:**
- Delete programme template
- Delete meal plan template
- End client relationship
- Remove client
- Delete account

### 5.6 Real-Time Verification

**Verify All Real-Time Features:**
- Messages arrive instantly
- New check-ins appear in list
- Notification badge updates
- Multiple browser tabs stay in sync

### 5.7 Performance Optimisation

**Checks:**
- Lighthouse score > 90 on key pages
- Images optimised (Next.js Image component)
- Lazy load heavy components (charts, modals)
- React Query caching configured properly
- No unnecessary re-renders (React DevTools)
- Bundle analysis and code splitting

### 5.8 Accessibility Audit

**Checks:**
- Keyboard navigation throughout
- Focus indicators visible
- ARIA labels on interactive elements
- Colour contrast meets WCAG AA
- Screen reader tested
- Form error announcements

### 5.9 Final Testing

**Functionality Checklist:**
- [ ] Apple Sign In works end-to-end
- [ ] Can invite clients
- [ ] Can view client list with filters
- [ ] Can view client detail with all 7 tabs
- [ ] Can review check-ins and add feedback
- [ ] Can create programme templates
- [ ] Can assign programmes to clients
- [ ] Can create meal plan templates
- [ ] Can assign meal plans to clients
- [ ] Can send/receive messages in real-time
- [ ] Analytics dashboard shows metrics
- [ ] Notifications work and update in real-time
- [ ] Settings can be updated
- [ ] PDF exports generate correctly
- [ ] All forms validate correctly
- [ ] All error states display correctly
- [ ] All empty states display correctly
- [ ] Responsive on mobile, tablet, desktop

**Data Integrity Checklist:**
- [ ] RLS policies prevent unauthorised access
- [ ] All mutations update database correctly
- [ ] Real-time subscriptions work
- [ ] No N+1 query issues

**Code Quality Checklist:**
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with no errors
- [ ] Prettier formatting consistent
- [ ] British English throughout
- [ ] No console errors or warnings

### 5.10 Deployment

**Vercel Configuration:**
- Connect repository
- Configure environment variables
- Enable preview deployments
- Production deployment from `main` branch

**Environment Variables for Production:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Additional API keys as needed

**Post-Deployment Verification:**
- All pages load correctly
- Authentication works
- Real-time features work
- No CORS issues
- Performance is acceptable

---

## File Inventory

### New Files to Create (Estimated: 150+ files)

**App Routes (25 files):**
```
app/auth/callback/route.ts
app/(dashboard)/clients/[clientId]/layout.tsx
app/(dashboard)/clients/[clientId]/page.tsx
app/(dashboard)/clients/[clientId]/overview/page.tsx
app/(dashboard)/clients/[clientId]/training/page.tsx
app/(dashboard)/clients/[clientId]/nutrition/page.tsx
app/(dashboard)/clients/[clientId]/check-ins/page.tsx
app/(dashboard)/clients/[clientId]/health/page.tsx
app/(dashboard)/clients/[clientId]/messages/page.tsx
app/(dashboard)/clients/[clientId]/settings/page.tsx
app/(dashboard)/clients/invite/page.tsx
app/(dashboard)/check-ins/[checkInId]/page.tsx
app/(dashboard)/programmes/new/page.tsx
app/(dashboard)/programmes/[templateId]/page.tsx
app/(dashboard)/programmes/[templateId]/edit/page.tsx
app/(dashboard)/programmes/assign/page.tsx
app/(dashboard)/meal-plans/new/page.tsx
app/(dashboard)/meal-plans/[templateId]/page.tsx
app/(dashboard)/meal-plans/[templateId]/edit/page.tsx
app/(dashboard)/meal-plans/assign/page.tsx
app/(dashboard)/analytics/page.tsx
app/(dashboard)/notifications/page.tsx
app/(dashboard)/settings/layout.tsx
app/(dashboard)/settings/profile/page.tsx
app/(dashboard)/settings/account/page.tsx
app/(dashboard)/settings/notifications/page.tsx
```

**Components (80+ files):**
```
components/auth/apple-sign-in-button.tsx
components/clients/clients-table.tsx (enhance)
components/clients/client-row-actions.tsx
components/clients/client-filters.tsx
components/clients/invite-client-dialog.tsx
components/clients/client-header.tsx
components/clients/client-tabs.tsx
components/clients/client-overview.tsx
components/clients/client-info-card.tsx
components/clients/current-programme-card.tsx
components/clients/current-meal-plan-card.tsx
components/clients/adherence-chart.tsx
components/clients/weight-chart.tsx
components/clients/quick-actions.tsx
components/clients/client-settings.tsx
components/clients/subscription-details.tsx
components/clients/relationship-management.tsx
components/check-ins/check-ins-list.tsx
components/check-ins/check-in-timeline.tsx
components/check-ins/check-in-card.tsx
components/check-ins/check-in-detail-modal.tsx
components/check-ins/steps-breakdown-chart.tsx
components/check-ins/coach-feedback-editor.tsx
components/check-ins/rating-selector.tsx
components/check-ins/check-in-filters.tsx
components/training/current-programme-display.tsx
components/training/session-history-table.tsx
components/training/session-detail-modal.tsx
components/training/personal-records-list.tsx
components/nutrition/current-meal-plan-display.tsx
components/nutrition/daily-logs-table.tsx
components/nutrition/macro-trends-chart.tsx
components/health/blood-work-tests-table.tsx
components/health/blood-work-test-modal.tsx
components/health/marker-trend-chart.tsx
components/health/sleep-trends-chart.tsx
components/health/hrv-trends-chart.tsx
components/health/strain-recovery-chart.tsx
components/messages/message-thread.tsx
components/messages/message-bubble.tsx
components/messages/message-input.tsx
components/messages/typing-indicator.tsx
components/programmes/programme-templates-grid.tsx
components/programmes/programme-template-card.tsx
components/programmes/programme-filters.tsx
components/programmes/programme-form.tsx
components/programmes/template-metadata-form.tsx
components/programmes/week-builder.tsx
components/programmes/training-day-card.tsx
components/programmes/exercise-builder.tsx
components/programmes/exercise-selector-modal.tsx
components/programmes/exercise-card.tsx
components/programmes/programme-preview.tsx
components/programmes/programme-detail-view.tsx
components/programmes/assignment-history-table.tsx
components/programmes/assign-programme-form.tsx
components/programmes/client-selector.tsx
components/programmes/template-selector-with-preview.tsx
components/programmes/programme-modification-editor.tsx
components/meal-plans/meal-plan-templates-grid.tsx
components/meal-plans/meal-plan-template-card.tsx
components/meal-plans/meal-plan-form.tsx
components/meal-plans/template-metadata-form.tsx
components/meal-plans/macro-targets-form.tsx
components/meal-plans/meal-builder.tsx
components/meal-plans/food-selector-modal.tsx
components/meal-plans/meal-card.tsx
components/meal-plans/food-item-row.tsx
components/meal-plans/macro-summary.tsx
components/meal-plans/meal-plan-preview.tsx
components/meal-plans/meal-plan-detail-view.tsx
components/meal-plans/assign-meal-plan-form.tsx
components/meal-plans/current-meal-plan-display.tsx
components/meal-plans/daily-logs-table.tsx
components/meal-plans/macro-trends-chart.tsx
components/analytics/analytics-dashboard.tsx
components/analytics/metric-card.tsx
components/analytics/engagement-chart.tsx
components/analytics/at-risk-clients-table.tsx
components/analytics/weight-trends-chart.tsx
components/analytics/client-leaderboard.tsx
components/analytics/report-exporter.tsx
components/analytics/date-range-picker.tsx
components/notifications/notification-list.tsx
components/notifications/notification-item.tsx
components/notifications/notification-badge.tsx
components/notifications/notification-dropdown.tsx
components/notifications/notification-filters.tsx
components/settings/settings-sidebar.tsx
components/settings/profile-settings-form.tsx
components/settings/logo-uploader.tsx
components/settings/colour-picker.tsx
components/settings/account-settings.tsx
components/settings/change-email-form.tsx
components/settings/change-password-form.tsx
components/settings/delete-account-modal.tsx
components/settings/notification-settings-form.tsx
components/exports/check-in-pdf-generator.tsx
components/exports/client-report-pdf-generator.tsx
components/exports/analytics-pdf-generator.tsx
components/exports/pdf-header.tsx
components/exports/pdf-footer.tsx
components/ui/table-skeleton.tsx
components/ui/card-skeleton.tsx
components/ui/chart-skeleton.tsx
components/ui/form-skeleton.tsx
components/ui/empty-state.tsx
components/ui/error-state.tsx
components/ui/confirmation-dialog.tsx
components/ui/sonner.tsx
```

**Hooks (35+ files):**
```
hooks/use-clients.ts
hooks/use-client.ts
hooks/use-client-stats.ts
hooks/use-invite-client.ts
hooks/use-update-client-relationship.ts
hooks/use-check-ins.ts
hooks/use-check-in.ts
hooks/use-review-check-in.ts
hooks/use-messages.ts
hooks/use-send-message.ts
hooks/use-mark-message-read.ts
hooks/use-message-subscription.ts
hooks/use-programme-templates.ts
hooks/use-programme-template.ts
hooks/use-create-programme-template.ts
hooks/use-update-programme-template.ts
hooks/use-delete-programme-template.ts
hooks/use-assign-programme.ts
hooks/use-programme-assignments.ts
hooks/use-meal-plan-templates.ts
hooks/use-meal-plan-template.ts
hooks/use-create-meal-plan-template.ts
hooks/use-update-meal-plan-template.ts
hooks/use-delete-meal-plan-template.ts
hooks/use-assign-meal-plan.ts
hooks/use-meal-plan-assignments.ts
hooks/use-coach-analytics.ts
hooks/use-notifications.ts
hooks/use-mark-notification-read.ts
hooks/use-notification-subscription.ts
hooks/use-update-profile.ts
hooks/use-upload-logo.ts
hooks/use-update-notification-settings.ts
```

**Library Files (15+ files):**
```
lib/supabase/realtime.ts
lib/exercises/musclewiki-client.ts
lib/exercises/exercises-data.json
lib/exercises/search-exercises.ts
lib/foods/food-database.json
lib/foods/search-foods.ts
lib/notifications/notification-types.ts
lib/exports/pdf-utils.ts
lib/exports/chart-to-image.ts
lib/toast.ts
```

---

## Dependencies to Install

```bash
# Charts
npm install recharts

# Tables
npm install @tanstack/react-table

# PDF Generation
npm install @react-pdf/renderer

# Toast Notifications
npm install sonner

# Date Picker (if needed beyond what shadcn provides)
npm install date-fns

# Colour Picker
npm install react-colorful

# File Upload
npm install react-dropzone

# Already installed (verify):
# @supabase/supabase-js, @supabase/ssr
# @tanstack/react-query
# react-hook-form, zod, @hookform/resolvers
# lucide-react
# tailwindcss, tailwindcss-animate
# clsx, tailwind-merge
```

---

## Quality Standards Reminder

### Apple++ Design Principles

1. **Precision:** Every pixel matters. Spacing is consistent. Alignment is perfect.

2. **Clarity:** UI is immediately understandable. No confusion about what to do.

3. **Delight:** Subtle animations make interactions feel alive. Hover states, transitions, micro-interactions.

4. **Performance:** Instant feedback. Optimistic updates. No janky scrolling.

5. **Typography:** Perfect hierarchy. Readable at all sizes. Proper line heights.

6. **Colour:** Purposeful use. Accessible contrast. Brand consistency.

7. **Polish:** No rough edges. Every state considered. Error messages are helpful.

### British English

- colour, not color
- organise, not organize
- realise, not realize
- analyse, not analyze
- programme (training programme), not program
- behaviour, not behavior
- favourite, not favorite
- centre, not center

---

## Commit Strategy

### Phase Commits:

**After Phase 1:**
```
feat: Complete core features

- Apple Sign In integration
- Client management (list, invite, detail with 7 tabs)
- Check-in review system
- Real-time messaging
```

**After Phase 2:**
```
feat: Complete template systems

- Programme templates with MuscleWiki integration
- Programme assignment flow
- Meal plan templates with food database
- Meal plan assignment flow
```

**After Phase 3:**
```
feat: Complete analytics and notifications

- Analytics dashboard with charts and metrics
- Real-time notifications system
- Notification preferences
```

**After Phase 4:**
```
feat: Complete settings and exports

- Profile settings with logo upload
- Account settings with password change
- Notification settings
- PDF exports for check-ins, reports, analytics
```

**After Phase 5:**
```
feat: Complete coach platform implementation

- Full polish pass (loading, empty, error states)
- Toast notifications throughout
- Confirmation modals for destructive actions
- Performance optimisations
- Accessibility improvements
- Production deployment
```

---

## Final Checklist Before Marking Complete

- [ ] All features from brief implemented and working
- [ ] Apple Sign In working end-to-end
- [ ] Can manage clients (invite, view, edit, remove)
- [ ] Can review check-ins with feedback and ratings
- [ ] Can create and assign programmes
- [ ] Can create and assign meal plans
- [ ] Messaging works with real-time updates
- [ ] Analytics dashboard shows accurate metrics
- [ ] Notifications work with real-time updates
- [ ] All settings pages functional
- [ ] PDF exports generate correctly
- [ ] All loading states implemented
- [ ] All empty states implemented
- [ ] All error states implemented
- [ ] Toast notifications throughout
- [ ] Confirmation modals for destructive actions
- [ ] Responsive on all devices
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no errors
- [ ] British English throughout
- [ ] Apple++ quality achieved
- [ ] Deployed to Vercel
- [ ] Production tested

---

**This plan represents a complete implementation of the Synced Momentum coach platform. Every feature has been detailed, every component specified, and every quality standard defined. Nothing but perfection.**

**Ready to build something extraordinary, Andy.**
