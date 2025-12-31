'use client'

import { useState } from 'react'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  MessageCircle,
  MoreVertical,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MessagesPage() {
  const [message, setMessage] = useState('')

  // TODO: Fetch coach info from user's profile when implemented
  const coachInfo = {
    name: 'Your Coach',
    title: 'Coach',
    avatar: 'C',
    lastSeen: 'Offline',
  }

  const handleSend = () => {
    if (!message.trim()) return
    // TODO: Implement message sending when messages table is created
    console.warn('Messages feature not implemented - no messages table in database')
    setMessage('')
  }

  return (
    <div className="h-[calc(100vh-80px)] lg:h-screen flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
            {coachInfo.avatar}
          </div>
          <div>
            <h2 className="font-semibold">{coachInfo.name}</h2>
            <p className="text-xs text-muted-foreground">{coachInfo.lastSeen}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages Area - Empty State */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">Messages coming soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            The messaging feature is not yet implemented. Check back later to chat with your coach.
          </p>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" disabled>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0" disabled>
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Messages coming soon..."
            className="flex-1"
            disabled
          />
          <Button
            onClick={handleSend}
            disabled
            size="icon"
            className="shrink-0 bg-amber-500 hover:bg-amber-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
