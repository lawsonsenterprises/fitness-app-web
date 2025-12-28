'use client'

import { useParams } from 'next/navigation'
import { Heart, Moon, Activity, Droplets, Plus } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { useClient } from '@/hooks/use-clients'
import { cn } from '@/lib/utils'

// Mock data
const mockSleepData = [
  { date: 'Mon', hours: 7.5, quality: 'good' },
  { date: 'Tue', hours: 8.0, quality: 'excellent' },
  { date: 'Wed', hours: 6.5, quality: 'fair' },
  { date: 'Thu', hours: 7.8, quality: 'good' },
  { date: 'Fri', hours: 7.2, quality: 'good' },
  { date: 'Sat', hours: 8.5, quality: 'excellent' },
  { date: 'Sun', hours: 7.0, quality: 'fair' },
]

const mockBloodTests = [
  {
    id: '1',
    date: '2024-12-15',
    lab: 'Medichecks',
    tags: ['Full Blood Count', 'Liver Function', 'Thyroid'],
    markers: [
      { name: 'Testosterone', value: 18.5, unit: 'nmol/L', status: 'normal', refLow: 8.6, refHigh: 29 },
      { name: 'TSH', value: 2.1, unit: 'mIU/L', status: 'normal', refLow: 0.27, refHigh: 4.2 },
      { name: 'Vitamin D', value: 85, unit: 'nmol/L', status: 'normal', refLow: 50, refHigh: 175 },
      { name: 'Ferritin', value: 45, unit: 'ug/L', status: 'low', refLow: 30, refHigh: 400 },
    ],
  },
  {
    id: '2',
    date: '2024-09-10',
    lab: 'Medichecks',
    tags: ['Full Blood Count', 'Liver Function'],
    markers: [
      { name: 'Testosterone', value: 16.2, unit: 'nmol/L', status: 'normal', refLow: 8.6, refHigh: 29 },
      { name: 'TSH', value: 2.4, unit: 'mIU/L', status: 'normal', refLow: 0.27, refHigh: 4.2 },
      { name: 'Vitamin D', value: 72, unit: 'nmol/L', status: 'normal', refLow: 50, refHigh: 175 },
      { name: 'Ferritin', value: 38, unit: 'ug/L', status: 'low', refLow: 30, refHigh: 400 },
    ],
  },
]

const mockHydrationData = [
  { date: 'Mon', litres: 3.2 },
  { date: 'Tue', litres: 2.8 },
  { date: 'Wed', litres: 3.5 },
  { date: 'Thu', litres: 3.0 },
  { date: 'Fri', litres: 2.5 },
  { date: 'Sat', litres: 3.8 },
  { date: 'Sun', litres: 3.2 },
]

export default function ClientHealthPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)

  if (!client) return null

  const avgSleep = (mockSleepData.reduce((sum, d) => sum + d.hours, 0) / mockSleepData.length).toFixed(1)
  const avgHydration = (mockHydrationData.reduce((sum, d) => sum + d.litres, 0) / mockHydrationData.length).toFixed(1)

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Moon className="h-4 w-4" />
            <span className="text-sm">Avg Sleep</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{avgSleep}h</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="h-4 w-4" />
            <span className="text-sm">Avg Hydration</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{avgHydration}L</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span className="text-sm">Resting HR</span>
          </div>
          <p className="mt-2 text-2xl font-bold">62 bpm</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="text-sm">HRV</span>
          </div>
          <p className="mt-2 text-2xl font-bold">48 ms</p>
        </div>
      </div>

      {/* Sleep Trends */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Sleep Trends</h3>
          <span className="text-sm text-muted-foreground">Last 7 days</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockSleepData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
                domain={[5, 10]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value}h`, 'Sleep']}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Blood Work */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-semibold">Blood Work</h3>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Test
          </Button>
        </div>
        <div className="divide-y divide-border">
          {mockBloodTests.map((test) => (
            <div key={test.id} className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {new Date(test.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">{test.lab}</p>
                </div>
                <div className="flex gap-2">
                  {test.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Markers grid */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {test.markers.map((marker) => (
                  <div
                    key={marker.name}
                    className={cn(
                      'rounded-lg border p-3',
                      marker.status === 'normal'
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : marker.status === 'low'
                        ? 'border-amber-500/20 bg-amber-500/5'
                        : 'border-red-500/20 bg-red-500/5'
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{marker.name}</p>
                    <p className="mt-1 text-lg font-semibold">
                      {marker.value} {marker.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ref: {marker.refLow} - {marker.refHigh}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hydration */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Hydration</h3>
          <span className="text-sm text-muted-foreground">Target: 3L/day</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockHydrationData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
                domain={[0, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value}L`, 'Water']}
              />
              <Line
                type="monotone"
                dataKey="litres"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
