'use client'

import { motion } from 'framer-motion'
import {
  Mail,
  Calendar,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Flame,
  UserCog,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

interface AthleteDetailData {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'active' | 'inactive' | 'pending'
  coachId?: string
  coachName?: string
  joinedAt: Date
  lastActiveAt?: Date
  checkInStreak?: number
  totalCheckIns?: number
  currentWeight?: number
  startWeight?: number
  goalWeight?: number
  currentProgramme?: string
  programmeProgress?: number
}

interface AthleteDetailProps {
  athlete: AthleteDetailData
  onViewCoach?: (id: string) => void
  onImpersonate: () => void
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  inactive: { label: 'Inactive', color: 'bg-slate-500', textColor: 'text-slate-600' },
  pending: { label: 'Pending', color: 'bg-amber-500', textColor: 'text-amber-600' },
}

export function AthleteDetail({
  athlete,
  onViewCoach,
  onImpersonate,
}: AthleteDetailProps) {
  const weightChange = athlete.currentWeight && athlete.startWeight
    ? athlete.currentWeight - athlete.startWeight
    : null

  const weightToGoal = athlete.currentWeight && athlete.goalWeight
    ? athlete.goalWeight - athlete.currentWeight
    : null

  return (
    <div className="space-y-6">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {athlete.avatar ? (
              <img
                src={athlete.avatar}
                alt={athlete.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {athlete.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{athlete.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    'h-2 w-2 rounded-full',
                    statusConfig[athlete.status].color
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    statusConfig[athlete.status].textColor
                  )}>
                    {statusConfig[athlete.status].label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <motion.button
                onClick={onImpersonate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 text-violet-600 text-sm font-medium hover:bg-violet-500/20 transition-colors"
              >
                <UserCog className="h-4 w-4" />
                Impersonate
              </motion.button>
            </div>

            {/* Contact and coach info */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${athlete.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {athlete.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {format(athlete.joinedAt, 'd MMMM yyyy')}
                </span>
              </div>
              {athlete.coachName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Coach:</span>
                  <button
                    onClick={() => athlete.coachId && onViewCoach?.(athlete.coachId)}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {athlete.coachName}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              )}
              {athlete.lastActiveAt && (
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Active {formatDistanceToNow(athlete.lastActiveAt, { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Check-in streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs">Check-in Streak</span>
          </div>
          <p className="text-2xl font-bold">
            {athlete.checkInStreak ?? 0}
            <span className="text-sm font-normal text-muted-foreground ml-1">weeks</span>
          </p>
          {athlete.totalCheckIns !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {athlete.totalCheckIns} total check-ins
            </p>
          )}
        </motion.div>

        {/* Weight progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            {weightChange !== null && weightChange < 0 ? (
              <TrendingDown className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-blue-500" />
            )}
            <span className="text-xs">Weight Progress</span>
          </div>
          {athlete.currentWeight ? (
            <>
              <p className="text-2xl font-bold">
                {athlete.currentWeight}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
              </p>
              {weightChange !== null && (
                <p className={cn(
                  'text-xs mt-1',
                  weightChange <= 0 ? 'text-emerald-600' : 'text-blue-600'
                )}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg from start
                </p>
              )}
            </>
          ) : (
            <p className="text-lg font-bold text-muted-foreground">-</p>
          )}
        </motion.div>

        {/* Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4 text-violet-500" />
            <span className="text-xs">Goal Weight</span>
          </div>
          {athlete.goalWeight ? (
            <>
              <p className="text-2xl font-bold">
                {athlete.goalWeight}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
              </p>
              {weightToGoal !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.abs(weightToGoal).toFixed(1)} kg to go
                </p>
              )}
            </>
          ) : (
            <p className="text-lg font-bold text-muted-foreground">Not set</p>
          )}
        </motion.div>

        {/* Programme progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-xs">Programme</span>
          </div>
          {athlete.currentProgramme ? (
            <>
              <p className="text-sm font-medium truncate">{athlete.currentProgramme}</p>
              {athlete.programmeProgress !== undefined && (
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${athlete.programmeProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {athlete.programmeProgress}% complete
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">No programme</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export type { AthleteDetailData, AthleteDetailProps }
