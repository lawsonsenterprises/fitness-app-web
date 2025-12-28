'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Ruler,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Calendar,
  Edit2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Measurement {
  name: string
  value: number
  unit: string
  previousValue?: number
  date: Date
}

interface MeasurementRecord {
  id: string
  date: Date
  measurements: Measurement[]
}

interface MeasurementsTableProps {
  records: MeasurementRecord[]
  onAddMeasurement?: () => void
  onEditMeasurement?: (recordId: string) => void
}

const measurementOrder = [
  'Chest',
  'Waist',
  'Hips',
  'Left Arm',
  'Right Arm',
  'Left Thigh',
  'Right Thigh',
  'Left Calf',
  'Right Calf',
  'Shoulders',
  'Neck',
]

export function MeasurementsTable({
  records,
  onAddMeasurement,
  onEditMeasurement,
}: MeasurementsTableProps) {
  const [showAll, setShowAll] = useState(false)

  // Sort records by date (newest first)
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [records])

  const displayedRecords = showAll ? sortedRecords : sortedRecords.slice(0, 3)

  // Get all measurement names from records
  const measurementNames = useMemo(() => {
    const names = new Set<string>()
    records.forEach(r => r.measurements.forEach(m => names.add(m.name)))
    return Array.from(names).sort((a, b) => {
      const aIndex = measurementOrder.indexOf(a)
      const bIndex = measurementOrder.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [records])

  // Calculate changes
  const getChange = (name: string, recordIndex: number): number | null => {
    if (recordIndex >= sortedRecords.length - 1) return null
    const current = sortedRecords[recordIndex].measurements.find(m => m.name === name)
    const previous = sortedRecords[recordIndex + 1].measurements.find(m => m.name === name)
    if (!current || !previous) return null
    return current.value - previous.value
  }

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <Ruler className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No measurements yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Track your body measurements to see progress over time
        </p>
        {onAddMeasurement && (
          <button
            onClick={onAddMeasurement}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Measurements
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Body Measurements</h3>
        {onAddMeasurement && (
          <button
            onClick={onAddMeasurement}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Measurement
                </th>
                {displayedRecords.map((record, i) => (
                  <th
                    key={record.id}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {record.date.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    {i === 0 && (
                      <span className="text-[10px] text-emerald-600 font-medium block">
                        Latest
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-border">
              {measurementNames.map((name, rowIndex) => (
                <motion.tr
                  key={name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.02 }}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">{name}</span>
                  </td>
                  {displayedRecords.map((record, colIndex) => {
                    const measurement = record.measurements.find(m => m.name === name)
                    const change = getChange(name, colIndex)

                    return (
                      <td key={record.id} className="px-4 py-3 text-center">
                        {measurement ? (
                          <div>
                            <span className="font-semibold">
                              {measurement.value}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                              {measurement.unit}
                            </span>
                            {change !== null && colIndex === 0 && (
                              <div className={cn(
                                'flex items-center justify-center gap-0.5 text-xs mt-0.5',
                                change > 0 ? 'text-emerald-600' : change < 0 ? 'text-rose-600' : 'text-muted-foreground'
                              )}>
                                {change > 0 && <TrendingUp className="h-3 w-3" />}
                                {change < 0 && <TrendingDown className="h-3 w-3" />}
                                {change === 0 && <Minus className="h-3 w-3" />}
                                {change !== 0 && (
                                  <span>{change > 0 ? '+' : ''}{change.toFixed(1)}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action row */}
        {sortedRecords.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/10 px-4 py-2">
            {sortedRecords.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {showAll ? 'Show less' : `Show all ${sortedRecords.length} records`}
              </button>
            )}
            {onEditMeasurement && sortedRecords[0] && (
              <button
                onClick={() => onEditMeasurement(sortedRecords[0].id)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3 w-3" />
                Edit latest
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export type { Measurement, MeasurementRecord }
