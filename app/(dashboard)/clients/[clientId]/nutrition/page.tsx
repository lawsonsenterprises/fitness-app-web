'use client'

import { useParams } from 'next/navigation'
import { UtensilsCrossed } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { useClient } from '@/hooks/use-clients'
import { cn } from '@/lib/utils'

// Mock meal plan data
const mockMealPlan = {
  name: 'Lean Bulk - 2800kcal',
  type: 'bulking',
  trainingDay: { calories: 2800, protein: 180, carbs: 320, fat: 80 },
  restDay: { calories: 2400, protein: 180, carbs: 240, fat: 75 },
}

// Mock daily logs
const mockDailyLogs = [
  { date: '2024-12-27', calories: 2750, protein: 175, carbs: 310, fat: 78, adherence: 98 },
  { date: '2024-12-26', calories: 2380, protein: 178, carbs: 235, fat: 72, adherence: 95 },
  { date: '2024-12-25', calories: 2900, protein: 168, carbs: 340, fat: 85, adherence: 88 },
  { date: '2024-12-24', calories: 2420, protein: 182, carbs: 242, fat: 74, adherence: 97 },
  { date: '2024-12-23', calories: 2680, protein: 172, carbs: 298, fat: 82, adherence: 92 },
  { date: '2024-12-22', calories: 2350, protein: 176, carbs: 230, fat: 73, adherence: 94 },
  { date: '2024-12-21', calories: 2820, protein: 184, carbs: 325, fat: 79, adherence: 99 },
]

// Mock trend data for chart
const macroTrendData = mockDailyLogs
  .slice()
  .reverse()
  .map((log) => ({
    date: new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
  }))

export default function ClientNutritionPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { data: client } = useClient(clientId)

  if (!client) return null

  const avgAdherence = Math.round(
    mockDailyLogs.reduce((sum, log) => sum + log.adherence, 0) / mockDailyLogs.length
  )

  return (
    <div className="space-y-8">
      {/* Current Meal Plan */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Current Meal Plan</h2>
            <p className="text-sm text-muted-foreground">{mockMealPlan.name}</p>
          </div>
          <Button variant="outline" size="sm">
            Modify Meal Plan
          </Button>
        </div>

        {/* Macro targets */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-amber-500" />
              <h3 className="font-medium">Training Day</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calories</span>
                <span className="font-semibold">{mockMealPlan.trainingDay.calories} kcal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Protein</span>
                <span className="font-medium">{mockMealPlan.trainingDay.protein}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Carbs</span>
                <span className="font-medium">{mockMealPlan.trainingDay.carbs}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fat</span>
                <span className="font-medium">{mockMealPlan.trainingDay.fat}g</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Rest Day</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calories</span>
                <span className="font-semibold">{mockMealPlan.restDay.calories} kcal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Protein</span>
                <span className="font-medium">{mockMealPlan.restDay.protein}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Carbs</span>
                <span className="font-medium">{mockMealPlan.restDay.carbs}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fat</span>
                <span className="font-medium">{mockMealPlan.restDay.fat}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{avgAdherence}%</p>
          <p className="text-sm text-muted-foreground">Avg Adherence</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold">
            {Math.round(mockDailyLogs.reduce((sum, log) => sum + log.calories, 0) / 7)}
          </p>
          <p className="text-sm text-muted-foreground">Avg Calories</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold">
            {Math.round(mockDailyLogs.reduce((sum, log) => sum + log.protein, 0) / 7)}g
          </p>
          <p className="text-sm text-muted-foreground">Avg Protein</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold">7/7</p>
          <p className="text-sm text-muted-foreground">Days Logged</p>
        </div>
      </div>

      {/* Macro Trends Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Macro Trends</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Protein</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Carbs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">Fat</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={macroTrendData}>
              <defs>
                <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="protein"
                stroke="#3b82f6"
                fill="url(#colorProtein)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="carbs"
                stroke="#f59e0b"
                fill="url(#colorCarbs)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="fat"
                stroke="#f43f5e"
                fill="url(#colorFat)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold">Daily Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Calories
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Protein
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Carbs
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Adherence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockDailyLogs.map((log) => (
                <tr key={log.date} className="hover:bg-muted/30">
                  <td className="px-6 py-4 text-sm font-medium">
                    {new Date(log.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">{log.calories}</td>
                  <td className="px-6 py-4 text-right text-sm">{log.protein}g</td>
                  <td className="px-6 py-4 text-right text-sm">{log.carbs}g</td>
                  <td className="px-6 py-4 text-right text-sm">{log.fat}g</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        log.adherence >= 90
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : log.adherence >= 70
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-red-500/10 text-red-600'
                      )}
                    >
                      {log.adherence}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
