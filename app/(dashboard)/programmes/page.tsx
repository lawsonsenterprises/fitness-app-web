'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Dumbbell,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProgrammeTemplateCard } from '@/components/programmes/programme-template-card'
import { useProgrammes, useDuplicateProgramme, useDeleteProgramme } from '@/hooks/use-programmes'
import { cn } from '@/lib/utils'

const programmeTypes: { value: string; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'hypertrophy', label: 'Hypertrophy' },
  { value: 'strength', label: 'Strength' },
  { value: 'powerlifting', label: 'Powerlifting' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'mobility', label: 'Mobility' },
]

const difficultyLevels: { value: string; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function ProgrammesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false)

  const { data: programmesData, isLoading } = useProgrammes({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
    search,
  })

  const duplicateProgramme = useDuplicateProgramme()
  const deleteProgramme = useDeleteProgramme()

  const programmes = programmesData?.data || []

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProgramme.mutateAsync(id)
      toast.success('Programme duplicated', {
        description: 'A copy of the programme has been created.',
      })
    } catch {
      toast.error('Failed to duplicate programme')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this programme? This action cannot be undone.')) {
      return
    }
    try {
      await deleteProgramme.mutateAsync(id)
      toast.success('Programme deleted')
    } catch {
      toast.error('Failed to delete programme')
    }
  }

  const currentType = programmeTypes.find((t) => t.value === typeFilter) || programmeTypes[0]
  const currentDifficulty = difficultyLevels.find((d) => d.value === difficultyFilter) || difficultyLevels[0]

  return (
    <div className="min-h-screen">
      <TopBar title="Programmes" />

      <div className="p-4 lg:p-8">
        {/* Header with stats and actions */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-muted-foreground">
                Create and assign training programmes to your clients
              </p>

              {/* Quick stats */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{programmesData?.total || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Published:</span>
                  <span className="font-medium">
                    {programmes.filter((p) => p.isPublished).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Drafts:</span>
                  <span className="font-medium">
                    {programmes.filter((p) => !p.isPublished).length}
                  </span>
                </div>
              </div>
            </div>

            <Link href="/programmes/new">
              <Button className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90">
                <Plus className="mr-2 h-4 w-4" />
                New Programme
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search programmes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'h-11 rounded-lg border-border bg-background pl-10 pr-4',
                'focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
              )}
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="h-11 min-w-[140px] justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {currentType.label}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showTypeDropdown && 'rotate-180'
                )}
              />
            </Button>

            {showTypeDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTypeDropdown(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                  {programmeTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setTypeFilter(type.value)
                        setShowTypeDropdown(false)
                      }}
                      className={cn(
                        'flex w-full items-center px-3 py-2 text-sm hover:bg-muted',
                        typeFilter === type.value && 'bg-muted'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Difficulty filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
              className="h-11 min-w-[140px] justify-between gap-2"
            >
              <span>{currentDifficulty.label}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showDifficultyDropdown && 'rotate-180'
                )}
              />
            </Button>

            {showDifficultyDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDifficultyDropdown(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => {
                        setDifficultyFilter(level.value)
                        setShowDifficultyDropdown(false)
                      }}
                      className={cn(
                        'flex w-full items-center px-3 py-2 text-sm hover:bg-muted',
                        difficultyFilter === level.value && 'bg-muted'
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active filters */}
        {(typeFilter !== 'all' || difficultyFilter !== 'all') && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {typeFilter !== 'all' && (
              <button
                onClick={() => setTypeFilter('all')}
                className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs hover:bg-muted/80"
              >
                {currentType.label}
                <span className="text-muted-foreground">×</span>
              </button>
            )}
            {difficultyFilter !== 'all' && (
              <button
                onClick={() => setDifficultyFilter('all')}
                className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs hover:bg-muted/80"
              >
                {currentDifficulty.label}
                <span className="text-muted-foreground">×</span>
              </button>
            )}
            <button
              onClick={() => {
                setTypeFilter('all')
                setDifficultyFilter('all')
              }}
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Programmes grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : programmes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => (
              <ProgrammeTemplateCard
                key={programme.id}
                programme={programme}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">
              {search || typeFilter !== 'all' || difficultyFilter !== 'all'
                ? 'No matching programmes'
                : 'No programmes yet'}
            </h3>
            <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
              {search || typeFilter !== 'all' || difficultyFilter !== 'all'
                ? 'Try adjusting your filters or search term.'
                : 'Create your first training programme to start assigning workouts to your clients.'}
            </p>
            {!search && typeFilter === 'all' && difficultyFilter === 'all' && (
              <Link href="/programmes/new">
                <Button className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Programme
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
