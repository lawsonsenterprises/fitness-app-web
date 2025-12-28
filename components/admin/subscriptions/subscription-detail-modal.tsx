'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CreditCard,
  Calendar,
  Clock,
  ExternalLink,
  Receipt,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface SubscriptionDetail {
  id: string
  coachId: string
  coachName: string
  coachEmail: string
  tier: string
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  amount: number
  currency: string
  interval: 'month' | 'year'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd?: boolean
  trialEnd?: Date
  clientCount?: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  invoices?: {
    id: string
    amount: number
    status: 'paid' | 'open' | 'failed'
    date: Date
  }[]
}

interface SubscriptionDetailModalProps {
  subscription: SubscriptionDetail
  isOpen: boolean
  onClose: () => void
  onViewCoach: (id: string) => void
  onOpenInStripe?: (subscriptionId: string) => void
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  past_due: { label: 'Past Due', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  trialing: { label: 'Trial', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

const invoiceStatusConfig = {
  paid: { label: 'Paid', color: 'text-emerald-600' },
  open: { label: 'Open', color: 'text-amber-600' },
  failed: { label: 'Failed', color: 'text-rose-600' },
}

export function SubscriptionDetailModal({
  subscription,
  isOpen,
  onClose,
  onViewCoach,
  onOpenInStripe,
}: SubscriptionDetailModalProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="rounded-xl border border-border bg-card shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold">Subscription Details</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status banner */}
                <div className={cn(
                  'rounded-lg border p-4',
                  statusConfig[subscription.status].color
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{subscription.tier}</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(subscription.amount, subscription.currency)}
                        <span className="text-sm font-normal">/{subscription.interval}</span>
                      </p>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      statusConfig[subscription.status].color
                    )}>
                      {statusConfig[subscription.status].label}
                    </span>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="mt-3 flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Cancels at end of period</span>
                    </div>
                  )}
                </div>

                {/* Coach info */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {subscription.coachName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{subscription.coachName}</p>
                        <p className="text-sm text-muted-foreground">{subscription.coachEmail}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewCoach(subscription.coachId)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Billing details */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Billing Period</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">Started</span>
                      </div>
                      <p className="font-medium">
                        {format(subscription.currentPeriodStart, 'd MMMM yyyy')}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Renews</span>
                      </div>
                      <p className="font-medium">
                        {format(subscription.currentPeriodEnd, 'd MMMM yyyy')}
                      </p>
                    </div>
                  </div>

                  {subscription.trialEnd && (
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <p className="text-sm text-blue-600">
                        Trial ends {format(subscription.trialEnd, 'd MMMM yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent invoices */}
                {subscription.invoices && subscription.invoices.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground">Recent Invoices</h3>
                    <div className="space-y-2">
                      {subscription.invoices.slice(0, 5).map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {formatCurrency(invoice.amount, subscription.currency)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(invoice.date, 'd MMM yyyy')}
                              </p>
                            </div>
                          </div>
                          <span className={cn(
                            'text-xs font-medium',
                            invoiceStatusConfig[invoice.status].color
                          )}>
                            {invoiceStatusConfig[invoice.status].label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stripe link */}
                {subscription.stripeSubscriptionId && onOpenInStripe && (
                  <button
                    onClick={() => onOpenInStripe(subscription.stripeSubscriptionId!)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm font-medium">View in Stripe</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export type { SubscriptionDetail, SubscriptionDetailModalProps }
