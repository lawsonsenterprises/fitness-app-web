'use client'

import { useParams } from 'next/navigation'

import { MessageThread } from '@/components/messages/message-thread'
import { useClient } from '@/hooks/use-clients'

export default function ClientMessagesPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client, isLoading } = useClient(clientId)

  if (isLoading) {
    return (
      <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
    )
  }

  if (!client) return null

  const clientName = `${client.firstName} ${client.lastName}`.trim() || 'Client'

  return (
    <MessageThread
      clientId={clientId}
      clientName={clientName}
    />
  )
}
