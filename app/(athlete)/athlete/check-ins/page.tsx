'use client'

import Link from 'next/link'
import {
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock data
const mockCheckIns = [
  {
    id: '1',
    date: '2024-12-22',
    status: 'reviewed',
    weight: 76.2,
    feedback: 'Excellent consistency this week! Keep up the great work.',
    metrics: { adherence: 95, energy: 8, sleep: 7.5 },
  },
  {
    id: '2',
    date: '2024-12-15',
    status: 'reviewed',
    weight: 76.8,
    feedback: 'Good progress. Consider adding more recovery days.',
    metrics: { adherence: 88, energy: 7, sleep: 6.5 },
  },
  {
    id: '3',
    date: '2024-12-08',
    status: 'reviewed',
    weight: 77.1,
    feedback: null,
    metrics: { adherence: 92, energy: 8, sleep: 7 },
  },
  {
    id: '4',
    date: '2024-12-01',
    status: 'reviewed',
    weight: 77.5,
    feedback: 'Great start to the programme. Looking forward to seeing progress.',
    metrics: { adherence: 90, energy: 7, sleep: 7 },
  },
]

const nextCheckInDue = {
  daysUntil: 1,
  dueDate: 'Tomorrow',
}

export default function CheckInsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Check-ins</h1>
          <p className="mt-1 text-muted-foreground">
            Weekly progress updates with your coach
          </p>
        </div>
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
        className={cn(
          'rounded-xl border p-6 mb-6',
          nextCheckInDue.daysUntil <= 1
            ? 'border-amber-500/50 bg-amber-500/5'
            : 'border-border bg-card'
        )}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              nextCheckInDue.daysUntil <= 1 ? 'bg-amber-500/10' : 'bg-muted'
            )}>
              <Calendar className={cn(
                'h-6 w-6',
                nextCheckInDue.daysUntil <= 1 ? 'text-amber-600' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <h2 className="font-semibold">Next Check-in Due</h2>
              <p className={cn(
                'text-sm',
                nextCheckInDue.daysUntil <= 1 ? 'text-amber-600' : 'text-muted-foreground'
              )}>
                {nextCheckInDue.dueDate}
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

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3 mb-6"
      >
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Check-ins</p>
          <p className="text-2xl font-bold mt-1">{mockCheckIns.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Adherence</p>
          <p className="text-2xl font-bold mt-1">
            {Math.round(mockCheckIns.reduce((acc, c) => acc + c.metrics.adherence, 0) / mockCheckIns.length)}%
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Weight Change</p>
          <p className="text-2xl font-bold mt-1 text-green-500">
            -{(mockCheckIns[mockCheckIns.length - 1].weight - mockCheckIns[0].weight).toFixed(1)}kg
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
          {mockCheckIns.map((checkIn) => (
            <Link
              key={checkIn.id}
              href={`/athlete/check-ins/${checkIn.id}`}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                checkIn.status === 'reviewed' ? 'bg-green-500/10' : 'bg-amber-500/10'
              )}>
                {checkIn.status === 'reviewed' ? (
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
                  {checkIn.feedback && (
                    <MessageSquare className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
                  <span>{checkIn.weight}kg</span>
                  <span>•</span>
                  <span>{checkIn.metrics.adherence}% adherence</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                  checkIn.status === 'reviewed'
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-amber-500/10 text-amber-600'
                )}>
                  {checkIn.status}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
