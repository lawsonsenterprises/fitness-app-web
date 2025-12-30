# Implementation Plan: HealthKit Data Integration

**Date:** 2025-12-30
**Branch:** `feat/healthkit-data-integration`
**Standard:** APPLE++

---

## Overview

Integrate real HealthKit data throughout the web UI, replacing demo/mock data with live health metrics from iOS. This transforms the platform into a comprehensive health monitoring solution for both athletes and coaches.

---

## Database Tables (Already Exist)

| Table | Purpose |
|-------|---------|
| `daily_readiness_summaries` | Strain, recovery, sleep scores, steps, calories, exercise mins, weight |
| `daily_sleep_summaries` | Sleep duration, quality, phases (REM/deep/light/awake), sleep bank |
| `daily_recovery_summaries` | HRV, resting HR, respiratory rate, SpO2, wrist temperature |
| `daily_workouts` | Workout type, duration, calories, HR data, distance |

---

## Implementation Phases

### Phase 1: React Query Hooks (Foundation)

Create data fetching hooks that will be used throughout the application.

| Hook | Location | Purpose |
|------|----------|---------|
| `useTodaysReadiness` | `hooks/athlete/use-todays-readiness.ts` | Fetch today's readiness data |
| `useSleepData` | `hooks/athlete/use-sleep-data.ts` | Fetch sleep summaries (configurable days) |
| `useRecoveryData` | `hooks/athlete/use-recovery-data.ts` | Fetch recovery metrics (HRV, HR, etc.) |
| `useHealthKitWorkouts` | `hooks/athlete/use-healthkit-workouts.ts` | Fetch workout history |
| `useWeightTrends` | `hooks/athlete/use-weight-trends.ts` | Fetch weight data with date range |
| `useStrainRecovery` | `hooks/athlete/use-strain-recovery.ts` | Fetch strain vs recovery data |
| `useClientReadiness` | `hooks/coach/use-client-readiness.ts` | Coach: fetch client readiness |
| `useClientSleepData` | `hooks/coach/use-client-sleep-data.ts` | Coach: fetch client sleep |
| `useClientRecoveryData` | `hooks/coach/use-client-recovery-data.ts` | Coach: fetch client recovery |
| `useClientWorkouts` | `hooks/coach/use-client-workouts.ts` | Coach: fetch client workouts |

---

### Phase 2: Reusable Chart Components

Create professional, reusable chart components for health data visualisation.

| Component | File | Purpose |
|-----------|------|---------|
| `ReadinessGauge` | `components/shared/charts/readiness-gauge.tsx` | Circular gauge for readiness score |
| `SleepDurationChart` | `components/shared/charts/sleep-duration-chart.tsx` | Bar chart for sleep hours |
| `SleepQualityChart` | `components/shared/charts/sleep-quality-chart.tsx` | Line chart for sleep score |
| `SleepPhasesChart` | `components/shared/charts/sleep-phases-chart.tsx` | Stacked bar for sleep phases |
| `SleepBankChart` | `components/shared/charts/sleep-bank-chart.tsx` | Area chart for sleep debt/surplus |
| `HRVTrendChart` | `components/shared/charts/hrv-trend-chart.tsx` | Line chart with rolling average |
| `RestingHRChart` | `components/shared/charts/resting-hr-chart.tsx` | Line chart for resting heart rate |
| `RecoveryScoreChart` | `components/shared/charts/recovery-score-chart.tsx` | Area chart with colour zones |
| `StrainRecoveryChart` | `components/shared/charts/strain-recovery-chart.tsx` | Dual-line comparison chart |
| `WeightTrendChart` | `components/shared/charts/weight-trend-chart.tsx` | Line chart with moving average |
| `ActivitySummaryChart` | `components/shared/charts/activity-summary-chart.tsx` | Bar chart for exercise mins |

---

### Phase 3: Athlete Dashboard Update

**File:** `app/(athlete)/athlete/page.tsx`

#### Components to Add/Update:

1. **Today's Readiness Section**
   - Large circular gauge showing `recovery_score` (0-100)
   - Colour-coded by `overall_readiness_band` (optimal/moderate/low)
   - Breakdown cards: Sleep Score, Strain (converted to %), Recovery
   - Mode badge: "Training Day" or "Rest Day"

2. **Today's Activity Stats**
   - Steps progress bar (with target)
   - Active Energy (kcal)
   - Exercise Minutes

3. **Recent Workouts**
   - Last 5 workouts from `daily_workouts`
   - Type, Duration, Calories, Date
   - Expandable for full details

---

### Phase 4: Athlete Recovery Page

**File:** `app/(athlete)/athlete/recovery/page.tsx`

#### Sections to Build:

1. **Readiness Overview** (reuse gauge component)

2. **Sleep Analysis**
   - Sleep Duration Chart (30 days)
   - Sleep Quality Chart (30 days)
   - Sleep Phases Breakdown (7 days)
   - Sleep Bank Trend (30 days)
   - Stats: Avg Duration, Avg Score, Consistency, Bank Status

3. **HRV & Recovery Metrics**
   - HRV Trend (30 days with 7-day rolling avg)
   - Resting HR Trend (30 days)
   - Recovery Score Trend (30 days)
   - Additional: Respiratory Rate, SpO2, Wrist Temp
   - Stats: Current HRV, 7-day Avg, Trend, Current RHR

4. **Strain Monitoring**
   - Strain vs Recovery Chart (7 days)
   - Training day indicators
   - Recovery alerts (if strain > recovery for 3+ days)

---

### Phase 5: Athlete Training Page

**File:** `app/(athlete)/athlete/training/page.tsx`

#### Additions:

1. **HealthKit Workouts Section**
   - Data table with: Date, Type, Name, Duration, Calories, Avg HR, Max HR, Distance
   - Row click to expand details
   - Filter by workout type
   - Date range selector

2. **Workout Detail Modal**
   - Full workout details
   - Start/end times
   - Source app
   - HR stats, distance, calories

3. **Weekly Activity Summary**
   - Total Steps, Active Energy, Exercise Mins
   - Workouts Completed count
   - Exercise minutes per day chart (7 days)

---

### Phase 6: Athlete Progress Page

**File:** `app/(athlete)/athlete/progress/page.tsx`

#### Updates:

1. **Weight Trends (Enhanced)**
   - Fetch from `daily_readiness_summaries.weight_kg`
   - Date range: 1m, 3m, 6m, 1y, all
   - 7-day moving average line
   - Goal weight indicator
   - Stats: Current, Starting, Change, Weekly Avg Change

2. **Body Composition Context**
   - Multi-line chart: Weight vs Exercise Minutes
   - Show relationship between activity and weight

---

### Phase 7: Coach Client Overview

**File:** `app/(dashboard)/clients/[clientId]/overview/page.tsx`

#### Additions:

1. **Readiness Card**
   - Gauge showing client's `recovery_score`
   - Readiness band indicator
   - Sleep, Strain, Recovery breakdown
   - Last updated time

2. **Activity Card**
   - Today's steps
   - Active energy
   - Exercise minutes

---

### Phase 8: Coach Health Tab (New)

**File:** `app/(dashboard)/clients/[clientId]/health/page.tsx` (NEW)

#### Sections:

1. **Readiness Overview (30 days)**
   - Daily recovery score chart
   - Colour-coded by readiness band
   - Training day annotations

2. **Sleep Analysis**
   - All 4 sleep charts from athlete view
   - Sleep stats

3. **HRV & Recovery Trends**
   - HRV trend with rolling average
   - Resting HR trend
   - Recovery score trend
   - Additional metrics (respiratory, SpO2, temp)

4. **Strain vs Recovery**
   - 14-day dual-line chart
   - Imbalance highlighting
   - Coach insights

5. **Workout Summary**
   - Total workouts (week/month)
   - Avg duration, calories
   - Workout type distribution (pie chart)

6. **Activity Trends**
   - Steps trend (30 days)
   - Exercise minutes trend
   - Active energy trend

---

### Phase 9: RLS Policies

**File:** `supabase/migrations/XXXXXX_healthkit_rls_policies.sql`

Ensure:
- Athletes can view own data (all 4 tables)
- Coaches can view client data via `coach_clients` relationship
- Admins can view all data

---

### Phase 10: Type Definitions

**File:** `types/healthkit.ts`

Define TypeScript interfaces for:
- `DailyReadinessSummary`
- `DailySleepSummary`
- `DailyRecoverySummary`
- `DailyWorkout`

---

## Implementation Order

1. ✅ Create feature branch
2. [ ] Create TypeScript type definitions
3. [ ] Create React Query hooks (athlete)
4. [ ] Create React Query hooks (coach)
5. [ ] Create ReadinessGauge component
6. [ ] Create all sleep chart components
7. [ ] Create all HRV/recovery chart components
8. [ ] Create strain/recovery chart component
9. [ ] Create weight trend chart component
10. [ ] Create activity summary chart
11. [ ] Update Athlete Dashboard with real data
12. [ ] Rebuild Athlete Recovery page with real data
13. [ ] Update Athlete Training page with workouts
14. [ ] Update Athlete Progress page with weight data
15. [ ] Add readiness to Coach Client Overview
16. [ ] Create new Coach Health tab
17. [ ] Create RLS migration
18. [ ] Test athlete data access
19. [ ] Test coach data access
20. [ ] Final polish and responsiveness

---

## Quality Standards (APPLE++)

### Visual Design
- Medical-grade professional appearance
- Smooth chart animations
- Colour accessibility (green/amber/red for status)
- Clear data hierarchy
- Responsive on all devices

### Data Presentation
- No raw data dumps - always insights
- Rolling averages for noise reduction
- Clear labels with units
- Helpful tooltips
- Empty states with guidance

### Performance
- React Query caching
- Skeleton loading states
- No unnecessary re-renders
- Smooth chart transitions

### British English
- Metres, colour, optimised
- UK date formats (DD/MM/YYYY)

---

## Files to Create

```
hooks/
  athlete/
    use-todays-readiness.ts
    use-sleep-data.ts
    use-recovery-data.ts
    use-healthkit-workouts.ts
    use-weight-trends.ts
    use-strain-recovery.ts
    index.ts
  coach/
    use-client-readiness.ts
    use-client-sleep-data.ts
    use-client-recovery-data.ts
    use-client-workouts.ts
    use-client-strain-recovery.ts
    use-client-weight-trends.ts
    index.ts

components/
  shared/
    charts/
      readiness-gauge.tsx
      sleep-duration-chart.tsx
      sleep-quality-chart.tsx
      sleep-phases-chart.tsx
      sleep-bank-chart.tsx
      hrv-trend-chart.tsx
      resting-hr-chart.tsx
      recovery-score-chart.tsx
      strain-recovery-chart.tsx
      weight-trend-chart.tsx
      activity-summary-chart.tsx
      workout-type-pie-chart.tsx
      index.ts

types/
  healthkit.ts

app/
  (dashboard)/
    clients/
      [clientId]/
        health/
          page.tsx

supabase/
  migrations/
    XXXXXX_healthkit_rls_policies.sql
```

---

## Files to Modify

```
app/(athlete)/athlete/page.tsx - Add readiness, activity, workouts
app/(athlete)/athlete/recovery/page.tsx - Complete rebuild with real data
app/(athlete)/athlete/training/page.tsx - Add HealthKit workouts section
app/(athlete)/athlete/training/programmes/page.tsx - May need updates
app/(athlete)/athlete/progress/page.tsx - Real weight data
app/(dashboard)/clients/[clientId]/overview/page.tsx - Add readiness card
app/(dashboard)/clients/[clientId]/layout.tsx - Add Health tab to navigation
```

---

## Estimated Complexity

| Phase | Complexity | Components |
|-------|------------|------------|
| 1. Hooks | Medium | 12 hooks |
| 2. Charts | High | 12 chart components |
| 3. Dashboard | Medium | 3 sections |
| 4. Recovery | High | 4 major sections |
| 5. Training | Medium | 3 sections |
| 6. Progress | Low | 2 sections |
| 7. Coach Overview | Low | 2 cards |
| 8. Coach Health | High | 6 sections |
| 9. RLS | Low | 8 policies |
| 10. Types | Low | 4 interfaces |

---

## Ready to Implement!

Proceeding with Phase 1: TypeScript types and React Query hooks.
