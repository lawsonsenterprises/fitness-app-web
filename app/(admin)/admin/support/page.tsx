'use client'

import { useState } from 'react'
import {
  HeadphonesIcon,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  ChevronRight,
  Loader2,
  Filter,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { TopBar } from '@/components/dashboard/top-bar'
import {
  useSupportTickets,
  useTicketStats,
  type TicketStatus,
  type TicketPriority,
  type SupportTicket,
} from '@/hooks/admin'

const statusConfig: Record<TicketStatus, { label: string; icon: typeof AlertCircle; color: string; bgColor: string }> = {
  open: { label: 'Open', icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  waiting_on_user: { label: 'Waiting on User', icon: User, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  waiting_on_admin: { label: 'Waiting on Admin', icon: HeadphonesIcon, color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  closed: { label: 'Closed', icon: CheckCircle2, color: 'text-gray-600', bgColor: 'bg-gray-500/10' },
}

const priorityConfig: Record<TicketPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-500/10' },
  medium: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-500/10' },
}

function getUserDisplayName(user?: SupportTicket['user']): string {
  if (!user) return 'Unknown User'
  if (user.display_name) return user.display_name
  if (user.first_name || user.last_name) return `${user.first_name || ''} ${user.last_name || ''}`.trim()
  return user.email
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')

  const { data: ticketsData, isLoading } = useSupportTickets({
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery || undefined,
  })
  const { data: stats } = useTicketStats()

  const tickets = ticketsData?.tickets || []

  return (
    <>
      <TopBar title="Support Tickets" />
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Support Tickets</h1>
          <p className="mt-1 text-muted-foreground">
            Manage user support requests and issues
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Open</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">{stats?.open || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats?.inProgress || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats?.resolved || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Urgent</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats?.urgent || 0}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="pl-10"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_on_user">Waiting on User</option>
              <option value="waiting_on_admin">Waiting on Admin</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'all')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <HeadphonesIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No Tickets Found</h3>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No support tickets have been submitted yet'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {tickets.map((ticket) => {
              const statusInfo = statusConfig[ticket.status]
              const priorityInfo = priorityConfig[ticket.priority]
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={ticket.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-red-500/30 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Status icon */}
                  <div className={cn('p-2.5 rounded-lg', statusInfo.bgColor)}>
                    <StatusIcon className={cn('h-5 w-5', statusInfo.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{ticket.ticket_number}
                      </span>
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        priorityInfo.bgColor,
                        priorityInfo.color
                      )}>
                        {priorityInfo.label}
                      </span>
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                        'bg-muted text-muted-foreground'
                      )}>
                        {ticket.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-medium truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {getUserDisplayName(ticket.user)}
                      </span>
                      <span>
                        {new Date(ticket.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="hidden md:flex items-center gap-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                      statusInfo.bgColor,
                      statusInfo.color
                    )}>
                      {statusInfo.label}
                    </span>
                    {ticket.assignee && (
                      <span className="text-xs text-muted-foreground">
                        Assigned to: {getUserDisplayName(ticket.assignee)}
                      </span>
                    )}
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Summary */}
        {tickets.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {tickets.length} of {ticketsData?.total || 0} tickets
          </div>
        )}
      </div>
    </>
  )
}
