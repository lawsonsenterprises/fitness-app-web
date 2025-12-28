'use client'

import { useState } from 'react'
import {
  X,
  Download,
  FileText,
  ImageIcon,
  BarChart3,
  Calendar,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { usePDFExport, type ExportType, type ExportOptions } from '@/hooks/use-pdf-export'
import { cn } from '@/lib/utils'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  defaultType: ExportType
  entityId: string
  entityTitle: string
}

const exportTypeLabels: Record<ExportType, string> = {
  client_progress: 'Client Progress Report',
  check_in: 'Check-in Details',
  programme: 'Training Programme',
  meal_plan: 'Meal Plan',
  client_summary: 'Client Summary',
}

export function ExportModal({
  isOpen,
  onClose,
  defaultType,
  entityId,
  entityTitle,
}: ExportModalProps) {
  const { isExporting, progress, exportPDF } = usePDFExport()
  const [includePhotos, setIncludePhotos] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter'>('all')

  if (!isOpen) return null

  const handleExport = async () => {
    const options: ExportOptions = {
      type: defaultType,
      id: entityId,
      title: entityTitle,
      includePhotos,
      includeCharts,
    }

    if (dateRange !== 'all') {
      const now = new Date()
      const from = new Date()
      if (dateRange === 'month') {
        from.setMonth(from.getMonth() - 1)
      } else {
        from.setMonth(from.getMonth() - 3)
      }
      options.dateRange = { from, to: now }
    }

    try {
      await exportPDF(options)
      toast.success('PDF exported successfully')
      onClose()
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95">
        <div className="rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold">Export PDF</h2>
                <p className="text-sm text-muted-foreground">
                  {exportTypeLabels[defaultType]}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Date range selector */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date Range
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'month', label: 'Last Month' },
                  { value: 'quarter', label: 'Last 3 Months' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateRange(option.value as typeof dateRange)}
                    className={cn(
                      'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      dateRange === option.value
                        ? 'bg-foreground text-background'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Include options */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                Include in Export
              </label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={includePhotos}
                    onChange={(e) => setIncludePhotos(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-amber-500"
                  />
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Progress photos</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-amber-500"
                  />
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Charts and graphs</span>
                </label>
              </div>
            </div>

            {/* Progress indicator */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Generating PDF...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border p-6">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
