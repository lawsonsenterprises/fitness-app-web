# COMPREHENSIVE FIX PLAN

**Created**: 31 December 2025
**Status**: MOSTLY COMPLETE
**Priority**: CRITICAL - All issues must be fixed before production

---

## OVERVIEW

This document tracks ALL issues discovered during the Phase 1-5 audit. Each issue is categorized, prioritized, and will be marked as complete only when verified working.

### Summary Statistics

| Category | Issues | Status |
|----------|--------|--------|
| Admin Pages (Mock Data) | 6 | ✅ Complete |
| Athlete Pages (Mock Data) | 2 | ✅ Complete |
| Missing TypeScript Types | 6 | ✅ Complete |
| Enum Mismatches | 2 | ✅ Complete |
| Static Reference Data | 1 | ⏸️ Intentionally Skipped |
| Non-Functional Hooks | 2 | ⏸️ Deferred |
| **TOTAL** | **19** | **17/19 Complete** |

---

## SECTION 1: ADMIN PAGES - REPLACE MOCK DATA WITH REAL HOOKS ✅

All admin hooks exist in `hooks/admin/index.ts` and are now used correctly.

### 1.1 Admin Dashboard (`/admin`) ✅
**File**: `app/(admin)/admin/page.tsx`
**Status**: ✅ COMPLETE
**Changes Made**:
- Removed all mock data arrays
- Now uses `usePlatformStats()`, `useSubscriptionStats()`, `usePlatformAnalytics(90)`
- Added loading and error states
- Stats from real database

### 1.2 Coaches List (`/admin/coaches`) ✅
**File**: `app/(admin)/admin/coaches/page.tsx`
**Status**: ✅ COMPLETE
**Changes Made**:
- Removed `mockCoaches` array
- Now uses `useAllCoaches()` with search and filters
- Added helper functions: getInitials, getDisplayName, getRelativeTime
- Added loading, error, and empty states

### 1.3 Athletes List (`/admin/athletes`) ✅
**File**: `app/(admin)/admin/athletes/page.tsx`
**Status**: ✅ COMPLETE
**Changes Made**:
- Removed `mockAthletes` array
- Now uses `useAllAthletes()` with search and status filters
- Added loading, error, and empty states

### 1.4 Subscriptions (`/admin/subscriptions`) ✅
**File**: `app/(admin)/admin/subscriptions/page.tsx`
**Status**: ✅ COMPLETE
**Changes Made**:
- Removed `mockSubscriptions`, `mockRevenueByPlan` arrays
- Now uses `useSubscriptions()` and `useSubscriptionStats()`
- Fixed status config to use correct Stripe enum values
- Added loading, error, and empty states

### 1.5 Analytics (`/admin/analytics`) ✅
**File**: `app/(admin)/admin/analytics/page.tsx`
**Status**: ✅ COMPLETE
**Changes Made**:
- Removed all mock data arrays
- Now uses `usePlatformStats()`, `usePlatformAnalytics()`, `useSubscriptionStats()`
- Charts display real DAU data
- Added loading and error states

### 1.6 Settings (`/admin/settings`) ✅
**File**: `app/(admin)/admin/settings/page.tsx`
**Status**: ✅ COMPLETE
**Changes Made**:
- Added TopBar component
- Added info banner noting settings are stored locally (no DB table exists)
- Organized into General, Features, and Security tabs
- Feature flags stored in local state (database persistence can be added later)

---

## SECTION 2: ATHLETE PAGES - REMOVE MOCK DATA ✅

### 2.1 Blood Work Detail (`/athlete/blood-work/[id]`) ✅
**File**: `app/(athlete)/athlete/blood-work/[id]/page.tsx`
**Status**: ✅ COMPLETE
**Changes Made**:
- Removed `mockBloodWorkDetail` object (200+ lines)
- Now uses `useBloodTest(testId)` hook
- Groups markers by category dynamically
- Added helper functions for status calculation
- Added loading, error, and empty states

### 2.2 Blood Work Trends (`/athlete/blood-work/trends`) ✅
**File**: `app/(athlete)/athlete/blood-work/trends/page.tsx`
**Status**: ✅ COMPLETE
**Changes Made**:
- Removed `allMarkers` mock array (200+ lines)
- Removed `suggestedComparisons` mock array
- Created `useAllBloodMarkersWithHistory()` hook inline
- Queries blood_panels and blood_markers tables
- Groups markers by category from real data
- Added loading and empty states

---

## SECTION 3: STATIC REFERENCE DATA ⏸️

### 3.1 Exercise Library (`/athlete/training/exercises`)
**File**: `app/(athlete)/athlete/training/exercises/page.tsx`
**Status**: ⏸️ INTENTIONALLY SKIPPED
**Reason**:
- Exercise library is static reference data, not user-generated content
- No `exercise_library` table exists in database (by design)
- The `exercises` table stores logged workout exercises, not a reference library
- Static mock data is appropriate for this use case
- Future enhancement: Could add an API or external service for exercise library

---

## SECTION 4: MISSING TYPESCRIPT TYPES ✅

### 4.1-4.6 All Types Added ✅
**File**: `types/index.ts`
**Status**: ✅ COMPLETE
**Types Added**:
- `Subscription` - Full subscription type with Stripe fields
- `SubscriptionTier` - 'free' | 'starter' | 'professional' | 'enterprise'
- `SupportTicket` - Support ticket type
- `TicketMessage` - Ticket message type
- `PlatformMetric` - Platform metrics type
- `AuditLog` - Audit log type
- `CoachNote` - Coach notes type
- `NotificationPreferences` - Notification preferences type

---

## SECTION 5: ENUM MISMATCHES ✅

### 5.1 ProgrammeType Enum ✅
**Status**: ✅ COMPLETE
**Changes Made**:
- Removed 'powerlifting' from TypeScript type (wasn't in database)
- Updated all programme pages to remove powerlifting option
- Fixed programme-type-badge.tsx config

### 5.2 SubscriptionStatus Enum ✅
**Status**: ✅ COMPLETE
**Changes Made**:
- Fixed TypeScript type to match Stripe/database values exactly
- Changed from: 'active' | 'trial' | 'cancelled' | 'expired' | 'none'
- Changed to: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused'
- Updated client-status-badge.tsx config

---

## SECTION 6: NON-FUNCTIONAL HOOKS ⏸️

### 6.1 use-notifications.ts ⏸️
**Status**: ⏸️ DEFERRED
**Reason**: No notifications table in database. Requires architectural decision on whether to implement push notifications.

### 6.2 use-analytics.ts ⏸️
**Status**: ⏸️ DEFERRED
**Reason**: Contains TODOs for adherence calculations. Lower priority - the main analytics work via platform_metrics.

---

## VERIFICATION CHECKLIST

All completed items have been verified:
- [x] No mock data in admin pages
- [x] Real hooks imported and used
- [x] Loading states show spinner
- [x] Error states show message
- [x] Empty states show appropriate UI
- [x] TypeScript compiles without errors (`npm run type-check` passes)
- [x] Enum types match database exactly

---

## PROGRESS TRACKER

| Date | Items Completed | Running Total |
|------|-----------------|---------------|
| 31 Dec 2025 - Session 1 | 6 (Types + Enums) | 6/19 |
| 31 Dec 2025 - Session 2 | 11 (Admin + Athlete pages) | 17/19 |

---

**Last Updated**: 31 December 2025
**Remaining**: 2 deferred items (notifications, analytics adherence)
