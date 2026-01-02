import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ============================================================================
// Platform Stats Hooks
// ============================================================================

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [coaches, athletes, subscriptions] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, created_at, last_sign_in_at', { count: 'exact' })
          .contains('roles', ['coach']),
        supabase
          .from('profiles')
          .select('id, created_at, last_sign_in_at', { count: 'exact' })
          .contains('roles', ['athlete']),
        supabase
          .from('subscriptions')
          .select('*', { count: 'exact' })
          .eq('status', 'active'),
      ])

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      return {
        totalCoaches: coaches.count || 0,
        activeCoaches: coaches.data?.filter(c =>
          c.last_sign_in_at && new Date(c.last_sign_in_at) > sevenDaysAgo
        ).length || 0,
        totalAthletes: athletes.count || 0,
        activeAthletes: athletes.data?.filter(a =>
          a.last_sign_in_at && new Date(a.last_sign_in_at) > sevenDaysAgo
        ).length || 0,
        activeSubscriptions: subscriptions.count || 0,
        mrr: (subscriptions.data || []).reduce((sum, sub) => sum + (sub.amount || 0), 0),
      }
    },
  })
}

// ============================================================================
// Coaches Management Hooks
// ============================================================================

export function useAllCoaches(options?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { status, search, page = 1, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['all-coaches', status, search, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, subscriptions(*)', { count: 'exact' })
        .contains('roles', ['coach'])
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { coaches: data, total: count }
    },
  })
}

export function useCoachDetail(coachId: string) {
  return useQuery({
    queryKey: ['coach-detail', coachId],
    queryFn: async () => {
      const [profile, clients, subscription, recentActivity, revenueHistory] = await Promise.all([
        // Get coach profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', coachId)
          .single(),
        // Get coach's clients from coach_clients table
        supabase
          .from('coach_clients')
          .select(`
            *,
            client:profiles!coach_clients_client_id_fkey(
              id,
              display_name,
              first_name,
              last_name,
              email,
              avatar_url
            )
          `)
          .eq('coach_id', coachId)
          .order('created_at', { ascending: false }),
        // Get subscription
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', coachId)
          .eq('status', 'active')
          .maybeSingle(),
        // Get recent activity from check_ins reviewed by this coach
        supabase
          .from('check_ins')
          .select(`
            id,
            date,
            reviewed_at,
            user:profiles!check_ins_user_id_fkey(id, display_name, first_name, last_name)
          `)
          .eq('reviewed_by', coachId)
          .order('reviewed_at', { ascending: false })
          .limit(10),
        // Get payment history for revenue
        supabase
          .from('subscriptions')
          .select('last_payment_amount, last_payment_at, current_period_start')
          .eq('user_id', coachId)
          .order('current_period_start', { ascending: false })
          .limit(6),
      ])

      if (profile.error) throw profile.error

      // Calculate client stats
      const clientsData = clients.data || []
      const activeClients = clientsData.filter(c => c.status === 'active').length
      const pendingClients = clientsData.filter(c => c.status === 'pending').length
      const pausedClients = clientsData.filter(c => c.status === 'paused').length

      // Transform clients for display
      const transformedClients = clientsData.map(c => {
        const clientProfile = Array.isArray(c.client) ? c.client[0] : c.client
        return {
          id: c.client_id,
          name: clientProfile?.display_name ||
                [clientProfile?.first_name, clientProfile?.last_name].filter(Boolean).join(' ') ||
                'Unknown',
          status: c.status || 'pending',
          since: c.started_at || c.created_at,
          lastCheckIn: c.next_check_in_due, // Will be updated when we have actual last check-in data
        }
      })

      // Transform activity
      const activity = (recentActivity.data || []).map(a => {
        const userProfile = Array.isArray(a.user) ? a.user[0] : a.user
        return {
          action: 'Reviewed check-in',
          client: userProfile?.display_name ||
                  [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') ||
                  'Unknown',
          time: a.reviewed_at,
        }
      })

      // Calculate total revenue from subscription
      const subData = subscription.data
      const monthlyAmount = subData?.last_payment_amount || 0
      const totalRevenue = subData?.total_revenue || 0

      return {
        ...profile.data,
        clients: transformedClients,
        clientCount: clients.count || clientsData.length,
        subscription: subData,
        stats: {
          totalClients: clientsData.length,
          activeClients,
          pendingClients,
          pausedClients,
          totalRevenue,
          avgCheckInResponse: 'N/A', // Would need to calculate from response times
        },
        recentActivity: activity,
        revenueHistory: revenueHistory.data || [],
        mrr: monthlyAmount,
      }
    },
    enabled: !!coachId,
  })
}

export function useSuspendCoach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ coachId, reason }: { coachId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', suspension_reason: reason })
        .eq('id', coachId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-coaches'] })
      queryClient.invalidateQueries({ queryKey: ['coach-detail'] })
    },
  })
}

export function useActivateCoach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (coachId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active', suspension_reason: null })
        .eq('id', coachId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-coaches'] })
      queryClient.invalidateQueries({ queryKey: ['coach-detail'] })
    },
  })
}

// ============================================================================
// Athletes Management Hooks
// ============================================================================

export function useAllAthletes(options?: {
  coachId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { coachId, status, search, page = 1, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['all-athletes', coachId, status, search, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, clients!inner(coach_id, status)', { count: 'exact' })
        .contains('roles', ['athlete'])
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (coachId) {
        query = query.eq('clients.coach_id', coachId)
      }

      if (status) {
        query = query.eq('clients.status', status)
      }

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { athletes: data, total: count }
    },
  })
}

export function useAthleteDetail(athleteId: string) {
  return useQuery({
    queryKey: ['athlete-detail', athleteId],
    queryFn: async () => {
      const [profile, clientData, checkIns, weightLogs] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', athleteId)
          .single(),
        supabase
          .from('clients')
          .select('*, coach:profiles!coach_id(*)')
          .eq('athlete_id', athleteId)
          .single(),
        supabase
          .from('check_ins')
          .select('*', { count: 'exact' })
          .eq('athlete_id', athleteId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('weight_logs')
          .select('*')
          .eq('athlete_id', athleteId)
          .order('logged_date', { ascending: false })
          .limit(30),
      ])

      if (profile.error) throw profile.error

      return {
        ...profile.data,
        clientInfo: clientData.data,
        coach: clientData.data?.coach,
        recentCheckIns: checkIns.data || [],
        checkInCount: checkIns.count || 0,
        weightHistory: weightLogs.data || [],
      }
    },
    enabled: !!athleteId,
  })
}

// ============================================================================
// Subscriptions Hooks
// ============================================================================

export function useSubscriptions(options?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { status, search, page = 1, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['subscriptions', status, search, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select('*, user:profiles!user_id(*)', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      if (search) {
        // Search by user name or email
        query = query.or(`user.first_name.ilike.%${search}%,user.last_name.ilike.%${search}%,user.email.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { subscriptions: data, total: count }
    },
  })
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [active, cancelled, mrr] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('*', { count: 'exact' })
          .eq('status', 'active'),
        supabase
          .from('subscriptions')
          .select('*', { count: 'exact' })
          .eq('status', 'cancelled')
          .gte('cancelled_at', thirtyDaysAgo),
        supabase
          .from('subscriptions')
          .select('amount')
          .eq('status', 'active'),
      ])

      const totalMrr = (mrr.data || []).reduce((sum, sub) => sum + (sub.amount || 0), 0)
      const totalActive = active.count || 0
      const totalCancelled = cancelled.count || 0
      const churnRate = totalActive > 0 ? (totalCancelled / totalActive) * 100 : 0

      return {
        activeSubscriptions: totalActive,
        cancelledLast30Days: totalCancelled,
        churnRate: churnRate.toFixed(1),
        mrr: totalMrr,
      }
    },
  })
}

// ============================================================================
// Analytics Hooks
// ============================================================================

export function usePlatformAnalytics(days = 90) {
  return useQuery({
    queryKey: ['platform-analytics', days],
    queryFn: async () => {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      // Get daily active users over time
      const { data: signIns } = await supabase
        .from('profiles')
        .select('last_sign_in_at')
        .gte('last_sign_in_at', startDate)

      // Group by day
      const dailyActiveUsers = new Map<string, number>()
      signIns?.forEach(profile => {
        if (profile.last_sign_in_at) {
          const day = profile.last_sign_in_at.split('T')[0]
          dailyActiveUsers.set(day, (dailyActiveUsers.get(day) || 0) + 1)
        }
      })

      const dauData = Array.from(dailyActiveUsers.entries())
        .map(([date, count]) => ({ date, dau: count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        dauData,
        avgDau: dauData.length > 0 ? Math.round(dauData.reduce((sum, d) => sum + d.dau, 0) / dauData.length) : 0,
      }
    },
  })
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

export function useRealtimeAdminAlerts(onAlert: (alert: Record<string, unknown>) => void) {
  // Subscribe to new signups, failed payments, etc.
  return useQuery({
    queryKey: ['realtime-admin-alerts'],
    queryFn: () => {
      const channel = supabase
        .channel('admin-alerts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
          onAlert({ type: 'new_signup', data: payload.new })
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscriptions' }, (payload) => {
          onAlert({ type: 'new_subscription', data: payload.new })
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    },
    staleTime: Infinity,
  })
}

// ============================================================================
// Support Ticket Hooks
// ============================================================================

export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_user' | 'waiting_on_admin' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory = 'account' | 'billing' | 'technical' | 'feature_request' | 'bug_report' | 'coaching' | 'data_privacy' | 'other'

export interface SupportTicket {
  id: string
  ticket_number: number
  user_id: string
  assigned_to: string | null
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  tags: string[]
  resolution: string | null
  resolved_at: string | null
  resolved_by: string | null
  satisfaction_rating: number | null
  satisfaction_feedback: string | null
  internal_notes: string | null
  first_response_at: string | null
  sla_deadline: string | null
  sla_breached: boolean
  created_at: string
  updated_at: string
  closed_at: string | null
  user?: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    display_name: string | null
  }
  assignee?: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    display_name: string | null
  }
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  content: string
  is_internal: boolean
  attachments: unknown[]
  read_at: string | null
  created_at: string
  sender?: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
  }
}

export function useSupportTickets(options?: {
  status?: TicketStatus | 'all'
  priority?: TicketPriority | 'all'
  category?: TicketCategory | 'all'
  assignedTo?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { status, priority, category, assignedTo, search, page = 1, limit = 20 } = options || {}

  return useQuery({
    queryKey: ['support-tickets', status, priority, category, assignedTo, search, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles!user_id(id, email, first_name, last_name, display_name),
          assignee:profiles!assigned_to(id, email, first_name, last_name, display_name)
        `, { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      if (priority && priority !== 'all') {
        query = query.eq('priority', priority)
      }

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo)
      }

      if (search) {
        query = query.or(`subject.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { tickets: data as SupportTicket[], total: count || 0 }
    },
  })
}

export function useTicketStats() {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      const [open, inProgress, resolved, urgent] = await Promise.all([
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .eq('status', 'open'),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .eq('status', 'in_progress'),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .eq('status', 'resolved'),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .eq('priority', 'urgent')
          .not('status', 'in', '(resolved,closed)'),
      ])

      return {
        open: open.count || 0,
        inProgress: inProgress.count || 0,
        resolved: resolved.count || 0,
        urgent: urgent.count || 0,
      }
    },
  })
}

export function useSupportTicket(ticketId: string) {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles!user_id(id, email, first_name, last_name, display_name),
          assignee:profiles!assigned_to(id, email, first_name, last_name, display_name)
        `)
        .eq('id', ticketId)
        .single()

      if (error) throw error
      return data as SupportTicket
    },
    enabled: !!ticketId,
  })
}

export function useTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select(`
          *,
          sender:profiles!sender_id(id, email, first_name, last_name)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as TicketMessage[]
    },
    enabled: !!ticketId,
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, updates }: {
      ticketId: string
      updates: Partial<Pick<SupportTicket, 'status' | 'priority' | 'assigned_to' | 'internal_notes' | 'resolution'>>
    }) => {
      const updateData: Record<string, unknown> = { ...updates }

      // If marking as resolved, set resolved_at timestamp
      if (updates.status === 'resolved' && updates.resolution) {
        updateData.resolved_at = new Date().toISOString()
      }

      // If closing, set closed_at timestamp
      if (updates.status === 'closed') {
        updateData.closed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)

      if (error) throw error
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] })
    },
  })
}

export function useSendTicketMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, content, isInternal = false }: {
      ticketId: string
      content: string
      isInternal?: boolean
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          content,
          is_internal: isInternal,
        })

      if (error) throw error

      // Update first_response_at if this is the first admin response
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select('first_response_at')
        .eq('id', ticketId)
        .single()

      if (!ticket?.first_response_at && !isInternal) {
        await supabase
          .from('support_tickets')
          .update({
            first_response_at: new Date().toISOString(),
            status: 'in_progress',
          })
          .eq('id', ticketId)
      }
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

export function useAssignTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, adminId }: { ticketId: string; adminId: string | null }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ assigned_to: adminId })
        .eq('id', ticketId)

      if (error) throw error
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] })
    },
  })
}

// ============================================================================
// Audit Log Hooks
// ============================================================================

export function useAuditLogs(options?: {
  action?: string
  actorId?: string
  resourceType?: string
  page?: number
  limit?: number
}) {
  const { action, actorId, resourceType, page = 1, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['audit-logs', action, actorId, resourceType, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (action) {
        query = query.eq('action', action)
      }

      if (actorId) {
        query = query.eq('actor_id', actorId)
      }

      if (resourceType) {
        query = query.eq('resource_type', resourceType)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { logs: data, total: count || 0 }
    },
  })
}

// ============================================================================
// Message Monitoring Hooks
// ============================================================================

export interface MessageThread {
  id: string
  coachClientId: string
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

export interface FlaggedContent {
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

export function useMessageThreads(options?: {
  status?: string
  flaggedOnly?: boolean
  search?: string
  page?: number
  limit?: number
}) {
  const { status, flaggedOnly, search, page = 1, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['message-threads', status, flaggedOnly, search, page, limit],
    queryFn: async () => {
      // Get all active coach-client relationships with their latest messages
      const { data: relationships, error: relError } = await supabase
        .from('coach_clients')
        .select(`
          id,
          status,
          created_at,
          coach:profiles!coach_clients_coach_id_fkey(id, display_name, first_name, last_name, avatar_url, roles),
          client:profiles!coach_clients_client_id_fkey(id, display_name, first_name, last_name, avatar_url, roles)
        `)
        .order('updated_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (relError) {
        console.error('Error fetching relationships:', relError)
        return { threads: [], stats: { totalThreads: 0, activeToday: 0, flaggedPending: 0, averageResponseTime: 'N/A' } }
      }

      // For each relationship, get the latest message and message count
      const threads: MessageThread[] = []

      for (const rel of relationships || []) {
        const coachData = Array.isArray(rel.coach) ? rel.coach[0] : rel.coach
        const clientData = Array.isArray(rel.client) ? rel.client[0] : rel.client

        // Get latest message for this thread
        const { data: messages, count: messageCount } = await supabase
          .from('coach_messages')
          .select('id, content, sender_id, created_at', { count: 'exact' })
          .eq('coach_client_id', rel.id)
          .order('created_at', { ascending: false })
          .limit(1)

        const lastMsg = messages?.[0]

        // Check if thread has search match
        if (search) {
          const searchLower = search.toLowerCase()
          const coachName = coachData?.display_name ||
            [coachData?.first_name, coachData?.last_name].filter(Boolean).join(' ') || ''
          const clientName = clientData?.display_name ||
            [clientData?.first_name, clientData?.last_name].filter(Boolean).join(' ') || ''

          if (!coachName.toLowerCase().includes(searchLower) &&
              !clientName.toLowerCase().includes(searchLower) &&
              !(lastMsg?.content?.toLowerCase().includes(searchLower))) {
            continue
          }
        }

        threads.push({
          id: rel.id,
          coachClientId: rel.id,
          participants: [
            {
              id: coachData?.id || '',
              name: coachData?.display_name ||
                [coachData?.first_name, coachData?.last_name].filter(Boolean).join(' ') || 'Unknown Coach',
              role: 'coach' as const,
              avatar: coachData?.avatar_url,
            },
            {
              id: clientData?.id || '',
              name: clientData?.display_name ||
                [clientData?.first_name, clientData?.last_name].filter(Boolean).join(' ') || 'Unknown Athlete',
              role: 'athlete' as const,
              avatar: clientData?.avatar_url,
            },
          ],
          lastMessage: lastMsg ? {
            content: lastMsg.content,
            senderId: lastMsg.sender_id,
            timestamp: new Date(lastMsg.created_at),
          } : {
            content: 'No messages yet',
            senderId: '',
            timestamp: new Date(rel.created_at),
          },
          messageCount: messageCount || 0,
          isFlagged: false, // Would need flagged_messages table to track this
          status: (rel.status === 'active' ? 'active' : 'pending_review') as 'active' | 'pending_review',
          createdAt: new Date(rel.created_at),
        })
      }

      // Get stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count: todayActiveCount } = await supabase
        .from('coach_messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      return {
        threads,
        stats: {
          totalThreads: threads.length,
          activeToday: todayActiveCount || 0,
          flaggedPending: 0, // Would need flagged content tracking
          averageResponseTime: 'N/A',
        },
      }
    },
  })
}

export function useFlaggedMessages() {
  return useQuery({
    queryKey: ['flagged-messages'],
    queryFn: async () => {
      // Flagged message content tracking would need a dedicated table
      // For now, return empty array since this feature isn't implemented yet
      return [] as FlaggedContent[]
    },
  })
}

export function useMessageStats() {
  return useQuery({
    queryKey: ['message-stats'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [totalThreads, activeToday] = await Promise.all([
        supabase
          .from('coach_clients')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('coach_messages')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
      ])

      return {
        totalThreads: totalThreads.count || 0,
        activeToday: activeToday.count || 0,
        flaggedPending: 0,
        averageResponseTime: 'N/A',
      }
    },
  })
}

// ============================================================================
// Admin Management Hooks
// ============================================================================

export interface AdminUser {
  id: string
  display_name: string | null
  contact_email: string | null
  avatar_url: string | null
  roles: string[]
  created_at: string | null
  updated_at: string | null
}

export function useAdmins(options?: { search?: string }) {
  const { search } = options || {}

  return useQuery({
    queryKey: ['admins', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, display_name, contact_email, avatar_url, roles, created_at, updated_at', { count: 'exact' })
        .contains('roles', ['admin'])
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`display_name.ilike.%${search}%,contact_email.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      // Use updated_at as proxy for "active today" since last_sign_in_at isn't in profiles
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const activeToday = (data || []).filter(admin =>
        admin.updated_at && new Date(admin.updated_at) >= today
      ).length

      return {
        admins: data as AdminUser[],
        total: count || 0,
        activeToday,
      }
    },
  })
}

export function useSearchUsersForPromotion(search: string) {
  return useQuery({
    queryKey: ['users-for-promotion', search],
    queryFn: async () => {
      if (!search || search.length < 2) return []

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, contact_email, avatar_url, roles')
        .not('roles', 'cs', '{"admin"}')
        .or(`display_name.ilike.%${search}%,contact_email.ilike.%${search}%`)
        .limit(10)

      if (error) throw error
      return data
    },
    enabled: search.length >= 2,
  })
}

export function usePromoteToAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      // First get current roles
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      const currentRoles = profile?.roles || []
      if (currentRoles.includes('admin')) {
        throw new Error('User is already an admin')
      }

      const newRoles = [...currentRoles, 'admin']

      const { error } = await supabase
        .from('profiles')
        .update({ roles: newRoles })
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      queryClient.invalidateQueries({ queryKey: ['users-for-promotion'] })
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] })
    },
  })
}

export function useDemoteAdmin(currentUserId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      // Prevent self-demotion
      if (userId === currentUserId) {
        throw new Error('You cannot remove your own admin access')
      }

      // First get current roles
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      const currentRoles = profile?.roles || []
      const newRoles = currentRoles.filter((role: string) => role !== 'admin')

      if (newRoles.length === 0) {
        // Ensure user has at least athlete role
        newRoles.push('athlete')
      }

      const { error } = await supabase
        .from('profiles')
        .update({ roles: newRoles })
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] })
    },
  })
}

export function useInviteAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, displayName }: { email: string; displayName: string }) => {
      // Dynamic import to avoid bundling server code in client
      const { inviteAdmin } = await import('@/app/actions/invite-admin')
      const result = await inviteAdmin(email, displayName)

      if (!result.success) {
        throw new Error(result.error || 'Failed to invite admin')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] })
    },
  })
}

export function useResendInvite() {
  return useMutation({
    mutationFn: async (userId: string) => {
      // Dynamic import to avoid bundling server code in client
      const { resendInvite } = await import('@/app/actions/resend-invite')
      const result = await resendInvite(userId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to resend invite')
      }

      return result
    },
  })
}

export function usePendingInvites() {
  return useQuery({
    queryKey: ['pending-invites'],
    queryFn: async () => {
      // Dynamic import to avoid bundling server code in client
      const { getPendingInvites } = await import('@/app/actions/get-pending-invites')
      const result = await getPendingInvites()

      if (!result.success) {
        throw new Error(result.error || 'Failed to get pending invites')
      }

      return result.pendingInvites || []
    },
  })
}
