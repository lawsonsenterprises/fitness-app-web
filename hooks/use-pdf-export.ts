'use client'

import { useState, useCallback } from 'react'

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
}

interface ExportState {
  isExporting: boolean
  progress: number
  error: string | null
}

// Mock function to simulate PDF generation
async function generatePDF(options: ExportOptions): Promise<Blob> {
  // Simulate PDF generation with progress
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real implementation, this would:
  // 1. Fetch the data for the given type and id
  // 2. Use a library like jsPDF or @react-pdf/renderer to generate the PDF
  // 3. Return the PDF blob

  // For now, we create a mock PDF blob
  const mockContent = `
    PDF Export: ${options.type}
    ID: ${options.id}
    Title: ${options.title || 'Export'}
    Generated: ${new Date().toISOString()}
  `

  return new Blob([mockContent], { type: 'application/pdf' })
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
      // Simulate progress updates
      setState((prev) => ({ ...prev, progress: 25 }))
      await new Promise((resolve) => setTimeout(resolve, 300))

      setState((prev) => ({ ...prev, progress: 50 }))
      const blob = await generatePDF(options)

      setState((prev) => ({ ...prev, progress: 75 }))
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `${options.title || options.type}-${dateStr}.pdf`

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
        const filename = `${items[i].title || items[i].type}-${dateStr}.pdf`
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
