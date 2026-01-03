# Synced Momentum - UI Documentation

> Complete reference for all user interfaces, layouts, components, and user flows in the Synced Momentum web application.

**Last Updated:** January 2026
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Navigation Structure](#navigation-structure)
4. [Athlete Portal](#athlete-portal)
5. [Coach Portal](#coach-portal)
6. [Admin Portal](#admin-portal)
7. [Authentication Pages](#authentication-pages)
8. [Shared Components](#shared-components)
9. [Design Patterns](#design-patterns)
10. [User Flows](#user-flows)

---

## Overview

### Portal Architecture

The application consists of three distinct portals with separate navigation and layouts:

**Athlete Portal** (`/athlete/*`)
- Primary user interface for athletes
- Mobile-first responsive design
- Focus on health tracking, nutrition, training
- Integrated with iOS app (HealthKit data sync)

**Coach Portal** (`/dashboard/*`)
- Professional interface for coaches
- Desktop-optimized layouts
- Client management and review workflows
- Template creation and assignment

**Admin Portal** (`/admin/*`)
- Platform administration interface
- System-wide analytics and management
- User role management
- Subscription and billing oversight

### Responsive Breakpoints

```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Color Scheme

**Brand Colors:**
- Primary: Amber-500 (#f59e0b) - Call-to-actions, highlights
- Success: Green-500 (#22c55e) - Positive metrics, achievements
- Warning: Orange-500 (#f97316) - Alerts, attention needed
- Danger: Red-500 (#ef4444) - Critical items, errors

**Semantic Colors:**
- Strain: Amber-500 (training load)
- Recovery: Green-500 (recovery status)
- Sleep: Indigo-500 (sleep quality)
- Heart Rate: Red-500 (HR metrics)
- HRV: Blue-500 (heart rate variability)

---

## Design System

### Typography

**Headings:**
- Page Title: `text-2xl font-bold tracking-tight lg:text-3xl`
- Section Heading: `text-lg font-semibold`
- Card Heading: `text-base font-semibold`
- Small Heading: `text-sm font-medium uppercase tracking-wider text-muted-foreground`

**Body Text:**
- Default: `text-base`
- Small: `text-sm`
- Extra Small: `text-xs`
- Muted: `text-muted-foreground`

### Spacing

**Container Padding:**
- Mobile: `p-4`
- Desktop: `lg:p-8`

**Section Gaps:**
- Small: `gap-3` or `space-y-3`
- Medium: `gap-6` or `space-y-6`
- Large: `gap-8` or `space-y-8`

### Components (shadcn/ui)

**Base Components:**
- `Button` - Primary, secondary, outline, ghost variants
- `Input` - Text inputs with label integration
- `Label` - Form labels
- `Card` - Container with header/content/footer
- `Alert` - Information banners
- `Spinner` - Loading indicators
- `Form` - Form wrapper with react-hook-form integration
- `Sonner` - Toast notifications
- `ConfirmationDialog` - Confirmation modals

**Custom Components:**
- `TopBar` - Page header with title and actions
- `ReadinessGauge` - Circular progress gauge for readiness score
- `WeatherWidget` - Weather display with training recommendations
- Various chart components (Recharts-based)

### Animation Patterns

**Framer Motion Usage:**

**Page Entry:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
```

**Stagger Lists:**
```tsx
transition={{ delay: index * 0.05 }}
```

**Hover Effects:**
```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

### Card Styles

**Standard Card:**
```tsx
className="rounded-xl border border-border bg-card p-6"
```

**Highlighted Card:**
```tsx
className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6"
```

**Empty State:**
```tsx
className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center"
```

---

## Navigation Structure

### Athlete Portal Navigation

**Sidebar Menu:**
```
Dashboard         (/)
├── Training      (/athlete/training)
│   ├── Overview
│   ├── Exercises
│   └── Programmes
├── Nutrition     (/athlete/nutrition)
│   ├── Overview
│   ├── Log Meal
│   └── Meal Plans
├── Blood Work    (/athlete/blood-work)
│   ├── Panels
│   ├── Upload
│   └── Trends
├── Check-ins     (/athlete/check-ins)
│   ├── History
│   └── New Check-in
├── Progress      (/athlete/progress)
├── Recovery      (/athlete/recovery)
├── Messages      (/athlete/messages)
└── Settings      (/athlete/settings)
    ├── Profile
    ├── Security
    ├── Goals
    ├── Notifications
    └── Help
```

**Top Bar:**
- User profile dropdown (bottom left on mobile, top right on desktop)
- Role switcher (if multi-role user)
- Sign out

### Coach Portal Navigation

**Sidebar Menu:**
```
Dashboard         (/)
├── Clients       (/clients)
├── Check-ins     (/check-ins)
├── Programmes    (/programmes)
├── Meal Plans    (/meal-plans)
├── Messages      (/messages)
├── Notifications (/notifications)
└── Settings      (/settings)
    ├── Profile
    ├── Security
    ├── Appearance
    ├── Notifications
    ├── Billing
    └── Help
```

### Admin Portal Navigation

**Sidebar Menu:**
```
Dashboard         (/admin)
├── Coaches       (/admin/coaches)
├── Athletes      (/admin/athletes)
├── Admins        (/admin/admins)
├── Subscriptions (/admin/subscriptions)
├── Support       (/admin/support)
├── Analytics     (/admin/analytics)
└── Settings      (/admin/settings)
```

---

## Athlete Portal

### Dashboard (`/athlete`)

**Layout:** 12-column grid with 8/4 split on desktop

**Left Column (Main Content):**

1. **Readiness Score Card**
   - Large circular gauge showing overall readiness (0-100%)
   - Training Day / Rest Day badge
   - 3-column breakdown: Strain | Recovery | Sleep
   - Each with icon, label, percentage
   - Fallback message if no HealthKit data

2. **Today's Activity Card**
   - HealthKit activity rings visualization
   - Steps progress bar (current / 10,000 target)
   - Active energy (calories burned)
   - Exercise minutes
   - Link to Recovery page

3. **Nutrition Summary Card**
   - Today's macros vs targets
   - 4 macro pills: Calories | Protein | Carbs | Fat
   - Each shows: current/target with colored background
   - Link to Nutrition page

4. **Today's Programme Card** (if assigned)
   - Programme name
   - Current week/total weeks
   - Today's session summary
   - List of exercises (max 5 visible)
   - "View Full Programme" button
   - Empty state if no programme assigned

5. **Recent Workouts** (HealthKit sync)
   - Last 5 workouts from Apple Watch
   - Each card shows:
     - Workout type icon
     - Duration
     - Active energy
     - Heart rate
     - Time ago
   - Empty state: "Workouts will appear here when synced from your Apple Watch"

6. **Recent Check-ins**
   - Last 3 check-ins
   - Each card shows:
     - Date
     - Weight
     - Status badge (pending/reviewed)
     - Coach feedback snippet (if reviewed)
   - "View All" link to check-ins page

**Right Column (Sidebar):**

1. **Weather Widget**
   - Current temperature and condition
   - Location (from postcode)
   - Settings icon to change location
   - High/Low temperatures (right-aligned)
   - Training recommendation based on weather
   - Icons change day/night

2. **Weight Trend Card**
   - Current weight (large display)
   - Mini line chart (last 30 days)
   - Weekly change (green/red with arrow)
   - Link to Progress page

3. **Quick Actions**
   - "Log Food" button
   - "Start Check-in" button
   - "View Recovery" button

**Empty States:**
- No HealthKit data: "Connect Apple Watch to see detailed metrics"
- No programme: "Your coach will assign a programme soon"
- No check-ins: "No check-ins yet. Submit your first check-in to get started"

---

### Training (`/athlete/training`)

**Layout:** Full-width with top stats row

**Header Section:**
- Page title: "Training"
- Subtitle: "Track your workouts and progress"

**Current Programme Card** (if assigned):
- Programme name and description
- Coach avatar and name
- Progress: Week X of Y
- Start date
- 4-column grid: Weeks | Sessions | Completion | Focus Areas
- "View Full Programme" button
- Empty state: "No active programme. Your coach will assign one soon."

**Recent Sessions Section:**
- Title: "Recent Training Sessions"
- List of last 10 sessions
- Each session card:
  - Date and session name
  - Duration
  - Total volume (kg)
  - Exercise count
  - Completion percentage
  - Click to expand details
- Empty state: "No training sessions logged yet"

**Exercise Library Link:**
- Card with dumbbell icon
- "Browse Exercise Library"
- "XXX exercises available"

---

### Training - Programme Detail (`/athlete/training/programmes/[id]`)

**Layout:** Full-width with week navigation

**Header:**
- Back button to Training
- Programme name (large)
- Coach name and avatar
- Week selector dropdown (Week 1, Week 2, etc.)

**Week Overview Card:**
- Current week stats:
  - Sessions this week
  - Total volume
  - Completion rate
- Progress bar for week completion

**Sessions Grid:**
- Cards for each session in the week
- Session card structure:
  - Day label (Monday, Tuesday, etc.)
  - Session name
  - Duration estimate
  - Exercise count
  - "Start Session" or "View Session" button
  - Completed checkmark if done

**Session Detail Modal** (opens on click):
- Session name and type
- Exercise list with:
  - Exercise name and image
  - Sets × Reps
  - Target weight
  - Rest periods
  - Form notes
- Log workout button

---

### Training - Exercises (`/athlete/training/exercises`)

**Layout:** Filterable list with search

**Header:**
- Search bar
- Filter buttons: All | Upper Body | Lower Body | Core | Cardio

**Exercise Grid:**
- 3-column grid on desktop, 1-column on mobile
- Each exercise card:
  - Exercise name
  - Muscle group tags
  - Equipment needed
  - Difficulty badge
  - Click to expand for:
    - Full description
    - Form cues
    - Video link (if available)
    - Recent PRs for this exercise

---

### Nutrition (`/athlete/nutrition`)

**Layout:** Stacked sections

**Today's Macros Card:**
- Title with date
- 4 macro progress cards:
  - Calories (orange) - Target, Current, Remaining with progress bar
  - Protein (red) - Same structure
  - Carbs (amber) - Same structure
  - Fat (purple) - Same structure
- Each shows: Current / Target, visual progress bar, "X remaining" or "Target reached!"
- Empty state: "No nutrition data logged today. Log your meals in the iOS app."

**Meal Plan Card:**
- Title: "Meal Plan"
- If assigned:
  - Meal plan name
  - Description
  - "View Full Plan" button
- If not assigned:
  - Empty state with apple icon
  - "No Meal Plan Assigned"
  - "Your coach will assign a meal plan tailored to your goals"

**Log Meals CTA:**
- Amber highlighted card
- Icon: Utensils
- "Track Your Nutrition"
- "Use the Synced Momentum iOS app to log your meals and track daily nutrition"

---

### Nutrition - Log Meal (`/athlete/nutrition/log`)

**Layout:** Two-column (meal selection | current day summary)

**Left: Food Database**
- Search bar
- Category filters (Breakfast, Lunch, Dinner, Snacks)
- Food list:
  - Food name
  - Serving size
  - Calories, P/C/F per serving
  - "+" button to add
- Pagination

**Right: Today's Log**
- Date selector
- Daily totals (4 macro pills)
- Progress bars vs targets
- Meals section:
  - Grouped by meal type (Breakfast, Lunch, etc.)
  - Each entry:
    - Food name
    - Portion
    - Macros breakdown
    - Remove button
  - Meal subtotals

**Bottom Actions:**
- "Save" button
- "Clear All" button

---

### Nutrition - Meal Plan Detail (`/athlete/nutrition/meal-plans/[id]`)

**Layout:** Tabbed interface (Training Day | Rest Day)

**Header:**
- Back to Nutrition
- Meal plan name
- Coach name
- Goal badge (e.g., "Muscle Gain", "Fat Loss")

**Day Type Tabs:**
- Training Day (amber highlight)
- Rest Day (blue highlight)

**Daily Overview Card:**
- 4-column macro summary
- Total calories for the day
- Pie chart showing macro split

**Meals Section:**
- Expandable meal cards (Breakfast, Lunch, Dinner, Snacks)
- Each meal card header:
  - Meal name
  - Time recommendation
  - Total calories
  - Macro breakdown (P/C/F)
  - Expand/collapse chevron
- Expanded view shows:
  - Food item list
  - Portions
  - Individual macros
  - Preparation notes

**Sidebar (Desktop):**
- Macro breakdown card
- Shopping list button
- Print plan button

---

### Blood Work (`/athlete/blood-work`)

**Layout:** List with filter sidebar

**Header:**
- Page title: "Blood Work"
- "Upload New Panel" button (primary CTA)

**Filter Sidebar** (desktop) / Top filters (mobile):
- Date range selector
- Panel type filter
- Sort by: Most Recent | Oldest

**Panels List:**
- Card for each blood panel:
  - Panel name (e.g., "Full Blood Count")
  - Test date
  - Lab name
  - Marker count (e.g., "24 markers")
  - Status badges:
    - X markers outside normal range (red)
    - Y markers optimal (green)
  - "View Details" button
- Empty state: "No blood panels uploaded"

---

### Blood Work - Panel Detail (`/athlete/blood-work/[id]`)

**Layout:** Full-width with category filter

**Header:**
- Back to Blood Work
- Panel name and date
- Lab name
- Download PDF button

**Category Filter Tabs:**
- All | General | Metabolic | Lipids | Hormones | Vitamins | Minerals | etc.
- Active tab highlighted in amber

**Markers Grid:**
- 2-column grid on desktop
- Each marker card:
  - Marker name (large)
  - Current value with unit (very large, bold)
  - Status badge: Optimal (green) | Normal (blue) | Low (orange) | High (red)
  - Reference range bar:
    - Visual bar showing low-normal-high ranges
    - Pointer showing current value position
  - Historical trend mini-chart (if multiple tests)
  - "View Trend" link

**Summary Stats (Top):**
- Total markers: X
- Optimal: Y (green)
- Within range: Z (blue)
- Outside range: W (red/orange)

---

### Blood Work - Upload (`/athlete/blood-work/upload`)

**Layout:** Centered upload form

**Upload Card:**
- Drag-and-drop zone
- "Upload PDF" button
- File type indicator: "Accepts PDF files only"
- File size limit: "Maximum 10MB"

**After Upload:**
- Loading state: "Parsing PDF..."
- Progress indicator
- Extracted markers preview
- Edit capability before saving
- "Save Panel" button

**Form Fields:**
- Panel name (auto-filled from PDF if possible)
- Test date (datepicker)
- Lab name (optional)

---

### Blood Work - Trends (`/athlete/blood-work/trends`)

**Layout:** Chart-focused with marker selector

**Marker Selector:**
- Dropdown: Select marker to view trend
- Common markers quick-select pills

**Trend Chart:**
- Line chart showing selected marker over time
- X-axis: Test dates
- Y-axis: Marker value
- Reference range shaded area (normal range)
- Optimal range highlighted in green
- Data points clickable to see details
- Legend showing: Low | Normal | Optimal | High ranges

**Historical Data Table:**
- Below chart
- Columns: Date | Value | Status | Lab | Panel Name
- Sortable by date
- Export to CSV button

---

### Check-ins (`/athlete/check-ins`)

**Layout:** Timeline list

**Header:**
- Page title: "Check-ins"
- "New Check-in" button (primary CTA)

**Check-ins Timeline:**
- Vertical timeline on left
- Check-in cards on right
- Each card:
  - Date range (e.g., "Week of Dec 18")
  - Status badge: Pending Review | Reviewed | Overdue
  - Key metrics row:
    - Weight
    - Sleep hours
    - Training quality
  - Coach feedback snippet (if reviewed)
  - Expand/collapse for full details
  - "View Full Check-in" link

**Empty State:**
- Calendar icon
- "No check-ins yet"
- "Submit your first weekly check-in to start tracking progress"
- "Start Check-in" button

---

### Check-ins - New Check-in (`/athlete/check-ins/new`)

**Layout:** Multi-step form

**Progress Indicator:**
- Step 1: Basic Info
- Step 2: Training
- Step 3: Nutrition & Lifestyle
- Step 4: Review

**Step 1: Basic Info**
- Weight input (kg)
- Progress photos upload (optional)
- Body measurements (optional fields):
  - Chest, Waist, Hips, Arms, Thighs

**Step 2: Training**
- Session quality rating (1-5 stars for each day)
- Muscle group trained (multi-select)
- Training notes (textarea)
- Perceived difficulty

**Step 3: Nutrition & Lifestyle**
- Dietary adherence rating (1-10)
- Average sleep hours
- Sleep quality (Poor/Fair/Good/Excellent)
- Energy levels (Low/Medium/High)
- Stress levels (Low/Medium/High)
- Hydration (Liters per day)

**Step 4: Review**
- Summary of all entries
- Additional notes (textarea)
- "Submit Check-in" button

**Bottom Navigation:**
- "Back" button (except step 1)
- "Next" button (steps 1-3)
- "Submit" button (step 4)

---

### Check-ins - Detail (`/athlete/check-ins/[id]`)

**Layout:** Two-column (metrics | coach feedback)

**Header:**
- Back to Check-ins
- Week date range
- Status badge

**Left: Metrics Summary**
- **Key Metrics Grid** (2×2):
  - Weight (kg)
  - Sleep hours
  - Steps average
  - Session quality

- **Training Section:**
  - Days trained
  - Muscle groups hit
  - Session quality ratings per day
  - Training notes

- **Nutrition & Lifestyle:**
  - Adherence score
  - Energy levels
  - Stress levels
  - Hydration

**Right: Coach Feedback**
- If reviewed:
  - Coach avatar and name
  - Star rating (1-5)
  - Feedback text (highlighted card)
  - Reviewed date
- If pending:
  - "Awaiting coach review" message
  - Expected review time

---

### Progress (`/athlete/progress`)

**Layout:** Tabbed sections

**Tabs:**
- Weight | Body Comp | Strength | Photos

**Weight Tab:**
- Current weight (large display)
- Target weight (if set)
- Time range selector: 1M | 3M | 6M | 1Y | All
- Line chart:
  - Blue line: Daily weight
  - Orange line: 7-day moving average
  - Green dashed: Goal weight
- Stats cards:
  - Current weight
  - Change (+ or - with arrow)
  - Target weight
  - Data points

**Body Composition Tab:**
- Measurements table (if tracked)
- Columns: Date | Chest | Waist | Hips | Arms | Thighs
- Empty state: "No measurements tracked. Add measurements in check-ins."

**Strength Tab:**
- Personal Records timeline
- PR cards showing:
  - Exercise name
  - Weight × Reps
  - Date achieved
  - Improvement percentage
  - Trophy icon
- Category filter: All | Upper | Lower | Back | Chest
- Empty state: "Hit your first PR to see it here"

**Photos Tab:**
- Empty state (not implemented)
- "Progress photo tracking coming soon"

---

### Recovery (`/athlete/recovery`)

**Layout:** Metrics grid with charts

**Header:**
- Page title: "Recovery"
- Date selector (default: today)

**Readiness Overview Card:**
- Large readiness score (circular gauge)
- Training Day / Rest Day badge
- 3-column bar breakdown:
  - Strain (amber) - percentage bar
  - Recovery (green) - percentage bar
  - Sleep (indigo) - percentage bar

**Recovery Metrics Grid** (2-3 columns):
1. **Heart Rate Variability (HRV)**
   - Current value (ms)
   - 7-day average
   - Trend arrow (up/down)
   - Status: Low/Normal/High

2. **Resting Heart Rate (RHR)**
   - Current value (bpm)
   - 7-day average
   - Trend arrow
   - Mini line chart (last 7 days)

3. **Respiratory Rate**
   - Current value (breaths/min)
   - Normal range indicator

4. **SpO2** (Oxygen Saturation)
   - Current value (%)
   - Status: Normal/Low

5. **Wrist Temperature**
   - Current value (°C)
   - Baseline comparison
   - Hidden if 0.0

**Sleep Metrics Card:**
- Total sleep (hours)
- Sleep quality (percentage)
- Sleep stages breakdown:
  - Deep sleep
  - REM sleep
  - Core sleep
  - Awake time
- 7-day sleep trend chart

**Historical Data:**
- Tab selector: Today | This Week | This Month
- Charts update based on selection
- Empty state: "Connect Apple Watch to track recovery metrics"

---

### Messages (`/athlete/messages`)

**Layout:** Chat interface (not implemented - empty state)

**Empty State:**
- Message bubble icon
- "Messages"
- "Chat with your coach directly"
- "Coming soon - messaging feature in development"

---

### Settings - Profile (`/athlete/settings`)

**Layout:** Form sections

**Profile Information:**
- Avatar upload (circular)
- Display name
- Email (read-only, from auth)
- Bio (textarea)
- "Save Changes" button

**Personal Details:**
- First name
- Last name
- Date of birth (datepicker)
- Gender (dropdown)
- Height (cm)
- Location / Postcode

**Account Status:**
- Account created date
- Last sign-in
- Apple Sign-In status (if applicable)

---

### Settings - Security (`/athlete/settings/security`)

**Change Password Section:**
- Current password
- New password
- Confirm new password
- Password requirements list:
  - 8+ characters
  - 1 uppercase letter
  - 1 number
  - 1 special character
- "Update Password" button
- Note: Hidden for Apple Sign-In users

**Sessions:**
- Active sessions list
- Device, location, last active
- "Sign out other sessions" button

---

### Settings - Goals (`/athlete/settings/goals`)

**Goal Cards:**

1. **Weight Goal**
   - Current weight
   - Target weight input
   - Target date
   - Weekly change estimate
   - "Save Goal" button

2. **Body Composition Goals**
   - Target measurements (optional)
   - Fields for each measurement

3. **Performance Goals**
   - Strength goals by exercise
   - Target weights and reps

---

### Settings - Notifications (`/athlete/settings/notifications`)

**Notification Toggles:**
- Email notifications
  - Check-in reminders
  - Coach messages
  - Programme updates
  - Weekly summaries
- Push notifications (iOS app)
  - Training reminders
  - Nutrition logging reminders
  - Check-in due dates

**Frequency:**
- Daily digest
- Weekly summary
- Instant notifications

---

### Settings - Help (`/athlete/settings/help`)

**Help Sections:**

**FAQ Accordion:**
- Common questions expandable
- Categories: Getting Started | Training | Nutrition | Check-ins

**Contact Support:**
- Email support form
- Fields: Subject, Message
- "Send Message" button

**Resources:**
- User guide link
- Video tutorials
- Terms of service
- Privacy policy

---

## Coach Portal

### Dashboard (`/dashboard`)

**Layout:** Grid of analytics cards

**Header:**
- Welcome message: "Welcome back, [Coach Name]"
- Date range selector (Today | This Week | This Month)

**Stats Row (4 cards):**
1. **Total Clients**
   - Large number
   - Change indicator (vs last period)
   - Users icon

2. **Active Clients**
   - Number of clients with recent activity
   - Percentage of total
   - Activity icon

3. **Check-ins Pending**
   - Number awaiting review
   - Urgency indicator if overdue
   - Alert icon

4. **This Month Revenue**
   - Revenue amount
   - Change vs last month
   - Dollar icon

**Recent Activity Section:**
- Timeline of recent client actions:
  - Check-ins submitted
  - Meals logged
  - Workouts completed
  - Messages sent
- "View All Activity" link

**Clients Requiring Attention:**
- List of clients needing action:
  - Overdue check-ins
  - Missed sessions
  - Low adherence
- Each row:
  - Client name/avatar
  - Issue type badge
  - Days overdue
  - "Review" button

**Quick Actions:**
- "Review Check-ins" button
- "Create Programme" button
- "Create Meal Plan" button
- "Message Clients" button

**Note:** Currently displays mock data - pending coach_clients table implementation

---

### Clients (`/clients`)

**Layout:** Filterable table/grid

**Header:**
- Page title: "Clients"
- Search bar
- "+ Add Client" button (primary CTA)

**Filters:**
- Status: All | Active | Paused | Completed
- Sort by: Name | Recent Activity | Join Date

**Client List** (Card View):
- Grid of client cards (3 columns desktop)
- Each card:
  - Client avatar
  - Name
  - Join date
  - Current programme (if assigned)
  - Current meal plan (if assigned)
  - Last check-in date
  - Status badge
  - Quick actions dropdown:
    - View Profile
    - Send Message
    - Assign Programme
    - Assign Meal Plan
    - Edit Settings

**Table View Option:**
- Columns: Name | Programme | Meal Plan | Last Check-in | Status | Actions
- Sortable columns
- Pagination (50 per page)

**Empty State:**
- "No clients yet"
- "Add your first client to get started"
- "+ Add Client" button

---

### Clients - Client Detail (`/clients/[id]`)

**Layout:** Client profile with tab navigation

**Header:**
- Back to Clients
- Client avatar (large)
- Client name
- Client since date
- Status badge
- Actions:
  - "Send Message" button
  - Settings dropdown (edit client, change status, export data)

**Stats Bar:**
- 5 cards showing:
  - Current weight
  - Check-ins completed
  - Training adherence
  - Nutrition adherence
  - Last activity

**Tabs:**
- Overview | Health | Training | Nutrition | Check-ins | Messages | Settings

**Overview Tab:**
- Current programme card
- Current meal plan card
- Recent activity timeline
- Upcoming check-in due date
- Recent measurements

**Health Tab:**
- Weight trend chart
- Blood work panels list
- Recovery metrics (if HealthKit data available)
- Body composition history

**Training Tab:**
- Assigned programme
- Training history
- Personal records
- Session completion rate
- Volume trends

**Nutrition Tab:**
- Assigned meal plan
- Daily adherence chart
- Macro targets
- Recent logs

**Check-ins Tab:**
- Check-in history
- Filtered to this client only
- Same structure as main check-ins page

**Messages Tab:**
- Direct message thread with client
- Message input
- File attachments

**Settings Tab:**
- Client information
- Programme assignment
- Meal plan assignment
- Check-in frequency
- Notification preferences

---

### Check-ins (`/check-ins`)

**Layout:** Review queue with filters

**Header:**
- Page title: "Check-in Review"
- Filter tabs: Pending | Reviewed | Flagged | All

**Filters:**
- Client search
- Date range
- Sort by: Oldest First | Newest First | Client Name

**Check-in Cards:**
- List of check-ins to review
- Each card:
  - Client avatar and name
  - Week date range
  - Submission date
  - Status badge (Pending/Reviewed/Flagged)
  - Key metrics preview:
    - Weight change
    - Training quality
    - Adherence score
  - "Review" button

**Pending Count Badge:**
- Shows number of pending reviews
- Red indicator if any overdue (>48 hours)

**Empty State:**
- "All caught up!"
- "No check-ins to review"
- Trophy icon

---

### Check-ins - Review Detail (`/check-ins/[id]`)

**Layout:** Client info + metrics + feedback form

**Header:**
- Back to Check-ins
- Navigation: Previous Check-in | Next Check-in buttons
- Client name and avatar
- Week date range
- Status badge

**Client Context Card:**
- Client info
- Current programme
- Current meal plan
- "View Client Profile" link

**Metrics Grid (2 columns):**
**Left: Client Submission**
- Key metrics (weight, sleep, steps, session quality)
- Check-in type badge (weekly/daily)
- Training details:
  - Days trained
  - Muscle groups
  - Quality ratings
  - Notes
- Nutrition & lifestyle:
  - Adherence score
  - Sleep quality
  - Energy levels
  - Stress levels
  - Hydration
- Client notes

**Right: Coach Review**
**If Pending:**
- Review form:
  - Star rating (1-5)
  - Feedback textarea
  - Quick response templates dropdown
  - "Submit Review" button
- Action buttons:
  - "Flag for Follow-up" (mark as requiring action)
  - "Archive" (skip review)

**If Reviewed:**
- Coach feedback display
- Rating shown
- Reviewed date and time
- Edit review button

**Follow-up Section** (if flagged):
- Follow-up required indicator
- Reason for flag
- "Mark Complete" button when addressed

---

### Programmes (`/programmes`)

**Layout:** Template library grid

**Header:**
- Page title: "Programme Templates"
- "+ Create Programme" button

**Filter/Sort:**
- Type: All | Strength | Hypertrophy | Conditioning | Sport-Specific
- Duration: Any | 4 weeks | 8 weeks | 12 weeks | 16 weeks
- Difficulty: All | Beginner | Intermediate | Advanced
- Sort: Recent | Name | Popularity

**Template Cards:**
- Grid view (3 columns)
- Each card:
  - Template name
  - Preview image or icon
  - Duration (e.g., "8 weeks")
  - Difficulty badge
  - Focus areas (tags: Upper Body, Lower Body, etc.)
  - Sessions per week
  - Active assignments count ("X clients")
  - Actions dropdown:
    - View Details
    - Assign to Client
    - Duplicate
    - Edit
    - Archive

**Empty State:**
- "No programme templates yet"
- "Create your first programme template"
- "+ Create Programme" button

**Note:** Currently mock data - pending programme_templates table

---

### Programmes - Template Editor (`/programmes/[id]/edit`)

**Layout:** Multi-section form

**Header:**
- Back to Programmes
- Template name
- Save status indicator
- "Save Template" button
- "Preview" button

**Basic Information:**
- Template name
- Description
- Duration (weeks)
- Difficulty level
- Focus areas (multi-select tags)
- Sessions per week

**Week Builder:**
- Week selector (Week 1, Week 2, etc.)
- "Copy Week" button
- "Paste Week" button

**Session Editor (per week):**
- Day selector
- Session name
- Session type (Strength, Conditioning, etc.)
- Duration estimate

**Exercise Builder:**
- Add exercise button (opens exercise selector modal)
- Exercise list (drag to reorder):
  - Exercise name
  - Sets × Reps
  - Weight/Intensity
  - Rest period
  - Notes field
  - Superset grouping
  - Remove button

**Exercise Selector Modal:**
- Search exercises
- Filter by muscle group
- Exercise card: Name, image, muscle groups
- "Add Exercise" button

**Bottom Actions:**
- "Save as Draft" button
- "Publish Template" button
- "Discard Changes" button

---

### Programmes - Assign (`/programmes/assign`)

**Layout:** Two-step assignment form

**Step 1: Select Client(s)**
- Client selector (multi-select)
- Search clients
- Client list with checkboxes
- "Next" button

**Step 2: Configure Assignment**
- Programme template selector
- Start date picker
- Starting week (if joining mid-programme)
- Custom notes for client
- "Assign Programme" button

**Confirmation:**
- Success message
- Summary of assignments
- Options:
  - Assign to more clients
  - View client profile
  - Back to programmes

---

### Meal Plans (`/meal-plans`)

**Layout:** Template library grid (similar to programmes)

**Header:**
- Page title: "Meal Plan Templates"
- "+ Create Meal Plan" button

**Filters:**
- Goal: All | Weight Loss | Muscle Gain | Maintenance | Performance
- Diet type: All | Standard | Vegetarian | Vegan | Keto | Paleo
- Calorie range slider
- Sort: Recent | Name | Active Assignments

**Template Cards:**
- Grid view (3 columns)
- Each card:
  - Template name
  - Goal badge
  - Diet type tag
  - Calorie range (e.g., "2000-2200 kcal")
  - Macro split (40/30/30 P/C/F)
  - Active assignments count
  - Actions dropdown:
    - View Details
    - Assign to Client
    - Duplicate
    - Edit
    - Archive

**Empty State:**
- "No meal plan templates"
- "+ Create Meal Plan" button

**Note:** Currently mock data - pending meal_plan_templates table

---

### Meal Plans - Template Editor (`/meal-plans/[id]`)

**Layout:** Day type tabs + meal builder

**Header:**
- Back to Meal Plans
- Template name
- Save button

**Basic Info:**
- Template name
- Description
- Goal (dropdown)
- Diet type (dropdown)
- Target macros (editable):
  - Calories
  - Protein (g)
  - Carbs (g)
  - Fat (g)

**Day Type Tabs:**
- Training Day | Rest Day
- Toggle to use same plan for both

**Meal Sections** (per day type):
- Breakfast
- Morning Snack
- Lunch
- Afternoon Snack
- Dinner
- Evening Snack

**Meal Editor:**
- Meal time recommendation
- Add food item button (opens food database search)
- Food item list:
  - Food name
  - Portion size
  - Macros
  - Remove button
- Meal totals (auto-calculated)

**Daily Summary Sidebar:**
- Total calories
- Total macros
- Macro split pie chart
- Percentage of target

**Actions:**
- "Save Template" button
- "Preview" button (shows client view)
- "Generate Shopping List" button

---

### Messages (`/messages`)

**Layout:** Inbox/chat hybrid

**Sidebar (Desktop) / Top (Mobile):**
- Search conversations
- Filter: All | Unread | Flagged
- Conversation list:
  - Client avatar
  - Client name
  - Last message preview
  - Timestamp
  - Unread badge
  - Pin icon (for pinned chats)

**Main Chat Area:**
- Selected client name header
- "View Profile" link
- Message thread (scrollable)
- Each message:
  - Avatar
  - Message text
  - Timestamp
  - Read status
- File attachments display
- Message input:
  - Text input
  - Emoji picker
  - File attachment button
  - Send button
- Typing indicator when client typing

**Empty State:**
- "No messages yet"
- "Messages from clients will appear here"

**Note:** Currently empty - pending coach_messages table

---

### Notifications (`/notifications`)

**Layout:** Notification feed

**Header:**
- Page title: "Notifications"
- Mark all as read button
- Filter: All | Unread | Check-ins | Messages | System

**Notification List:**
- Grouped by date (Today, Yesterday, This Week, etc.)
- Each notification:
  - Icon (based on type)
  - Message text
  - Timestamp
  - Unread indicator (blue dot)
  - Action button (if applicable): View Check-in, Reply, etc.
  - Mark as read/unread
  - Delete button

**Notification Types:**
- Check-in submitted (requires review)
- Client message
- Programme completed
- Subscription renewal
- System updates

**Empty State:**
- Bell icon
- "All caught up!"
- "You have no notifications"

---

### Settings - Profile (`/settings`)

**Coach Profile Form:**
- Avatar upload
- Display name
- Professional title (e.g., "Strength Coach", "Nutritionist")
- Bio
- Qualifications (textarea)
- Specializations (tags)
- Years of experience
- Email (read-only)
- Phone number
- Website/social links

**Business Information:**
- Business name
- Address
- Tax ID

**Save Changes button**

---

### Settings - Billing (`/settings/billing`)

**Subscription Section:**
- Current plan: Professional (monthly)
- Status: Active
- Next billing date
- Payment amount
- "Manage Subscription" button (opens Stripe portal)

**Payment Method:**
- Card details (last 4 digits)
- Expiry date
- "Update Payment Method" button

**Billing History:**
- Table of past invoices:
  - Date | Amount | Status | Invoice PDF
- Pagination

**Note:** Mock data - Stripe not integrated

---

### Settings - Security (`/settings/security`)

**Change Password:**
- Same as athlete security page
- Current password
- New password
- Confirm new password
- Requirements list
- Update button

**Two-Factor Authentication:** (planned)
- Enable 2FA toggle
- QR code for authenticator app
- Backup codes

**Active Sessions:**
- Current sessions list
- Sign out other sessions button

---

## Admin Portal

### Dashboard (`/admin`)

**Layout:** Executive dashboard with KPI cards and charts

**Header:**
- Welcome message
- Date range selector

**KPI Row (5 cards):**
1. **Total Users**
   - Number with growth percentage
   - Breakdown: Coaches | Athletes

2. **Active Subscriptions**
   - Number of paid subscriptions
   - MRR (Monthly Recurring Revenue)

3. **Monthly Revenue**
   - Total revenue
   - Change vs last month

4. **Support Tickets**
   - Open tickets count
   - Average response time

5. **Platform Health**
   - Uptime percentage
   - Green/amber/red status indicator

**Charts Section:**
- User Growth Chart (line chart)
  - Last 12 months
  - Separate lines for coaches and athletes
- Revenue Chart (area chart)
  - Last 12 months
  - Stacked by subscription tier

**Recent Activity:**
- New user registrations
- New subscriptions
- Cancelled subscriptions
- Support tickets opened

**Quick Actions:**
- Invite Coach
- Invite Admin
- View Support Queue
- Export Reports

**Note:** All data is mock - pending platform analytics tables

---

### Coaches (`/admin/coaches`)

**Layout:** Filterable table

**Header:**
- Page title: "Coaches"
- Search bar
- "+ Invite Coach" button

**Filters:**
- Status: All | Active | Inactive | Pending Invite
- Subscription: All | Pro | Enterprise | Trial
- Sort by: Name | Join Date | Client Count

**Coach Table:**
- Columns:
  - Name & Avatar
  - Email
  - Join Date
  - Subscription Plan
  - Client Count
  - Last Active
  - Status
  - Actions dropdown
- Each row expandable to show:
  - Full profile details
  - Recent activity
  - Subscription details

**Actions Dropdown:**
- View Profile
- Reset Password
- Suspend Account
- Change Subscription
- View Clients
- Export Data
- Delete Account (with confirmation)

**Empty State:**
- "No coaches yet"
- "+ Invite Coach" button

---

### Coaches - Coach Detail (`/admin/coaches/[id]`)

**Layout:** Profile + analytics

**Header:**
- Back to Coaches
- Coach name and avatar
- Status badge
- Actions: Reset Password | Suspend | Delete

**Profile Information Card:**
- Personal details
- Professional info
- Contact information
- Join date
- Subscription tier

**Analytics Cards:**
- Total clients
- Active clients
- Check-ins reviewed (this month)
- Response time average
- Client retention rate

**Activity Timeline:**
- Recent actions
- Check-in reviews
- Programme creations
- Client messages

**Clients List:**
- All clients assigned to this coach
- Link to each client profile

**Subscription Details:**
- Plan type
- Billing interval
- Next billing date
- Payment history

---

### Athletes (`/admin/athletes`)

**Layout:** Table with filters (similar to coaches)

**Header:**
- Page title: "Athletes"
- Search bar
- Export button

**Filters:**
- Status: All | Active | Inactive
- Has Coach: All | With Coach | No Coach
- Join Date range

**Athlete Table:**
- Columns:
  - Name & Avatar
  - Email
  - Coach (if assigned)
  - Join Date
  - Last Active
  - Status
  - Actions

**Actions:**
- View Profile
- Assign/Reassign Coach
- Reset Password
- View Data
- Suspend Account
- Delete Account

---

### Admins (`/admin/admins`)

**Layout:** Admin user management

**Header:**
- Page title: "Admin Users"
- "+ Invite Admin" button

**Admin Table:**
- Columns:
  - Name
  - Email
  - Role (Admin | Super Admin)
  - Created Date
  - Last Active
  - Actions

**Actions:**
- Promote to Super Admin
- Demote to Admin
- Reset Password
- Remove Admin Access
- Delete User

**Invite Admin Modal:**
- Email input
- Role selector (Admin | Super Admin)
- Send Invite button
- Note: Creates pending invite, sends email

**Pending Invites Section:**
- List of sent invites
- Email, Role, Sent Date, Status
- Resend or Cancel buttons

---

### Subscriptions (`/admin/subscriptions`)

**Layout:** Subscription management table

**Header:**
- Page title: "Subscriptions"
- Filter: All | Active | Cancelled | Expired | Trial

**Subscription Table:**
- Columns:
  - User (Coach name)
  - Plan (Pro Monthly, Pro Annual, etc.)
  - Status
  - MRR (Monthly Recurring Revenue)
  - Current Period
  - Actions

**Actions:**
- View Details
- Change Plan
- Cancel Subscription
- Refund (last payment)
- View Invoice History

**Analytics Cards (Top):**
- Total MRR
- Active Subscriptions
- Churn Rate
- Average Revenue Per User (ARPU)

**Note:** Mock data - Stripe integration needed

---

### Support (`/admin/support`)

**Layout:** Ticket queue

**Header:**
- Page title: "Support Tickets"
- Filter tabs: Open | In Progress | Resolved | All

**Filters:**
- Priority: All | High | Medium | Low
- Assigned to: All | Me | Unassigned
- Category: All | Technical | Billing | Feature Request | Bug

**Ticket Table:**
- Columns:
  - Ticket ID
  - Subject
  - User
  - Category
  - Priority badge
  - Status
  - Assigned to
  - Created Date
  - Last Updated
  - Actions

**Actions:**
- View Details
- Assign to Me
- Change Priority
- Close Ticket

**Ticket Detail View:**
- Ticket info header
- User details
- Full conversation thread
- Internal notes
- Reply form
- Status change dropdown
- Priority selector

**Note:** Mock data - support system not implemented

---

### Analytics (`/admin/analytics`)

**Layout:** Dashboard with multiple chart sections

**Header:**
- Page title: "Platform Analytics"
- Date range selector (This Week, Month, Quarter, Year, Custom)
- Export Data button

**Chart Sections:**

1. **User Growth**
   - Line chart: Total users over time
   - Breakdown by role (coaches, athletes)
   - Growth rate percentage

2. **Revenue Analytics**
   - Area chart: Revenue over time
   - Stacked by subscription tier
   - MRR trend line

3. **Engagement Metrics**
   - Average check-ins per athlete
   - Coach response times
   - Active users (daily/weekly/monthly)

4. **Feature Usage**
   - Bar chart: Most used features
   - Feature adoption rates
   - Unused features

5. **Retention Analysis**
   - Cohort retention chart
   - Churn rate over time
   - User lifetime value

**Note:** All mock data - analytics infrastructure needed

---

## Authentication Pages

### Login (`/login`)

**Layout:** Centered card

**Login Card:**
- Logo
- "Welcome back" heading
- Email input
- Password input
- "Remember me" checkbox
- "Sign In" button (full-width, primary)
- "Forgot password?" link
- Divider
- "Don't have an account? Sign up" link

**Redirect Handling:**
- If `?redirectTo` param present, redirect there after login
- Otherwise redirect to default portal based on role

**Error Handling:**
- Invalid credentials: "Invalid email or password"
- Account suspended: "Account suspended. Contact support."

---

### Register (`/register`)

**Layout:** Centered card

**Registration Form:**
- Logo
- "Create your account" heading
- First name input
- Last name input
- Email input
- Password input
- Confirm password input
- Terms acceptance checkbox
- "Create Account" button
- "Already have an account? Sign in" link

**Password Requirements** (shown as checklist):
- 8+ characters
- 1 uppercase letter
- 1 number
- 1 special character

**Post-Registration:**
- Email confirmation sent message
- "Check your email" screen
- Resend confirmation link

---

### Reset Password (`/reset-password`)

**Layout:** Centered card

**Step 1: Request Reset**
- "Reset your password" heading
- Email input
- "Send Reset Link" button
- "Back to login" link

**Step 2: Confirmation**
- "Check your email" message
- Instructions
- "Didn't receive email? Resend" button

---

### Reset Password - Update (`/reset-password/update`)

**Layout:** Centered card

**Reset Form:**
- "Create new password" heading
- New password input
- Confirm password input
- Password requirements checklist
- "Reset Password" button

**Success:**
- "Password updated successfully"
- "Sign in with your new password" link
- Auto-redirect to login after 3 seconds

---

### Change Password (`/change-password`)

**Layout:** Full-page forced flow (no back button)

**When Shown:**
- When `user_metadata.force_password_change === true`
- User cannot access any other page until completed

**Form:**
- "Your password must be changed" warning message
- Current password input
- New password input
- Confirm new password input
- Password requirements checklist
- "Change Password" button

**On Success:**
- Clears `force_password_change` flag
- Redirects to default portal

---

### Select Role (`/select-role`)

**Layout:** Centered role selection

**When Shown:**
- Multi-role users on first login
- Or when manually switching roles

**Role Cards:**
- Card for each available role
- Role icon
- Role name
- Role description
- "Continue as [Role]" button

**Example:**
- **Athlete** - Track your health, training, and nutrition
- **Coach** - Manage clients and review progress
- **Admin** - Platform administration

**Selection:**
- Sets active role in auth context
- Redirects to appropriate portal
- Role stored in localStorage for persistence

---

## Shared Components

### TopBar

**Usage:** Page header across all portals

**Structure:**
- Left: Page title (text-2xl font-bold)
- Right: Action buttons (contextual)

**Examples:**
- Dashboard: "Dashboard"
- Clients: "Clients" + "Add Client" button
- Check-ins: "Check-in Review" + Filter tabs

---

### ReadinessGauge

**Usage:** Display readiness score (0-100%)

**Appearance:**
- Circular progress indicator
- Score in center (large number)
- Color changes based on score:
  - 0-40: Red
  - 41-60: Orange
  - 61-80: Yellow
  - 81-100: Green
- Animated fill on load

---

### WeatherWidget

**Usage:** Show local weather on athlete dashboard

**Structure:**
- Current temperature (large)
- Weather icon (day/night variants)
- Condition description
- Location (from postcode)
- High/Low temps (right-aligned)
- Training recommendation based on conditions
- Settings icon to change location

**Modal (Settings):**
- UK Postcode input
- Save button
- Updates user profile

---

### Charts (Recharts)

**Common Chart Configurations:**

**LineChart:**
- Used for: Weight trends, blood markers, recovery metrics
- Features: Dots on data points, tooltips, reference lines
- Colors: Based on metric (weight=green, markers=blue/red based on status)

**AreaChart:**
- Used for: Revenue, progress over time
- Features: Gradient fill, smooth curves
- Colors: Emerald/teal gradients

**BarChart:**
- Used for: Volume comparisons, category breakdowns
- Features: Horizontal bars, value labels
- Colors: Amber for training, green for nutrition

**PieChart:**
- Used for: Macro breakdowns, composition
- Features: Inner labels, legend
- Colors: Protein=purple, Carbs=green, Fat=amber

---

### Confirmation Dialog

**Usage:** Confirm destructive actions

**Structure:**
- Modal overlay
- Warning icon (amber or red)
- Title: "Are you sure?"
- Description of action
- Cancel button (secondary)
- Confirm button (danger for destructive actions)

**Examples:**
- Delete check-in
- Remove client
- Cancel subscription
- Archive programme

---

### Loading States

**Page Loading:**
```tsx
<div className="flex min-h-[50vh] items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
</div>
```

**Card Loading (Skeleton):**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-6 w-48 rounded bg-muted" />
  <div className="h-4 w-32 rounded bg-muted" />
</div>
```

**Button Loading:**
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Save
</Button>
```

---

### Empty States

**Standard Pattern:**
```tsx
<div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
  <IconComponent className="mx-auto h-10 w-10 text-muted-foreground/50" />
  <p className="mt-3 font-medium text-muted-foreground">[Main message]</p>
  <p className="text-sm text-muted-foreground/70 mt-1">[Subtext]</p>
  <Button className="mt-4">[Primary action]</Button>
</div>
```

**Used for:**
- No check-ins
- No blood panels
- No messages
- No clients
- No programmes

---

## Design Patterns

### Card Elevation System

**Standard Card:** `border border-border bg-card`
- Used for: Most content containers
- Shadow: None (relies on border)

**Elevated Card:** `border border-border bg-card shadow-sm`
- Used for: Overlays, modals
- Shadow: Subtle elevation

**Highlighted Card:** `border border-[color]/20 bg-[color]/5`
- Used for: CTAs, important info, status cards
- Colors: amber, green, red, blue based on context

---

### Status Badges

**Badge Pattern:**
```tsx
<span className="rounded-full px-2.5 py-1 text-xs font-medium bg-[color]/10 text-[color]-600">
  {status}
</span>
```

**Color Mappings:**
- Success/Active/Completed: Green
- Pending/In Progress: Amber
- Warning/Flagged: Orange
- Error/Overdue/Cancelled: Red
- Neutral/Paused: Blue
- Training Day: Green
- Rest Day: Blue

---

### Button Variants

**Primary:**
- Background: Amber-500
- Text: White
- Use for: Main actions (Save, Submit, Create)

**Secondary:**
- Background: Muted
- Text: Foreground
- Use for: Alternative actions

**Outline:**
- Border: Border color
- Background: Transparent
- Use for: Secondary actions

**Ghost:**
- No border or background
- Text: Muted-foreground
- Hover: Muted background
- Use for: Tertiary actions, back buttons

**Destructive:**
- Background: Red-500
- Text: White
- Use for: Delete, remove actions

---

### Form Patterns

**Standard Form Field:**
```tsx
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input id="field" placeholder="..." />
  {error && <p className="text-sm text-destructive">{error}</p>}
</div>
```

**Form Layout:**
- Single column for mobile
- 2-column grid for desktop (if multiple related fields)
- Consistent spacing: `space-y-4` or `space-y-6`

**Submit Button:**
- Full width on mobile
- Auto-width on desktop
- Disabled state while submitting
- Loading spinner in button when processing

---

### Responsive Grid Patterns

**Dashboard Layout:**
```tsx
className="grid gap-6 lg:grid-cols-12"
```
- Left column: `lg:col-span-8` (main content)
- Right column: `lg:col-span-4` (sidebar)

**Stats Cards:**
```tsx
className="grid grid-cols-2 md:grid-cols-4 gap-4"
```

**Data Cards:**
```tsx
className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
```

**Form Columns:**
```tsx
className="grid gap-6 md:grid-cols-2"
```

---

### Navigation Patterns

**Breadcrumbs:**
```tsx
<Link href="/back" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
  <ChevronLeft className="h-4 w-4" />
  Back to [Parent]
</Link>
```

**Tab Navigation:**
```tsx
<div className="border-b border-border">
  <nav className="flex gap-4">
    {tabs.map(tab => (
      <button className={cn(
        "py-2 border-b-2 transition-colors",
        isActive ? "border-amber-500 text-foreground" : "border-transparent text-muted-foreground"
      )}>
        {tab.label}
      </button>
    ))}
  </nav>
</div>
```

---

## User Flows

### First-Time User Onboarding (Athlete)

1. Register account (email + password)
2. Email confirmation
3. Login
4. Onboarding wizard (if `onboarding_completed = false`):
   - Welcome screen
   - Profile setup (name, height, weight, DOB)
   - Goals selection
   - Connect iOS app instructions
   - Dashboard tour
5. Redirect to dashboard

---

### Check-in Submission Flow

1. Athlete: Navigate to Check-ins
2. Click "New Check-in"
3. Multi-step form:
   - Basic info (weight, measurements)
   - Training (quality, notes)
   - Nutrition & lifestyle
   - Review
4. Submit
5. Confirmation: "Check-in submitted. Your coach will review it soon."
6. Email notification sent to coach
7. Coach: Reviews check-in queue
8. Coach: Opens check-in detail
9. Coach: Submits feedback and rating
10. Athlete: Receives notification
11. Athlete: Views feedback in check-in detail

---

### Programme Assignment Flow

1. Coach: Creates programme template (or uses existing)
2. Coach: Clicks "Assign to Client"
3. Select client(s)
4. Configure start date
5. Confirm assignment
6. Client receives notification
7. Client: Sees new programme on dashboard
8. Client: Navigates to Training
9. Client: Views programme detail
10. Client: Starts sessions

---

### Blood Work Upload Flow

1. Athlete: Gets blood test done at lab
2. Athlete: Receives PDF results via email
3. Athlete: Navigates to Blood Work → Upload
4. Athlete: Uploads PDF
5. System: Parses PDF (external service)
6. System: Extracts markers and values
7. Athlete: Reviews extracted data
8. Athlete: Edits if necessary
9. Athlete: Saves panel
10. Panel appears in blood work list
11. Athlete: Views panel detail with trends

---

### Multi-Role User Flow

1. User has both athlete and coach roles
2. Login
3. Select Role screen appears
4. Choose "Coach" role
5. Redirected to coach dashboard
6. User switches role via profile dropdown
7. Select Role screen appears
8. Choose "Athlete" role
9. Redirected to athlete dashboard
10. Active role persists in localStorage

---

## Summary

This document provides a complete reference for all UI pages, components, layouts, and user flows in the Synced Momentum web application. It covers:

- **3 Portals:** Athlete, Coach, Admin
- **60+ Pages:** Detailed descriptions of every page
- **Design System:** Colors, typography, spacing, components
- **Navigation:** Menu structure for each portal
- **Patterns:** Reusable UI patterns and conventions
- **User Flows:** End-to-end interaction scenarios

**For Developers:**
- Use this as a reference when building new features
- Follow established patterns for consistency
- Refer to component examples when creating new UIs

**For Claude AI:**
- This document provides complete context of the web UI
- Use when making UI changes or additions
- Reference page structures when answering UI questions
- Follow design patterns described here

---

**Maintained by:** Synced Momentum Development Team
**Last Updated:** January 2026
**Related Docs:** TECH_STACK.md, PORTAL_STATUS.md, README.md
