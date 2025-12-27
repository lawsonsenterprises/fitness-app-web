import { ClipboardCheck } from 'lucide-react'

import { TopBar } from '@/components/dashboard/top-bar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Check-ins - Synced Momentum',
  description: 'Review client check-ins',
}

export default function CheckInsPage() {
  return (
    <div className="min-h-screen">
      <TopBar title="Check-ins" />

      <div className="p-4 lg:p-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Review and respond to your clients&apos; weekly check-ins
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No pending check-ins</h3>
          <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
            When your clients submit their weekly check-ins, they&apos;ll appear
            here for your review.
          </p>
        </div>
      </div>
    </div>
  )
}
