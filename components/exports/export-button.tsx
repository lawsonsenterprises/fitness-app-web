'use client'

import { useState } from 'react'
import { Download, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { usePDFExport, type ExportOptions } from '@/hooks/use-pdf-export'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  options: ExportOptions
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showLabel?: boolean
  label?: string
}

export function ExportButton({
  options,
  variant = 'outline',
  size = 'default',
  className,
  showLabel = true,
  label = 'Export PDF',
}: ExportButtonProps) {
  const { isExporting, progress, exportPDF } = usePDFExport()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleExport = async () => {
    try {
      await exportPDF(options)
      setShowSuccess(true)
      toast.success('PDF exported successfully', {
        description: 'The file has been downloaded to your device.',
      })
      setTimeout(() => setShowSuccess(false), 2000)
    } catch {
      toast.error('Export failed', {
        description: 'Please try again.',
      })
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={cn('gap-2', className)}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showLabel && <span>{progress}%</span>}
        </>
      ) : showSuccess ? (
        <>
          <Check className="h-4 w-4 text-emerald-500" />
          {showLabel && <span>Downloaded</span>}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {showLabel && <span>{label}</span>}
        </>
      )}
    </Button>
  )
}
