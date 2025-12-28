'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flag,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
  Users,
  Percent,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureFlag {
  id: string
  name: string
  key: string
  description: string
  enabled: boolean
  rolloutPercentage?: number
  enabledForRoles?: ('athlete' | 'coach' | 'admin')[]
  lastModified?: Date
  modifiedBy?: string
}

interface FeatureFlagsProps {
  flags: FeatureFlag[]
  onToggle: (id: string, enabled: boolean) => Promise<void>
  onUpdateRollout: (id: string, percentage: number) => Promise<void>
  onUpdateRoles: (id: string, roles: FeatureFlag['enabledForRoles']) => Promise<void>
}

function FlagCard({
  flag,
  onToggle,
  onUpdateRollout,
  onUpdateRoles,
}: {
  flag: FeatureFlag
  onToggle: (enabled: boolean) => Promise<void>
  onUpdateRollout: (percentage: number) => Promise<void>
  onUpdateRoles: (roles: FeatureFlag['enabledForRoles']) => Promise<void>
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rollout, setRollout] = useState(flag.rolloutPercentage ?? 100)
  const [roles, setRoles] = useState<FeatureFlag['enabledForRoles']>(
    flag.enabledForRoles ?? ['athlete', 'coach', 'admin']
  )

  const handleToggle = async () => {
    setIsUpdating(true)
    try {
      await onToggle(!flag.enabled)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveRollout = async () => {
    setIsUpdating(true)
    try {
      await onUpdateRollout(rollout)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRoleToggle = async (role: 'athlete' | 'coach' | 'admin') => {
    const newRoles = roles?.includes(role)
      ? roles.filter((r) => r !== role)
      : [...(roles || []), role]
    setRoles(newRoles)
    setIsUpdating(true)
    try {
      await onUpdateRoles(newRoles)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <motion.div
      layout
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              flag.enabled ? 'bg-emerald-500/10' : 'bg-muted'
            )}>
              <Flag className={cn(
                'h-4 w-4',
                flag.enabled ? 'text-emerald-500' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <h4 className="font-medium">{flag.name}</h4>
              <p className="text-xs text-muted-foreground font-mono">{flag.key}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle */}
            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                flag.enabled ? 'bg-emerald-500' : 'bg-muted',
                isUpdating && 'opacity-50'
              )}
            >
              <motion.span
                animate={{ x: flag.enabled ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
              />
            </button>

            {/* Expand */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-2">{flag.description}</p>

        {/* Quick stats */}
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          {flag.rolloutPercentage !== undefined && (
            <span className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              {flag.rolloutPercentage}% rollout
            </span>
          )}
          {flag.enabledForRoles && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {flag.enabledForRoles.length} roles
            </span>
          )}
        </div>
      </div>

      {/* Expanded settings */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {/* Rollout percentage */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rollout Percentage
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={rollout}
                    onChange={(e) => setRollout(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12">{rollout}%</span>
                  <button
                    onClick={handleSaveRollout}
                    disabled={isUpdating || rollout === flag.rolloutPercentage}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>

              {/* Role targeting */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enabled for Roles
                </label>
                <div className="flex gap-2">
                  {(['athlete', 'coach', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleToggle(role)}
                      disabled={isUpdating}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                        roles?.includes(role)
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Last modified */}
              {flag.lastModified && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Last modified {flag.lastModified.toLocaleDateString('en-GB')}
                  {flag.modifiedBy && ` by ${flag.modifiedBy}`}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FeatureFlags({
  flags,
  onToggle,
  onUpdateRollout,
  onUpdateRoles,
}: FeatureFlagsProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all')

  const filteredFlags = flags.filter((flag) => {
    const matchesSearch =
      flag.name.toLowerCase().includes(search.toLowerCase()) ||
      flag.key.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'enabled' && flag.enabled) ||
      (filter === 'disabled' && !flag.enabled)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feature flags..."
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'enabled', 'disabled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                filter === f
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-600">
          <p className="font-medium">Feature Flag Safety</p>
          <p className="mt-1">
            Changes take effect immediately. Use rollout percentages for gradual releases.
          </p>
        </div>
      </div>

      {/* Flags list */}
      <div className="space-y-3">
        {filteredFlags.map((flag) => (
          <FlagCard
            key={flag.id}
            flag={flag}
            onToggle={(enabled) => onToggle(flag.id, enabled)}
            onUpdateRollout={(percentage) => onUpdateRollout(flag.id, percentage)}
            onUpdateRoles={(roles) => onUpdateRoles(flag.id, roles)}
          />
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Flag className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No feature flags found</p>
        </div>
      )}
    </div>
  )
}

export type { FeatureFlag, FeatureFlagsProps }
