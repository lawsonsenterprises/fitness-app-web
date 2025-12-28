'use client'

import { useState, useMemo } from 'react'
import {
  ClipboardCheck,
  Search,
  Clock,
  CheckCircle2,
  Filter,
  ChevronDown,
} from 'lucide-react'

import { TopBar } from '@/components/dashboard/top-bar'
import { CheckInCard } from '@/components/check-ins/check-in-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCheckIns, useCheckInStats } from '@/hooks/use-check-ins'
import { cn } from '@/lib/utils'
import type { CheckInStatus } from '@/types'

type StatusFilter = CheckInStatus | 'all'

const statusFilters: { value: StatusFilter; label: string; icon: typeof Clock }[] = [
  { value: 'all', label: 'All', icon: ClipboardCheck },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'reviewed', label: 'Reviewed', icon: CheckCircle2 },
]

export default function CheckInsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const { data: checkInsData, isLoading } = useCheckIns({
    status: statusFilter,
    search,
  })

  const { data: stats } = useCheckInStats()

  const currentFilter = statusFilters.find((f) => f.value === statusFilter) || statusFilters[0]

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    return {
      all: stats?.total || 0,
      pending: stats?.pending || 0,
      reviewed: stats?.reviewed || 0,
    }
  }, [stats])

  const checkIns = checkInsData?.data || []

  return (
    <div className="min-h-screen">
      <TopBar title="Check-ins" />

      <div className="p-4 lg:p-8">
        {/* Header with stats */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-muted-foreground">
                Review and respond to your clients&apos; weekly check-ins
              </p>

              {/* Quick stats */}
              <div className="mt-4 flex flex-wrap gap-3">
                {statusFilters.slice(1).map((filter) => {
                  const count = filterCounts[filter.value as keyof typeof filterCounts]
                  const FilterIcon = filter.icon
                  return (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all',
                        statusFilter === filter.value
                          ? 'border-foreground/20 bg-foreground/5 text-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                      )}
                    >
                      <FilterIcon className="h-3.5 w-3.5" />
                      {filter.label}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-xs font-medium',
                          statusFilter === filter.value
                            ? filter.value === 'pending'
                              ? 'bg-amber-500/20 text-amber-600'
                              : 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-muted'
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Average rating */}
            {stats && stats.averageRating > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="mt-1 text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Search and filters row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'h-11 rounded-lg border-border bg-background pl-10 pr-4',
                'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
              )}
            />
          </div>

          {/* Status filter dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="h-11 min-w-[140px] justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {currentFilter.label}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showFilterDropdown && 'rotate-180'
                )}
              />
            </Button>

            {showFilterDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFilterDropdown(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                  {statusFilters.map((filter) => {
                    const FilterIcon = filter.icon
                    const count = filterCounts[filter.value as keyof typeof filterCounts]
                    return (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setStatusFilter(filter.value)
                          setShowFilterDropdown(false)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-muted',
                          statusFilter === filter.value && 'bg-muted'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <FilterIcon className="h-4 w-4 text-muted-foreground" />
                          {filter.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results summary */}
        {statusFilter !== 'all' && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {currentFilter.label.toLowerCase()} check-ins
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Check-ins list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : checkIns.length > 0 ? (
          <div className="space-y-4">
            {checkIns.map((checkIn) => (
              <CheckInCard key={checkIn.id} checkIn={checkIn} showClient />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">
              {statusFilter === 'pending'
                ? 'No pending check-ins'
                : statusFilter === 'reviewed'
                ? 'No reviewed check-ins'
                : 'No check-ins yet'}
            </h3>
            <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
              {statusFilter === 'pending'
                ? "You're all caught up! All check-ins have been reviewed."
                : "When your clients submit their weekly check-ins, they'll appear here for your review."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
