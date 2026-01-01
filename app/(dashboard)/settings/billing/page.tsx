'use client'

import { CreditCard, Crown, Info, Loader2, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Fetch the current user's subscription
async function fetchMySubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

// Fetch client count for the current coach
async function fetchClientCount(coachId: string) {
  const { count, error } = await supabase
    .from('coach_clients')
    .select('id', { count: 'exact', head: true })
    .eq('coach_id', coachId)
    .eq('status', 'active')

  if (error) throw error
  return count || 0
}

function useMySubscription() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['my-subscription', user?.id],
    queryFn: () => fetchMySubscription(user!.id),
    enabled: !!user?.id,
  })
}

function useMyClientCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['my-client-count', user?.id],
    queryFn: () => fetchClientCount(user!.id),
    enabled: !!user?.id,
  })
}

export default function BillingSettingsPage() {
  const { data: subscription, isLoading: subLoading, error: subError } = useMySubscription()
  const { data: clientCount = 0, isLoading: clientLoading } = useMyClientCount()

  const isLoading = subLoading || clientLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (subError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load subscription data</p>
      </div>
    )
  }

  // No subscription found
  if (!subscription) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No Active Subscription</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              You don&apos;t have an active subscription yet. Contact support to set up your billing.
            </p>
            <Button>Contact Support</Button>
          </div>
        </div>
      </div>
    )
  }

  // Format subscription data
  const tierLabel = subscription.tier
    ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)
    : 'Standard'

  const statusLabel = subscription.status
    ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
    : 'Unknown'

  const renewalDate = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const maxClients = subscription.max_clients || 'Unlimited'
  const monthlyAmount = subscription.last_payment_amount || 0

  return (
    <div className="space-y-8">
      {/* Current plan overview */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Crown className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{tierLabel} Plan</h2>
              {renewalDate && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Your subscription renews on {renewalDate}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    subscription.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : subscription.status === 'trialing'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {statusLabel}
                </span>
                <span className="text-sm text-muted-foreground">
                  {clientCount} / {maxClients} clients
                </span>
                {monthlyAmount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    £{monthlyAmount}/month
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Payment Method</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your payment details through Stripe
            </p>
            <div className="mt-4 rounded-lg bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Payment details managed by Stripe</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click &quot;Manage Subscription&quot; above to update your payment method via the secure Stripe portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
            <Info className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Billing History</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              View and download past invoices
            </p>
            <div className="mt-4 rounded-lg bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Invoices available in Stripe</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Access your complete billing history and download invoices through the Stripe customer portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      {subscription && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Plan Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Max Clients</p>
              <p className="text-lg font-semibold">{maxClients}</p>
            </div>
            {subscription.max_programmes && (
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Max Programmes</p>
                <p className="text-lg font-semibold">{subscription.max_programmes}</p>
              </div>
            )}
            {subscription.max_meal_plans && (
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Max Meal Plans</p>
                <p className="text-lg font-semibold">{subscription.max_meal_plans}</p>
              </div>
            )}
            {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
              <div className="rounded-lg bg-blue-500/10 p-4">
                <p className="text-sm text-blue-600">Trial Ends</p>
                <p className="text-lg font-semibold text-blue-600">
                  {new Date(subscription.trial_end).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
