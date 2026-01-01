'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  MoreHorizontal,
  Eye,
  MessageSquare,
  Pause,
  Play,
  UserX,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { ClientStatusBadge } from './client-status-badge'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { cn } from '@/lib/utils'
import { getClientDisplayName, getClientInitials, type Client } from '@/types'

interface ClientsTableProps {
  clients: Client[]
  isLoading?: boolean
  onStatusChange?: (clientId: string, status: Client['status']) => void
}

function ClientAvatar({ client }: { client: Client }) {
  const initials = getClientInitials(client)
  const displayName = getClientDisplayName(client)

  if (client.avatarUrl) {
    return (
      <Image
        src={client.avatarUrl}
        alt={displayName}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-sm font-medium text-background ring-2 ring-background">
      {initials || '?'}
    </div>
  )
}

function RowActions({
  client,
  onStatusChange,
}: {
  client: Client
  onStatusChange?: (clientId: string, status: Client['status']) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showEndConfirmation, setShowEndConfirmation] = useState(false)

  const displayName = getClientDisplayName(client)

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
              <Link
                href={`/clients/${client.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                View Profile
              </Link>
              <Link
                href={`/clients/${client.id}/messages`}
                className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Send Message
              </Link>
              <div className="my-1 border-t border-border" />
              {client.status === 'active' && (
                <button
                  onClick={() => {
                    onStatusChange?.(client.id, 'paused')
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Pause className="h-4 w-4 text-muted-foreground" />
                  Pause Relationship
                </button>
              )}
              {client.status === 'paused' && (
                <button
                  onClick={() => {
                    onStatusChange?.(client.id, 'active')
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Play className="h-4 w-4 text-muted-foreground" />
                  Resume Relationship
                </button>
              )}
              {client.status !== 'completed' && client.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setShowEndConfirmation(true)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <UserX className="h-4 w-4" />
                  End Relationship
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showEndConfirmation}
        onClose={() => setShowEndConfirmation(false)}
        onConfirm={() => onStatusChange?.(client.id, 'completed')}
        title="End Client Relationship"
        description={`Are you sure you want to end your coaching relationship with ${displayName}? They will no longer have access to assigned programmes and meal plans. This action cannot be undone.`}
        confirmLabel="End Relationship"
        cancelLabel="Keep Client"
        variant="destructive"
        icon={<UserX className="h-5 w-5" />}
      />
    </>
  )
}

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 text-left"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Client
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    ),
    accessorFn: (row) => getClientDisplayName(row),
    cell: ({ row }) => {
      const client = row.original
      const displayName = getClientDisplayName(client)
      return (
        <Link
          href={`/clients/${client.id}`}
          className="flex items-center gap-3 group"
        >
          <ClientAvatar client={client} />
          <div>
            <p className="font-medium group-hover:text-amber-600 transition-colors">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground md:hidden">
              {client.email}
            </p>
          </div>
        </Link>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ClientStatusBadge status={row.original.status} />,
    filterFn: (row, id, value) => {
      return value === 'all' || row.getValue(id) === value
    },
  },
  {
    accessorKey: 'nextCheckInDue',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 text-left"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Next Check-in
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const nextDue = row.original.nextCheckInDue
      if (!nextDue) return <span className="text-sm text-muted-foreground">Not set</span>
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(nextDue), { addSuffix: true })}
        </span>
      )
    },
  },
  {
    accessorKey: 'startedAt',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 text-left"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Started
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const startedAt = row.original.startedAt
      if (!startedAt) return <span className="text-sm text-muted-foreground">Pending</span>
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(startedAt), { addSuffix: true })}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => (
      <RowActions
        client={row.original}
        onStatusChange={(table.options.meta as { onStatusChange?: (clientId: string, status: Client['status']) => void })?.onStatusChange}
      />
    ),
  },
]

export function ClientsTable({ clients, isLoading, onStatusChange }: ClientsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    meta: {
      onStatusChange,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  if (isLoading) {
    return <ClientsTableSkeleton />
  }

  if (clients.length === 0) {
    return <ClientsEmptyState />
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
                        header.id === 'email' && 'hidden md:table-cell',
                        header.id === 'nextCheckInDue' && 'hidden lg:table-cell',
                        header.id === 'startedAt' && 'hidden xl:table-cell'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-4 py-4',
                        cell.column.id === 'email' && 'hidden md:table-cell',
                        cell.column.id === 'nextCheckInDue' && 'hidden lg:table-cell',
                        cell.column.id === 'startedAt' && 'hidden xl:table-cell',
                        cell.column.id === 'actions' && 'text-right'
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{' '}
            of{' '}
            <span className="font-medium">
              {table.getFilteredRowModel().rows.length}
            </span>{' '}
            clients
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ClientsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </th>
            <th className="hidden px-4 py-3 text-left md:table-cell">
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-3 w-14 animate-pulse rounded bg-muted" />
            </th>
            <th className="hidden px-4 py-3 text-left lg:table-cell">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            </th>
            <th className="hidden px-4 py-3 text-left xl:table-cell">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </div>
              </td>
              <td className="hidden px-4 py-4 md:table-cell">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-4 py-4">
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
              </td>
              <td className="hidden px-4 py-4 lg:table-cell">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </td>
              <td className="hidden px-4 py-4 xl:table-cell">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-4 py-4" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ClientsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-medium">No clients yet</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
        Start building your client roster by sending an invitation to your first client.
      </p>
    </div>
  )
}
