# Brief: Add Exercise Library to Athlete Navigation

**Date:** 2025-01-03  
**Project:** Synced Momentum Web UI  
**Target Platform:** Next.js 15, React 18, TypeScript  
**Related:** Web UI Exercise Library (completed)  
**Status:** Ready for Implementation

---

## Overview

Add "Exercise Library" navigation link to the athlete sidebar under the Training section, enabling users to access the newly implemented exercise library at `/athlete/training/exercises`.

---

## Current State

**Athlete Sidebar Navigation (from screenshot):**
```
- Dashboard
- Training (current active page)
- Nutrition
- Blood Work
- Check-ins
- Progress
- Recovery
- Messages
- Settings
```

**Problem:** No way to access the Exercise Library page (`/athlete/training/exercises`) from the UI.

---

## Required Changes

### Update Athlete Sidebar Navigation

**File:** `app/(athlete)/athlete/layout.tsx` or similar navigation component

**Add nested "Exercise Library" link under Training:**

```
- Dashboard
- Training
  ├─ Overview (existing page at /athlete/training)
  └─ Exercise Library ← NEW (links to /athlete/training/exercises)
- Nutrition
- Blood Work
- Check-ins
- Progress
- Recovery
- Messages
- Settings
```

**Behaviour:**
- When user is on `/athlete/training` → "Training" is highlighted, "Overview" sub-item shown
- When user is on `/athlete/training/exercises` → "Training" is highlighted, "Exercise Library" sub-item shown
- Clicking "Training" in sidebar should toggle expand/collapse of sub-items
- Default state: Training section collapsed (unless user is on a Training page)

**Icon:**
- Use existing icon library (Lucide React)
- Suggested icon for "Exercise Library": `Dumbbell` or `Library` or `BookOpen`

---

## Implementation Details

### Navigation Structure

**Expected structure (if using nested navigation):**

```typescript
const athleteNavigation = [
  { name: 'Dashboard', href: '/athlete', icon: HomeIcon },
  { 
    name: 'Training', 
    icon: DumbbellIcon,
    items: [
      { name: 'Overview', href: '/athlete/training' },
      { name: 'Exercise Library', href: '/athlete/training/exercises' }
    ]
  },
  { name: 'Nutrition', href: '/athlete/nutrition', icon: AppleIcon },
  // ... rest of navigation
]
```

**If sidebar doesn't support nested items currently:**
- Add "Exercise Library" as a top-level item (less ideal but acceptable)
- Place it directly after "Training"
- Use `Library` or `BookOpen` icon

---

## Acceptance Criteria

- ✅ "Exercise Library" link appears in athlete sidebar
- ✅ Link is visually nested under "Training" (if sidebar supports nested nav)
- ✅ Clicking link navigates to `/athlete/training/exercises`
- ✅ Active state highlights "Exercise Library" when on `/athlete/training/exercises`
- ✅ Active state highlights "Training" parent when on any `/athlete/training/*` route
- ✅ Responsive: Navigation works on mobile (hamburger menu)

---

## Testing Checklist

- [ ] Athlete can see "Exercise Library" in sidebar
- [ ] Clicking "Exercise Library" navigates to correct URL
- [ ] Active state highlights correctly on `/athlete/training/exercises`
- [ ] Parent "Training" remains highlighted when on Exercise Library page
- [ ] Navigation works on mobile viewport
- [ ] Navigation works for all athlete roles (Free, Premium, Coached)

---

## Design Notes

**Follow existing navigation patterns:**
- Use same font size, spacing, padding as other nav items
- Use same hover states and active states
- Use same icon size and colour scheme
- Maintain consistency with existing sidebar design

**If nested navigation is new:**
- Add subtle indentation for nested items (e.g., `pl-8` or `ml-4`)
- Consider collapse/expand icon (chevron) next to "Training"
- Ensure nested items are visually subordinate to parent

---

## Rollout

**Deployment:**
- Simple navigation update, no database changes
- Deploy to production immediately after testing
- No feature flag needed

**Monitoring:**
- Check analytics: Are users finding the Exercise Library?
- Monitor 404 errors: Ensure no broken links

---

**END OF BRIEF**
