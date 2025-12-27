import { Plus, Search, Filter } from 'lucide-react'

import { TopBar } from '@/components/dashboard/top-bar'
import { ClientsTable } from '@/components/clients/clients-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Client } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Clients - Synced Momentum',
  description: 'Manage your coaching clients',
}

// Placeholder data - will be replaced with real data from Supabase
const mockClients: Client[] = [
  {
    id: '1',
    coachId: 'coach-1',
    firstName: 'Emma',
    lastName: 'Thompson',
    email: 'emma.thompson@example.com',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    coachId: 'coach-1',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@example.com',
    status: 'active',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
  },
  {
    id: '3',
    coachId: 'coach-1',
    firstName: 'Sophie',
    lastName: 'Brown',
    email: 'sophie.brown@example.com',
    status: 'pending',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
]

export default function ClientsPage() {
  return (
    <div className="min-h-screen">
      <TopBar title="Clients" />

      <div className="p-4 lg:p-8">
        {/* Header with actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">
              Manage and track all your coaching clients
            </p>
          </div>

          <Button className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </Button>
        </div>

        {/* Filters and search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="h-10 pl-10"
            />
          </div>
          <Button variant="outline" className="h-10 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Clients table */}
        <ClientsTable clients={mockClients} />
      </div>
    </div>
  )
}
