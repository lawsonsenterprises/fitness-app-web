import { Plus, Dumbbell } from 'lucide-react'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Programmes - Synced Momentum',
  description: 'Create and manage training programmes',
}

export default function ProgrammesPage() {
  return (
    <div className="min-h-screen">
      <TopBar title="Programmes" />

      <div className="p-4 lg:p-8">
        {/* Header with actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">
              Create and assign training programmes to your clients
            </p>
          </div>

          <Button className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90">
            <Plus className="mr-2 h-4 w-4" />
            New Programme
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </Button>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No programmes yet</h3>
          <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
            Create your first training programme to start assigning workouts to
            your clients.
          </p>
          <Button className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Programme
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </Button>
        </div>
      </div>
    </div>
  )
}
