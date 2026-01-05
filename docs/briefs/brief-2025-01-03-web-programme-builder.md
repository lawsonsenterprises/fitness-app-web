# Brief: Programme Builder (Athletes & Coaches)

**Date:** 2025-01-03  
**Project:** Synced Momentum Web UI  
**Target Platform:** Next.js 15, React 18, TypeScript  
**Related:** Web UI Exercise Library (completed)  
**Status:** Ready for Implementation

---

## Overview

Build a comprehensive programme builder that allows both **athletes** and **coaches** to create training programmes, add exercises from the library, configure workout parameters (sets, reps, weight, rest, RPE), and sync to the iOS app.

**Core Requirements:**
- Athletes can create their own training programmes (self-coached)
- Coaches can create programme templates and assign to clients
- Both use the same programme builder interface
- Programmes sync to iOS app via Supabase
- Support multi-week programmes with different sessions per day

---

## Database Schema

### Existing Tables (from TECH_STACK.md)

**Already exists in Supabase:**

```sql
-- programmes table
CREATE TABLE programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INT NOT NULL,
  current_week INT DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- programme_days table
CREATE TABLE programme_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  day_number INT NOT NULL, -- 1-7 (Monday-Sunday)
  day_name TEXT, -- e.g., "Push Day", "Leg Day", "Rest"
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- workout_items table
CREATE TABLE workout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_day_id UUID NOT NULL REFERENCES programme_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id), -- NEW: Added by iOS Claude Code
  order_index INT NOT NULL, -- Order within the day
  sets INT NOT NULL,
  reps TEXT NOT NULL, -- e.g., "8-12" or "10"
  target_weight_kg DECIMAL,
  rest_seconds INT DEFAULT 90,
  rpe_target DECIMAL, -- Rate of Perceived Exertion (1-10)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Required Additions

**Add RLS policies:**

```sql
-- Enable RLS
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own programmes
CREATE POLICY "Users can view own programmes"
  ON programmes FOR SELECT
  USING (user_id = auth.uid());

-- Users can create programmes
CREATE POLICY "Users can create programmes"
  ON programmes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own programmes
CREATE POLICY "Users can update own programmes"
  ON programmes FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own programmes
CREATE POLICY "Users can delete own programmes"
  ON programmes FOR DELETE
  USING (user_id = auth.uid());

-- Programme days: Users can view/edit days of their programmes
CREATE POLICY "Users can view own programme days"
  ON programme_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programmes 
      WHERE id = programme_day_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create programme days"
  ON programme_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programmes 
      WHERE id = programme_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own programme days"
  ON programme_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM programmes 
      WHERE id = programme_day_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own programme days"
  ON programme_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM programmes 
      WHERE id = programme_day_id 
      AND user_id = auth.uid()
    )
  );

-- Workout items: Same pattern
CREATE POLICY "Users can view own workout items"
  ON workout_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programme_days pd
      JOIN programmes p ON p.id = pd.programme_id
      WHERE pd.id = programme_day_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workout items"
  ON workout_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programme_days pd
      JOIN programmes p ON p.id = pd.programme_id
      WHERE pd.id = programme_day_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout items"
  ON workout_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM programme_days pd
      JOIN programmes p ON p.id = pd.programme_id
      WHERE pd.id = programme_day_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout items"
  ON workout_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM programme_days pd
      JOIN programmes p ON p.id = pd.programme_id
      WHERE pd.id = programme_day_id
      AND p.user_id = auth.uid()
    )
  );
```

---

## Phase 1: Programme List & Creation

### 1.1 Programme List Page

**Route:** `/athlete/training/programmes` (Athletes)  
**Route:** `/dashboard/programmes` (Coaches)

**Page Structure:**

```
┌─────────────────────────────────────────┐
│ My Programmes               [+ Create]  │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🎯 Upper/Lower Split                │ │
│ │ 8 weeks • Week 3 of 8               │ │
│ │ 4 sessions/week                     │ │
│ │ [Active] ← is_active = true         │ │
│ │ ───────────────────────────────────  │ │
│ │ [View] [Edit] [Duplicate] [Delete]  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🎯 Push Pull Legs                   │ │
│ │ 12 weeks • Not started              │ │
│ │ 6 sessions/week                     │ │
│ │ [Inactive]                          │ │
│ │ ───────────────────────────────────  │ │
│ │ [View] [Edit] [Duplicate] [Delete]  │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- List all programmes for current user
- Show active/inactive status
- Show progress (current week / total weeks)
- Filter: All | Active | Inactive
- Sort: Recent | Name | Duration
- Empty state: "No programmes yet. Create your first programme."

### 1.2 Create Programme Modal

**Triggered by:** Clicking "+ Create" button

**Modal Structure:**

```
┌─────────────────────────────────────────┐
│ Create Programme                    [X] │
├─────────────────────────────────────────┤
│                                         │
│ Programme Name *                        │
│ [...................................]   │
│                                         │
│ Description                             │
│ [...................................]   │
│ [...................................]   │
│                                         │
│ Duration (weeks) *                      │
│ [4...] weeks                            │
│                                         │
│ Sessions per week *                     │
│ [3...] sessions                         │
│                                         │
│ Start Week                              │
│ [1...] (default: 1)                     │
│                                         │
│ Set as Active Programme                 │
│ [☐] Make this my active programme       │
│                                         │
│ [Cancel]                    [Create]    │
└─────────────────────────────────────────┘
```

**Validation:**
- Programme name: Required, 3-100 characters
- Duration: Required, 1-52 weeks
- Sessions per week: Required, 1-7 sessions
- Start week: Optional, default 1

**On Create:**
1. Insert into `programmes` table
2. If "Set as Active" checked: Set `is_active = true`, set all other programmes `is_active = false`
3. Redirect to Programme Builder (`/athlete/training/programmes/{id}/edit`)

### 1.3 Programme Actions

**View Programme:**
- Read-only view of all weeks, days, exercises
- Shows current progress if active

**Edit Programme:**
- Opens Programme Builder (Phase 2)

**Duplicate Programme:**
- Creates copy with " (Copy)" appended to name
- Sets `is_active = false`
- Copies all days and workout items

**Delete Programme:**
- Soft delete: Sets `deleted_at = now()`
- Confirmation dialog: "Are you sure? This will permanently delete this programme."

**Set Active:**
- Sets `is_active = true` for selected programme
- Sets `is_active = false` for all other programmes
- Only one programme can be active at a time

**Acceptance Criteria:**
- ✅ Programme list displays all user programmes
- ✅ Create programme modal validates input
- ✅ Create programme redirects to builder
- ✅ Active programme highlighted in list
- ✅ Only one programme can be active at a time
- ✅ Duplicate creates exact copy
- ✅ Delete soft-deletes programme

---

## Phase 2: Programme Builder

### 2.1 Programme Builder Layout

**Route:** `/athlete/training/programmes/{id}/edit`

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Programmes    Upper/Lower Split          [Save]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Week [1 ▼] [2] [3] [4] [5] [6] [7] [8]  ← Week selector│
│                                                         │
│ ┌──────────┬──────────┬──────────┬──────────┬─────────┐│
│ │ Monday   │ Tuesday  │Wednesday │ Thursday │ Friday  ││
│ │          │          │          │          │         ││
│ │ Upper    │ Rest     │ Lower    │ Rest     │ Upper   ││
│ │ Body     │          │ Body     │          │ Body    ││
│ │          │          │          │          │         ││
│ │ 5 ex.    │          │ 6 ex.    │          │ 5 ex.   ││
│ │          │          │          │          │         ││
│ │ [Edit]   │ [Edit]   │ [Edit]   │ [Edit]   │ [Edit]  ││
│ └──────────┴──────────┴──────────┴──────────┴─────────┘│
│ ┌──────────┬──────────┐                                 │
│ │ Saturday │ Sunday   │                                 │
│ │          │          │                                 │
│ │ Lower    │ Rest     │                                 │
│ │ Body     │          │                                 │
│ │          │          │                                 │
│ │ 6 ex.    │          │                                 │
│ │          │          │                                 │
│ │ [Edit]   │ [Edit]   │                                 │
│ └──────────┴──────────┘                                 │
│                                                         │
│ [Copy Week] [Paste Week] [Clear Week]                  │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Week selector at top (1-N weeks based on programme duration)
- 7-day grid (Monday-Sunday)
- Each day shows:
  - Day name (editable, e.g., "Upper Body", "Rest", "Leg Day")
  - Exercise count (e.g., "5 exercises")
  - Edit button
- Copy/Paste Week: Copy entire week and paste to another week
- Clear Week: Remove all exercises from week
- Auto-save on changes

### 2.2 Day Editor Modal

**Triggered by:** Clicking "Edit" on any day card

**Modal Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ Edit Monday - Week 1                                [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Session Name                                            │
│ [Upper Body....................................]        │
│                                                         │
│ Session Notes                                           │
│ [Focus on progressive overload...............]          │
│ [......................................]                │
│                                                         │
│ Exercises                               [+ Add Exercise]│
│ ┌─────────────────────────────────────────────────────┐│
│ │ ☰ 1. Barbell Bench Press                      [Edit]││
│ │    3 sets × 8-12 reps • 60kg • 90s rest             ││
│ │    RPE: 8/10                                   [Del]││
│ └─────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │ ☰ 2. Dumbbell Rows                            [Edit]││
│ │    4 sets × 10 reps • 30kg • 60s rest               ││
│ │    RPE: 7/10                                   [Del]││
│ └─────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │ ☰ 3. Overhead Press                           [Edit]││
│ │    3 sets × 8-10 reps • 40kg • 90s rest             ││
│ │    Note: Focus on form                         [Del]││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ☰ = Drag handle (reorder exercises)                    │
│                                                         │
│ [Cancel]                              [Save Session]    │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Edit session name (e.g., "Upper Body", "Push Day")
- Add session notes (optional)
- List all exercises for this day
- Drag to reorder exercises
- Edit exercise parameters
- Delete exercise
- Add new exercise (opens Exercise Selector)

### 2.3 Exercise Selector Modal

**Triggered by:** Clicking "+ Add Exercise" in Day Editor

**Modal Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ Add Exercise to Monday - Week 1                     [X] │
├─────────────────────────────────────────────────────────┤
│ [Search exercises...............................]       │
│ [All] [Chest] [Back] [Legs] [Arms]...                   │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ ☐ Barbell Bench Press                              ││
│ │   Equipment: Barbell | Difficulty: ⭐⭐             ││
│ │   Primary: Chest | Secondary: Shoulders, Triceps   ││
│ └─────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │ ☐ Dumbbell Flyes                                   ││
│ │   Equipment: Dumbbell | Difficulty: ⭐⭐            ││
│ │   Primary: Chest | Secondary: Shoulders            ││
│ └─────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │ ☐ Cable Crossovers                                 ││
│ │   Equipment: Cable | Difficulty: ⭐⭐               ││
│ │   Primary: Chest                                   ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Selected: 0 exercises                                   │
│ [Cancel]                              [Add Selected]    │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Search exercises by name
- Filter by muscle group
- Multi-select exercises (checkbox)
- Shows exercise details inline
- Click "Add Selected" → Opens Exercise Configuration Modal for each

### 2.4 Exercise Configuration Modal

**Triggered by:** After selecting exercises in Exercise Selector

**Modal Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ Configure: Barbell Bench Press                      [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Sets *                                                  │
│ [3....] sets                                            │
│                                                         │
│ Reps *                                                  │
│ [8-12.............] (e.g., "8-12" or "10")             │
│                                                         │
│ Target Weight (optional)                                │
│ [60...] kg                                              │
│                                                         │
│ Rest Period                                             │
│ [90...] seconds                                         │
│                                                         │
│ RPE Target (optional)                                   │
│ [8....] / 10 (Rate of Perceived Exertion)              │
│                                                         │
│ Notes (optional)                                        │
│ [Focus on controlled tempo....................]        │
│ [......................................]                │
│                                                         │
│ [Cancel]                                     [Add]      │
└─────────────────────────────────────────────────────────┘
```

**Validation:**
- Sets: Required, 1-10
- Reps: Required, text format (e.g., "8-12", "10", "AMRAP")
- Target weight: Optional, decimal
- Rest period: Optional, default 90 seconds
- RPE: Optional, 1-10

**On Add:**
1. Insert into `workout_items` table
2. Close modal
3. Return to Day Editor (shows new exercise in list)

### 2.5 Data Hooks

**File:** `hooks/use-programmes.ts`

```typescript
export function useProgrammes() {
  return useQuery({
    queryKey: ['programmes'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('programmes')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })
}

export function useProgrammeById(id: string) {
  return useQuery({
    queryKey: ['programme', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('programmes')
        .select(`
          *,
          programme_days (
            *,
            workout_items (
              *,
              exercises (*)
            )
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
  })
}

export function useCreateProgramme() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateProgrammeInput) => {
      const supabase = createClient()
      
      // If setting as active, deactivate all other programmes first
      if (data.is_active) {
        await supabase
          .from('programmes')
          .update({ is_active: false })
          .eq('user_id', data.user_id)
      }
      
      const { data: programme, error } = await supabase
        .from('programmes')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return programme
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programmes'] })
    }
  })
}
```

**Acceptance Criteria:**
- ✅ Programme builder displays week grid (7 days)
- ✅ Week selector switches between weeks
- ✅ Day editor modal opens on "Edit" click
- ✅ Exercise selector modal shows all exercises with search/filter
- ✅ Exercise configuration modal validates input
- ✅ Exercises save to `workout_items` table with correct `order_index`
- ✅ Drag-and-drop reordering updates `order_index`
- ✅ Copy/Paste Week duplicates all days and exercises
- ✅ Auto-save on changes (debounced, 1 second)

---

## Phase 3: iOS Sync

### 3.1 Programme Sync to iOS

**iOS already has Core Data entities:**
- `Programme`
- `ProgrammeDay`
- `WorkoutItem`

**iOS SyncManager already handles:**
- Bidirectional sync with Supabase
- Entity-to-table mapping
- Conflict resolution (last-write-wins)

**No iOS changes needed** - programmes created on web will automatically sync to iOS.

**Flow:**
1. User creates programme on web → Inserts into Supabase `programmes` table
2. iOS app launches → `SyncManager` fetches programmes with `updated_at > lastSyncDate`
3. Programmes imported to Core Data
4. Programme appears in iOS Training tab

### 3.2 Verification

**Test on iOS:**
1. Create programme on web with 2 weeks, 3 days/week, 5 exercises/day
2. Open iOS app
3. Navigate to Training tab → Programmes
4. Verify programme appears with correct name, duration, sessions
5. Tap programme → View weeks and days
6. Tap day → View exercises with sets/reps/weight
7. Start session → Verify workout runner loads correctly

**Acceptance Criteria:**
- ✅ Programmes created on web sync to iOS within 30 seconds (on app launch or pull-to-refresh)
- ✅ All programme data syncs correctly (name, duration, weeks, days, exercises)
- ✅ Exercise details sync correctly (sets, reps, weight, rest, RPE, notes)
- ✅ Active programme status syncs to iOS
- ✅ Changes on web reflect on iOS after sync

---

## Phase 4: Programme View (Read-Only)

### 4.1 Programme Detail View (Read-Only)

**Route:** `/athlete/training/programmes/{id}`

**For athletes viewing their programme (not editing)**

**Page Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ ← Back         Upper/Lower Split              [Edit]    │
├─────────────────────────────────────────────────────────┤
│ 8 weeks • Week 3 of 8 • 4 sessions/week                │
│ [Active Programme]                                      │
│                                                         │
│ Description:                                            │
│ Progressive overload focused upper/lower split          │
│                                                         │
│ Week [1 ▼] [2] [3] [4] [5] [6] [7] [8]                 │
│                                                         │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Monday - Upper Body                                  ││
│ │ ───────────────────────────────────────────────────  ││
│ │ 1. Barbell Bench Press - 3×8-12 @ 60kg • 90s rest   ││
│ │ 2. Dumbbell Rows - 4×10 @ 30kg • 60s rest           ││
│ │ 3. Overhead Press - 3×8-10 @ 40kg • 90s rest        ││
│ │ 4. Lateral Raises - 3×12-15 @ 12kg • 45s rest       ││
│ │ 5. Bicep Curls - 3×10-12 @ 15kg • 45s rest          ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Tuesday - Rest                                       ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Wednesday - Lower Body                               ││
│ │ ───────────────────────────────────────────────────  ││
│ │ 1. Barbell Squats - 4×8-10 @ 80kg • 120s rest       ││
│ │ 2. Romanian Deadlifts - 3×10 @ 60kg • 90s rest      ││
│ │ 3. Leg Press - 3×12-15 @ 100kg • 60s rest           ││
│ │ 4. Leg Curls - 3×10-12 @ 40kg • 45s rest            ││
│ │ 5. Calf Raises - 4×15-20 @ 60kg • 45s rest          ││
│ │ 6. Planks - 3×60s • 30s rest                        ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ ... (more days)                                         │
│                                                         │
│ [Duplicate Programme] [Set as Active]                   │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Read-only view of entire programme
- Week selector to view different weeks
- Shows all days and exercises in expandable cards
- "Edit" button → Opens Programme Builder (Phase 2)
- "Duplicate" → Creates copy
- "Set as Active" → Makes this the active programme

**Acceptance Criteria:**
- ✅ Programme detail view displays all weeks, days, exercises
- ✅ Week selector switches between weeks
- ✅ Exercise details readable (sets, reps, weight, rest, RPE, notes)
- ✅ "Edit" button opens Programme Builder
- ✅ "Duplicate" creates copy successfully
- ✅ "Set as Active" updates active programme

---

## Testing Checklist

### Unit Tests
- [ ] `useProgrammes()` fetches user programmes
- [ ] `useCreateProgramme()` creates programme and deactivates others if `is_active=true`
- [ ] `useUpdateProgramme()` updates programme details
- [ ] RLS policies enforce user can only access own programmes
- [ ] Deleting programme soft-deletes (sets `deleted_at`)

### Integration Tests
- [ ] Create programme flow: Modal → Form → Submit → Redirect to builder
- [ ] Programme builder: Add exercises → Save → Persist to database
- [ ] Exercise selector: Search → Filter → Select → Configure → Add
- [ ] Drag-and-drop reordering updates `order_index` correctly
- [ ] Copy/Paste Week duplicates all days and exercises
- [ ] Set Active Programme: Only one programme active at a time
- [ ] Programme syncs to iOS within 30 seconds

### Edge Cases
- [ ] Empty programme (no exercises): Shows empty state
- [ ] Maximum exercises (100+ per day): Pagination or scroll
- [ ] Very long programme (52 weeks): Week selector scrollable
- [ ] Invalid exercise configuration: Shows validation errors
- [ ] Network error during save: Retry mechanism or error message

---

## Rollout Plan

### Pre-Deployment
1. **Database Setup:**
   - Apply RLS policies to `programmes`, `programme_days`, `workout_items`
   - Verify `exercise_id` foreign key exists on `workout_items`

2. **Code Review:**
   - Review programme list and creation flow
   - Review programme builder UI
   - Review exercise selector and configuration
   - Review iOS sync integration

### Deployment
1. **Backend First:**
   - Deploy RLS policies
   - Verify table constraints

2. **Web App:**
   - Deploy programme pages (list, create, builder, view)
   - Test on staging environment

3. **iOS App:**
   - No changes needed (sync already implemented)
   - Test that programmes sync correctly

### Post-Deployment Monitoring
- Monitor programme creation rate
- Track sync errors (web → iOS)
- Collect user feedback on builder UX

---

## Success Metrics

- **Programme creation time:** <2 minutes to create 4-week programme with 4 sessions/week
- **Exercise addition:** <30 seconds to add exercise with configuration
- **iOS sync time:** <30 seconds from web creation to iOS display
- **Programme completion rate:** Track % of programmes users complete

---

## Future Enhancements (Out of Scope)

- **Programme templates marketplace:** Share/sell programmes
- **Auto-progression:** Automatically increase weight based on performance
- **Deload weeks:** Built-in deload week templates
- **Exercise substitutions:** Suggest alternatives if gym lacks equipment
- **Rest day activities:** Add cardio, stretching, mobility to rest days
- **Programme analytics:** Volume trends, adherence tracking

---

## Related Documentation

- **iOS Exercise Data Import Brief:** `brief-2025-01-03-ios-exercise-data-import.md`
- **Web UI Exercise Library Brief:** `brief-2025-01-03-web-exercise-library.md`
- **Web UI Tech Stack:** `TECH_STACK.md`
- **iOS Tech Stack:** `IOS_TECH_STACK.md`

---

**END OF BRIEF**
