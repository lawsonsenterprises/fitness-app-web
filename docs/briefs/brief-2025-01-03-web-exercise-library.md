# Brief: Web UI Exercise Library & Custom Exercise Creation

**Date:** 2025-01-03  
**Project:** Synced Momentum Web UI  
**Target Platform:** Next.js 15, React 18, TypeScript  
**Related:** iOS Exercise Data Import (completed)  
**Status:** Ready for Implementation

---

## Overview

Build a comprehensive exercise library for the web platform that displays 1,731 MuscleWiki exercises, allows coaches and athletes to create custom exercises, and integrates with the programme builder for assigning exercises to clients.

**Core Requirements:**
- Display all exercises from Supabase `exercises` table
- Respect RLS visibility rules (MuscleWiki + user custom + coach custom)
- Allow coaches to create custom exercises with YouTube videos
- Allow athletes to create private custom exercises
- Implement video usage tracking across platforms (shared with iOS)
- Integrate with programme builder (coaches assign exercises to clients)

---

## Final Architecture - Confirmed

### Supabase `exercises` Table Contents

- **1,731 MuscleWiki exercises** (`is_custom = false`)
- **Athlete custom exercises** (private to creator)
- **Coach custom exercises** (visible to coach + ALL **active** clients)

### RLS Visibility Rules

| User Type              | Sees                                                     |
|------------------------|----------------------------------------------------------|
| Athlete (Free/Premium) | 1,731 MuscleWiki + Own custom exercises                  |
| Athlete (Has Coach)    | 1,731 MuscleWiki + Own custom + Coach's custom exercises |
| Coach                  | 1,731 MuscleWiki + Own custom exercises                  |

**Important:** Coach custom exercises only visible to clients with `status = 'active'` in `coach_clients` table.

### Tier-Based Video Access

| Tier       | Daily Limit | Video Type    |
|------------|-------------|---------------|
| Logger     | 3 previews  | MuscleWiki    |
| CoachBrain | 10 videos   | MuscleWiki    |
| CoachPay+  | 10 videos   | MuscleWiki    |
| All Tiers  | Unlimited   | YouTube       |

**Note:** YouTube videos do NOT count toward tier limits (no API cost).

---

## Phase 1: Exercise Library Display

### 1.1 Exercise Library Page

**Route:** `/athlete/training/exercises` (Athlete Portal)  
**Route:** `/dashboard/exercises` (Coach Portal)

**Page Structure:**

```
┌─────────────────────────────────────────┐
│ Exercise Library                [+ New] │ ← Only coaches see "+ New"
├─────────────────────────────────────────┤
│ [Search box...........................]  │
│                                         │
│ Filters:                                │
│ [All] [Chest] [Back] [Legs] [Arms]...   │ ← Muscle group pills
│ [All Equipment] ▼  [All Difficulty] ▼   │ ← Dropdowns
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💪 Barbell Bench Press              │ │
│ │ Equipment: Barbell | Difficulty: ⭐⭐│ │
│ │ Primary: Chest | Secondary: Arms    │ │
│ │ [Custom] ← Only if is_custom=true   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 💪 Dumbbell Rows                    │ │
│ │ Equipment: Dumbbell | Difficulty: ⭐⭐│ │
│ │ Primary: Back | Secondary: Arms     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Load More] ← Pagination                │
└─────────────────────────────────────────┘
```

**Features:**
- Search by exercise name (debounced, 300ms)
- Filter by muscle group (abs, chest, back, shoulders, arms, legs, glutes, calves)
- Filter by equipment (barbell, dumbbell, bodyweight, cable, machine, other)
- Filter by difficulty (beginner, intermediate, advanced)
- Pagination (50 exercises per page)
- "Custom" badge for user-created exercises
- Click exercise → Opens detail modal

### 1.2 Exercise Detail Modal

**Triggered by:** Clicking any exercise in the list

**Modal Structure:**

```
┌─────────────────────────────────────────┐
│ Barbell Bench Press              [X]    │
├─────────────────────────────────────────┤
│                                         │
│ [Video Player]                          │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │   ▶️  Play Video                    │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Primary Muscle: Chest                   │
│ Secondary Muscles: Shoulders, Triceps   │
│ Equipment: Barbell                      │
│ Difficulty: ⭐⭐ Intermediate            │
│                                         │
│ Instructions:                           │
│ 1. Lie flat on bench                    │
│ 2. Grip bar slightly wider than...     │
│ 3. Lower bar to chest                   │
│ 4. Press up explosively                 │
│                                         │
│ [Add to Programme] ← Coach only         │
└─────────────────────────────────────────┘
```

**Video Player Logic:**
- **MuscleWiki exercises:** Check tier limits, show "Preview available" or "Tap to play"
- **Custom exercises (YouTube):** Embed YouTube iframe, no tier limits
- Track video plays in `video_usage_tracking` table

### 1.3 Data Fetching Hook

**File:** `hooks/use-exercises.ts`

```typescript
export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const supabase = createClient()
      
      // RLS automatically filters based on user role
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true })
      
      if (error) throw error
      return data
    }
  })
}

export function useExerciseById(id: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
  })
}
```

**Acceptance Criteria:**
- ✅ Exercise library page displays all exercises visible to user (RLS enforced)
- ✅ Search filters exercises by name (client-side or server-side)
- ✅ Muscle group filter works
- ✅ Equipment and difficulty filters work
- ✅ Custom exercises show "Custom" badge
- ✅ Clicking exercise opens detail modal
- ✅ Video player shows MuscleWiki or YouTube video based on exercise type
- ✅ Pagination loads 50 exercises at a time

---

## Phase 2: Video Usage Tracking (Cross-Platform)

### 2.1 Video Usage Tracking Table

**Create Supabase table:** `video_usage_tracking`

```sql
CREATE TABLE video_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  video_type TEXT NOT NULL CHECK (video_type IN ('musclewiki', 'youtube')),
  watched_at TIMESTAMPTZ DEFAULT now(),
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'web')),
  
  -- Index for daily limit queries
  CONSTRAINT unique_video_per_day UNIQUE (user_id, exercise_id, DATE(watched_at))
);

-- Index for fast daily count queries
CREATE INDEX idx_video_usage_user_date 
  ON video_usage_tracking(user_id, DATE(watched_at));

-- Index for global daily limit
CREATE INDEX idx_video_usage_date 
  ON video_usage_tracking(DATE(watched_at));

-- RLS: Users can only see their own usage
ALTER TABLE video_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON video_usage_tracking FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own usage"
  ON video_usage_tracking FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

### 2.2 Video Limit Checking Service

**File:** `lib/video-limits.ts`

```typescript
const TIER_LIMITS = {
  logger: 3,
  coachBrain: 10,
  coachPayPlus: 10
}

const GLOBAL_DAILY_LIMIT = 80

export async function canWatchVideo(
  userId: string, 
  tier: 'logger' | 'coachBrain' | 'coachPayPlus',
  videoType: 'musclewiki' | 'youtube'
): Promise<{ canWatch: boolean; reason?: string }> {
  // YouTube videos always allowed (no API cost)
  if (videoType === 'youtube') {
    return { canWatch: true }
  }
  
  const supabase = createClient()
  
  // Check user's daily usage
  const today = new Date().toISOString().split('T')[0]
  
  const { count: userCount } = await supabase
    .from('video_usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('video_type', 'musclewiki')
    .gte('watched_at', `${today}T00:00:00Z`)
    .lte('watched_at', `${today}T23:59:59Z`)
  
  const userLimit = TIER_LIMITS[tier]
  
  if (userCount >= userLimit) {
    return { 
      canWatch: false, 
      reason: 'You have reached your daily video limit. Existing cached videos still play.' 
    }
  }
  
  // Check global daily limit
  const { count: globalCount } = await supabase
    .from('video_usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('video_type', 'musclewiki')
    .gte('watched_at', `${today}T00:00:00Z`)
    .lte('watched_at', `${today}T23:59:59Z`)
  
  if (globalCount >= GLOBAL_DAILY_LIMIT) {
    return { 
      canWatch: false, 
      reason: 'We are pausing new video downloads today. You can still use the written steps below.' 
    }
  }
  
  return { canWatch: true }
}

export async function trackVideoWatch(
  userId: string,
  exerciseId: string,
  videoType: 'musclewiki' | 'youtube',
  platform: 'ios' | 'web'
): Promise<void> {
  const supabase = createClient()
  
  await supabase
    .from('video_usage_tracking')
    .insert({
      user_id: userId,
      exercise_id: exerciseId,
      video_type: videoType,
      platform: platform
    })
}
```

### 2.3 Video Player Component

**File:** `components/shared/exercise-video-player.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { canWatchVideo, trackVideoWatch } from '@/lib/video-limits'

interface ExerciseVideoPlayerProps {
  exerciseId: string
  videoUrl: string
  videoType: 'musclewiki' | 'youtube'
  tier: 'logger' | 'coachBrain' | 'coachPayPlus'
}

export function ExerciseVideoPlayer({
  exerciseId,
  videoUrl,
  videoType,
  tier
}: ExerciseVideoPlayerProps) {
  const { user } = useAuth()
  const [canPlay, setCanPlay] = useState<boolean | null>(null)
  const [limitMessage, setLimitMessage] = useState<string>('')
  const [hasPlayed, setHasPlayed] = useState(false)
  
  const handlePlay = async () => {
    if (hasPlayed) return // Already tracked
    
    const result = await canWatchVideo(user.id, tier, videoType)
    
    if (!result.canWatch) {
      setCanPlay(false)
      setLimitMessage(result.reason)
      return
    }
    
    setCanPlay(true)
    setHasPlayed(true)
    
    // Track the play
    await trackVideoWatch(user.id, exerciseId, videoType, 'web')
  }
  
  if (videoType === 'youtube') {
    return (
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        />
      </div>
    )
  }
  
  // MuscleWiki video with tier limits
  return (
    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
      {canPlay === null && (
        <button
          onClick={handlePlay}
          className="flex flex-col items-center gap-2"
        >
          <PlayIcon className="h-12 w-12" />
          <span className="text-sm">
            {tier === 'logger' ? 'Preview available' : 'Tap to play'}
          </span>
        </button>
      )}
      
      {canPlay === false && (
        <div className="text-center p-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 text-amber-500" />
          <p className="text-sm text-muted-foreground">{limitMessage}</p>
        </div>
      )}
      
      {canPlay === true && (
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full rounded-lg"
        />
      )}
    </div>
  )
}

function extractYouTubeId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : ''
}
```

**Acceptance Criteria:**
- ✅ `video_usage_tracking` table created with RLS policies
- ✅ Video limit checking works (Logger=3, Premium=10)
- ✅ Global daily limit enforced (80 videos/day across all users)
- ✅ YouTube videos bypass tier limits
- ✅ Video plays tracked on button click (before video loads)
- ✅ Usage shared between iOS and web (same table)

---

## Phase 3: Custom Exercise Creation

### 3.1 Create Custom Exercise Form

**Route:** `/dashboard/exercises/new` (Coach Portal)  
**Route:** `/athlete/training/exercises/new` (Athlete Portal)

**Form Structure:**

```
┌─────────────────────────────────────────┐
│ Create Custom Exercise          [X]     │
├─────────────────────────────────────────┤
│                                         │
│ Exercise Name *                         │
│ [...................................]   │
│                                         │
│ Primary Muscle Group *                  │
│ [Dropdown: Chest ▼]                     │
│                                         │
│ Secondary Muscle Groups                 │
│ [☑ Shoulders] [☐ Triceps] [☐ Back]     │
│                                         │
│ Equipment *                             │
│ [Dropdown: Barbell ▼]                   │
│                                         │
│ Difficulty *                            │
│ [Dropdown: Intermediate ▼]              │
│                                         │
│ YouTube Video URL                       │
│ [...................................]   │
│ Optional: Add a YouTube link            │
│                                         │
│ Instructions *                          │
│ [...................................]   │
│ [...................................]   │
│ [...................................]   │
│ Step-by-step instructions (one per line)│
│                                         │
│ [Cancel]                    [Create]    │
└─────────────────────────────────────────┘
```

**Validation Rules:**
- Exercise name: Required, 3-100 characters
- Primary muscle: Required, must be valid muscle group
- Equipment: Required, must be valid equipment type
- Difficulty: Required, must be beginner/intermediate/advanced
- YouTube URL: Optional, must be valid YouTube URL format
- Instructions: Required, minimum 10 characters

### 3.2 Create Exercise Server Action

**File:** `app/actions/create-custom-exercise.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createExerciseSchema = z.object({
  name: z.string().min(3).max(100),
  primaryMuscle: z.enum(['abs', 'chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'calves']),
  secondaryMuscles: z.array(z.string()).optional(),
  equipment: z.enum(['barbell', 'dumbbell', 'bodyweight', 'cable', 'machine', 'other']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  youtubeUrl: z.string().url().optional(),
  instructions: z.string().min(10)
})

export async function createCustomExercise(formData: FormData) {
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }
  
  // Validate input
  const validatedFields = createExerciseSchema.safeParse({
    name: formData.get('name'),
    primaryMuscle: formData.get('primaryMuscle'),
    secondaryMuscles: formData.getAll('secondaryMuscles'),
    equipment: formData.get('equipment'),
    difficulty: formData.get('difficulty'),
    youtubeUrl: formData.get('youtubeUrl') || undefined,
    instructions: formData.get('instructions')
  })
  
  if (!validatedFields.success) {
    return { error: 'Invalid input', details: validatedFields.error.flatten() }
  }
  
  const data = validatedFields.data
  
  // Insert custom exercise
  const { data: exercise, error } = await supabase
    .from('exercises')
    .insert({
      name: data.name,
      primary_muscle: data.primaryMuscle,
      secondary_muscles: data.secondaryMuscles || [],
      equipment: data.equipment,
      difficulty: data.difficulty,
      youtube_url: data.youtubeUrl,
      instructions: data.instructions,
      is_custom: true,
      created_by_user_id: user.id
    })
    .select()
    .single()
  
  if (error) {
    return { error: 'Failed to create exercise', details: error.message }
  }
  
  // Revalidate exercise library
  revalidatePath('/dashboard/exercises')
  revalidatePath('/athlete/training/exercises')
  
  return { success: true, exercise }
}
```

### 3.3 Create Exercise Page Components

**File:** `app/(dashboard)/dashboard/exercises/new/page.tsx` (Coach)  
**File:** `app/(athlete)/athlete/training/exercises/new/page.tsx` (Athlete)

Use shadcn/ui components:
- `Form` (react-hook-form + Zod)
- `Input` for text fields
- `Select` for dropdowns
- `Textarea` for instructions
- `Button` for submit
- `Label` for field labels

**Acceptance Criteria:**
- ✅ Coaches can access "Create Custom Exercise" page
- ✅ Athletes can access "Create Custom Exercise" page
- ✅ Form validates all required fields
- ✅ YouTube URL validation works (optional field)
- ✅ Form submits to `createCustomExercise` server action
- ✅ Success: Exercise appears in library immediately
- ✅ Error: Shows validation errors inline
- ✅ RLS enforces: Only creator can see their custom exercise (except coaches → active clients)

---

## Phase 4: Programme Builder Integration (Coach Only)

### 4.1 Add Exercise to Programme Flow

**Context:** When coach is building a programme, they need to add exercises

**Flow:**
1. Coach opens Programme Editor
2. Coach clicks "Add Exercise" for a specific day/session
3. Exercise selector modal opens (shows all visible exercises)
4. Coach searches/filters exercises
5. Coach clicks exercise → Configure sets/reps/weight
6. Coach saves → Exercise added to programme

**Exercise Selector Modal:**

```
┌─────────────────────────────────────────┐
│ Add Exercise to Day 1: Push          [X]│
├─────────────────────────────────────────┤
│ [Search exercises...................]   │
│ [All] [Chest] [Back] [Legs]...          │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ☐ Barbell Bench Press               │ │
│ │    Equipment: Barbell | Diff: ⭐⭐   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ☐ Dumbbell Flyes                    │ │
│ │    Equipment: Dumbbell | Diff: ⭐⭐  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Selected: 2 exercises                   │
│ [Cancel]               [Add Selected]   │
└─────────────────────────────────────────┘
```

### 4.2 Exercise Configuration Modal

**After selecting exercises, configure workout parameters:**

```
┌─────────────────────────────────────────┐
│ Configure: Barbell Bench Press      [X] │
├─────────────────────────────────────────┤
│                                         │
│ Sets *                                  │
│ [3....] sets                            │
│                                         │
│ Reps *                                  │
│ [8-12] reps (e.g., "8-12" or "10")     │
│                                         │
│ Target Weight (optional)                │
│ [....] kg                               │
│                                         │
│ Rest Period                             │
│ [90...] seconds                         │
│                                         │
│ RPE Target (optional)                   │
│ [8....] / 10                            │
│                                         │
│ Coach Notes (optional)                  │
│ [...................................]   │
│ [...................................]   │
│                                         │
│ [Cancel]                      [Add]     │
└─────────────────────────────────────────┘
```

### 4.3 Programme Workout Items Table

**Update existing `programme_workout_items` table to reference exercises:**

```sql
-- Assuming this table already exists (from TECH_STACK.md: workout_items)
-- Add foreign key to exercises table

ALTER TABLE workout_items
ADD COLUMN exercise_id UUID REFERENCES exercises(id);

-- Allow NULL temporarily for legacy data
-- Future: Make NOT NULL after migration
```

**Acceptance Criteria:**
- ✅ Exercise selector modal shows all exercises (MuscleWiki + custom)
- ✅ Coach can search/filter exercises in selector
- ✅ Coach can select multiple exercises
- ✅ Exercise configuration modal allows setting sets/reps/weight/rest/RPE/notes
- ✅ Exercises added to programme are saved in `workout_items` table with `exercise_id`
- ✅ Programme detail view shows exercise name, sets, reps, etc.
- ✅ Athletes see assigned exercises in iOS app (synced via Supabase)

---

## Testing Checklist

### Unit Tests
- [ ] `useExercises()` hook fetches exercises from Supabase
- [ ] RLS policies enforce visibility (MuscleWiki + user custom + coach custom for active clients)
- [ ] `canWatchVideo()` respects tier limits (3/10/10)
- [ ] `canWatchVideo()` returns true for YouTube videos (no limit)
- [ ] `trackVideoWatch()` inserts record into `video_usage_tracking`
- [ ] `createCustomExercise()` validates all fields
- [ ] `createCustomExercise()` inserts exercise with `is_custom=true`

### Integration Tests
- [ ] Exercise library page loads all exercises
- [ ] Search filters exercises by name
- [ ] Muscle group filter works
- [ ] Equipment and difficulty filters work
- [ ] Custom exercises show "Custom" badge
- [ ] Clicking exercise opens detail modal
- [ ] MuscleWiki video player checks tier limits before playing
- [ ] YouTube video player embeds iframe without limits
- [ ] Video usage tracked on play (before video loads)
- [ ] Create custom exercise form validates input
- [ ] Create custom exercise form submits successfully
- [ ] Custom exercise appears in library after creation
- [ ] Coach custom exercises visible to active clients
- [ ] Athlete custom exercises private to creator

### Edge Cases
- [ ] No exercises: Empty state with "No exercises found"
- [ ] Network error: Show error message, retry button
- [ ] Tier limit reached: Show appropriate message, prevent video play
- [ ] Global limit reached: Show global limit message
- [ ] Invalid YouTube URL: Show validation error
- [ ] Duplicate exercise name: Allow (no uniqueness constraint on name)
- [ ] Soft-deleted exercises: Excluded from results

---

## Rollout Plan

### Pre-Deployment
1. **Supabase Setup:**
   - `video_usage_tracking` table already created (from iOS brief)
   - Verify RLS policies on `exercises` table (from iOS brief)

2. **Code Review:**
   - Review exercise library components
   - Review custom exercise creation form
   - Review video player with tier limits
   - Review programme builder integration

### Deployment
1. **Backend First:**
   - Deploy `video_usage_tracking` table (if not already deployed)
   - Verify exercises table has 1,731 MuscleWiki exercises

2. **Web App:**
   - Deploy exercise library pages
   - Deploy custom exercise creation
   - Deploy programme builder integration
   - Test on staging environment

### Post-Deployment Monitoring
- Monitor video usage across platforms (iOS + web)
- Track tier limit hits (should see 3/10/10 limits enforced)
- Monitor RapidAPI quota (should stay well under 3,000/month due to caching)
- Collect user feedback on exercise library UX

---

## Success Metrics

- **Exercise browsing:** <500ms page load time for 1,731 exercises
- **Search performance:** <100ms to filter exercises by name
- **Video loading:** <2s for MuscleWiki videos (Supabase bucket cache)
- **Custom exercise creation:** <1s from submit to library refresh
- **Programme builder:** Coach can add exercise to programme in <30s

---

## Future Enhancements (Out of Scope)

- **Exercise history:** Track which exercises athlete has performed
- **Exercise recommendations:** AI-powered "similar alternatives"
- **Exercise favouriting:** Star exercises for quick access
- **Exercise analytics:** Most popular exercises, completion rates
- **Custom muscle group heatmaps:** Visual representation of muscles worked
- **Video thumbnails:** Generate thumbnails for MuscleWiki videos

---

## Related Documentation

- **iOS Exercise Data Import Brief:** `brief-2025-01-03-ios-exercise-data-import.md`
- **MuscleWiki API Documentation:** https://musclewiki-api.p.rapidapi.com/
- **3-Tier Video Caching Architecture:** (iOS implementation)
- **Tier System Documentation:** (iOS implementation)
- **Web UI Tech Stack:** `TECH_STACK.md`
- **Web UI Documentation:** `UI_DOCUMENTATION.md`

---

**END OF BRIEF**
