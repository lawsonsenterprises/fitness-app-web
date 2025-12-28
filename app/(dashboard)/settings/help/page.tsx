'use client'

import {
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const resources = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Comprehensive guides and tutorials',
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
    icon: FileText,
    title: 'API Reference',
    description: 'Technical documentation for integrations',
    href: '#',
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
    question: 'How do I invite a new client?',
    answer:
      'Navigate to the Clients page and click "Add Client". Enter their email address and they\'ll receive an invitation to join your roster.',
  },
  {
    question: 'Can I customise programme templates?',
    answer:
      'Yes! You can create templates from scratch or duplicate existing ones. Each template can be fully customised with exercises, sets, reps, and notes.',
  },
  {
    question: 'How do check-ins work?',
    answer:
      'Clients submit weekly check-ins with their weight, progress photos, and notes. You\'ll receive a notification and can provide feedback directly in the app.',
  },
  {
    question: 'What happens if I exceed my client limit?',
    answer:
      'You won\'t be able to add new clients until you upgrade your plan or remove inactive clients. Existing clients will continue to have access.',
  },
  {
    question: 'Can I export client data?',
    answer:
      'Yes, you can export client progress data, check-ins, and programme history as PDF or CSV files from the client detail page.',
  },
]

export default function HelpSettingsPage() {
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
              Start Live Chat
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

      {/* Keyboard shortcuts */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Keyboard Shortcuts</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { keys: ['⌘', 'K'], action: 'Open search' },
            { keys: ['⌘', 'N'], action: 'New client' },
            { keys: ['⌘', 'P'], action: 'New programme' },
            { keys: ['⌘', '/'], action: 'Show shortcuts' },
            { keys: ['Esc'], action: 'Close modal' },
            { keys: ['⌘', 'S'], action: 'Save changes' },
          ].map((shortcut) => (
            <div
              key={shortcut.action}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2"
            >
              <span className="text-sm">{shortcut.action}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, i) => (
                  <kbd
                    key={i}
                    className="rounded bg-background px-2 py-0.5 font-mono text-xs shadow-sm border border-border"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
