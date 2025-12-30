'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

import { cn } from '@/lib/utils'
import type { WorkoutTypePieData } from '@/types/healthkit'

interface WorkoutTypePieChartProps {
  data: WorkoutTypePieData[]
  className?: string
}

const COLOURS = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#f97316', // Orange
]

export function WorkoutTypePieChart({ data, className }: WorkoutTypePieChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64 text-muted-foreground', className)}>
        No workout data available
      </div>
    )
  }

  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count)

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="count"
            nameKey="type"
            label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
            labelLine={{ strokeWidth: 1 }}
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLOURS[index % COLOURS.length]}
                strokeWidth={0}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value, name) => [
              `${value ?? 0} workouts`,
              String(name)
            ]}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
