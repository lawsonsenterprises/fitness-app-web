'use client'

import { useState, useCallback } from 'react'
import { jsPDF } from 'jspdf'

export type ExportType =
  | 'client_progress'
  | 'check_in'
  | 'programme'
  | 'meal_plan'
  | 'client_summary'

export interface ExportOptions {
  type: ExportType
  id: string
  title?: string
  dateRange?: {
    from: Date
    to: Date
  }
  includePhotos?: boolean
  includeCharts?: boolean
  data?: ExportData
}

export interface ExportData {
  clientName?: string
  coachName?: string
  metrics?: {
    label: string
    value: string | number
    change?: string
  }[]
  sections?: {
    title: string
    content: string | string[]
  }[]
  notes?: string
  date?: string
}

interface ExportState {
  isExporting: boolean
  progress: number
  error: string | null
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function generatePDF(options: ExportOptions): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  // Helper to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }
  }

  // Header with branding
  doc.setFillColor(245, 158, 11) // Amber-500
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Synced Momentum', margin, 22)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Coach Platform', margin, 30)

  yPosition = 50

  // Title section
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  const title = options.title || getDefaultTitle(options.type)
  doc.text(title, margin, yPosition)
  yPosition += 10

  // Date and metadata
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${formatDate(new Date())}`, margin, yPosition)

  if (options.dateRange) {
    yPosition += 5
    doc.text(
      `Period: ${formatDate(options.dateRange.from)} - ${formatDate(options.dateRange.to)}`,
      margin,
      yPosition
    )
  }
  yPosition += 15

  // Add data based on export type
  const data = options.data
  if (!data) {
    console.warn('PDF export called without data - no content will be rendered')
  }

  // Client/Coach info if available
  if (data?.clientName || data?.coachName) {
    checkPageBreak(25)
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, yPosition, contentWidth, 20, 3, 3, 'F')

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')

    if (data?.clientName) {
      doc.text(`Client: ${data.clientName}`, margin + 5, yPosition + 8)
    }
    if (data?.coachName) {
      doc.text(`Coach: ${data.coachName}`, margin + 5, yPosition + 15)
    }
    yPosition += 28
  }

  // Metrics section
  if (data?.metrics && data.metrics.length > 0) {
    checkPageBreak(40)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Key Metrics', margin, yPosition)
    yPosition += 8

    // Draw metrics in a grid
    const metricWidth = contentWidth / Math.min(data.metrics.length, 3)
    const metricsPerRow = Math.min(data.metrics.length, 3)

    data.metrics.forEach((metric, index) => {
      const row = Math.floor(index / metricsPerRow)
      const col = index % metricsPerRow
      const xPos = margin + col * metricWidth
      const yPos = yPosition + row * 25

      checkPageBreak(30)

      // Metric box
      doc.setFillColor(255, 251, 235) // Amber-50
      doc.roundedRect(xPos, yPos, metricWidth - 5, 20, 2, 2, 'F')

      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'normal')
      doc.text(metric.label, xPos + 3, yPos + 6)

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(String(metric.value), xPos + 3, yPos + 14)

      if (metric.change) {
        doc.setFontSize(8)
        const isPositive = metric.change.startsWith('+')
        doc.setTextColor(isPositive ? 34 : 239, isPositive ? 197 : 68, isPositive ? 94 : 68)
        doc.text(metric.change, xPos + 3, yPos + 18)
      }
    })

    const totalRows = Math.ceil(data.metrics.length / metricsPerRow)
    yPosition += totalRows * 25 + 10
  }

  // Sections
  if (data?.sections && data.sections.length > 0) {
    for (const section of data.sections) {
      checkPageBreak(30)

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(section.title, margin, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)

      if (Array.isArray(section.content)) {
        for (const item of section.content) {
          checkPageBreak(8)
          doc.text(`• ${item}`, margin + 5, yPosition)
          yPosition += 6
        }
      } else {
        const lines = doc.splitTextToSize(section.content, contentWidth)
        for (const line of lines) {
          checkPageBreak(6)
          doc.text(line, margin, yPosition)
          yPosition += 5
        }
      }
      yPosition += 10
    }
  }

  // Notes section
  if (data?.notes) {
    checkPageBreak(40)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Notes', margin, yPosition)
    yPosition += 8

    doc.setFillColor(249, 250, 251)
    const notesLines = doc.splitTextToSize(data.notes, contentWidth - 10)
    const notesHeight = notesLines.length * 5 + 10
    doc.roundedRect(margin, yPosition, contentWidth, notesHeight, 2, 2, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(notesLines, margin + 5, yPosition + 8)
    yPosition += notesHeight + 10
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    doc.text(
      'Generated by Synced Momentum Coach Platform',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
  }

  return doc.output('blob')
}

function getDefaultTitle(type: ExportType): string {
  switch (type) {
    case 'client_progress':
      return 'Client Progress Report'
    case 'check_in':
      return 'Check-In Summary'
    case 'programme':
      return 'Training Programme'
    case 'meal_plan':
      return 'Meal Plan'
    case 'client_summary':
      return 'Client Summary'
    default:
      return 'Report'
  }
}


function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function usePDFExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    progress: 0,
    error: null,
  })

  const exportPDF = useCallback(async (options: ExportOptions) => {
    setState({ isExporting: true, progress: 0, error: null })

    try {
      setState((prev) => ({ ...prev, progress: 25 }))

      setState((prev) => ({ ...prev, progress: 50 }))
      const blob = await generatePDF(options)

      setState((prev) => ({ ...prev, progress: 75 }))

      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0]
      const sanitizedTitle = (options.title || options.type)
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
      const filename = `${sanitizedTitle}-${dateStr}.pdf`

      setState((prev) => ({ ...prev, progress: 100 }))
      downloadBlob(blob, filename)

      // Reset state after a short delay
      setTimeout(() => {
        setState({ isExporting: false, progress: 0, error: null })
      }, 500)

    } catch (error) {
      setState({
        isExporting: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Export failed',
      })
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ isExporting: false, progress: 0, error: null })
  }, [])

  return {
    ...state,
    exportPDF,
    reset,
  }
}

// Hook for batch exports
export function useBatchPDFExport() {
  const [state, setState] = useState<{
    isExporting: boolean
    totalItems: number
    completedItems: number
    error: string | null
  }>({
    isExporting: false,
    totalItems: 0,
    completedItems: 0,
    error: null,
  })

  const exportBatch = useCallback(async (items: ExportOptions[]) => {
    setState({
      isExporting: true,
      totalItems: items.length,
      completedItems: 0,
      error: null,
    })

    try {
      for (let i = 0; i < items.length; i++) {
        const blob = await generatePDF(items[i])
        const dateStr = new Date().toISOString().split('T')[0]
        const sanitizedTitle = (items[i].title || items[i].type)
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase()
        const filename = `${sanitizedTitle}-${dateStr}.pdf`
        downloadBlob(blob, filename)

        setState((prev) => ({
          ...prev,
          completedItems: i + 1,
        }))

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setTimeout(() => {
        setState({
          isExporting: false,
          totalItems: 0,
          completedItems: 0,
          error: null,
        })
      }, 500)

    } catch (error) {
      setState((prev) => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : 'Batch export failed',
      }))
    }
  }, [])

  return {
    ...state,
    exportBatch,
    progress: state.totalItems > 0
      ? Math.round((state.completedItems / state.totalItems) * 100)
      : 0,
  }
}
