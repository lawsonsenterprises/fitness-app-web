'use client'

import { useState } from 'react'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Check,
  CheckCheck,
  MoreVertical,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock data
const mockMessages = [
  {
    id: '1',
    sender: 'coach',
    name: 'Sarah Johnson',
    message: 'Great check-in this week! I can see your consistency is really paying off. Keep up the excellent work!',
    timestamp: '2024-12-27T10:30:00',
    read: true,
  },
  {
    id: '2',
    sender: 'athlete',
    name: 'You',
    message: 'Thanks Sarah! I\'m feeling really good about the progress. Quick question - should I increase my cardio next week?',
    timestamp: '2024-12-27T11:15:00',
    read: true,
  },
  {
    id: '3',
    sender: 'coach',
    name: 'Sarah Johnson',
    message: 'Let\'s keep cardio the same for now. Your recovery metrics look good, but I want to make sure we don\'t add too much volume at once. We can reassess after next week\'s check-in.',
    timestamp: '2024-12-27T14:20:00',
    read: true,
  },
  {
    id: '4',
    sender: 'athlete',
    name: 'You',
    message: 'Makes sense! I\'ll stick with the current plan.',
    timestamp: '2024-12-27T14:45:00',
    read: true,
  },
  {
    id: '5',
    sender: 'coach',
    name: 'Sarah Johnson',
    message: 'Perfect! Also, don\'t forget to submit your blood work results when you get them. Looking forward to reviewing everything together.',
    timestamp: '2024-12-27T15:00:00',
    read: false,
  },
]

export default function MessagesPage() {
  const [message, setMessage] = useState('')

  const coachInfo = {
    name: 'Sarah Johnson',
    title: 'Head Coach',
    avatar: 'SJ',
    lastSeen: 'Active now',
  }

  const handleSend = () => {
    if (!message.trim()) return
    // Handle sending message
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockMessages.map((msg, idx) => {
          const isAthlete = msg.sender === 'athlete'
          const showTimestamp = idx === 0 ||
            new Date(mockMessages[idx - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString()

          return (
            <div key={msg.id}>
              {showTimestamp && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {new Date(msg.timestamp).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', isAthlete ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[80%] lg:max-w-[60%] rounded-2xl px-4 py-3',
                  isAthlete
                    ? 'bg-amber-500 text-white rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                )}>
                  <p className="text-sm">{msg.message}</p>
                  <div className={cn(
                    'flex items-center justify-end gap-1 mt-1',
                    isAthlete ? 'text-white/70' : 'text-muted-foreground'
                  )}>
                    <span className="text-xs">
                      {new Date(msg.timestamp).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isAthlete && (
                      msg.read ? (
                        <CheckCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
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
