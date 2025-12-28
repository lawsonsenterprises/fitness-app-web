'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, ChevronDown, Users, UserCheck, Clock, UserX } from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { ClientsTable } from '@/components/clients/clients-table'
import { InviteClientDialog } from '@/components/clients/invite-client-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useClients, useUpdateClientStatus } from '@/hooks/use-clients'
import { cn } from '@/lib/utils'
import type { ClientStatus } from '@/types'

type StatusFilter = ClientStatus | 'all'

const statusFilters: { value: StatusFilter; label: string; icon: typeof Users }[] = [
  { value: 'all', label: 'All Clients', icon: Users },
  { value: 'active', label: 'Active', icon: UserCheck },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'paused', label: 'Paused', icon: Clock },
  { value: 'ended', label: 'Ended', icon: UserX },
]

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const { data: clientsData, isLoading } = useClients({
    status: statusFilter,
    search,
  })

  const updateStatus = useUpdateClientStatus()

  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    try {
      await updateStatus.mutateAsync({ clientId, status: newStatus })
      toast.success('Client status updated', {
        description: `Client has been marked as ${newStatus}.`,
      })
    } catch {
      toast.error('Failed to update status', {
        description: 'Please try again.',
      })
    }
  }

  const currentFilter = statusFilters.find((f) => f.value === statusFilter) || statusFilters[0]

  // Stats for the filter badges
  const stats = useMemo(() => {
    if (!clientsData?.data) return { all: 0, active: 0, pending: 0, paused: 0, ended: 0 }
    const clients = clientsData.data
    return {
      all: clients.length,
      active: clients.filter((c) => c.status === 'active').length,
      pending: clients.filter((c) => c.status === 'pending').length,
      paused: clients.filter((c) => c.status === 'paused').length,
      ended: clients.filter((c) => c.status === 'ended').length,
    }
  }, [clientsData])

  return (
    <div className="min-h-screen">
      <TopBar title="Clients" />

      <div className="p-4 lg:p-8">
        {/* Header with stats and actions */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-muted-foreground">
                Manage and track all your coaching clients
              </p>

              {/* Quick stats */}
              <div className="mt-4 flex flex-wrap gap-3">
                {statusFilters.slice(1).map((filter) => {
                  const count = stats[filter.value as keyof typeof stats]
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
                            ? 'bg-foreground/10'
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

            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Invite Client
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Button>
          </div>
        </div>

        {/* Search and filters row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
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
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="h-11 min-w-[140px] justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <currentFilter.icon className="h-4 w-4" />
                {currentFilter.label}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showStatusDropdown && 'rotate-180'
                )}
              />
            </Button>

            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                  {statusFilters.map((filter) => {
                    const FilterIcon = filter.icon
                    const count = stats[filter.value as keyof typeof stats]
                    return (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setStatusFilter(filter.value)
                          setShowStatusDropdown(false)
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
              Showing {currentFilter.label.toLowerCase()} clients
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Clients table */}
        <ClientsTable
          clients={clientsData?.data || []}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Invite Client Dialog */}
      <InviteClientDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  )
}
