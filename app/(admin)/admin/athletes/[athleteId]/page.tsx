'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Mail,
  Calendar,
  User,
  Dumbbell,
  UtensilsCrossed,
  ClipboardCheck,
  Eye,
  MessageSquare,
  Activity,
  Scale,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/dashboard/top-bar'
import { useAthleteDetail } from '@/hooks/admin'

function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '??'
}

function getDisplayName(firstName?: string | null, lastName?: string | null, displayName?: string | null, email?: string): string {
  if (displayName) return displayName
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  return email || 'Unknown'
}

function getRelativeTime(date: string | null): string {
  if (!date) return 'Never'
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 5) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AthleteDetailPage({
  params,
}: {
  params: Promise<{ athleteId: string }>
}) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview')

  const { data: athlete, isLoading, error } = useAthleteDetail(resolvedParams.athleteId)

  if (isLoading) {
    return (
      <>
        <TopBar title="Athlete Details" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (error || !athlete) {
    return (
      <>
        <TopBar title="Athlete Details" />
        <div className="p-6 lg:p-8">
          <Link
            href="/admin/athletes"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Athletes
          </Link>
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground">
              {error ? 'Failed to load athlete details' : 'Athlete not found'}
            </p>
          </div>
        </div>
      </>
    )
  }

  const displayName = getDisplayName(athlete.first_name, athlete.last_name, athlete.display_name, athlete.email)
  const initials = getInitials(athlete.first_name, athlete.last_name, athlete.email)

  // Calculate weight stats from weight history
  const weightHistory = athlete.weightHistory || []
  const currentWeight = weightHistory[0]?.weight || 0
  const startWeight = weightHistory[weightHistory.length - 1]?.weight || currentWeight
  const weightChange = startWeight - currentWeight

  // Get coach info
  const coach = athlete.coach
  const coachName = coach ? getDisplayName(coach.first_name, coach.last_name, coach.display_name, coach.email) : 'Unassigned'

  // Get client status
  const clientStatus = athlete.clientInfo?.status || 'pending'

  // Get last check-in
  const lastCheckIn = athlete.recentCheckIns?.[0]
  const checkInCount = athlete.checkInCount || 0

  // Prepare weight chart data
  const chartData = weightHistory.slice(0, 10).reverse().map((log: { logged_date: string; weight: number }) => ({
    date: new Date(log.logged_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    weight: log.weight,
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600'
      case 'pending': return 'bg-amber-500/10 text-amber-600'
      case 'paused': return 'bg-blue-500/10 text-blue-600'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <>
      <TopBar title="Athlete Details" />
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/athletes"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Athletes
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-xl font-bold text-white">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{displayName}</h1>
                  <span className={cn('rounded-full px-3 py-1 text-sm font-medium capitalize', getStatusColor(clientStatus))}>
                    {clientStatus}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {athlete.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Coach: {coachName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Impersonate
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-4 mb-8"
        >
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Scale className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Current Weight</span>
            </div>
            {currentWeight > 0 ? (
              <>
                <p className="text-2xl font-bold">{currentWeight.toFixed(1)} kg</p>
                {weightChange !== 0 && (
                  <p className={cn('text-xs mt-1 flex items-center gap-1', weightChange > 0 ? 'text-green-500' : 'text-amber-500')}>
                    {weightChange > 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {Math.abs(weightChange).toFixed(1)} kg {weightChange > 0 ? 'lost' : 'gained'}
                  </p>
                )}
              </>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">-</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ClipboardCheck className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Check-Ins</span>
            </div>
            <p className="text-2xl font-bold">{checkInCount}</p>
            <p className="text-xs text-muted-foreground mt-1">total submitted</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Last Check-In</span>
            </div>
            {lastCheckIn ? (
              <>
                <p className="text-2xl font-bold">
                  {new Date(lastCheckIn.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getRelativeTime(lastCheckIn.created_at)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">-</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Last Active</span>
            </div>
            <p className="text-2xl font-bold">
              {athlete.last_sign_in_at
                ? new Date(athlete.last_sign_in_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {getRelativeTime(athlete.last_sign_in_at)}
            </p>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 mb-8"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="text-sm font-medium">
                  {athlete.created_at
                    ? new Date(athlete.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })
                    : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Active</span>
                <span className="text-sm font-medium">
                  {athlete.last_sign_in_at
                    ? new Date(athlete.last_sign_in_at).toLocaleString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })
                    : 'Never'}
                </span>
              </div>
              {coach && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Coach</span>
                  <Link href={`/admin/coaches/${coach.id}`} className="text-sm font-medium text-primary hover:underline">
                    {coachName}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Client Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium capitalize">{clientStatus}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Check-Ins</p>
                  <p className="text-sm font-medium">{checkInCount} submitted</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                activeTab === tab
                  ? 'bg-foreground text-background'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-6">Weight Progress</h3>
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} kg`, 'Weight']}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#weightGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Scale className="h-12 w-12 mb-4 opacity-50" />
                <p>No weight data recorded</p>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Start Weight</p>
                  <p className="text-xl font-bold">{startWeight.toFixed(1)} kg</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                  <p className="text-xl font-bold">{currentWeight.toFixed(1)} kg</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Change</p>
                  <p className={cn('text-xl font-bold', weightChange > 0 ? 'text-green-500' : weightChange < 0 ? 'text-amber-500' : '')}>
                    {weightChange > 0 ? '-' : weightChange < 0 ? '+' : ''}{Math.abs(weightChange).toFixed(1)} kg
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-6">Recent Check-Ins</h3>
            {athlete.recentCheckIns && athlete.recentCheckIns.length > 0 ? (
              <div className="space-y-4">
                {athlete.recentCheckIns.map((checkIn: { id: string; created_at: string; weight?: number; notes?: string }) => (
                  <div key={checkIn.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                      <ClipboardCheck className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Check-in submitted</p>
                      {checkIn.weight && (
                        <p className="text-sm text-muted-foreground">Weight: {checkIn.weight} kg</p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {getRelativeTime(checkIn.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mb-4 opacity-50" />
                <p>No check-ins submitted yet</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
