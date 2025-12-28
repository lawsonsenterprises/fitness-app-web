'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Calendar,
  Building2,
  MessageSquare,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock detailed blood work data
const mockBloodWorkDetail = {
  id: '1',
  date: '2024-12-15',
  lab: 'Medichecks',
  testName: 'Ultimate Performance Blood Test',
  status: 'reviewed',
  coachNotes: 'Good progress on testosterone. Continue with current supplement protocol. Consider increasing Vitamin D supplementation to 4000 IU daily during winter months.',
  categories: [
    {
      name: 'Hormones',
      markers: [
        {
          name: 'Testosterone',
          value: 22.5,
          unit: 'nmol/L',
          reference: { low: 8.64, high: 29 },
          optimal: { low: 15, high: 25 },
          status: 'optimal',
          trend: 'up',
          history: [
            { date: 'Jun 24', value: 20.1 },
            { date: 'Sep 24', value: 21.2 },
            { date: 'Dec 24', value: 22.5 },
          ],
        },
        {
          name: 'Free Testosterone',
          value: 0.42,
          unit: 'nmol/L',
          reference: { low: 0.2, high: 0.62 },
          optimal: { low: 0.3, high: 0.5 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 0.38 },
            { date: 'Sep 24', value: 0.40 },
            { date: 'Dec 24', value: 0.42 },
          ],
        },
        {
          name: 'SHBG',
          value: 35,
          unit: 'nmol/L',
          reference: { low: 18, high: 54 },
          optimal: { low: 25, high: 45 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 36 },
            { date: 'Sep 24', value: 34 },
            { date: 'Dec 24', value: 35 },
          ],
        },
        {
          name: 'Cortisol',
          value: 380,
          unit: 'nmol/L',
          reference: { low: 166, high: 507 },
          optimal: { low: 200, high: 400 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 395 },
            { date: 'Sep 24', value: 385 },
            { date: 'Dec 24', value: 380 },
          ],
        },
      ],
    },
    {
      name: 'Vitamins & Minerals',
      markers: [
        {
          name: 'Vitamin D',
          value: 65,
          unit: 'nmol/L',
          reference: { low: 50, high: 175 },
          optimal: { low: 100, high: 150 },
          status: 'low',
          trend: 'down',
          history: [
            { date: 'Jun 24', value: 95 },
            { date: 'Sep 24', value: 78 },
            { date: 'Dec 24', value: 65 },
          ],
          recommendation: 'Increase supplementation to 4000 IU daily. Consider vitamin D + K2 combo.',
        },
        {
          name: 'Ferritin',
          value: 95,
          unit: 'ug/L',
          reference: { low: 30, high: 400 },
          optimal: { low: 100, high: 150 },
          status: 'borderline',
          trend: 'up',
          history: [
            { date: 'Jun 24', value: 72 },
            { date: 'Sep 24', value: 85 },
            { date: 'Dec 24', value: 95 },
          ],
        },
        {
          name: 'Vitamin B12',
          value: 520,
          unit: 'pmol/L',
          reference: { low: 140, high: 724 },
          optimal: { low: 400, high: 600 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 505 },
            { date: 'Sep 24', value: 515 },
            { date: 'Dec 24', value: 520 },
          ],
        },
        {
          name: 'Folate',
          value: 18.5,
          unit: 'ug/L',
          reference: { low: 3.89, high: 26.8 },
          optimal: { low: 10, high: 20 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 17.8 },
            { date: 'Sep 24', value: 18.2 },
            { date: 'Dec 24', value: 18.5 },
          ],
        },
      ],
    },
    {
      name: 'Thyroid',
      markers: [
        {
          name: 'TSH',
          value: 1.8,
          unit: 'mU/L',
          reference: { low: 0.27, high: 4.2 },
          optimal: { low: 0.5, high: 2.5 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 1.9 },
            { date: 'Sep 24', value: 1.85 },
            { date: 'Dec 24', value: 1.8 },
          ],
        },
        {
          name: 'Free T4',
          value: 16.2,
          unit: 'pmol/L',
          reference: { low: 12, high: 22 },
          optimal: { low: 14, high: 18 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 15.8 },
            { date: 'Sep 24', value: 16.0 },
            { date: 'Dec 24', value: 16.2 },
          ],
        },
        {
          name: 'Free T3',
          value: 5.2,
          unit: 'pmol/L',
          reference: { low: 3.1, high: 6.8 },
          optimal: { low: 4.5, high: 6 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 5.0 },
            { date: 'Sep 24', value: 5.1 },
            { date: 'Dec 24', value: 5.2 },
          ],
        },
      ],
    },
    {
      name: 'Metabolic',
      markers: [
        {
          name: 'HbA1c',
          value: 32,
          unit: 'mmol/mol',
          reference: { low: 20, high: 42 },
          optimal: { low: 20, high: 36 },
          status: 'optimal',
          trend: 'stable',
          history: [
            { date: 'Jun 24', value: 33 },
            { date: 'Sep 24', value: 32 },
            { date: 'Dec 24', value: 32 },
          ],
        },
      ],
    },
  ],
}

export default function BloodWorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [expandedMarker, setExpandedMarker] = useState<string | null>(null)

  const totalMarkers = mockBloodWorkDetail.categories.reduce((acc, cat) => acc + cat.markers.length, 0)
  const flaggedMarkers = mockBloodWorkDetail.categories.reduce(
    (acc, cat) => acc + cat.markers.filter((m) => m.status !== 'optimal').length,
    0
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/athlete/blood-work"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {new Date(mockBloodWorkDetail.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {mockBloodWorkDetail.lab}
              </span>
              <span>•</span>
              <span>{mockBloodWorkDetail.testName}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Optimal</p>
              <p className="text-2xl font-bold">{totalMarkers - flaggedMarkers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
              <p className="text-2xl font-bold">{flaggedMarkers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Markers</p>
              <p className="text-2xl font-bold">{totalMarkers}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Coach Notes */}
      {mockBloodWorkDetail.coachNotes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <MessageSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-600">Coach Notes</h3>
              <p className="text-sm mt-1">{mockBloodWorkDetail.coachNotes}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Marker Categories */}
      <div className="space-y-6">
        {mockBloodWorkDetail.categories.map((category, categoryIdx) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + categoryIdx * 0.1 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold">{category.name}</h2>
            </div>

            <div className="divide-y divide-border">
              {category.markers.map((marker) => {
                const isExpanded = expandedMarker === marker.name

                return (
                  <div key={marker.name}>
                    <button
                      onClick={() => setExpandedMarker(isExpanded ? null : marker.name)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        marker.status === 'optimal' && 'bg-green-500/10',
                        marker.status === 'low' && 'bg-amber-500/10',
                        marker.status === 'high' && 'bg-red-500/10',
                        marker.status === 'borderline' && 'bg-yellow-500/10'
                      )}>
                        {marker.status === 'optimal' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {(marker.status === 'low' || marker.status === 'borderline') && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        {marker.status === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>

                      <div className="flex-1 text-left">
                        <p className="font-medium">{marker.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Reference: {marker.reference.low} - {marker.reference.high} {marker.unit}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {marker.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {marker.trend === 'down' && <TrendingDown className="h-4 w-4 text-amber-500" />}
                        {marker.trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}

                        <div className="text-right">
                          <p className="text-xl font-bold">{marker.value}</p>
                          <p className="text-xs text-muted-foreground">{marker.unit}</p>
                        </div>
                      </div>
                    </button>

                    {/* Expanded View with Chart */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="rounded-lg bg-muted/30 p-4">
                          <h4 className="text-sm font-medium mb-4">Trend Over Time</h4>
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={marker.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                  dataKey="date"
                                  stroke="hsl(var(--muted-foreground))"
                                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                />
                                <YAxis
                                  stroke="hsl(var(--muted-foreground))"
                                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                  domain={[marker.reference.low * 0.9, marker.reference.high * 1.1]}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                  }}
                                />
                                {/* Optimal range shading */}
                                <ReferenceArea
                                  y1={marker.optimal.low}
                                  y2={marker.optimal.high}
                                  fill="#22c55e"
                                  fillOpacity={0.1}
                                />
                                <ReferenceLine
                                  y={marker.optimal.low}
                                  stroke="#22c55e"
                                  strokeDasharray="3 3"
                                  strokeOpacity={0.5}
                                />
                                <ReferenceLine
                                  y={marker.optimal.high}
                                  stroke="#22c55e"
                                  strokeDasharray="3 3"
                                  strokeOpacity={0.5}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={marker.status === 'optimal' ? '#22c55e' : '#f59e0b'}
                                  strokeWidth={2}
                                  dot={{ fill: marker.status === 'optimal' ? '#22c55e' : '#f59e0b', r: 5 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {marker.recommendation && (
                            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <p className="text-sm text-amber-600">
                                <strong>Recommendation:</strong> {marker.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
