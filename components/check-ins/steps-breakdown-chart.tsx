'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface StepsBreakdownChartProps {
  dailySteps: number[]
  target: number
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function StepsBreakdownChart({ dailySteps, target }: StepsBreakdownChartProps) {
  const data = dailySteps.map((steps, index) => ({
    day: dayLabels[index],
    steps,
    target,
    hitTarget: steps >= target,
  }))

  const average = Math.round(dailySteps.reduce((sum, s) => sum + s, 0) / dailySteps.length)
  const daysOnTarget = dailySteps.filter((s) => s >= target).length

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-muted-foreground">Average: </span>
          <span className="font-medium">{average.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Target: </span>
          <span className="font-medium">{target.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Days on target: </span>
          <span className="font-medium">{daysOnTarget}/7</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
            />
            <YAxis
              hide
              domain={[0, Math.max(...dailySteps, target) * 1.1]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                'Steps',
              ]}
            />
            <ReferenceLine
              y={target}
              stroke="#71717a"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Bar
              dataKey="steps"
              radius={[4, 4, 0, 0]}
              fill="#f59e0b"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-amber-500" />
          <span>Daily steps</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 border-b border-dashed border-muted-foreground" />
          <span>Target</span>
        </div>
      </div>
    </div>
  )
}
