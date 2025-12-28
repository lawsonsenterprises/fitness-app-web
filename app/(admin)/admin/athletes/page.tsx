'use client'

import { useState } from 'react'
import {
  UserCircle,
  Search,
  Filter,
  Eye,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

// Mock data
const mockAthletes = [
  {
    id: '1',
    name: 'John Davis',
    email: 'john@example.com',
    coach: 'Sarah Johnson',
    status: 'active',
    joinedAt: '2024-06-15',
    lastCheckIn: '2 days ago',
    adherence: 92,
  },
  {
    id: '2',
    name: 'Emily Parker',
    email: 'emily@example.com',
    coach: 'Sarah Johnson',
    status: 'active',
    joinedAt: '2024-08-20',
    lastCheckIn: '5 days ago',
    adherence: 88,
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david@example.com',
    coach: 'Mike Thompson',
    status: 'active',
    joinedAt: '2024-10-01',
    lastCheckIn: '1 day ago',
    adherence: 95,
  },
  {
    id: '4',
    name: 'Sophie Miller',
    email: 'sophie@example.com',
    coach: 'Mike Thompson',
    status: 'pending',
    joinedAt: '2024-12-20',
    lastCheckIn: 'Never',
    adherence: 0,
  },
  {
    id: '5',
    name: 'Alex Turner',
    email: 'alex@example.com',
    coach: 'Emma Williams',
    status: 'inactive',
    joinedAt: '2024-02-10',
    lastCheckIn: '45 days ago',
    adherence: 45,
  },
]

export default function AthletesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all')

  const filteredAthletes = mockAthletes.filter((athlete) => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.coach.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || athlete.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Athletes</h1>
        <p className="mt-1 text-muted-foreground">
          View all athletes across the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Athletes</p>
          <p className="text-2xl font-bold mt-1">{mockAthletes.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-500">
            {mockAthletes.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">
            {mockAthletes.filter(a => a.status === 'pending').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Adherence</p>
          <p className="text-2xl font-bold mt-1">
            {Math.round(mockAthletes.filter(a => a.adherence > 0).reduce((acc, a) => acc + a.adherence, 0) / mockAthletes.filter(a => a.adherence > 0).length)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athletes or coaches..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'pending', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                statusFilter === status
                  ? 'bg-foreground text-background'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Athlete</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Coach</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Adherence</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Check-in</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAthletes.map((athlete) => (
                <tr key={athlete.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                        {athlete.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{athlete.name}</p>
                        <p className="text-sm text-muted-foreground">{athlete.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{athlete.coach}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                      athlete.status === 'active' && 'bg-green-500/10 text-green-600',
                      athlete.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                      athlete.status === 'inactive' && 'bg-red-500/10 text-red-600'
                    )}>
                      {athlete.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
                      {athlete.status === 'pending' && <Clock className="h-3 w-3" />}
                      {athlete.status === 'inactive' && <XCircle className="h-3 w-3" />}
                      {athlete.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            athlete.adherence >= 80 ? 'bg-green-500' :
                            athlete.adherence >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${athlete.adherence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{athlete.adherence}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{athlete.lastCheckIn}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(athlete.joinedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
