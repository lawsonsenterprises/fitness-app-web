'use client'

import { MoreHorizontal, Mail, Eye } from 'lucide-react'
import Link from 'next/link'

import { ClientStatusBadge } from './client-status-badge'
import type { Client } from '@/types'

interface ClientsTableProps {
  clients: Client[]
  isLoading?: boolean
}

export function ClientsTable({ clients, isLoading }: ClientsTableProps) {
  if (isLoading) {
    return <ClientsTableSkeleton />
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-7 w-7 text-muted-foreground"
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
        <h3 className="mb-1 font-medium">No clients yet</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Add your first client to get started
        </p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
          Add client
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Client
            </th>
            <th className="hidden px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </th>
            <th className="hidden px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
              Joined
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {clients.map((client) => (
            <tr
              key={client.id}
              className="group transition-colors hover:bg-muted/30"
            >
              {/* Client info */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                    {client.firstName[0]}
                    {client.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {client.firstName} {client.lastName}
                    </p>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="hidden px-6 py-4 md:table-cell">
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <ClientStatusBadge status={client.status} />
              </td>

              {/* Joined date */}
              <td className="hidden px-6 py-4 lg:table-cell">
                <p className="text-sm text-muted-foreground">
                  {new Date(client.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    href={`/clients/${client.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="View client"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <a
                    href={`mailto:${client.email}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Send email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ClientsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-4 text-left">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </th>
            <th className="hidden px-6 py-4 text-left md:table-cell">
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
            </th>
            <th className="px-6 py-4 text-left">
              <div className="h-3 w-14 animate-pulse rounded bg-muted" />
            </th>
            <th className="hidden px-6 py-4 text-left lg:table-cell">
              <div className="h-3 w-14 animate-pulse rounded bg-muted" />
            </th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </div>
              </td>
              <td className="hidden px-6 py-4 md:table-cell">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </td>
              <td className="hidden px-6 py-4 lg:table-cell">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-6 py-4" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
