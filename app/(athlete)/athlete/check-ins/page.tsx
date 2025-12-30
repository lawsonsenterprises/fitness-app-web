'use client'

import Link from 'next/link'
import {
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Calendar,
  Loader2,
  ClipboardCheck,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useCheckIns } from '@/hooks/athlete'
import { TopBar } from '@/components/dashboard/top-bar'

export default function CheckInsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { data: checkIns, isLoading } = useCheckIns(user?.id)

  // Show loading while auth is loading OR (user exists AND query is loading)
  if (authLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Safely check - checkIns could be undefined if query was disabled
  const hasCheckIns = Array.isArray(checkIns) && checkIns.length > 0

  // Calculate stats from real data
  const totalCheckIns = checkIns?.length || 0
  const firstWeight = hasCheckIns ? checkIns[checkIns.length - 1]?.weight : null
  const latestWeight = hasCheckIns ? checkIns[0]?.weight : null
  const weightChange = firstWeight && latestWeight ? Math.round((latestWeight - firstWeight) * 10) / 10 : null

  return (
    <>
      <TopBar title="Check-ins" />
      <div className="p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <p className="text-muted-foreground">
            Weekly progress updates with your coach
          </p>
          <Button asChild className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Link href="/athlete/check-ins/new">
              <Plus className="h-4 w-4" />
              New Check-in
            </Link>
          </Button>
        </div>

        {/* Next Check-in Due */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-amber-500/50 bg-amber-500/5 p-6 mb-6"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold">Submit a Check-in</h2>
              <p className="text-sm text-amber-600">
                Keep your coach updated on your progress
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/athlete/check-ins/new">
              Submit Now
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {hasCheckIns ? (
        <>
          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-3 mb-6"
          >
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Check-ins</p>
              <p className="text-2xl font-bold mt-1">{totalCheckIns}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Latest Weight</p>
              <p className="text-2xl font-bold mt-1">
                {latestWeight ? `${Math.round(latestWeight * 10) / 10} kg` : '-'}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Weight Change</p>
              <p className={cn(
                'text-2xl font-bold mt-1',
                weightChange && weightChange < 0 ? 'text-green-500' : weightChange && weightChange > 0 ? 'text-amber-500' : ''
              )}>
                {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange} kg` : '-'}
              </p>
            </div>
          </motion.div>

          {/* Check-in History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">History</h2>
            </div>

            <div className="divide-y divide-border">
              {checkIns.map((checkIn) => (
                <Link
                  key={checkIn.id}
                  href={`/athlete/check-ins/${checkIn.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    checkIn.was_sent_to_coach ? 'bg-green-500/10' : 'bg-amber-500/10'
                  )}>
                    {checkIn.was_sent_to_coach ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {new Date(checkIn.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
                      {checkIn.weight && <span>{Math.round(checkIn.weight * 10) / 10} kg</span>}
                      {checkIn.sleep_hours && (
                        <>
                          <span>•</span>
                          <span>{checkIn.sleep_hours}h sleep</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      checkIn.was_sent_to_coach
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-amber-500/10 text-amber-600'
                    )}>
                      {checkIn.was_sent_to_coach ? 'Submitted' : 'Draft'}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-12 text-center"
        >
          <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Check-ins Yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Regular check-ins help your coach track your progress and adjust your programme accordingly.
          </p>
          <Button asChild>
            <Link href="/athlete/check-ins/new">
              Submit Your First Check-in
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      )}
      </div>
    </>
  )
}
