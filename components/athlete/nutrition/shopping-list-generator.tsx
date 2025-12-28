'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Check,
  Copy,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Search,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Ingredient {
  name: string
  quantity: string
  unit: string
  category: string
  checked: boolean
}

interface ShoppingListGeneratorProps {
  mealPlanName: string
  ingredients: Ingredient[]
  daysIncluded: number
  onToggleItem?: (name: string) => void
  onRemoveItem?: (name: string) => void
  onAddItem?: (item: Omit<Ingredient, 'checked'>) => void
  onShare?: () => void
}

const categoryIcons: Record<string, string> = {
  protein: '🥩',
  dairy: '🥛',
  vegetables: '🥬',
  fruits: '🍎',
  grains: '🌾',
  fats: '🥑',
  pantry: '🥫',
  spices: '🧂',
  other: '📦',
}

const categoryOrder = [
  'protein',
  'dairy',
  'vegetables',
  'fruits',
  'grains',
  'fats',
  'pantry',
  'spices',
  'other',
]

function CategorySection({
  category,
  items,
  onToggle,
  onRemove,
}: {
  category: string
  items: Ingredient[]
  onToggle?: (name: string) => void
  onRemove?: (name: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const checkedCount = items.filter(i => i.checked).length
  const allChecked = checkedCount === items.length

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-colors',
          allChecked && 'bg-emerald-500/5'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{categoryIcons[category] || '📦'}</span>
          <div>
            <p className="font-semibold capitalize">{category}</p>
            <p className="text-xs text-muted-foreground">
              {checkedCount}/{items.length} items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allChecked && <Check className="h-4 w-4 text-emerald-500" />}
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-3 space-y-1">
              {items.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 transition-all',
                    item.checked
                      ? 'bg-emerald-500/10 opacity-60'
                      : 'bg-muted/30 hover:bg-muted/50'
                  )}
                >
                  <button
                    onClick={() => onToggle?.(item.name)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                        item.checked
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-muted-foreground'
                      )}
                    >
                      {item.checked && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={cn(
                      'font-medium',
                      item.checked && 'line-through text-muted-foreground'
                    )}>
                      {item.name}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                    {onRemove && (
                      <button
                        onClick={() => onRemove(item.name)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ShoppingListGenerator({
  mealPlanName,
  ingredients,
  daysIncluded,
  onToggleItem,
  onRemoveItem,
  onAddItem,
  onShare,
}: ShoppingListGeneratorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', category: 'other' })

  // Group by category
  const groupedIngredients = useMemo(() => {
    const filtered = searchQuery
      ? ingredients.filter(i =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : ingredients

    return categoryOrder.reduce((acc, category) => {
      const items = filtered.filter(i => i.category.toLowerCase() === category)
      if (items.length > 0) {
        acc[category] = items
      }
      return acc
    }, {} as Record<string, Ingredient[]>)
  }, [ingredients, searchQuery])

  // Stats
  const totalItems = ingredients.length
  const checkedItems = ingredients.filter(i => i.checked).length
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  const copyToClipboard = () => {
    const list = Object.entries(groupedIngredients)
      .map(([category, items]) =>
        `${category.toUpperCase()}\n${items
          .map(i => `- ${i.name}: ${i.quantity} ${i.unit}${i.checked ? ' ✓' : ''}`)
          .join('\n')}`
      )
      .join('\n\n')

    navigator.clipboard.writeText(`Shopping List for ${mealPlanName}\n\n${list}`)
    alert('Shopping list copied to clipboard!')
  }

  const downloadList = () => {
    const list = Object.entries(groupedIngredients)
      .map(([category, items]) =>
        `${category.toUpperCase()}\n${items
          .map(i => `- ${i.name}: ${i.quantity} ${i.unit}`)
          .join('\n')}`
      )
      .join('\n\n')

    const blob = new Blob([`Shopping List for ${mealPlanName}\n\n${list}`], {
      type: 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shopping-list-${mealPlanName.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity && newItem.unit) {
      onAddItem?.(newItem)
      setNewItem({ name: '', quantity: '', unit: '', category: 'other' })
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-500" />
            Shopping List
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Based on {mealPlanName} • {daysIncluded} days
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button
            onClick={downloadList}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Shopping Progress</span>
          <span className="text-sm text-muted-foreground">
            {checkedItems} of {totalItems} items
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
        {progress === 100 && (
          <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
            <Check className="h-4 w-4" />
            All items checked off!
          </p>
        )}
      </div>

      {/* Search and Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Add item form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h3 className="font-semibold mb-3">Add Custom Item</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Unit (g, kg, etc)"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {categoryOrder.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddItem}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category sections */}
      <div className="space-y-3">
        {Object.entries(groupedIngredients).map(([category, items]) => (
          <CategorySection
            key={category}
            category={category}
            items={items}
            onToggle={onToggleItem}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Empty state */}
      {Object.keys(groupedIngredients).length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium text-muted-foreground">
            {searchQuery ? 'No items match your search' : 'No items in shopping list'}
          </p>
        </div>
      )}
    </div>
  )
}

export type { Ingredient }
