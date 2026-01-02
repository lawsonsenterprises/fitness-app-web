'use client'

import {
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  Video,
  HelpCircle,
  Sparkles,
  Dumbbell,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const resources = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn how to use the app',
    href: '#',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Step-by-step walkthroughs',
    href: '#',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Dumbbell,
    title: 'Exercise Library',
    description: 'Browse all exercises with videos',
    href: '/athlete/training/exercises',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Sparkles,
    title: "What's New",
    description: 'Latest features and updates',
    href: '#',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
]

const faqs = [
  {
    question: 'How do I submit a check-in?',
    answer:
      'Go to the Check-ins page and tap "New Check-in". Fill in your weight, upload progress photos if required, and add any notes for your coach. Your coach will be notified once you submit.',
  },
  {
    question: 'Where can I find my training programme?',
    answer:
      'Your current training programme is available on the Training page. You can view your scheduled workouts, log exercises, and track your progress.',
  },
  {
    question: 'How do I log my meals?',
    answer:
      'Navigate to the Nutrition page and use the food log feature. You can search for foods, scan barcodes, or add custom meals to track your daily intake.',
  },
  {
    question: 'Can I message my coach?',
    answer:
      'Yes! Use the Messages feature to communicate with your coach. They\'ll receive a notification and can respond directly in the app.',
  },
  {
    question: 'How do I update my goals?',
    answer:
      'Go to Settings > Goals & Targets to update your weight goals, macro targets, and training preferences. Your coach will be able to see these updates.',
  },
]

export default function AthleteHelpSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Contact support */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <MessageCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Need Help?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Our support team typically responds within 2 hours
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
            <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
              <MessageCircle className="h-4 w-4" />
              Message Coach
            </Button>
          </div>
        </div>
      </div>

      {/* Resources grid */}
      <div>
        <h2 className="mb-6 text-lg font-semibold">Resources</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map((resource) => {
            const Icon = resource.icon
            return (
              <Link
                key={resource.title}
                href={resource.href}
                className={cn(
                  'group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all',
                  'hover:border-foreground/20 hover:shadow-sm'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    resource.bgColor
                  )}
                >
                  <Icon className={cn('h-5 w-5', resource.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium group-hover:text-amber-600 transition-colors">
                    {resource.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* FAQs */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <HelpCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-medium hover:bg-muted/50">
                <span>{faq.question}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-4 pb-4 text-sm text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">App Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">{new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
