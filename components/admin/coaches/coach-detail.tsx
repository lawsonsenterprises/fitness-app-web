'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Clock,
  Shield,
  ShieldOff,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

interface CoachDetailData {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  avatar?: string
  status: 'active' | 'suspended' | 'pending'
  clientCount: number
  activeClientCount: number
  subscriptionTier?: string
  subscriptionStatus?: 'active' | 'past_due' | 'cancelled'
  monthlyRevenue?: number
  joinedAt: Date
  lastActiveAt?: Date
  bio?: string
}

interface CoachDetailProps {
  coach: CoachDetailData
  onSuspend: () => void
  onActivate: () => void
  onImpersonate: () => void
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  suspended: { label: 'Suspended', color: 'bg-rose-500', textColor: 'text-rose-600' },
  pending: { label: 'Pending', color: 'bg-amber-500', textColor: 'text-amber-600' },
}

const subscriptionStatusConfig = {
  active: { label: 'Active', color: 'text-emerald-600' },
  past_due: { label: 'Past Due', color: 'text-amber-600' },
  cancelled: { label: 'Cancelled', color: 'text-rose-600' },
}

export function CoachDetail({
  coach,
  onSuspend,
  onActivate,
  onImpersonate,
}: CoachDetailProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value)
  }

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
            {coach.avatar ? (
              <Image
                src={coach.avatar}
                alt={coach.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {coach.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{coach.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    'h-2 w-2 rounded-full',
                    statusConfig[coach.status].color
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    statusConfig[coach.status].textColor
                  )}>
                    {statusConfig[coach.status].label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  onClick={onImpersonate}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 text-violet-600 text-sm font-medium hover:bg-violet-500/20 transition-colors"
                >
                  <UserCog className="h-4 w-4" />
                  Impersonate
                </motion.button>
                {coach.status === 'suspended' ? (
                  <motion.button
                    onClick={onActivate}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Activate
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={onSuspend}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-600 text-sm font-medium hover:bg-rose-500/20 transition-colors"
                  >
                    <ShieldOff className="h-4 w-4" />
                    Suspend
                  </motion.button>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${coach.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {coach.email}
                </a>
              </div>
              {coach.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{coach.phone}</span>
                </div>
              )}
              {coach.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{coach.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {format(coach.joinedAt, 'd MMMM yyyy')}
                </span>
              </div>
            </div>

            {/* Bio */}
            {coach.bio && (
              <p className="mt-4 text-sm text-muted-foreground">{coach.bio}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span className="text-xs">Total Clients</span>
          </div>
          <p className="text-2xl font-bold">{coach.clientCount}</p>
          <p className="text-xs text-muted-foreground">
            {coach.activeClientCount} active
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs">Subscription</span>
          </div>
          <p className="text-lg font-bold">{coach.subscriptionTier || 'None'}</p>
          {coach.subscriptionStatus && (
            <p className={cn(
              'text-xs',
              subscriptionStatusConfig[coach.subscriptionStatus].color
            )}>
              {subscriptionStatusConfig[coach.subscriptionStatus].label}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="text-xs">Monthly Revenue</span>
          </div>
          <p className="text-2xl font-bold">
            {coach.monthlyRevenue !== undefined
              ? formatCurrency(coach.monthlyRevenue)
              : '-'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Last Active</span>
          </div>
          <p className="text-lg font-bold">
            {coach.lastActiveAt
              ? formatDistanceToNow(coach.lastActiveAt, { addSuffix: true })
              : 'Never'
            }
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export type { CoachDetailData, CoachDetailProps }
