'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'

// Shared chart styles
const chartStyles = {
  grid: 'hsl(var(--border))',
  axis: 'hsl(var(--muted-foreground))',
  tooltip: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  },
}

interface BaseChartProps {
  data: Record<string, unknown>[]
  height?: number
  className?: string
}

interface LineChartProps extends BaseChartProps {
  lines: {
    dataKey: string
    name?: string
    color: string
    strokeWidth?: number
    dot?: boolean
  }[]
  xAxisKey: string
  yAxisDomain?: [number | 'auto', number | 'auto']
  referenceLines?: { y: number; color: string; label?: string }[]
}

export function LineChartWrapper({
  data,
  lines,
  xAxisKey,
  height = 300,
  yAxisDomain = ['auto', 'auto'],
  referenceLines,
}: LineChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} />
          <XAxis
            dataKey={xAxisKey}
            stroke={chartStyles.axis}
            tick={{ fill: chartStyles.axis, fontSize: 12 }}
          />
          <YAxis
            stroke={chartStyles.axis}
            tick={{ fill: chartStyles.axis, fontSize: 12 }}
            domain={yAxisDomain}
          />
          <Tooltip contentStyle={chartStyles.tooltip} />
          <Legend />
          {referenceLines?.map((ref, i) => (
            <ReferenceLine
              key={i}
              y={ref.y}
              stroke={ref.color}
              strokeDasharray="3 3"
              label={ref.label}
            />
          ))}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot !== false ? { fill: line.color, r: 4 } : false}
              activeDot={{ r: 6, fill: line.color }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AreaChartProps extends BaseChartProps {
  areas: {
    dataKey: string
    name?: string
    color: string
    fillOpacity?: number
  }[]
  xAxisKey: string
  yAxisDomain?: [number | 'auto', number | 'auto']
  stacked?: boolean
}

export function AreaChartWrapper({
  data,
  areas,
  xAxisKey,
  height = 300,
  yAxisDomain = ['auto', 'auto'],
  stacked = false,
}: AreaChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {areas.map((area) => (
              <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color} stopOpacity={area.fillOpacity || 0.2} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} />
          <XAxis
            dataKey={xAxisKey}
            stroke={chartStyles.axis}
            tick={{ fill: chartStyles.axis, fontSize: 12 }}
          />
          <YAxis
            stroke={chartStyles.axis}
            tick={{ fill: chartStyles.axis, fontSize: 12 }}
            domain={yAxisDomain}
          />
          <Tooltip contentStyle={chartStyles.tooltip} />
          <Legend />
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              stroke={area.color}
              strokeWidth={2}
              fill={`url(#gradient-${area.dataKey})`}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface BarChartProps extends BaseChartProps {
  bars: {
    dataKey: string
    name?: string
    color: string
    radius?: [number, number, number, number]
  }[]
  xAxisKey: string
  stacked?: boolean
  layout?: 'horizontal' | 'vertical'
}

export function BarChartWrapper({
  data,
  bars,
  xAxisKey,
  height = 300,
  stacked = false,
  layout = 'horizontal',
}: BarChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} />
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey={xAxisKey}
                stroke={chartStyles.axis}
                tick={{ fill: chartStyles.axis, fontSize: 12 }}
              />
              <YAxis stroke={chartStyles.axis} tick={{ fill: chartStyles.axis, fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis type="number" stroke={chartStyles.axis} tick={{ fill: chartStyles.axis, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                stroke={chartStyles.axis}
                tick={{ fill: chartStyles.axis, fontSize: 12 }}
              />
            </>
          )}
          <Tooltip contentStyle={chartStyles.tooltip} />
          <Legend />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color}
              radius={bar.radius || [4, 4, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PieChartProps {
  data: { name: string; value: number; color: string }[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  showLabels?: boolean
}

export function PieChartWrapper({
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  showLabels = false,
}: PieChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={innerRadius > 0 ? 5 : 0}
            dataKey="value"
            label={showLabels ? ({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)` : undefined}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={chartStyles.tooltip} />
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface GaugeChartProps {
  value: number
  max?: number
  min?: number
  colors?: { threshold: number; color: string }[]
  label?: string
  size?: number
}

export function GaugeChart({
  value,
  max = 100,
  min = 0,
  colors = [
    { threshold: 40, color: '#ef4444' },
    { threshold: 70, color: '#f59e0b' },
    { threshold: 100, color: '#22c55e' },
  ],
  label,
  size = 200,
}: GaugeChartProps) {
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1)

  const getColor = () => {
    for (const { threshold, color } of colors) {
      if (value <= threshold) return color
    }
    return colors[colors.length - 1].color
  }

  const strokeWidth = size * 0.1
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (percentage * circumference)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease-out' }}
        />
        {/* Value text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground font-bold"
          style={{ fontSize: size * 0.2 }}
        >
          {Math.round(value)}
        </text>
      </svg>
      {label && <p className="text-sm text-muted-foreground mt-2">{label}</p>}
    </div>
  )
}

// Export component references for tree-shaking
export {
  ReferenceLine,
  ReferenceArea,
}
