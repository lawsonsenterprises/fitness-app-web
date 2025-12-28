'use client'

import { useState } from 'react'
import { Sun, Moon, Monitor, Save, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const brandColours = [
  { name: 'Amber', value: '#f59e0b', class: 'bg-amber-500' },
  { name: 'Emerald', value: '#10b981', class: 'bg-emerald-500' },
  { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-violet-500' },
  { name: 'Rose', value: '#f43f5e', class: 'bg-rose-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
]

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [brandColour, setBrandColour] = useState('#f59e0b')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Appearance settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Theme selection */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Theme</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Select your preferred colour theme
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              value: 'light',
              label: 'Light',
              icon: Sun,
              preview: 'bg-white border-gray-200',
            },
            {
              value: 'dark',
              label: 'Dark',
              icon: Moon,
              preview: 'bg-gray-900 border-gray-700',
            },
            {
              value: 'system',
              label: 'System',
              icon: Monitor,
              preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400',
            },
          ].map((option) => {
            const Icon = option.icon
            const isSelected = theme === option.value

            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                className={cn(
                  'group relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all',
                  isSelected
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-border hover:border-foreground/20'
                )}
              >
                {/* Preview box */}
                <div
                  className={cn(
                    'flex h-16 w-full items-center justify-center rounded-lg border',
                    option.preview
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6',
                      option.value === 'light' && 'text-gray-700',
                      option.value === 'dark' && 'text-gray-300',
                      option.value === 'system' && 'text-gray-500'
                    )}
                  />
                </div>

                <span className="text-sm font-medium">{option.label}</span>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Brand colour */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Brand Colour</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Customise the accent colour throughout the platform
        </p>

        <div className="flex flex-wrap gap-3">
          {brandColours.map((colour) => {
            const isSelected = brandColour === colour.value

            return (
              <button
                key={colour.value}
                onClick={() => setBrandColour(colour.value)}
                className={cn(
                  'group relative flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-110',
                  colour.class,
                  isSelected && 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                )}
                title={colour.name}
              >
                {isSelected && <Check className="h-5 w-5 text-white" />}
              </button>
            )
          })}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Currently selected: <span className="font-medium">{brandColours.find(c => c.value === brandColour)?.name}</span>
        </p>
      </div>

      {/* Font size */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Font Size</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Adjust the text size for better readability
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">A</span>
          <input
            type="range"
            min="12"
            max="20"
            defaultValue="16"
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
          />
          <span className="text-xl text-muted-foreground">A</span>
        </div>
      </div>

      {/* Density */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Display Density</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Adjust the spacing and compactness of the interface
        </p>

        <div className="flex flex-wrap gap-3">
          {['Compact', 'Comfortable', 'Spacious'].map((density) => (
            <button
              key={density}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                density === 'Comfortable'
                  ? 'bg-foreground text-background'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {density}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
