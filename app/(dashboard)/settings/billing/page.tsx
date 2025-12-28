'use client'

import { CreditCard, Check, Crown, Zap, Users, Download, Receipt } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Starter',
    price: 29,
    description: 'Perfect for new coaches',
    features: [
      'Up to 10 clients',
      'Basic programme templates',
      'Weekly check-ins',
      'Email support',
    ],
    isCurrent: false,
    isPopular: false,
  },
  {
    name: 'Professional',
    price: 79,
    description: 'For growing coaching businesses',
    features: [
      'Up to 50 clients',
      'Advanced programme builder',
      'Custom meal plans',
      'In-app messaging',
      'Analytics dashboard',
      'Priority support',
    ],
    isCurrent: true,
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    description: 'For established fitness businesses',
    features: [
      'Unlimited clients',
      'White-label branding',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
    isCurrent: false,
    isPopular: false,
  },
]

const invoices = [
  { id: 'INV-2024-012', date: '2024-12-01', amount: 79, status: 'paid' },
  { id: 'INV-2024-011', date: '2024-11-01', amount: 79, status: 'paid' },
  { id: 'INV-2024-010', date: '2024-10-01', amount: 79, status: 'paid' },
  { id: 'INV-2024-009', date: '2024-09-01', amount: 79, status: 'paid' },
]

export default function BillingSettingsPage() {
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
              <h2 className="text-lg font-semibold">Professional Plan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your subscription renews on 1st January 2025
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  Active
                </span>
                <span className="text-sm text-muted-foreground">
                  <Users className="mr-1 inline-block h-4 w-4" />
                  23 / 50 clients
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <h2 className="mb-6 text-lg font-semibold">Available Plans</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-xl border bg-card p-6 transition-all',
                plan.isCurrent
                  ? 'border-amber-500 shadow-lg'
                  : 'border-border hover:border-foreground/20'
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">£{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.isCurrent ? 'outline' : 'default'}
                className={cn(
                  'w-full',
                  !plan.isCurrent && 'bg-foreground text-background hover:bg-foreground/90'
                )}
                disabled={plan.isCurrent}
              >
                {plan.isCurrent ? 'Current Plan' : 'Upgrade'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your payment details
              </p>
            </div>
          </div>
          <Button variant="outline">Update</Button>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
          <div className="flex h-10 w-16 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-800">
            <span className="text-xs font-bold text-white">VISA</span>
          </div>
          <div>
            <p className="font-medium">•••• •••• •••• 4242</p>
            <p className="text-sm text-muted-foreground">Expires 12/2026</p>
          </div>
        </div>
      </div>

      {/* Billing history */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Billing History</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Download invoices for your records
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="font-medium">{invoice.id}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(invoice.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">£{invoice.amount}.00</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium capitalize text-emerald-600">
                    {invoice.status}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
