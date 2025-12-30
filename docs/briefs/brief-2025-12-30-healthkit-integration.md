# Brief for Claude Code: HealthKit Data Integration - Complete Web UI

**Date:** 2025-12-30  
**Project:** Synced Momentum - HealthKit Data Integration  
**Branch:** Create `feat/healthkit-data-integration`  
**Priority:** HIGH - This is gold dust for coaches and athletes

---

## Overview

Andy has added comprehensive HealthKit sync to the database. The web UI currently shows demo/placeholder data, but now we have REAL health data flowing from iOS:

- Daily readiness summaries (strain, recovery, sleep scores)
- Sleep analysis (REM, deep, light, awake phases)
- Recovery metrics (HRV, resting HR, respiratory rate, SpO2, wrist temperature)
- Workouts (type, duration, calories, heart rate, distance)
- Weight trends
- Steps, active energy, exercise minutes

**This data needs to be beautifully visualized in the web UI for both athletes and coaches.**

---

## Database Schema (Already Exists)

### Table: `daily_readiness_summaries`
- `user_id` - FK to profiles
- `date` - The day (DATE type)
- `strain_score` - 0-21 scale
- `recovery_score` - 0-100%
- `sleep_score` - 0-100%
- `overall_readiness_band` - "optimal", "moderate", "low"
- `mode` - "training_day" or "rest_day"
- `steps` - Step count
- `active_energy_kcal` - Active calories
- `exercise_minutes` - Exercise time
- `weight_kg` - Daily weight (nullable)

### Table: `daily_sleep_summaries`
- `user_id` - FK to profiles
- `date` - The night (DATE type)
- `time_asleep_minutes` - Total sleep
- `sleep_score` - 0-100%
- `rem_minutes` - REM phase
- `deep_minutes` - Deep phase
- `light_minutes` - Light phase
- `awake_minutes` - Awake time
- `sleep_start_time` - When fell asleep (TIMESTAMPTZ)
- `sleep_end_time` - When woke up (TIMESTAMPTZ)
- `sleep_bank_minutes` - Sleep debt/surplus

### Table: `daily_recovery_summaries`
- `user_id` - FK to profiles
- `date` - The day (DATE type)
- `recovery_score` - 0-100%
- `resting_hrv` - HRV in ms
- `resting_hr` - Resting HR in bpm
- `respiratory_rate` - Breaths per minute
- `oxygen_saturation` - SpO2 %
- `wrist_temperature` - Deviation in °C

### Table: `daily_workouts`
- `user_id` - FK to profiles
- `date` - Workout date (DATE)
- `workout_type` - "Traditional Strength Training", "Running", "Cycling", etc.
- `name` - Workout name (nullable)
- `duration_seconds` - Total duration
- `active_energy_kcal` - Calories burned
- `distance_meters` - Distance if applicable
- `avg_heart_rate` - Average HR
- `max_heart_rate` - Peak HR
- `source_name` - App that recorded
- `start_time` - Workout start (TIMESTAMPTZ)
- `end_time` - Workout end (TIMESTAMPTZ)
- `healthkit_uuid` - For deduplication

---

## Task 1: Update Athlete Dashboard (Today Tab)

**File:** `app/(athlete)/dashboard/page.tsx`

### Current Issues:
- Showing placeholder/demo readiness score
- No real HealthKit data

### Required Changes:

#### 1.1 Readiness Score Component
**File:** `components/athlete/dashboard/readiness-gauge.tsx`

**Fetch real data:**
```typescript
const { data: readiness } = useQuery({
  queryKey: ['readiness', 'today', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('daily_readiness_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single()
    
    if (error) throw error
    return data
  }
})
```

**Display:**
- Large circular gauge showing `recovery_score` (0-100)
- Colour-coded by `overall_readiness_band`:
  - "optimal" → Green (#10B981)
  - "moderate" → Yellow (#F59E0B)
  - "low" → Red (#EF4444)
- Breakdown cards below gauge:
  - Sleep Score: `sleep_score` / 100
  - Strain: `strain_score` / 21 (convert to %)
  - Recovery: `recovery_score` / 100
  - Mode badge: "Training Day" or "Rest Day" based on `mode`

#### 1.2 Today's Activity Stats
**Display real data from today's readiness:**
- Steps: `steps` with progress bar (target from athlete's goals)
- Active Energy: `active_energy_kcal` kcal
- Exercise Minutes: `exercise_minutes` min

#### 1.3 Recent Workouts
**Fetch from `daily_workouts`:**
```typescript
const { data: recentWorkouts } = useQuery({
  queryKey: ['workouts', 'recent', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('daily_workouts')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(5)
    
    if (error) throw error
    return data
  }
})
```

**Display:**
- Last 5 workouts
- Each showing: Type, Duration, Calories, Date
- Click to expand for full details (HR, distance, etc.)

---

## Task 2: Update Recovery Page

**File:** `app/(athlete)/recovery/page.tsx`

### 2.1 Current Readiness (from Task 1)
Reuse the readiness gauge component

### 2.2 Sleep Analysis Section

**Fetch last 30 days:**
```typescript
const { data: sleepData } = useQuery({
  queryKey: ['sleep', 'last-30-days', userId],
  queryFn: async () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data, error } = await supabase
      .from('daily_sleep_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  }
})
```

**Charts to create:**

**A) Sleep Duration Chart (Bar Chart)**
- X-axis: Dates (last 30 days)
- Y-axis: Hours of sleep
- Bars showing `time_asleep_minutes / 60`
- Target line (e.g., 8 hours)
- Colour-coded: <6h red, 6-7h yellow, 7-9h green, >9h blue

**B) Sleep Quality Chart (Line Chart)**
- X-axis: Dates
- Y-axis: Sleep score (0-100)
- Line showing `sleep_score`
- Shaded area under line
- Average line

**C) Sleep Phases Breakdown (Stacked Bar Chart)**
- X-axis: Dates (last 7 days for clarity)
- Y-axis: Minutes
- Stacked bars showing:
  - REM: `rem_minutes` (purple)
  - Deep: `deep_minutes` (blue)
  - Light: `light_minutes` (light blue)
  - Awake: `awake_minutes` (grey)

**D) Sleep Bank Trend (Area Chart)**
- X-axis: Dates
- Y-axis: Minutes (debt/surplus)
- Area showing `sleep_bank_minutes`
- Zero line
- Green above zero (surplus), red below (debt)

**Stats Cards:**
- Avg Sleep Duration (last 7 days): Calculate from data
- Avg Sleep Score: Calculate from `sleep_score`
- Sleep Consistency: How much sleep time varies
- Sleep Bank Status: Current `sleep_bank_minutes`

### 2.3 HRV & Recovery Metrics

**Fetch last 30 days:**
```typescript
const { data: recoveryData } = useQuery({
  queryKey: ['recovery', 'last-30-days', userId],
  queryFn: async () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data, error } = await supabase
      .from('daily_recovery_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  }
})
```

**Charts to create:**

**A) HRV Trend (Line Chart with Rolling Average)**
- X-axis: Dates
- Y-axis: HRV (ms)
- Two lines:
  - Daily HRV: `resting_hrv` (light line)
  - 7-day rolling average (bold line)
- Baseline reference line (athlete's average)

**B) Resting Heart Rate Trend**
- X-axis: Dates
- Y-axis: BPM
- Line showing `resting_hr`
- 7-day rolling average

**C) Recovery Score Trend**
- X-axis: Dates
- Y-axis: Recovery % (0-100)
- Area chart showing `recovery_score`
- Colour-coded zones: <60% red, 60-80% yellow, >80% green

**D) Additional Metrics (if available)**
- Respiratory Rate: Line chart of `respiratory_rate`
- SpO2: Line chart of `oxygen_saturation`
- Wrist Temperature: Line chart of `wrist_temperature` deviation

**Stats Cards:**
- Current HRV: Latest `resting_hrv`
- 7-day Avg HRV
- HRV Trend: ↑ Improving / ↓ Declining / → Stable
- Current Resting HR: Latest `resting_hr`
- Recovery Status: Based on `recovery_score`

### 2.4 Strain Monitoring

**Fetch strain from readiness:**
```typescript
const { data: strainData } = useQuery({
  queryKey: ['strain', 'last-7-days', userId],
  queryFn: async () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data, error } = await supabase
      .from('daily_readiness_summaries')
      .select('date, strain_score, recovery_score, mode')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  }
})
```

**Chart:**
- X-axis: Last 7 days
- Dual Y-axis:
  - Left: Strain (0-21)
  - Right: Recovery (0-100%)
- Two lines:
  - Strain: `strain_score` (red/orange)
  - Recovery: `recovery_score` (green/blue)
- Show relationship between strain and recovery
- Highlight training days vs rest days (from `mode`)

**Alerts:**
- If strain > recovery for 3+ consecutive days: "Consider a rest day"
- If recovery < 60% on training day: "Low recovery - reduce intensity"

---

## Task 3: Update Training Page

**File:** `app/(athlete)/training/page.tsx`

### 3.1 Add HealthKit Workouts Section

**Fetch workouts:**
```typescript
const { data: healthkitWorkouts } = useQuery({
  queryKey: ['healthkit-workouts', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('daily_workouts')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(20)
    
    if (error) throw error
    return data
  }
})
```

**Display:**

**Table:**
- Columns: Date, Type, Name, Duration, Calories, Avg HR, Max HR, Distance
- Click row to expand for details
- Filter by workout type
- Date range selector

**Workout Detail Modal:**
When row clicked, show:
- Full workout details
- Start/end times
- Heart rate graph (if available - may need to add HR samples table later)
- Distance (if applicable)
- Source (e.g., "Apple Watch", "Strava")
- Map (if GPS data available - future enhancement)

### 3.2 Weekly Activity Summary

**From `daily_readiness_summaries` for last 7 days:**
- Total Steps: Sum of `steps`
- Total Active Energy: Sum of `active_energy_kcal`
- Total Exercise Minutes: Sum of `exercise_minutes`
- Workouts Completed: Count from `daily_workouts`

**Chart:**
- Bar chart showing exercise minutes per day (last 7 days)
- Target line (from athlete's goals)

---

## Task 4: Update Progress Page

**File:** `app/(athlete)/progress/page.tsx`

### 4.1 Weight Trends (Enhanced)

**Fetch weight from readiness:**
```typescript
const { data: weightData } = useQuery({
  queryKey: ['weight', 'trends', userId, dateRange],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('daily_readiness_summaries')
      .select('date, weight_kg')
      .eq('user_id', userId)
      .not('weight_kg', 'is', null)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  }
})
```

**Chart:**
- Line chart with `weight_kg` over time
- Date range selector: 1 month, 3 months, 6 months, 1 year, all time
- Trend line (linear regression)
- Goal weight indicator (from athlete's goals)
- Weight change annotations (+/- since start)
- 7-day moving average line

**Stats:**
- Current Weight: Latest `weight_kg`
- Starting Weight: First weight in range
- Change: Difference
- Weekly Avg Change: Calculate weekly deltas

### 4.2 Body Composition Context

**If available from readiness data:**
- Correlate weight changes with:
  - Training volume (exercise_minutes)
  - Active energy expenditure
  - Step count trends

**Chart:**
- Multi-line chart:
  - Weight (primary Y-axis)
  - Exercise minutes (secondary Y-axis)
- Show relationship between activity and weight

---

## Task 5: Coach View Enhancements

**Files:**
- `app/(dashboard)/clients/[clientId]/overview/page.tsx`
- `app/(dashboard)/clients/[clientId]/health/page.tsx` (new tab)

### 5.1 Client Overview - Add Readiness

**Fetch client's latest readiness:**
```typescript
const { data: clientReadiness } = useQuery({
  queryKey: ['client-readiness', clientId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('daily_readiness_summaries')
      .select('*')
      .eq('user_id', clientId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single()
    
    if (error) throw error
    return data
  }
})
```

**Display on overview:**
- **Readiness Card:**
  - Gauge showing recovery_score
  - Band: optimal/moderate/low
  - Sleep, Strain, Recovery breakdown
  - Last updated time

- **Activity Card:**
  - Today's steps
  - Active energy
  - Exercise minutes

### 5.2 New Tab: Health & Recovery

**Route:** `app/(dashboard)/clients/[clientId]/health/page.tsx`

**This is GOLD for coaches - comprehensive health monitoring.**

**Sections:**

#### A) Readiness Overview (Last 30 Days)
- Chart showing daily recovery_score
- Colour-coded by readiness_band
- Annotations for training days vs rest days

#### B) Sleep Analysis
**Same charts as athlete view but for coach:**
- Sleep duration chart
- Sleep quality trend
- Sleep phases breakdown
- Sleep bank trend

**Why coaches need this:**
- Identify overtraining (poor sleep)
- Adjust training load based on sleep
- Monitor recovery capacity

#### C) HRV & Recovery Trends
**Same charts as athlete view:**
- HRV trend with rolling average
- Resting HR trend
- Recovery score trend
- Respiratory rate, SpO2, wrist temp

**Why coaches need this:**
- HRV indicates nervous system stress
- Declining HRV = overtraining risk
- Can adjust programme intensity
- Prevent injuries from overreach

#### D) Strain vs Recovery
**Chart:**
- Last 14 days
- Dual line: Strain vs Recovery
- Highlight imbalances

**Insights for coaches:**
- If strain consistently > recovery: Deload needed
- If recovery low on training days: Reduce volume
- If both optimal: Can push harder

#### E) Workout Summary
**From `daily_workouts`:**
- Total workouts this week/month
- Avg workout duration
- Avg calories per workout
- Workout type distribution (pie chart)

**Why coaches need this:**
- See if client doing extra cardio (affecting recovery)
- Monitor total training volume
- Ensure programme compliance

#### F) Activity Trends
**From readiness summaries:**
- Steps trend (last 30 days)
- Exercise minutes trend
- Active energy trend

**Why coaches need this:**
- Monitor NEAT (Non-Exercise Activity Thermogenesis)
- Adjust nutrition if activity changes dramatically
- Ensure client hitting step targets

---

## Task 6: Create React Query Hooks

**Create these hooks in `hooks/athlete/` and `hooks/coach/`:**

### Athlete Hooks
```typescript
// hooks/athlete/use-todays-readiness.ts
export function useTodaysReadiness(userId: string) {
  return useQuery({
    queryKey: ['readiness', 'today', userId],
    queryFn: async () => {
      // Fetch from daily_readiness_summaries
    }
  })
}

// hooks/athlete/use-sleep-data.ts
export function useSleepData(userId: string, days: number = 30) {
  return useQuery({
    queryKey: ['sleep', days, userId],
    queryFn: async () => {
      // Fetch from daily_sleep_summaries
    }
  })
}

// hooks/athlete/use-recovery-data.ts
export function useRecoveryData(userId: string, days: number = 30) {
  return useQuery({
    queryKey: ['recovery', days, userId],
    queryFn: async () => {
      // Fetch from daily_recovery_summaries
    }
  })
}

// hooks/athlete/use-healthkit-workouts.ts
export function useHealthKitWorkouts(userId: string, limit: number = 20) {
  return useQuery({
    queryKey: ['healthkit-workouts', userId, limit],
    queryFn: async () => {
      // Fetch from daily_workouts
    }
  })
}

// hooks/athlete/use-weight-trends.ts
export function useWeightTrends(userId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['weight-trends', userId, startDate, endDate],
    queryFn: async () => {
      // Fetch weight_kg from daily_readiness_summaries
    }
  })
}

// hooks/athlete/use-strain-recovery.ts
export function useStrainRecovery(userId: string, days: number = 7) {
  return useQuery({
    queryKey: ['strain-recovery', userId, days],
    queryFn: async () => {
      // Fetch strain and recovery from daily_readiness_summaries
    }
  })
}
```

### Coach Hooks (Same but for viewing client data)
```typescript
// hooks/coach/use-client-readiness.ts
export function useClientReadiness(clientId: string) {
  return useQuery({
    queryKey: ['client-readiness', clientId],
    queryFn: async () => {
      // Fetch from daily_readiness_summaries WHERE user_id = clientId
      // RLS allows coach to view via coach_clients relationship
    }
  })
}

// Repeat for all athlete hooks but with clientId parameter
```

---

## Task 7: Create Recharts Components

**Create reusable chart components in `components/shared/charts/`:**

### 7.1 Sleep Duration Chart
**File:** `components/shared/charts/sleep-duration-chart.tsx`

```typescript
interface SleepDurationChartProps {
  data: Array<{ date: string; time_asleep_minutes: number }>
  targetHours?: number
}

export function SleepDurationChart({ data, targetHours = 8 }: Props) {
  const chartData = data.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    hours: d.time_asleep_minutes / 60,
    target: targetHours
  }))
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Hours', angle: -90 }} />
        <Tooltip />
        <ReferenceLine y={targetHours} stroke="green" strokeDasharray="3 3" label="Target" />
        <Bar dataKey="hours" fill="#3b82f6">
          {chartData.map((entry, index) => {
            const color = entry.hours < 6 ? '#ef4444' : 
                         entry.hours < 7 ? '#f59e0b' :
                         entry.hours <= 9 ? '#10b981' : '#3b82f6'
            return <Cell key={`cell-${index}`} fill={color} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

### 7.2 Sleep Phases Stacked Chart
**File:** `components/shared/charts/sleep-phases-chart.tsx`

```typescript
export function SleepPhasesChart({ data }: Props) {
  const chartData = data.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    rem: d.rem_minutes,
    deep: d.deep_minutes,
    light: d.light_minutes,
    awake: d.awake_minutes
  }))
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Minutes', angle: -90 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="deep" stackId="a" fill="#3b82f6" name="Deep" />
        <Bar dataKey="rem" stackId="a" fill="#8b5cf6" name="REM" />
        <Bar dataKey="light" stackId="a" fill="#93c5fd" name="Light" />
        <Bar dataKey="awake" stackId="a" fill="#9ca3af" name="Awake" />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

### 7.3 HRV Trend Chart
**File:** `components/shared/charts/hrv-trend-chart.tsx`

```typescript
export function HRVTrendChart({ data }: Props) {
  // Calculate 7-day rolling average
  const chartData = data.map((d, index) => {
    const last7Days = data.slice(Math.max(0, index - 6), index + 1)
    const avg = last7Days.reduce((sum, day) => sum + day.resting_hrv, 0) / last7Days.length
    
    return {
      date: format(new Date(d.date), 'MMM dd'),
      hrv: d.resting_hrv,
      avg: avg
    }
  })
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'HRV (ms)', angle: -90 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="hrv" stroke="#93c5fd" strokeWidth={1} dot={false} name="Daily HRV" />
        <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} name="7-day Avg" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### 7.4 Weight Trend Chart
**File:** `components/shared/charts/weight-trend-chart.tsx`

```typescript
export function WeightTrendChart({ data, goalWeight }: Props) {
  // Calculate 7-day moving average and trend line
  const chartData = data.map((d, index) => {
    const last7Days = data.slice(Math.max(0, index - 6), index + 1)
    const avg = last7Days.reduce((sum, day) => sum + day.weight_kg, 0) / last7Days.length
    
    return {
      date: format(new Date(d.date), 'MMM dd'),
      weight: d.weight_kg,
      avg: avg
    }
  })
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} label={{ value: 'Weight (kg)', angle: -90 }} />
        <Tooltip />
        <Legend />
        {goalWeight && <ReferenceLine y={goalWeight} stroke="green" strokeDasharray="3 3" label="Goal" />}
        <Line type="monotone" dataKey="weight" stroke="#93c5fd" strokeWidth={1} dot={{ r: 3 }} name="Daily" />
        <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} name="7-day Avg" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### 7.5 Strain vs Recovery Chart
**File:** `components/shared/charts/strain-recovery-chart.tsx`

```typescript
export function StrainRecoveryChart({ data }: Props) {
  const chartData = data.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    strain: (d.strain_score / 21) * 100, // Convert to percentage
    recovery: d.recovery_score,
    isTrainingDay: d.mode === 'training_day'
  }))
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} label={{ value: 'Percentage', angle: -90 }} />
        <Tooltip />
        <Legend />
        <ReferenceLine y={60} stroke="red" strokeDasharray="3 3" label="Low Recovery" />
        <Line type="monotone" dataKey="strain" stroke="#f59e0b" strokeWidth={2} name="Strain" />
        <Line type="monotone" dataKey="recovery" stroke="#10b981" strokeWidth={2} name="Recovery" />
        {/* Add background shading for training days */}
        {chartData.map((entry, index) => 
          entry.isTrainingDay && (
            <ReferenceArea key={index} x1={index} x2={index + 1} fill="#3b82f6" fillOpacity={0.1} />
          )
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

## Task 8: RLS Policies

**Ensure coaches can view client HealthKit data:**

```sql
-- Coaches can view client readiness summaries
CREATE POLICY "Coaches can view client readiness"
  ON daily_readiness_summaries FOR SELECT
  USING (
    user_id IN (
      SELECT client_id FROM coach_clients 
      WHERE coach_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Coaches can view client sleep summaries
CREATE POLICY "Coaches can view client sleep"
  ON daily_sleep_summaries FOR SELECT
  USING (
    user_id IN (
      SELECT client_id FROM coach_clients 
      WHERE coach_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Coaches can view client recovery summaries
CREATE POLICY "Coaches can view client recovery"
  ON daily_recovery_summaries FOR SELECT
  USING (
    user_id IN (
      SELECT client_id FROM coach_clients 
      WHERE coach_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Coaches can view client workouts
CREATE POLICY "Coaches can view client workouts"
  ON daily_workouts FOR SELECT
  USING (
    user_id IN (
      SELECT client_id FROM coach_clients 
      WHERE coach_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Athletes can view their own data (if not already covered)
CREATE POLICY "Athletes can view own readiness"
  ON daily_readiness_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Athletes can view own sleep"
  ON daily_sleep_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Athletes can view own recovery"
  ON daily_recovery_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Athletes can view own workouts"
  ON daily_workouts FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Implementation Checklist

### Phase 1: Athlete Dashboard & Recovery
- [ ] Create readiness gauge component with real data
- [ ] Update dashboard with today's readiness
- [ ] Create sleep analysis section with 4 charts
- [ ] Create HRV & recovery metrics section with charts
- [ ] Create strain vs recovery chart
- [ ] Add workout summary from HealthKit
- [ ] Create all athlete hooks for fetching data

### Phase 2: Progress & Training Pages
- [ ] Update weight trends chart with real data
- [ ] Add HealthKit workouts table to training page
- [ ] Create workout detail modal
- [ ] Add weekly activity summary

### Phase 3: Coach View
- [ ] Add readiness card to client overview
- [ ] Create new "Health & Recovery" tab for clients
- [ ] Add all health charts for coach view
- [ ] Create coach hooks for client data
- [ ] Add insights/alerts for coaches

### Phase 4: Shared Components
- [ ] Create all Recharts components (reusable)
- [ ] Ensure charts work in both athlete and coach views
- [ ] Add loading skeletons for charts
- [ ] Add empty states ("No data yet")

### Phase 5: RLS & Testing
- [ ] Create/verify RLS policies
- [ ] Test athlete can see own data
- [ ] Test coach can see client data
- [ ] Test coach cannot see non-client data
- [ ] Test all charts render correctly
- [ ] Test mobile responsiveness

---

## Acceptance Criteria

### Athlete View
- [ ] Dashboard shows real readiness score from today
- [ ] Sleep analysis shows last 30 days with 4 charts
- [ ] HRV trends display correctly with rolling average
- [ ] Strain vs recovery chart shows last 7 days
- [ ] Weight chart shows historical data
- [ ] HealthKit workouts appear in training page
- [ ] All data is USER'S real data, not demo data

### Coach View
- [ ] Can see client's current readiness on overview
- [ ] New "Health & Recovery" tab exists for each client
- [ ] Can view client's sleep, HRV, recovery, strain data
- [ ] Can see client's HealthKit workouts
- [ ] All charts render correctly
- [ ] Can identify overtraining or recovery issues

### Data Accuracy
- [ ] All dates display correctly (no timezone issues)
- [ ] All calculations correct (averages, trends, etc.)
- [ ] Empty states show when no data available
- [ ] Loading states show while fetching
- [ ] Error handling for failed queries

### Performance
- [ ] Charts render smoothly (no lag)
- [ ] Data caching works (React Query)
- [ ] No unnecessary re-renders
- [ ] Mobile performance good

---

## Notes

### British English
- Metres (not meters) for distance
- Colour-coded charts
- Optimised performance

### Apple++ Quality
- Professional medical-grade feel for health data
- Smooth chart animations
- Thoughtful colour choices (accessibility)
- Clear data visualization
- Insights, not just data dumps

### Coach Value Proposition
**This HealthKit data is GOLD for coaches:**
- See if client is overtraining (low HRV, poor sleep)
- Adjust training load based on recovery
- Prevent injuries from overreach
- Monitor compliance (are they actually training?)
- Understand why performance drops (sleep issues, high strain)
- Make data-driven programme decisions

### Data Privacy
- All data protected by RLS
- Coaches only see active clients
- Athletes control data sharing (via coach-client relationship)

---

## Commit Message

When complete:

```
feat: Integrate HealthKit data throughout web UI

Athlete Interface:
- Dashboard shows real readiness score with breakdown
- Sleep analysis with duration, quality, phases, and bank charts
- HRV trends with 7-day rolling average
- Recovery metrics (HR, SpO2, respiratory rate, wrist temp)
- Strain vs recovery monitoring with alerts
- Weight trends with moving average and goal line
- HealthKit workouts table with detail modal
- Weekly activity summary

Coach Interface:
- Client overview shows current readiness
- New "Health & Recovery" tab for comprehensive health monitoring
- All sleep, HRV, recovery, and strain charts for clients
- Client workout history from HealthKit
- Insights for identifying overtraining and recovery issues

Data Integration:
- Fetch from daily_readiness_summaries
- Fetch from daily_sleep_summaries
- Fetch from daily_recovery_summaries
- Fetch from daily_workouts
- Real user data (no more demo/mock data)

Components:
- Reusable Recharts components for all health metrics
- Loading states for all charts
- Empty states for no data
- Mobile responsive charts

RLS Policies:
- Coaches can view client health data via coach_clients relationship
- Athletes can view own data
- Default-deny security model

British English throughout.
Professional medical-grade visualization.
Apple++ quality design.
```

---

## Ready to Build! 🔥

**This HealthKit data transforms the platform from "nice to have" to "must have" for serious coaches.**

Build everything specified. Make the health data visualization EXCEPTIONAL.

When done, report what was built and any issues encountered.
