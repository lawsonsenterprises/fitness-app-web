'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  Mail,
  Calendar,
  UserCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TopBar } from '@/components/dashboard/top-bar'

// Mock data
const mockCoaches = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+44 7700 900123',
    status: 'active',
    plan: 'Pro Annual',
    athletes: 24,
    joinedAt: '2024-03-15',
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Mike Thompson',
    email: 'mike@example.com',
    phone: '+44 7700 900456',
    status: 'active',
    plan: 'Pro Monthly',
    athletes: 18,
    joinedAt: '2024-06-22',
    lastActive: '5 min ago',
  },
  {
    id: '3',
    name: 'Emma Williams',
    email: 'emma@example.com',
    phone: '+44 7700 900789',
    status: 'trial',
    plan: 'Trial',
    athletes: 5,
    joinedAt: '2024-12-10',
    lastActive: '1 day ago',
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james@example.com',
    phone: '+44 7700 900012',
    status: 'inactive',
    plan: 'Pro Monthly',
    athletes: 12,
    joinedAt: '2024-01-08',
    lastActive: '30 days ago',
  },
  {
    id: '5',
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    phone: '+44 7700 900345',
    status: 'active',
    plan: 'Enterprise',
    athletes: 45,
    joinedAt: '2023-09-12',
    lastActive: '1 hour ago',
  },
]

export default function CoachesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'inactive'>('all')

  const filteredCoaches = mockCoaches.filter((coach) => {
    const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || coach.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <TopBar title="Coaches" />
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Coaches</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all coaches on the platform
          </p>
        </div>
        <Button className="gap-2 bg-red-600 hover:bg-red-700">
          <Users className="h-4 w-4" />
          Add Coach
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Coaches</p>
          <p className="text-2xl font-bold mt-1">{mockCoaches.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-500">
            {mockCoaches.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">On Trial</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">
            {mockCoaches.filter(c => c.status === 'trial').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Athletes</p>
          <p className="text-2xl font-bold mt-1">
            {mockCoaches.reduce((acc, c) => acc + c.athletes, 0)}
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
            placeholder="Search coaches..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'trial', 'inactive'] as const).map((status) => (
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
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Coach</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Athletes</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Active</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCoaches.map((coach) => (
                <tr key={coach.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
                        {coach.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{coach.name}</p>
                        <p className="text-sm text-muted-foreground">{coach.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                      coach.status === 'active' && 'bg-green-500/10 text-green-600',
                      coach.status === 'trial' && 'bg-amber-500/10 text-amber-600',
                      coach.status === 'inactive' && 'bg-red-500/10 text-red-600'
                    )}>
                      {coach.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
                      {coach.status === 'trial' && <Calendar className="h-3 w-3" />}
                      {coach.status === 'inactive' && <XCircle className="h-3 w-3" />}
                      {coach.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{coach.plan}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{coach.athletes}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(coach.joinedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{coach.lastActive}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                        <Ban className="h-4 w-4 text-red-500" />
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
    </>
  )
}
