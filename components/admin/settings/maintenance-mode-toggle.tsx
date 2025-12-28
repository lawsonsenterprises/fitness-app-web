'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wrench,
  AlertTriangle,
  Users,
  Shield,
  Loader2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MaintenanceStatus {
  enabled: boolean
  message?: string
  estimatedEndTime?: Date
  allowAdminAccess: boolean
  allowCoachAccess: boolean
}

interface MaintenanceModeToggleProps {
  status: MaintenanceStatus
  onUpdate: (status: MaintenanceStatus) => Promise<void>
  activeUserCount?: number
}

export function MaintenanceModeToggle({
  status: initialStatus,
  onUpdate,
  activeUserCount = 0,
}: MaintenanceModeToggleProps) {
  const [status, setStatus] = useState<MaintenanceStatus>(initialStatus)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleToggle = () => {
    if (status.enabled) {
      // Turning off - no confirmation needed
      updateStatus({ ...status, enabled: false })
    } else {
      // Turning on - show confirmation
      setIsConfirming(true)
    }
  }

  const updateStatus = async (newStatus: MaintenanceStatus) => {
    setIsUpdating(true)
    try {
      await onUpdate(newStatus)
      setStatus(newStatus)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to update maintenance mode:', error)
    } finally {
      setIsUpdating(false)
      setIsConfirming(false)
    }
  }

  const confirmEnable = () => {
    updateStatus({ ...status, enabled: true })
  }

  return (
    <div className="space-y-6">
      {/* Main card */}
      <div className={cn(
        'rounded-xl border p-6 transition-colors',
        status.enabled
          ? 'border-amber-500/50 bg-amber-500/5'
          : 'border-border bg-card'
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={cn(
              'p-3 rounded-xl',
              status.enabled ? 'bg-amber-500/20' : 'bg-muted'
            )}>
              <Wrench className={cn(
                'h-6 w-6',
                status.enabled ? 'text-amber-500' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Maintenance Mode</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {status.enabled
                  ? 'Platform is currently in maintenance mode'
                  : 'Enable to prevent user access during maintenance'
                }
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={handleToggle}
            disabled={isUpdating || isConfirming}
            className={cn(
              'relative h-8 w-14 rounded-full transition-colors',
              status.enabled ? 'bg-amber-500' : 'bg-muted',
              (isUpdating || isConfirming) && 'opacity-50'
            )}
          >
            <motion.span
              animate={{ x: status.enabled ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 h-6 w-6 rounded-full bg-white shadow flex items-center justify-center"
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : isSuccess ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : null}
            </motion.span>
          </button>
        </div>

        {/* Status details when enabled */}
        {status.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-amber-500/30 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Active users warning */}
              {activeUserCount > 0 && (
                <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                  <Users className="h-5 w-5 text-rose-500" />
                  <span className="text-sm text-rose-600">
                    {activeUserCount} user{activeUserCount !== 1 ? 's' : ''} currently active - they will be logged out
                  </span>
                </div>
              )}

              {/* Message */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">
                  Maintenance Message
                </label>
                <textarea
                  value={status.message || ''}
                  onChange={(e) => setStatus({ ...status, message: e.target.value })}
                  placeholder="We're currently performing scheduled maintenance..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Estimated end time */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Estimated End Time
                </label>
                <input
                  type="datetime-local"
                  value={status.estimatedEndTime
                    ? new Date(status.estimatedEndTime.getTime() - status.estimatedEndTime.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                    : ''
                  }
                  onChange={(e) => setStatus({
                    ...status,
                    estimatedEndTime: e.target.value ? new Date(e.target.value) : undefined,
                  })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Access controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Allow Access During Maintenance</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatus({
                    ...status,
                    allowAdminAccess: !status.allowAdminAccess,
                  })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    status.allowAdminAccess
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admins
                </button>
                <button
                  type="button"
                  onClick={() => setStatus({
                    ...status,
                    allowCoachAccess: !status.allowCoachAccess,
                  })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    status.allowCoachAccess
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Users className="h-4 w-4" />
                  Coaches
                </button>
              </div>
            </div>

            {/* Save changes */}
            <motion.button
              onClick={() => updateStatus(status)}
              disabled={isUpdating}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 text-white px-4 py-2.5 font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Maintenance Settings'
              )}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {isConfirming && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirming(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="rounded-xl border border-border bg-card shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Enable Maintenance Mode?</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  This will prevent all users from accessing the platform.
                  {activeUserCount > 0 && (
                    <span className="text-rose-600 font-medium">
                      {' '}{activeUserCount} active user{activeUserCount !== 1 ? 's' : ''} will be logged out.
                    </span>
                  )}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfirming(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmEnable}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Wrench className="h-4 w-4" />
                        Enable
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export type { MaintenanceStatus, MaintenanceModeToggleProps }
