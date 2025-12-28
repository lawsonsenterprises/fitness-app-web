'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Building2,
  Tag,
  FileText,
  ChevronLeft,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestMetadata {
  date: Date
  lab: string
  tags: string[]
  notes?: string
}

interface TestMetadataFormProps {
  onSubmit: (data: TestMetadata) => void
  onBack: () => void
  initialData?: Partial<TestMetadata>
}

const commonLabs = [
  'Medichecks',
  'Forth',
  'Thriva',
  'Randox',
  'NHS',
  'Private GP',
  'Other',
]

const suggestedTags = [
  'Baseline',
  'Pre-cycle',
  'Mid-cycle',
  'Post-cycle',
  'PCT',
  'Annual',
  'Follow-up',
  'Routine',
]

export function TestMetadataForm({
  onSubmit,
  onBack,
  initialData,
}: TestMetadataFormProps) {
  const [date, setDate] = useState<string>(
    initialData?.date
      ? initialData.date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [lab, setLab] = useState(initialData?.lab || '')
  const [customLab, setCustomLab] = useState('')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [customTag, setCustomTag] = useState('')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalLab = lab === 'Other' ? customLab : lab
    if (!finalLab) return

    onSubmit({
      date: new Date(date),
      lab: finalLab,
      tags,
      notes: notes || undefined,
    })
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleCustomTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (customTag.trim()) {
        addTag(customTag.trim())
        setCustomTag('')
      }
    }
  }

  const isValid = date && (lab === 'Other' ? customLab : lab)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Test Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Lab */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Lab / Provider
        </label>
        <div className="grid grid-cols-4 gap-2">
          {commonLabs.map((labOption) => (
            <button
              key={labOption}
              type="button"
              onClick={() => setLab(labOption)}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                lab === labOption
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              {labOption}
            </button>
          ))}
        </div>
        {lab === 'Other' && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            type="text"
            value={customLab}
            onChange={(e) => setCustomLab(e.target.value)}
            placeholder="Enter lab name"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            required={lab === 'Other'}
          />
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Tag className="h-4 w-4 text-muted-foreground" />
          Tags (optional)
        </label>

        {/* Selected tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-emerald-500/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Suggested tags */}
        <div className="flex flex-wrap gap-2">
          {suggestedTags
            .filter((tag) => !tags.includes(tag))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-600 transition-colors"
              >
                <Plus className="inline h-3 w-3 mr-1" />
                {tag}
              </button>
            ))}
        </div>

        {/* Custom tag input */}
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={handleCustomTagKeyDown}
          placeholder="Type custom tag and press Enter"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about this test..."
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className={cn(
            'rounded-lg px-6 py-2 text-sm font-medium transition-colors',
            isValid
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          Save Test
        </button>
      </div>
    </form>
  )
}

export type { TestMetadata }
