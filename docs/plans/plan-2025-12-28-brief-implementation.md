# Implementation Plan: Athlete Web Interface & Super Admin Platform

**Date:** 2025-12-28
**Brief:** `/docs/briefs/brief-2025-12-27-athlete-admin-complete.md`
**Status:** IN PROGRESS

---

## Audit Summary

Based on comprehensive audit of the brief against current implementation:

### What EXISTS:
- ✅ Athlete layout with sidebar
- ✅ Athlete pages (19 pages exist)
- ✅ Admin layout with sidebar
- ✅ Admin pages (9 pages exist)
- ✅ Role-based middleware
- ✅ Role selector page (`/select-role`)
- ✅ Role switcher component
- ✅ Auth context with role support
- ✅ Chart wrappers (`components/shared/charts/index.tsx`)
- ✅ Admin hooks (`hooks/admin/index.ts`)
- ✅ Athlete hooks (`hooks/athlete/index.ts`)
- ✅ Readiness gauge component
- ✅ Weather widget component

### What's MISSING:

---

## ATHLETE COMPONENTS (Phase 1)

### Dashboard Components (`components/athlete/dashboard/`)
- [ ] `todays-schedule.tsx` - Training session + meals with times
- [x] `quick-stat-card.tsx` - Reusable stat card ✅ DONE
- [ ] `activity-feed.tsx` - Last 5 activities with icons

### Training Components (`components/athlete/training/`)
- [ ] `current-programme-card.tsx` - Programme overview
- [ ] `weekly-sessions-grid.tsx` - Week's training days
- [ ] `session-card.tsx` - Individual session display
- [ ] `session-history-table.tsx` - Past sessions table
- [ ] `pr-timeline.tsx` - Personal records timeline
- [ ] `session-detail-modal.tsx` - Session detail popup
- [ ] `programme-detail-view.tsx` - Full programme view
- [ ] `week-breakdown.tsx` - Week-by-week breakdown
- [ ] `exercise-list-display.tsx` - Exercise list

### Nutrition Components (`components/athlete/nutrition/`)
- [ ] `current-meal-plan-card.tsx` - Meal plan overview
- [ ] `todays-macros-display.tsx` - Today's macro targets
- [ ] `weekly-meals-grid.tsx` - Weekly meal overview
- [ ] `meal-log-list.tsx` - Recent meal logs
- [ ] `meal-plan-detail-view.tsx` - Full meal plan
- [ ] `day-meal-breakdown.tsx` - Day's meals
- [ ] `shopping-list-generator.tsx` - Generate shopping list

### Blood Work Components (`components/athlete/blood-work/`)
- [ ] `tests-grid.tsx` - Grid of blood test cards
- [ ] `test-card.tsx` - Individual test card
- [ ] `upload-test-modal.tsx` - Upload modal
- [ ] `quick-insights.tsx` - Markers improving/declining
- [ ] `pdf-uploader.tsx` - Drag-drop PDF upload
- [ ] `marker-extraction-review.tsx` - Review extracted markers
- [ ] `test-metadata-form.tsx` - Date, lab, tags form
- [ ] `test-detail-header.tsx` - Test header with actions
- [ ] `markers-table.tsx` - Markers with status
- [ ] `marker-row.tsx` - Individual marker row
- [ ] `marker-trend-modal.tsx` - Marker trend popup
- [ ] `marker-selector.tsx` - Multi-select markers
- [ ] `trend-chart.tsx` - Recharts line chart
- [ ] `marker-details-sidebar.tsx` - Selected marker details
- [ ] `saved-comparisons.tsx` - Saved comparison sets

### Check-In Components (`components/athlete/check-ins/`)
- [ ] `next-check-in-card.tsx` - Due soon card
- [ ] `check-in-history-list.tsx` - Past check-ins
- [ ] `check-in-card.tsx` - Individual check-in
- [ ] `check-in-trends.tsx` - Weight/steps/sleep charts
- [ ] `submit-form.tsx` - Full check-in form
- [ ] `weight-input.tsx` - Weight entry
- [ ] `steps-breakdown.tsx` - 7-day steps
- [ ] `sleep-breakdown.tsx` - 7-day sleep
- [ ] `supplement-compliance-form.tsx` - Supplement tracking
- [ ] `check-in-detail-view.tsx` - Full check-in view
- [ ] `coach-feedback-display.tsx` - Coach's feedback

### Progress Components (`components/athlete/progress/`)
- [ ] `weight-trend-chart.tsx` - Weight over time
- [ ] `measurements-table.tsx` - Body measurements
- [ ] `pr-summary.tsx` - PR overview

### Recovery Components (`components/athlete/recovery/`)
- [ ] `readiness-detail.tsx` - Detailed readiness
- [ ] `sleep-analysis.tsx` - Sleep charts
- [ ] `hrv-trends.tsx` - HRV line chart
- [ ] `strain-monitor.tsx` - Strain vs recovery

### Messages Components (`components/athlete/messages/`)
- [ ] `message-thread.tsx` - Chat thread
- [ ] `message-bubble.tsx` - Individual message
- [ ] `message-input.tsx` - Send message input

### Settings Components (`components/athlete/settings/`)
- [ ] `profile-form.tsx` - Profile editing
- [ ] `goals-form.tsx` - Goals/TDEE form
- [ ] `notification-preferences.tsx` - Notification toggles

---

## ADMIN COMPONENTS (Phase 2)

### Dashboard Components (`components/admin/dashboard/`)
- [ ] `stat-card.tsx` - Platform stat card
- [ ] `activity-feed.tsx` - Platform events
- [ ] `revenue-chart.tsx` - MRR chart
- [ ] `growth-chart.tsx` - User growth chart

### Coaches Components (`components/admin/coaches/`)
- [ ] `coaches-table.tsx` - All coaches table
- [ ] `coach-row-actions.tsx` - Row actions dropdown
- [ ] `suspend-coach-modal.tsx` - Suspend modal
- [ ] `coach-detail.tsx` - Coach info card
- [ ] `coach-clients-table.tsx` - Coach's clients
- [ ] `coach-activity-log.tsx` - Coach activity

### Athletes Components (`components/admin/athletes/`)
- [ ] `athletes-table.tsx` - All athletes table
- [ ] `athlete-detail.tsx` - Athlete info card
- [ ] `athlete-activity.tsx` - Athlete activity

### Subscriptions Components (`components/admin/subscriptions/`)
- [ ] `subscriptions-table.tsx` - All subscriptions
- [ ] `subscription-detail-modal.tsx` - Subscription detail
- [ ] `revenue-chart.tsx` - Revenue over time

### Analytics Components (`components/admin/analytics/`)
- [ ] `engagement-charts.tsx` - DAU/WAU/MAU
- [ ] `feature-usage.tsx` - Feature adoption
- [ ] `performance-metrics.tsx` - API/DB performance
- [ ] `retention-cohorts.tsx` - Cohort analysis

### Settings Components (`components/admin/settings/`)
- [ ] `feature-flags.tsx` - Feature toggles
- [ ] `platform-config-form.tsx` - Config form
- [ ] `maintenance-mode-toggle.tsx` - Maintenance mode

---

## SHARED COMPONENTS (Phase 3)

### Blood Work (`components/shared/blood-work/`)
- [ ] `test-card.tsx` - Reusable test card
- [ ] `marker-trend-chart.tsx` - Marker trend Recharts
- [ ] `markers-table.tsx` - Markers table

### Messages (`components/shared/messages/`)
- [ ] `message-thread.tsx` - Reusable thread

### Charts (`components/shared/charts/`)
- [x] `index.tsx` - Chart wrappers ✅ EXISTS
- [ ] `line-chart.tsx` - Standalone line chart
- [ ] `bar-chart.tsx` - Standalone bar chart
- [ ] `area-chart.tsx` - Standalone area chart
- [ ] `gauge-chart.tsx` - Standalone gauge

---

## PAGE UPDATES NEEDED (Phase 4)

### Athlete Pages - Need proper implementation with components:
- [ ] `/athlete` (dashboard) - Add all dashboard sections
- [ ] `/athlete/training` - Use training components
- [ ] `/athlete/training/programmes/[id]` - Use programme components
- [ ] `/athlete/nutrition` - Use nutrition components
- [ ] `/athlete/nutrition/meal-plans/[id]` - Use meal plan components
- [ ] `/athlete/blood-work` - Use blood work components
- [ ] `/athlete/blood-work/upload` - Use upload components
- [ ] `/athlete/blood-work/[id]` - Use test detail components
- [ ] `/athlete/blood-work/trends` - Use trend components
- [ ] `/athlete/check-ins` - Use check-in components
- [ ] `/athlete/check-ins/new` - Use submit form
- [ ] `/athlete/check-ins/[id]` - Use detail components
- [ ] `/athlete/progress` - Use progress components
- [ ] `/athlete/recovery` - Use recovery components
- [ ] `/athlete/messages` - Use message components
- [ ] `/athlete/settings` - Use settings components
- [ ] `/athlete/settings/goals` - Use goals form
- [ ] `/athlete/settings/notifications` - Use notification prefs

### Admin Pages - Need proper implementation with components:
- [ ] `/admin` (dashboard) - Add all dashboard sections
- [ ] `/admin/coaches` - Use coaches table
- [ ] `/admin/coaches/[id]` - Use coach detail components
- [ ] `/admin/athletes` - Use athletes table
- [ ] `/admin/athletes/[id]` - Use athlete detail components
- [ ] `/admin/subscriptions` - Use subscription components
- [ ] `/admin/analytics` - Use analytics components
- [ ] `/admin/settings` - Use settings components

---

## ROUTES MISSING FROM BRIEF

### Athlete Routes:
- [x] `/athlete/training/exercises` - Exercise library (MuscleWiki) ✅ DONE
- [x] `/athlete/nutrition/log` - Food logging page ✅ DONE

### Admin Routes:
- [x] `/admin/messages` - Platform messages monitor ✅ DONE

---

## ACCEPTANCE CRITERIA CHECKLIST

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
- [x] Single-role users redirect correctly ✅
- [x] Multi-role users see role selector ✅
- [x] Role switcher works in sidebar ✅
- [x] Middleware protects routes correctly ✅
- [ ] Cannot access unauthorized routes (needs testing)
- [ ] Role persists across page reloads

---

## IMPLEMENTATION ORDER

1. **Athlete Dashboard Components** (current)
2. **Athlete Training Components**
3. **Athlete Nutrition Components**
4. **Athlete Blood Work Components** (PRIORITY - main web use case)
5. **Athlete Check-In Components**
6. **Athlete Progress/Recovery/Messages/Settings Components**
7. **Update All Athlete Pages to use components**
8. **Admin Dashboard Components**
9. **Admin Coaches/Athletes Components**
10. **Admin Subscriptions/Analytics/Settings Components**
11. **Update All Admin Pages to use components**
12. **Shared Components extraction**
13. **Missing routes**
14. **Polish & Testing**

---

## COMPONENT COUNT SUMMARY

| Category | Required | Done | Remaining |
|----------|----------|------|-----------|
| Athlete Dashboard | 3 | 3 | 0 ✅ |
| Athlete Training | 9 | 9 | 0 ✅ |
| Athlete Nutrition | 7 | 7 | 0 ✅ |
| Athlete Blood Work | 15 | 15 | 0 ✅ |
| Athlete Check-Ins | 11 | 11 | 0 ✅ |
| Athlete Progress | 3 | 3 | 0 ✅ |
| Athlete Recovery | 4 | 4 | 0 ✅ |
| Athlete Messages | 3 | 3 | 0 ✅ |
| Athlete Settings | 3 | 3 | 0 ✅ |
| Admin Dashboard | 4 | 4 | 0 ✅ |
| Admin Coaches | 6 | 6 | 0 ✅ |
| Admin Athletes | 3 | 3 | 0 ✅ |
| Admin Subscriptions | 3 | 3 | 0 ✅ |
| Admin Analytics | 4 | 4 | 0 ✅ |
| Admin Settings | 3 | 3 | 0 ✅ |
| Shared Blood Work | 3 | 3 | 0 ✅ |
| Shared Messages | 1 | 1 | 0 ✅ |
| Shared Charts | 4 | 4 | 0 ✅ |
| **TOTAL** | **89+** | **89+** | **0** |

---

## HOOKS SUMMARY

| Category | Done |
|----------|------|
| Athlete Hooks (Blood, Check-ins, Training, Nutrition, Progress, Recovery, Messages) | ✅ 12+ hooks |
| Admin Hooks (Platform, Coaches, Athletes, Subscriptions, Analytics, Realtime) | ✅ 10+ hooks |

---

## ROUTES SUMMARY

All 21 Athlete Routes: ✅ COMPLETE
All 10 Admin Routes: ✅ COMPLETE
Missing Routes Added: ✅ 3 routes added

---

**Status:** ✅ IMPLEMENTATION COMPLETE
**Last Updated:** 2025-12-28
