'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  MessageSquare,
  Users,
  Flag,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  ChevronDown,
  X,
  User,
  Shield,
  ExternalLink,
  ArrowUpRight,
  Ban,
  Mail,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

// Types
interface MessageThread {
  id: string
  participants: {
    id: string
    name: string
    role: 'coach' | 'athlete'
    avatar?: string
  }[]
  lastMessage: {
    content: string
    senderId: string
    timestamp: Date
  }
  messageCount: number
  isFlagged: boolean
  flagReason?: string
  status: 'active' | 'resolved' | 'pending_review'
  createdAt: Date
}

interface FlaggedContent {
  id: string
  threadId: string
  content: string
  sender: {
    id: string
    name: string
    role: 'coach' | 'athlete'
  }
  recipient: {
    id: string
    name: string
    role: 'coach' | 'athlete'
  }
  flagReason: 'harassment' | 'spam' | 'inappropriate' | 'other'
  flaggedAt: Date
  status: 'pending' | 'reviewed' | 'dismissed'
  reviewedBy?: string
}

// Mock data
const mockThreads: MessageThread[] = [
  {
    id: '1',
    participants: [
      { id: 'c1', name: 'Mike Johnson', role: 'coach' },
      { id: 'a1', name: 'Sarah Williams', role: 'athlete' },
    ],
    lastMessage: {
      content: 'Great progress this week! Let\'s keep the momentum going.',
      senderId: 'c1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    messageCount: 47,
    isFlagged: false,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: '2',
    participants: [
      { id: 'c2', name: 'Emma Davis', role: 'coach' },
      { id: 'a2', name: 'James Anderson', role: 'athlete' },
    ],
    lastMessage: {
      content: 'I\'ve updated your meal plan based on your feedback.',
      senderId: 'c2',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    messageCount: 23,
    isFlagged: true,
    flagReason: 'Reported by athlete',
    status: 'pending_review',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
  {
    id: '3',
    participants: [
      { id: 'c1', name: 'Mike Johnson', role: 'coach' },
      { id: 'a3', name: 'Emily Brown', role: 'athlete' },
    ],
    lastMessage: {
      content: 'When should I expect the new programme?',
      senderId: 'a3',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    messageCount: 156,
    isFlagged: false,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
  },
  {
    id: '4',
    participants: [
      { id: 'c3', name: 'Tom Wilson', role: 'coach' },
      { id: 'a4', name: 'Alex Taylor', role: 'athlete' },
    ],
    lastMessage: {
      content: 'This is getting out of hand...',
      senderId: 'a4',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
    messageCount: 89,
    isFlagged: true,
    flagReason: 'Auto-flagged: Potential conflict',
    status: 'pending_review',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
  },
  {
    id: '5',
    participants: [
      { id: 'c2', name: 'Emma Davis', role: 'coach' },
      { id: 'a5', name: 'Chris Martin', role: 'athlete' },
    ],
    lastMessage: {
      content: 'See you at the check-in tomorrow!',
      senderId: 'c2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    messageCount: 34,
    isFlagged: false,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
  },
]

const mockFlaggedContent: FlaggedContent[] = [
  {
    id: 'f1',
    threadId: '2',
    content: 'This message was flagged for review due to reported issues.',
    sender: { id: 'c2', name: 'Emma Davis', role: 'coach' },
    recipient: { id: 'a2', name: 'James Anderson', role: 'athlete' },
    flagReason: 'harassment',
    flaggedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'pending',
  },
  {
    id: 'f2',
    threadId: '4',
    content: 'Automated system detected potentially problematic language.',
    sender: { id: 'c3', name: 'Tom Wilson', role: 'coach' },
    recipient: { id: 'a4', name: 'Alex Taylor', role: 'athlete' },
    flagReason: 'inappropriate',
    flaggedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'pending',
  },
]

const stats = {
  totalThreads: 1247,
  activeToday: 342,
  flaggedPending: 8,
  averageResponseTime: '2.4h',
}

export default function AdminMessagesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false)
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [activeTab, setActiveTab] = useState<'threads' | 'flagged'>('threads')

  const filteredThreads = useMemo(() => {
    return mockThreads.filter((thread) => {
      // Search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesParticipant = thread.participants.some((p) =>
          p.name.toLowerCase().includes(searchLower)
        )
        const matchesContent = thread.lastMessage.content
          .toLowerCase()
          .includes(searchLower)
        if (!matchesParticipant && !matchesContent) return false
      }

      // Status filter
      if (statusFilter && thread.status !== statusFilter) return false

      // Flagged filter
      if (showFlaggedOnly && !thread.isFlagged) return false

      return true
    })
  }, [searchQuery, statusFilter, showFlaggedOnly])

  const getStatusConfig = (status: MessageThread['status']) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          colour: 'bg-emerald-500/10 text-emerald-500',
          icon: CheckCircle2,
        }
      case 'pending_review':
        return {
          label: 'Pending Review',
          colour: 'bg-amber-500/10 text-amber-500',
          icon: Clock,
        }
      case 'resolved':
        return {
          label: 'Resolved',
          colour: 'bg-blue-500/10 text-blue-500',
          icon: CheckCircle2,
        }
    }
  }

  const getFlagReasonConfig = (reason: FlaggedContent['flagReason']) => {
    switch (reason) {
      case 'harassment':
        return { label: 'Harassment', colour: 'text-rose-500' }
      case 'spam':
        return { label: 'Spam', colour: 'text-amber-500' }
      case 'inappropriate':
        return { label: 'Inappropriate', colour: 'text-purple-500' }
      case 'other':
        return { label: 'Other', colour: 'text-blue-500' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Message Monitor</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and moderate platform communications
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Threads',
            value: stats.totalThreads.toLocaleString(),
            icon: MessageSquare,
            colour: 'text-blue-500',
            bgColour: 'bg-blue-500/10',
          },
          {
            label: 'Active Today',
            value: stats.activeToday.toLocaleString(),
            icon: Users,
            colour: 'text-emerald-500',
            bgColour: 'bg-emerald-500/10',
          },
          {
            label: 'Flagged Pending',
            value: stats.flaggedPending.toString(),
            icon: Flag,
            colour: 'text-rose-500',
            bgColour: 'bg-rose-500/10',
          },
          {
            label: 'Avg Response Time',
            value: stats.averageResponseTime,
            icon: Clock,
            colour: 'text-amber-500',
            bgColour: 'bg-amber-500/10',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', stat.bgColour)}>
                  <Icon className={cn('h-5 w-5', stat.colour)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab('threads')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'threads'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          All Threads
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'flagged'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Flag className="h-4 w-4" />
          Flagged Content
          {mockFlaggedContent.filter((f) => f.status === 'pending').length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
              {mockFlaggedContent.filter((f) => f.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'threads' ? (
        <>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search threads by participant or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_review">Pending Review</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                  showFlaggedOnly
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                <Flag className="h-4 w-4" />
                Flagged
              </button>
            </div>
          </div>

          {/* Threads list */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {filteredThreads.map((thread, index) => {
                const statusConfig = getStatusConfig(thread.status)
                const StatusIcon = statusConfig.icon
                return (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Participants */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex -space-x-2">
                            {thread.participants.map((p) => (
                              <div
                                key={p.id}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-card"
                              >
                                {p.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </div>
                            ))}
                          </div>
                          <span className="font-medium">
                            {thread.participants.map((p) => p.name).join(' & ')}
                          </span>
                          {thread.isFlagged && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs">
                              <Flag className="h-3 w-3" />
                              Flagged
                            </div>
                          )}
                        </div>

                        {/* Last message */}
                        <p className="text-sm text-muted-foreground truncate">
                          <span className="font-medium text-foreground">
                            {thread.participants.find(
                              (p) => p.id === thread.lastMessage.senderId
                            )?.name}
                            :
                          </span>{' '}
                          {thread.lastMessage.content}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{thread.messageCount} messages</span>
                          <span>
                            Started{' '}
                            {formatDistanceToNow(thread.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                          {thread.flagReason && (
                            <span className="text-rose-500">{thread.flagReason}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                            statusConfig.colour
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(thread.lastMessage.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Empty state */}
          {filteredThreads.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No threads found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </>
      ) : (
        /* Flagged content tab */
        <div className="space-y-4">
          {mockFlaggedContent.map((flag, index) => {
            const reasonConfig = getFlagReasonConfig(flag.flagReason)
            return (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <AlertTriangle className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Flagged Message</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(flag.flaggedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs font-medium',
                      flag.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-500'
                        : flag.status === 'reviewed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {flag.status.charAt(0).toUpperCase() + flag.status.slice(1)}
                  </span>
                </div>

                {/* Message content */}
                <div className="rounded-lg bg-muted/50 p-4 mb-4">
                  <p className="text-sm italic">&quot;{flag.content}&quot;</p>
                </div>

                {/* Participants */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sender</p>
                      <p className="text-sm font-medium">
                        {flag.sender.name}
                        <span className="text-muted-foreground ml-1 capitalize">
                          ({flag.sender.role})
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <User className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Recipient</p>
                      <p className="text-sm font-medium">
                        {flag.recipient.name}
                        <span className="text-muted-foreground ml-1 capitalize">
                          ({flag.recipient.role})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flag reason */}
                <div className="flex items-center gap-2 mb-4">
                  <Flag className={cn('h-4 w-4', reasonConfig.colour)} />
                  <span className="text-sm font-medium">{reasonConfig.label}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Dismiss Flag
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Send Warning
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-sm font-medium">
                    <Ban className="h-4 w-4" />
                    Take Action
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    View Thread
                  </button>
                </div>
              </motion.div>
            )
          })}

          {mockFlaggedContent.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="font-semibold mb-1">No flagged content</h3>
              <p className="text-sm text-muted-foreground">
                All messages are currently clear
              </p>
            </div>
          )}
        </div>
      )}

      {/* Thread detail modal */}
      <AnimatePresence>
        {selectedThread && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedThread(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="rounded-xl border border-border bg-card shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Thread Details</h2>
                    <p className="text-sm text-muted-foreground">
                      ID: {selectedThread.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Participants */}
                  <div>
                    <h3 className="font-semibold mb-3">Participants</h3>
                    <div className="space-y-3">
                      {selectedThread.participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {p.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {p.role}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-blue-500 hover:bg-blue-500/10 transition-colors">
                              <ExternalLink className="h-3.5 w-3.5" />
                              View Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thread info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Messages</p>
                      <p className="text-xl font-bold">{selectedThread.messageCount}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="text-xl font-bold">
                        {format(selectedThread.createdAt, 'd MMM yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Flag info */}
                  {selectedThread.isFlagged && (
                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                      <div className="flex items-center gap-2 text-rose-500 mb-2">
                        <Flag className="h-4 w-4" />
                        <span className="font-medium">Flagged Thread</span>
                      </div>
                      <p className="text-sm text-rose-600">
                        {selectedThread.flagReason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      View Full Thread
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium">
                      <Shield className="h-4 w-4" />
                      Impersonate User
                    </button>
                    {selectedThread.isFlagged && (
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium ml-auto">
                        <CheckCircle2 className="h-4 w-4" />
                        Resolve Flag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
