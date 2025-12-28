# Brief for Claude Code: Athlete Web Interface & Super Admin Platform

**Date:** 2025-12-27  
**Project:** Synced Momentum - Athlete Web Interface + Super Admin  
**Branch:** Create `feat/athlete-and-admin-interfaces`  
**Quality Standard:** Apple++ (premium design excellence, no compromises)

---

## Overview

Build **TWO** complete web interfaces:

1. **Athlete Interface** - For athletes to view detailed analytics, blood work trends, submit check-ins, and manage their training/nutrition on larger screens
2. **Super Admin Interface** - Platform management for monitoring coaches, athletes, subscriptions, and overall platform health

Both interfaces must be production-ready, fully functional, and match the premium quality of the coach interface.

---

## Part 1: Athlete Web Interface

### Purpose

Athletes primarily use the iOS app for daily logging (workouts, meals, check-ins), but need web access for:
- **Blood work analysis** - Detailed charts, trends, marker comparisons (CRITICAL FEATURE)
- **Detailed reporting** - Bigger screens for better data visualization
- **Programme review** - See entire training programmes on one screen
- **Progress tracking** - Comprehensive charts and trends
- **Check-in submission** - If they prefer web over mobile

### User Flow

**Login → Athlete Dashboard → Access to:**
- Today (overview)
- Training (programmes, history, PRs)
- Nutrition (meal plans, logging, macros)
- Blood Work (upload, analyze, trends) ← **PRIMARY WEB USE CASE**
- Check-Ins (submit, view history)
- Progress (weight, measurements, charts)
- Recovery (sleep, HRV, strain)
- Messages (chat with coach)
- Settings (profile, goals, preferences)

---

## Athlete Route Structure

```
app/(athlete)/
├── layout.tsx                    # Athlete layout with sidebar
├── dashboard/                    # Today tab (default landing)
│   └── page.tsx
├── training/
│   ├── page.tsx                  # Current programme + session history
│   ├── programmes/
│   │   └── [programmeId]/
│   │       └── page.tsx          # Programme detail view
│   └── exercises/
│       └── page.tsx              # Exercise library (MuscleWiki)
├── nutrition/
│   ├── page.tsx                  # Current meal plan + daily logging
│   ├── meal-plans/
│   │   └── [mealPlanId]/
│   │       └── page.tsx          # Meal plan detail view
│   └── log/
│       └── page.tsx              # Food logging (if web logging enabled)
├── blood-work/
│   ├── page.tsx                  # All tests list + upload
│   ├── upload/
│   │   └── page.tsx              # Upload new test (PDF)
│   ├── [testId]/
│   │   └── page.tsx              # Test detail with all markers
│   └── trends/
│       └── page.tsx              # Marker trends comparison
├── check-ins/
│   ├── page.tsx                  # Check-in history
│   ├── submit/
│   │   └── page.tsx              # Submit new check-in
│   └── [checkInId]/
│       └── page.tsx              # Check-in detail view
├── progress/
│   └── page.tsx                  # Weight, measurements, charts
├── recovery/
│   └── page.tsx                  # Sleep, HRV, strain, readiness
├── messages/
│   └── page.tsx                  # Chat with coach
└── settings/
    ├── page.tsx                  # Profile settings
    ├── goals/
    │   └── page.tsx              # TDEE, goals, targets
    └── notifications/
        └── page.tsx              # Notification preferences
```

---

## Athlete Pages - Detailed Specifications

### Dashboard (Today Tab)

**Route:** `app/(athlete)/dashboard/page.tsx`

**Layout:**
- Hero section with greeting: "Good morning, [Name]"
- Current date, day of week
- Readiness score (large, prominent)

**Sections:**

#### 1. Readiness Score Card
- **Large circular gauge** (0-100 scale)
- Colour-coded: 
  - 0-40: Red (Poor recovery)
  - 41-70: Yellow (Moderate recovery)
  - 71-100: Green (Fully recovered)
- Calculation: Weighted average of:
  - Sleep quality (30%)
  - HRV (30%)
  - Strain (20%)
  - Compliance (20%)
- Breakdown below gauge showing each factor

#### 2. Weather Widget
- Current weather at athlete's location
- Temperature, conditions, icon
- Training recommendation based on weather
- Optional: "Good day for outdoor cardio" or "Consider indoor training"

#### 3. Today's Schedule
- Upcoming training session (if scheduled)
  - Session type (Push, Pull, Legs, etc.)
  - Start time
  - Duration estimate
  - Quick action: "Start Workout" (links to iOS app or shows programme)
- Upcoming meals (from meal plan)
  - Next 2-3 meals with times
  - Macro breakdown

#### 4. Quick Stats (4 cards in grid)
- **This Week's Training**
  - Sessions completed / Sessions planned
  - Total volume (sets × reps × weight)
- **This Week's Nutrition**
  - Avg calories vs target
  - Protein adherence %
- **This Week's Sleep**
  - Avg hours per night
  - Avg quality score
- **Next Check-In**
  - Days until next check-in
  - Status: Ready / Pending / Overdue

#### 5. Recent Activity Feed
- Last 5 activities (workouts, meals logged, check-ins submitted)
- Timestamp (relative: "2 hours ago")
- Icons for each activity type

#### 6. Coach Message Preview
- If unread messages from coach, show preview
- Link to messages page

**Components:**
- `components/athlete/dashboard/readiness-gauge.tsx`
- `components/athlete/dashboard/weather-widget.tsx`
- `components/athlete/dashboard/todays-schedule.tsx`
- `components/athlete/dashboard/quick-stat-card.tsx`
- `components/athlete/dashboard/activity-feed.tsx`

---

### Training Page

**Route:** `app/(athlete)/training/page.tsx`

**Sections:**

#### 1. Current Programme Card
- Programme name (e.g., "8-Week Hypertrophy Block")
- Coach name (assigned by)
- Start date, end date
- Current week: "Week 3 of 8"
- Progress bar (percentage complete)
- Button: "View Full Programme"

#### 2. This Week's Sessions
- Grid of training days for current week
- Each day card shows:
  - Day name (e.g., "Monday - Push A")
  - Exercises count (e.g., "7 exercises")
  - Status: Not Started / In Progress / Completed
  - If completed: Total volume, duration
  - Click to expand and see exercise list

#### 3. Session History Table
- Last 20 sessions
- Columns:
  - Date
  - Type (Push/Pull/Legs/Full)
  - Duration
  - Exercises
  - Volume (total)
  - Notes
- Click row to view full session detail

#### 4. Personal Records Timeline
- List of PRs (newest first)
- Each PR card shows:
  - Exercise name
  - New record: weight × reps @ RPE
  - Previous record
  - Improvement percentage
  - Date achieved
  - Celebration badge/icon

**Session Detail Modal:**
- Exercise list with sets/reps/weight/RPE for that session
- Notes
- Duration
- Total volume
- Comparison to previous session (if available)

**Components:**
- `components/athlete/training/current-programme-card.tsx`
- `components/athlete/training/weekly-sessions-grid.tsx`
- `components/athlete/training/session-card.tsx`
- `components/athlete/training/session-history-table.tsx`
- `components/athlete/training/pr-timeline.tsx`
- `components/athlete/training/session-detail-modal.tsx`

---

### Programme Detail Page

**Route:** `app/(athlete)/training/programmes/[programmeId]/page.tsx`

**Content:**
- Programme metadata (name, description, duration, type)
- Week-by-week breakdown
- For each week:
  - Week number
  - Training days
  - For each day:
    - Day name
    - Exercise list with sets/reps/RPE/rest
    - Notes

**View Options:**
- Compact view (collapsed exercises)
- Detailed view (all exercise details visible)
- Print-friendly layout

**Components:**
- `components/athlete/training/programme-detail-view.tsx`
- `components/athlete/training/week-breakdown.tsx`
- `components/athlete/training/exercise-list-display.tsx`

---

### Nutrition Page

**Route:** `app/(athlete)/nutrition/page.tsx`

**Sections:**

#### 1. Current Meal Plan Card
- Meal plan name
- Coach name (assigned by)
- Start date
- Training day vs non-training day macros

#### 2. Today's Macros (Prominent Display)
- Is today a training day? (Yes/No toggle or auto-detect)
- Target macros:
  - Calories (large number)
  - Protein / Carbs / Fat (in grams)
- Logged so far:
  - Calories consumed
  - Protein / Carbs / Fat
- Remaining:
  - Calories to go
  - Macros to go
- Visual progress bars for each macro

#### 3. This Week's Meals (Grid)
- Daily cards for Mon-Sun
- Each card shows:
  - Date
  - Training day indicator
  - Calories: Logged / Target
  - Adherence % (colour-coded)
  - Click to view day detail

#### 4. Recent Meal Logs
- Last 10 meals logged
- Each log shows:
  - Meal name/time
  - Foods consumed
  - Macros
  - Timestamp

**Components:**
- `components/athlete/nutrition/current-meal-plan-card.tsx`
- `components/athlete/nutrition/todays-macros-display.tsx`
- `components/athlete/nutrition/weekly-meals-grid.tsx`
- `components/athlete/nutrition/meal-log-list.tsx`

---

### Meal Plan Detail Page

**Route:** `app/(athlete)/nutrition/meal-plans/[mealPlanId]/page.tsx`

**Content:**
- Meal plan metadata
- Training Day Plan:
  - All meals with foods and macros
  - Total macros for the day
- Non-Training Day Plan:
  - All meals with foods and macros
  - Total macros for the day
- Shopping list generator (button to generate from current plan)

**Components:**
- `components/athlete/nutrition/meal-plan-detail-view.tsx`
- `components/athlete/nutrition/day-meal-breakdown.tsx`
- `components/athlete/nutrition/shopping-list-generator.tsx`

---

### Blood Work Page (CRITICAL FEATURE)

**Route:** `app/(athlete)/blood-work/page.tsx`

**This is THE primary reason athletes use the web interface - make it exceptional.**

**Sections:**

#### 1. Upload New Test Button
- Prominent button: "Upload New Blood Test"
- Opens upload modal
- Accepts PDF (Atlas Labs, Randox Health formats)
- Optional: Manual entry for individual markers

#### 2. Tests List
- Grid of blood test cards (newest first)
- Each card shows:
  - Date of test
  - Lab provider (Atlas Labs, Randox Health, or "Manual Entry")
  - Number of markers tested
  - Tags (e.g., "Baseline", "GH Cycle 2024", "Thyroid Panel")
  - Status indicator: Normal / Flagged (if any markers out of range)
  - Actions: View, Add Tags, Delete

#### 3. Quick Insights (if >1 test)
- "Markers Improving": Count of markers trending better
- "Markers Declining": Count of markers trending worse
- "Out of Range": Count of current markers outside reference range

#### 4. Favourite Markers (user can pin)
- Small trend sparklines for pinned markers
- Quick view of last 3 results for each
- Click to see full trend

**Components:**
- `components/athlete/blood-work/tests-grid.tsx`
- `components/athlete/blood-work/test-card.tsx`
- `components/athlete/blood-work/upload-test-modal.tsx`
- `components/athlete/blood-work/quick-insights.tsx`

---

### Blood Test Upload

**Route:** `app/(athlete)/blood-work/upload/page.tsx`

**Form:**

#### Step 1: Upload PDF or Manual Entry
- Drag-and-drop PDF upload
- File size limit: 10MB
- Accepted: PDF only
- OR: "Enter markers manually" button

#### Step 2: PDF Processing (if PDF uploaded)
- Show processing indicator
- Extract markers from PDF (use existing iOS logic)
- Display extracted markers in review table
- Allow editing/correcting extracted values

#### Step 3: Test Metadata
- Test date (date picker)
- Lab provider (dropdown: Atlas Labs, Randox Health, Other/Manual)
- Tags (multi-select chips: create new or select existing)
- Notes (textarea)

#### Step 4: Review & Save
- Preview all markers
- Highlight any out-of-range values
- Save button

**Components:**
- `components/athlete/blood-work/pdf-uploader.tsx`
- `components/athlete/blood-work/marker-extraction-review.tsx`
- `components/athlete/blood-work/test-metadata-form.tsx`

---

### Blood Test Detail Page

**Route:** `app/(athlete)/blood-work/[testId]/page.tsx`

**Content:**

#### Test Header
- Test date
- Lab provider
- Tags (editable)
- Notes (editable)
- Actions: Edit, Delete, Export PDF

#### Markers Table
- All markers from this test
- Columns:
  - Marker Name (e.g., "Testosterone")
  - Value
  - Unit
  - Reference Range (Low - High)
  - Status (with colour indicator):
    - Low (yellow)
    - Normal (green)
    - High (red)
  - Trend (if previous tests exist):
    - ↑ Increased
    - ↓ Decreased
    - → Stable
  - Actions: View Trend Chart

**Grouping:**
- Group markers by category:
  - Lipid Panel
  - Liver Function
  - Kidney Function
  - Hormones
  - Thyroid
  - Vitamins & Minerals
  - Blood Count
  - Other

**Filter/Search:**
- Search markers by name
- Filter by status (All, Normal, Out of Range)
- Filter by category

**Components:**
- `components/athlete/blood-work/test-detail-header.tsx`
- `components/athlete/blood-work/markers-table.tsx`
- `components/athlete/blood-work/marker-row.tsx`
- `components/athlete/blood-work/marker-trend-modal.tsx`

---

### Blood Work Trends Page

**Route:** `app/(athlete)/blood-work/trends/page.tsx`

**This is the MOST IMPORTANT page for blood work - make it exceptional.**

**Features:**

#### Marker Selection
- Dropdown/search to select markers to compare
- Multi-select: compare up to 6 markers on one chart
- Suggested comparisons:
  - "Testosterone + Free Testosterone + SHBG"
  - "Total Cholesterol + LDL + HDL + Triglycerides"
  - "TSH + T3 + T4"
  - User can save custom comparison sets

#### Trend Chart
- **Recharts line chart**
- X-axis: Test dates
- Y-axis: Marker values
- Multiple lines (one per marker, different colours)
- Reference range shaded areas for each marker
- Hover tooltips showing:
  - Date
  - Marker value
  - Unit
  - Whether in/out of range
- Zoom controls
- Date range selector (last 6 months, 1 year, all time, custom)

#### Marker Details Sidebar
- For selected markers, show:
  - Current value (most recent test)
  - Previous value (test before)
  - Change (absolute and %)
  - Trend direction (↑↓→)
  - Reference range
  - Notes/context about this marker

#### Export Options
- Export chart as image (PNG)
- Export data as CSV
- Print-friendly view

**Components:**
- `components/athlete/blood-work/marker-selector.tsx`
- `components/athlete/blood-work/trend-chart.tsx` (Recharts)
- `components/athlete/blood-work/marker-details-sidebar.tsx`
- `components/athlete/blood-work/saved-comparisons.tsx`

---

### Check-Ins Page

**Route:** `app/(athlete)/check-ins/page.tsx`

**Sections:**

#### 1. Next Check-In Card (if due soon)
- "Your next check-in is due [day]"
- Button: "Submit Check-In Now"
- Checklist of what's needed:
  - ✓ Weight logged today
  - ✓ Steps synced from HealthKit
  - ✓ Sleep logged
  - ✗ Supplement compliance (needs update)
  - Optional: Progress photos

#### 2. Check-In History
- List of all past check-ins (newest first)
- Each card shows:
  - Date submitted
  - Weight (with change from previous)
  - Steps average
  - Sleep average
  - Compliance %
  - Review status: Pending Review / Reviewed
  - If reviewed: Coach rating (stars) and feedback preview
  - Click to view full details

#### 3. Trends (if >3 check-ins)
- Weight trend chart (line chart, last 12 weeks)
- Steps trend chart
- Sleep trend chart

**Components:**
- `components/athlete/check-ins/next-check-in-card.tsx`
- `components/athlete/check-ins/check-in-history-list.tsx`
- `components/athlete/check-ins/check-in-card.tsx`
- `components/athlete/check-ins/check-in-trends.tsx`

---

### Submit Check-In Page

**Route:** `app/(athlete)/check-ins/submit/page.tsx`

**Form:**

#### Section 1: Weight
- Current weight input (kg or lb based on preference)
- Auto-populate if logged today via HealthKit
- Week-over-week change displayed
- Trend indicator (up/down/stable)

#### Section 2: Steps
- Last 7 days from HealthKit
- Daily breakdown table
- Average steps per day
- Target comparison (e.g., "Target: 12,000, Avg: 11,500")

#### Section 3: Sleep
- Last 7 days from HealthKit
- Daily breakdown table
- Average hours per night
- Quality scores (if available)
- Target comparison

#### Section 4: Supplement Compliance
- List of supplements (from athlete's supplement log)
- For each: "How many days this week did you take this?"
- Calculate compliance % per supplement
- Overall compliance %

#### Section 5: Progress Photos (Optional)
- **Note:** Photos stored as local references only (iOS handles storage)
- On web: Text saying "Add photos via the iOS app" OR simple upload
- If uploads enabled: Max 4 photos, 5MB each

#### Section 6: Notes (Optional)
- Textarea for athlete to add notes/comments for coach
- E.g., "Felt strong this week", "Struggled with sleep Tuesday"

#### Review & Submit
- Preview all data
- "Submit Check-In" button
- On submit:
  - Creates check-in record
  - Sets `was_sent_to_coach = true`
  - Triggers notification to coach
  - Redirects to check-in history

**Components:**
- `components/athlete/check-ins/submit-form.tsx`
- `components/athlete/check-ins/weight-input.tsx`
- `components/athlete/check-ins/steps-breakdown.tsx`
- `components/athlete/check-ins/sleep-breakdown.tsx`
- `components/athlete/check-ins/supplement-compliance-form.tsx`

---

### Check-In Detail Page

**Route:** `app/(athlete)/check-ins/[checkInId]/page.tsx`

**Content:**
- All check-in data (weight, steps, sleep, supplements)
- Charts/visualizations
- Coach feedback (if reviewed)
- Coach rating (if reviewed)
- Comparison to previous check-in

**Components:**
- `components/athlete/check-ins/check-in-detail-view.tsx`
- `components/athlete/check-ins/coach-feedback-display.tsx`

---

### Progress Page

**Route:** `app/(athlete)/progress/page.tsx`

**Sections:**

#### 1. Weight Trends
- Line chart (Recharts) showing weight over time
- Date range selector (1 month, 3 months, 6 months, 1 year, all time)
- Trend line (linear regression)
- Goal weight indicator (if set)
- Annotations for key events (e.g., "Started cut", "Deload week")

#### 2. Body Measurements
- If athlete tracks measurements (chest, waist, arms, etc.)
- Table of measurements with dates
- Trend charts for each measurement

#### 3. Progress Photos Comparison
- **Note:** Photos managed via iOS app
- On web: "View progress photos in the iOS app" OR
- If photos accessible: Side-by-side comparison view
  - Select two dates to compare
  - Display photos side-by-side

#### 4. Personal Records
- Total PRs achieved
- Recent PRs (last 30 days)
- PR timeline chart (count of PRs per month)

**Components:**
- `components/athlete/progress/weight-trend-chart.tsx`
- `components/athlete/progress/measurements-table.tsx`
- `components/athlete/progress/pr-summary.tsx`

---

### Recovery Page

**Route:** `app/(athlete)/recovery/page.tsx`

**Sections:**

#### 1. Current Readiness Score
- Same gauge as dashboard
- Detailed breakdown of factors

#### 2. Sleep Analysis
- Last 30 days sleep data
- Chart: Hours per night (bar chart)
- Chart: Sleep quality scores (line chart)
- Average hours per night
- Sleep consistency score
- Recommendations based on data

#### 3. HRV Trends (if available)
- Last 30 days HRV data
- Line chart with rolling average
- Interpretation: "Your HRV is trending up, indicating improved recovery"

#### 4. Strain Monitoring
- Last 7 days strain scores
- Chart showing training load vs recovery
- Warning if strain too high for recovery capacity

#### 5. Recovery Recommendations
- Based on readiness, sleep, HRV, strain
- E.g., "Consider a deload this week", "Prioritise sleep tonight"

**Components:**
- `components/athlete/recovery/readiness-detail.tsx`
- `components/athlete/recovery/sleep-analysis.tsx`
- `components/athlete/recovery/hrv-trends.tsx`
- `components/athlete/recovery/strain-monitor.tsx`

---

### Messages Page

**Route:** `app/(athlete)/messages/page.tsx`

**Layout:**
- If athlete has a coach: Show message thread with coach
- If no coach: "You don't have a coach yet"

**Message Thread:**
- Chat-style interface
- Messages from athlete (right, blue)
- Messages from coach (left, grey)
- Timestamps
- Read receipts
- Input at bottom
- Send button
- Real-time updates (Supabase Realtime)

**Components:**
- `components/athlete/messages/message-thread.tsx`
- `components/athlete/messages/message-bubble.tsx`
- `components/athlete/messages/message-input.tsx`

---

### Settings Pages

#### Profile Settings

**Route:** `app/(athlete)/settings/page.tsx`

**Form:**
- Display name
- Email (read-only, click to change redirects to account security)
- Photo upload
- Bio (optional)
- Location
- Save button

#### Goals Settings

**Route:** `app/(athlete)/settings/goals/page.tsx`

**Form:**
- Current weight
- Goal weight
- Goal (dropdown: Cut, Bulk, Maintain)
- TDEE (calculated or manual input)
- Target macros:
  - Training day: Calories, Protein, Carbs, Fat
  - Non-training day: Calories, Protein, Carbs, Fat
- Training days per week
- Save button

#### Notification Settings

**Route:** `app/(athlete)/settings/notifications/page.tsx`

**Toggles:**
- Check-in reminders
- Coach messages
- Programme updates
- Meal plan updates
- PR achievements
- Email digest frequency (daily, weekly, never)

**Components:**
- `components/athlete/settings/profile-form.tsx`
- `components/athlete/settings/goals-form.tsx`
- `components/athlete/settings/notification-preferences.tsx`

---

## Part 2: Super Admin Interface

### Purpose

Platform owner (you) needs God-mode access to:
- Monitor platform health
- Manage coaches and athletes
- View subscriptions and revenue
- Monitor messages (optional, privacy consideration)
- Platform analytics
- Feature flags and configuration

---

## Admin Route Structure

```
app/(admin)/
├── layout.tsx                    # Admin layout with sidebar
├── dashboard/
│   └── page.tsx                  # Platform stats overview
├── coaches/
│   ├── page.tsx                  # All coaches list
│   └── [coachId]/
│       └── page.tsx              # Coach detail + their clients
├── athletes/
│   ├── page.tsx                  # All athletes list
│   └── [athleteId]/
│       └── page.tsx              # Athlete detail
├── subscriptions/
│   └── page.tsx                  # Subscription management
├── messages/
│   └── page.tsx                  # Platform messages monitor
├── analytics/
│   └── page.tsx                  # Platform analytics
└── settings/
    └── page.tsx                  # Platform configuration
```

---

## Admin Pages - Detailed Specifications

### Admin Dashboard

**Route:** `app/(admin)/dashboard/page.tsx`

**Sections:**

#### 1. Platform Stats (4 big cards)
- **Total Coaches**
  - Count
  - Active (logged in last 7 days)
  - Growth this month
- **Total Athletes**
  - Count
  - Active (logged in last 7 days)
  - Growth this month
- **Active Subscriptions**
  - Count
  - Monthly Recurring Revenue (MRR)
  - Growth this month
- **Platform Health**
  - Uptime %
  - Avg response time
  - Error rate (last 24h)

#### 2. Recent Activity (Table)
- Last 50 platform events
- Columns: Event, User, Timestamp
- Events: New coach signup, New athlete signup, Subscription created, Check-in submitted, etc.

#### 3. Revenue Chart
- Last 12 months MRR
- Line chart (Recharts)
- Annotations for key events

#### 4. User Growth Chart
- Last 12 months
- Two lines: Coaches, Athletes
- Area chart (Recharts)

#### 5. Alerts (if any)
- Failed payments
- Error spikes
- Inactive coaches (>30 days)
- Low engagement athletes

**Components:**
- `components/admin/dashboard/stat-card.tsx`
- `components/admin/dashboard/activity-feed.tsx`
- `components/admin/dashboard/revenue-chart.tsx`
- `components/admin/dashboard/growth-chart.tsx`

---

### Coaches Management

**Route:** `app/(admin)/coaches/page.tsx`

**Features:**

#### Coaches Table
- All coaches
- Columns:
  - Name
  - Email
  - Status (Active, Suspended, Inactive)
  - Clients Count
  - Joined Date
  - Last Active
  - Subscription Status
  - Actions (View, Suspend/Activate, Impersonate)
- Filters:
  - Status
  - Subscription status
  - Joined date range
- Search by name or email
- Sort by any column
- Pagination (50 per page)

#### Actions:
- **View** - Go to coach detail page
- **Suspend** - Disable coach account (with reason)
- **Activate** - Re-enable suspended account
- **Impersonate** - Log in as this coach (for support/debugging)

**Components:**
- `components/admin/coaches/coaches-table.tsx`
- `components/admin/coaches/coach-row-actions.tsx`
- `components/admin/coaches/suspend-coach-modal.tsx`

---

### Coach Detail Page

**Route:** `app/(admin)/coaches/[coachId]/page.tsx`

**Sections:**

#### Coach Info
- Name, email, joined date
- Status badge
- Last active
- Subscription details
- Total clients (active/pending/paused/ended)

#### Clients List
- Table of all this coach's clients
- Columns: Name, Status, Since, Last Check-In, Actions
- Click to view athlete detail

#### Activity Log
- Coach's recent actions
- Programme created, Meal plan assigned, Check-in reviewed, etc.

#### Revenue
- Total revenue from this coach's subscription
- Payment history

#### Actions
- Suspend/Activate account
- Impersonate
- Send message (admin to coach)

**Components:**
- `components/admin/coaches/coach-detail.tsx`
- `components/admin/coaches/coach-clients-table.tsx`
- `components/admin/coaches/coach-activity-log.tsx`

---

### Athletes Management

**Route:** `app/(admin)/athletes/page.tsx`

**Features:**

#### Athletes Table
- All athletes
- Columns:
  - Name
  - Email
  - Coach (if assigned)
  - Status
  - Joined Date
  - Last Active
  - Subscription Status
  - Actions (View, Impersonate)
- Filters:
  - Has coach / No coach
  - Status
  - Joined date range
- Search by name or email
- Sort by any column
- Pagination

**Components:**
- `components/admin/athletes/athletes-table.tsx`

---

### Athlete Detail Page

**Route:** `app/(admin)/athletes/[athleteId]/page.tsx`

**Sections:**

#### Athlete Info
- Name, email, joined date
- Status
- Last active
- Coach (if assigned)
- Current programme
- Current meal plan

#### Recent Activity
- Last 20 activities (workouts, meals, check-ins)

#### Subscription Details
- Status
- Payment history

#### Actions
- Impersonate
- Send message (admin to athlete)

**Components:**
- `components/admin/athletes/athlete-detail.tsx`
- `components/admin/athletes/athlete-activity.tsx`

---

### Subscriptions Management

**Route:** `app/(admin)/subscriptions/page.tsx`

**Sections:**

#### Stats Overview
- Total active subscriptions
- Total cancelled (last 30 days)
- Churn rate
- MRR
- Lifetime value (avg)

#### Subscriptions Table
- All subscriptions
- Columns:
  - User (Name)
  - Plan
  - Status (Active, Cancelled, Past Due, Trial)
  - Start Date
  - Next Billing Date
  - Amount
  - Payment Method
  - Actions
- Filters:
  - Status
  - Plan type
- Search by user

#### Revenue Chart
- MRR over time (last 12 months)

#### Actions:
- View subscription detail
- Cancel subscription (with reason)
- Issue refund
- Update payment method

**Components:**
- `components/admin/subscriptions/subscriptions-table.tsx`
- `components/admin/subscriptions/subscription-detail-modal.tsx`
- `components/admin/subscriptions/revenue-chart.tsx`

---

### Messages Monitor (Optional - Privacy Consideration)

**Route:** `app/(admin)/messages/page.tsx`

**Purpose:** Monitor for abuse, spam, or issues

**Features:**
- List of all coach-athlete message threads
- Filters:
  - Date range
  - Coach
  - Athlete
- Search message content
- Flag system for reported messages
- **Privacy note:** Only show if explicitly needed for moderation

**Consider:** Maybe skip this and only add if abuse becomes an issue

---

### Analytics Page

**Route:** `app/(admin)/analytics/page.tsx`

**Sections:**

#### User Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Charts for each (last 90 days)

#### Feature Usage
- Most used features (top 10)
- Adoption rates for new features
- Drop-off points (where users stop engaging)

#### Platform Performance
- Avg page load time
- API response times
- Error rates by endpoint
- Database query performance

#### Retention
- Cohort retention table
- Churn analysis
- User lifetime value by cohort

**Components:**
- `components/admin/analytics/engagement-charts.tsx`
- `components/admin/analytics/feature-usage.tsx`
- `components/admin/analytics/performance-metrics.tsx`
- `components/admin/analytics/retention-cohorts.tsx`

---

### Platform Settings

**Route:** `app/(admin)/settings/page.tsx`

**Sections:**

#### Feature Flags
- Enable/disable features platform-wide
- Examples:
  - Blood work upload
  - Messaging
  - Check-in photos
  - PDF exports
- Per-feature toggle

#### Platform Configuration
- Default TDEE multipliers
- Default macro ratios
- Check-in frequency defaults
- Notification settings (platform-wide)

#### Maintenance Mode
- Enable/disable maintenance mode
- Custom message to show users

#### API Keys
- Supabase keys (read-only display)
- Third-party API keys (MuscleWiki, weather, etc.)

**Components:**
- `components/admin/settings/feature-flags.tsx`
- `components/admin/settings/platform-config-form.tsx`
- `components/admin/settings/maintenance-mode-toggle.tsx`

---

## Part 3: Role-Based Authentication & Routing

### Database Schema Updates

**Extend `profiles` table:**

```sql
-- Add role column if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['athlete'];

-- Update existing users
UPDATE profiles SET roles = ARRAY['athlete'] WHERE roles IS NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING GIN(roles);
```

**Role values:**
- `'athlete'` - Athlete user (default)
- `'coach'` - Coach user
- `'admin'` - Super admin (you)

**Users can have multiple roles:**
- Andy: `['athlete', 'coach', 'admin']`
- Sheridan: `['coach', 'athlete']` (if he trains clients but is also coached)
- Regular athlete: `['athlete']`

---

### Role Checking Functions

**File:** `lib/auth/roles.ts`

```typescript
export type UserRole = 'athlete' | 'coach' | 'admin'

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', userId)
    .single()
  
  return data?.roles || ['athlete']
}

export function hasRole(userRoles: UserRole[], requiredRole: UserRole): boolean {
  return userRoles.includes(requiredRole)
}

export function hasAnyRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role))
}
```

---

### Authentication Flow

**After login:**

1. Fetch user roles from database
2. Determine which dashboard to show:
   - If only `athlete` → `/athlete/dashboard`
   - If only `coach` → `/dashboard` (coach dashboard)
   - If only `admin` → `/admin/dashboard`
   - If multiple roles → Show role selector

**Role Selector:**
- Modal or page: "Which view would you like to see?"
- Buttons for each role
- Save preference to localStorage
- Redirect to selected dashboard

**File:** `components/auth/role-selector.tsx`

```typescript
'use client'

export function RoleSelector({ roles }: { roles: UserRole[] }) {
  const router = useRouter()
  
  const selectRole = (role: UserRole) => {
    localStorage.setItem('selected-role', role)
    
    if (role === 'athlete') router.push('/athlete/dashboard')
    if (role === 'coach') router.push('/dashboard')
    if (role === 'admin') router.push('/admin/dashboard')
  }
  
  return (
    <div className="space-y-4">
      <h2>Select Your View</h2>
      {roles.map(role => (
        <Button key={role} onClick={() => selectRole(role)}>
          {role === 'athlete' && 'View as Athlete'}
          {role === 'coach' && 'View as Coach'}
          {role === 'admin' && 'View as Admin'}
        </Button>
      ))}
    </div>
  )
}
```

---

### Role Switcher (Top Bar)

**For multi-role users, add dropdown in top bar:**

**File:** `components/layout/role-switcher.tsx`

```typescript
'use client'

export function RoleSwitcher({ currentRole, roles }: Props) {
  const router = useRouter()
  
  const switchRole = (role: UserRole) => {
    localStorage.setItem('selected-role', role)
    
    if (role === 'athlete') router.push('/athlete/dashboard')
    if (role === 'coach') router.push('/dashboard')
    if (role === 'admin') router.push('/admin/dashboard')
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost">
          {currentRole === 'athlete' && 'Athlete View'}
          {currentRole === 'coach' && 'Coach View'}
          {currentRole === 'admin' && 'Admin View'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {roles.map(role => (
          <DropdownMenuItem key={role} onClick={() => switchRole(role)}>
            {role === 'athlete' && '🏋️ Athlete View'}
            {role === 'coach' && '👨‍🏫 Coach View'}
            {role === 'admin' && '⚙️ Admin View'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

Add to top bar in all three layouts.

---

### Middleware Protection

**Update `middleware.ts`:**

```typescript
export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Not authenticated, redirect to login
    if (!request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }
  
  // Get user roles
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single()
  
  const roles = profile?.roles || ['athlete']
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!roles.includes('admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // Protect coach routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/clients') ||
      request.nextUrl.pathname.startsWith('/programmes') ||
      request.nextUrl.pathname.startsWith('/meal-plans')) {
    if (!roles.includes('coach') && !roles.includes('admin')) {
      return NextResponse.redirect(new URL('/athlete/dashboard', request.url))
    }
  }
  
  // Protect athlete routes
  if (request.nextUrl.pathname.startsWith('/athlete')) {
    if (!roles.includes('athlete') && !roles.includes('admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return response
}
```

---

## Shared Components Between Interfaces

### Blood Work Components
Use the same components across athlete and admin views:
- `components/shared/blood-work/test-card.tsx`
- `components/shared/blood-work/marker-trend-chart.tsx`
- `components/shared/blood-work/markers-table.tsx`

### Message Thread
Use same component in athlete/coach/admin:
- `components/shared/messages/message-thread.tsx`

### Charts
Shared chart components:
- `components/shared/charts/line-chart.tsx` (Recharts wrapper)
- `components/shared/charts/bar-chart.tsx`
- `components/shared/charts/area-chart.tsx`
- `components/shared/charts/gauge-chart.tsx`

---

## Data Fetching Patterns

### React Query Hooks for Athlete

**Files:**
- `hooks/athlete/use-current-programme.ts`
- `hooks/athlete/use-session-history.ts`
- `hooks/athlete/use-personal-records.ts`
- `hooks/athlete/use-current-meal-plan.ts`
- `hooks/athlete/use-daily-macros.ts`
- `hooks/athlete/use-blood-tests.ts`
- `hooks/athlete/use-blood-test.ts`
- `hooks/athlete/use-check-ins.ts`
- `hooks/athlete/use-submit-check-in.ts`
- `hooks/athlete/use-readiness-score.ts`
- `hooks/athlete/use-weight-trends.ts`
- `hooks/athlete/use-coach-messages.ts`

### React Query Hooks for Admin

**Files:**
- `hooks/admin/use-platform-stats.ts`
- `hooks/admin/use-all-coaches.ts`
- `hooks/admin/use-coach-detail.ts`
- `hooks/admin/use-all-athletes.ts`
- `hooks/admin/use-athlete-detail.ts`
- `hooks/admin/use-subscriptions.ts`
- `hooks/admin/use-platform-analytics.ts`

---

## Real-Time Subscriptions

### Athlete Real-Time

**Subscribe to:**
- Coach messages (when new message from coach)
- Programme assignments (when coach assigns new programme)
- Meal plan assignments (when coach assigns new meal plan)
- Check-in reviews (when coach reviews check-in)

**File:** `hooks/athlete/use-realtime-subscriptions.ts`

### Admin Real-Time

**Subscribe to:**
- New user signups
- New subscriptions
- Failed payments
- System alerts

**File:** `hooks/admin/use-realtime-subscriptions.ts`

---

## Implementation Checklist

### Phase 1: Athlete Interface
- [ ] Create athlete layout with sidebar
- [ ] Build dashboard (today tab) with readiness gauge
- [ ] Build training page with current programme and session history
- [ ] Build nutrition page with meal plan and macros
- [ ] Build blood work pages (list, upload, detail, trends) ← PRIORITY
- [ ] Build check-ins pages (list, submit, detail)
- [ ] Build progress page with weight trends
- [ ] Build recovery page with sleep/HRV
- [ ] Build messages page
- [ ] Build settings pages
- [ ] Create all athlete-specific hooks
- [ ] Add real-time subscriptions

### Phase 2: Admin Interface
- [ ] Create admin layout with sidebar
- [ ] Build admin dashboard with platform stats
- [ ] Build coaches management (list, detail)
- [ ] Build athletes management (list, detail)
- [ ] Build subscriptions management
- [ ] Build analytics page
- [ ] Build platform settings
- [ ] Create all admin-specific hooks
- [ ] Add impersonation functionality

### Phase 3: Role-Based Auth
- [ ] Update database schema (roles column)
- [ ] Create role checking functions
- [ ] Build role selector component
- [ ] Build role switcher component
- [ ] Update middleware for route protection
- [ ] Update login flow to handle roles
- [ ] Test multi-role users

### Phase 4: Shared Components
- [ ] Extract blood work components to shared
- [ ] Extract message components to shared
- [ ] Create shared chart components (Recharts)
- [ ] Create shared utility components

### Phase 5: Polish & Testing
- [ ] All loading states (skeletons)
- [ ] All empty states
- [ ] All error states
- [ ] Toast notifications
- [ ] Mobile responsive (all pages)
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Test all user flows
- [ ] Test role switching
- [ ] Test impersonation

---

## Acceptance Criteria

### Athlete Interface
- [ ] Athletes can log in and see their dashboard
- [ ] Readiness score calculates correctly
- [ ] Training page shows current programme and history
- [ ] Nutrition page shows meal plan and macros
- [ ] Blood work upload works (PDF parsing)
- [ ] Blood work trends chart displays correctly
- [ ] Can compare multiple markers on one chart
- [ ] Check-in submission works
- [ ] Weight trends display correctly
- [ ] Messages work with real-time updates
- [ ] All pages are mobile responsive
- [ ] No console errors

### Admin Interface
- [ ] Admin can view platform dashboard
- [ ] Can view all coaches and athletes
- [ ] Can suspend/activate accounts
- [ ] Can impersonate users (logs in as them)
- [ ] Subscription data displays correctly
- [ ] Revenue charts accurate
- [ ] Analytics show correct metrics
- [ ] Platform settings can be updated
- [ ] All tables sortable and filterable
- [ ] Search works across all data

### Role-Based Auth
- [ ] Single-role users redirect correctly
- [ ] Multi-role users see role selector
- [ ] Role switcher works in top bar
- [ ] Middleware protects routes correctly
- [ ] Cannot access unauthorized routes
- [ ] Role persists across page reloads

---

## Notes

### British English
- Programme (not program)
- Organise, realise, analyse
- Colour (not color)

### Apple++ Quality
- Use frontend-design skill extensively
- Premium animations and transitions
- Thoughtful micro-interactions
- Exceptional blood work trends visualization
- Professional charts (Recharts)
- Delightful UX throughout

### Blood Work Priority
**Blood work is THE reason athletes use web interface.**
- Make upload seamless
- Make trends exceptional
- Make comparisons intuitive
- Export capabilities
- Professional medical-grade feel

### Performance
- Lazy load heavy charts
- Skeleton loaders everywhere
- Optimize Recharts (virtualization if needed)
- React Query caching aggressive
- Image optimization

### Security
- RLS policies for athlete data
- Admin can bypass RLS (service role key)
- Impersonation logs everything
- Sensitive data encrypted
- Rate limiting on uploads

---

## Commit Message

When complete:

```
feat: Add athlete web interface and super admin platform management

Athlete Interface:
- Dashboard with readiness score and today's overview
- Training with current programme and session history
- Nutrition with meal plan and macro tracking
- Blood work analysis with upload, trends, and multi-marker comparison
- Check-in submission and history
- Progress tracking with weight and measurement trends
- Recovery monitoring with sleep, HRV, and strain
- Real-time messaging with coach
- Settings and preferences

Admin Interface:
- Platform dashboard with stats and revenue
- Coaches management with suspend/activate
- Athletes management
- Subscription tracking and revenue analytics
- Platform analytics and engagement metrics
- Platform settings and feature flags
- User impersonation for support

Role-Based System:
- Multi-role support (athlete, coach, admin)
- Role selector on login
- Role switcher in top bar
- Middleware route protection
- RLS policies for data access

All interfaces:
- Mobile responsive
- Real-time updates via Supabase
- Professional Recharts visualizations
- Loading/empty/error states
- British English throughout
- Apple++ quality design
```

---

## Ready to Build! 🚀

**This is comprehensive. This is complete. Build it all now.**

Use the frontend-design skill to make every page exceptional, especially the blood work trends - that's the killer feature for athletes on web.

When done, report back with what was built.
