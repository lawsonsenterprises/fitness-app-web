'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ShieldOff,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Coach {
  id: string
  name: string
  email: string
  clientCount: number
}

interface SuspendCoachModalProps {
  coach: Coach
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}

const suspensionReasons = [
  { value: 'terms_violation', label: 'Terms of Service Violation' },
  { value: 'payment_issues', label: 'Payment Issues' },
  { value: 'client_complaints', label: 'Client Complaints' },
  { value: 'inactivity', label: 'Extended Inactivity' },
  { value: 'other', label: 'Other' },
]

export function SuspendCoachModal({
  coach,
  isOpen,
  onClose,
  onConfirm,
}: SuspendCoachModalProps) {
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    const finalReason = reason === 'other' ? customReason : reason
    if (!finalReason) return

    setIsSubmitting(true)
    try {
      await onConfirm(finalReason)
      onClose()
    } catch (error) {
      console.error('Failed to suspend coach:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = reason && (reason !== 'other' || customReason.trim())

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="rounded-xl border border-border bg-card shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10">
                    <ShieldOff className="h-5 w-5 text-rose-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Suspend Coach</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Warning */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-600">
                    <p className="font-medium">This action will:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>Immediately suspend {coach.name}'s account</li>
                      <li>Prevent login and access to the platform</li>
                      {coach.clientCount > 0 && (
                        <li>Affect {coach.clientCount} client(s) currently assigned</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Coach info */}
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Coach</p>
                  <p className="font-medium">{coach.name}</p>
                  <p className="text-sm text-muted-foreground">{coach.email}</p>
                </div>

                {/* Reason selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for Suspension
                  </label>
                  <div className="space-y-2">
                    {suspensionReasons.map((r) => (
                      <label
                        key={r.value}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                          reason === r.value
                            ? 'border-rose-500 bg-rose-500/5'
                            : 'border-border hover:border-muted-foreground/30'
                        )}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={(e) => setReason(e.target.value)}
                          className="sr-only"
                        />
                        <div className={cn(
                          'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                          reason === r.value ? 'border-rose-500' : 'border-muted-foreground'
                        )}>
                          {reason === r.value && (
                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                          )}
                        </div>
                        <span className="text-sm">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom reason */}
                {reason === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please provide a reason..."
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-rose-500 transition-colors resize-none"
                    />
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleConfirm}
                  disabled={!canSubmit || isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    canSubmit && !isSubmitting
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : 'bg-rose-500/50 cursor-not-allowed'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Suspending...
                    </>
                  ) : (
                    <>
                      <ShieldOff className="h-4 w-4" />
                      Suspend Coach
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export type { SuspendCoachModalProps }
