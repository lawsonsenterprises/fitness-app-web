'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Calendar, TrendingUp, MoreVertical, Copy, Trash2, CheckCircle2 } from 'lucide-react'
import {
  useUserProgrammes,
  useDeleteUserProgramme,
  useDuplicateUserProgramme,
  useSetActiveProgramme,
  type ProgrammeRotationType,
} from '@/hooks/athlete'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CreateProgrammeModal } from '@/components/programmes/create-programme-modal'
import { TopBar } from '@/components/dashboard/top-bar'

export default function ProgrammesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: programmes = [], isLoading } = useUserProgrammes()
  const deleteMutation = useDeleteUserProgramme()
  const duplicateMutation = useDuplicateUserProgramme()
  const setActiveMutation = useSetActiveProgramme()

  const handleDelete = async (programmeId: string, programmeName: string) => {
    if (!confirm(`Are you sure you want to delete "${programmeName}"? This cannot be undone.`)) {
      return
    }

    try {
      await deleteMutation.mutateAsync(programmeId)
      toast.success('Programme deleted successfully')
    } catch (error) {
      console.error('Error deleting programme:', error)
      toast.error('Failed to delete programme')
    }
  }

  const handleDuplicate = async (programmeId: string) => {
    try {
      const result = await duplicateMutation.mutateAsync(programmeId)
      toast.success('Programme duplicated successfully')
      return result
    } catch (error) {
      console.error('Error duplicating programme:', error)
      toast.error('Failed to duplicate programme')
    }
  }

  const handleSetActive = async (programmeId: string, programmeName: string) => {
    try {
      await setActiveMutation.mutateAsync(programmeId)
      toast.success(`"${programmeName}" is now your active programme`)
    } catch (error) {
      console.error('Error setting active programme:', error)
      toast.error('Failed to set active programme')
    }
  }

  if (isLoading) {
    return (
      <>
        <TopBar title="My Programmes" />
        <div className="p-6 lg:p-8">
          <p className="mb-6 text-muted-foreground">Create and manage your training programmes</p>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/10 border-t-foreground"></div>
          </div>
        </div>
      </>
    )
  }

  const activeProgramme = programmes.find(p => p.isActive)
  const inactiveProgrammes = programmes.filter(p => !p.isActive)

  return (
    <>
      <TopBar title="My Programmes" />
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-muted-foreground">
            {programmes.length === 0
              ? 'Create your first training programme'
              : `${programmes.length} ${programmes.length === 1 ? 'programme' : 'programmes'}`}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Programme
          </Button>
        </div>

        {/* Active Programme */}
        {activeProgramme && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Active Programme</h2>
            <div className="max-w-2xl">
              <ProgrammeCard
                programme={activeProgramme}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onSetActive={handleSetActive}
                isActive={true}
              />
            </div>
          </div>
        )}

        {/* Inactive Programmes */}
        {inactiveProgrammes.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">All Programmes</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inactiveProgrammes.map((programme) => (
                <ProgrammeCard
                  key={programme.id}
                  programme={programme}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onSetActive={handleSetActive}
                  isActive={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {programmes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">No programmes yet</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Create your first training programme to start tracking your workouts
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Create Programme
            </Button>
          </div>
        )}
      </div>

      <CreateProgrammeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  )
}

interface ProgrammeCardProps {
  programme: {
    id: string
    name: string
    description: string | null
    durationWeeks: number
    currentWeek: number
    rotationType: ProgrammeRotationType
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  onDelete: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onSetActive: (id: string, name: string) => void
  isActive: boolean
}

function ProgrammeCard({ programme, onDelete, onDuplicate, onSetActive, isActive }: ProgrammeCardProps) {
  const hasFixedDuration = programme.durationWeeks && programme.durationWeeks > 0
  const progress = hasFixedDuration ? Math.round((programme.currentWeek / programme.durationWeeks) * 100) : 0

  // Determine schedule display text
  const getScheduleText = () => {
    if (hasFixedDuration) {
      return `Week ${programme.currentWeek}/${programme.durationWeeks}`
    }
    // For programmes without fixed duration, show "Ongoing"
    return 'Ongoing'
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-md">
      <Link
        href={`/athlete/training/programmes/${programme.id}`}
        className="block p-6"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold transition-colors group-hover:text-foreground">
              {programme.name}
            </h3>
            {programme.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {programme.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{getScheduleText()}</span>
          </div>
          {hasFixedDuration && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{progress}% complete</span>
            </div>
          )}
        </div>

        {/* Progress Bar (only for fixed-duration programmes) */}
        {hasFixedDuration && (
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {isActive && (
            <Badge variant="default" className="bg-amber-500 text-white">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Active
            </Badge>
          )}
          <Badge variant="outline" className="text-muted-foreground">
            {programme.rotationType === 'sequential' ? 'Sequential' : 'Weekly Schedule'}
          </Badge>
        </div>
      </Link>

      {/* Actions Menu */}
      <div className="absolute right-4 top-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <DropdownMenuItem asChild>
              <Link href={`/athlete/training/programmes/${programme.id}/edit`}>
                Edit Programme
              </Link>
            </DropdownMenuItem>
            {!isActive && (
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  onSetActive(programme.id, programme.name)
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Set as Active
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDuplicate(programme.id)
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDelete(programme.id, programme.name)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
