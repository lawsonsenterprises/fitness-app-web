'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Search,
  Calendar,
  Loader2,
  Check,
  Dumbbell,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { TopBar } from '@/components/dashboard/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProgrammeTypeBadge, DifficultyBadge } from '@/components/programmes/programme-type-badge'
import { ClientStatusBadge } from '@/components/clients/client-status-badge'
import { useProgrammes, useProgramme, useAssignProgramme } from '@/hooks/use-programmes'
import { useClients } from '@/hooks/use-clients'
import { getClientDisplayName, getClientInitials } from '@/types'
import { cn } from '@/lib/utils'

function AssignProgrammeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTemplateId = searchParams.get('template')

  // Data fetching
  const { data: programmesData } = useProgrammes()
  const { data: preselectedProgramme } = useProgramme(preselectedTemplateId || '')
  const { data: clientsData, isLoading: isLoadingClients } = useClients({ status: 'active' })
  const assignProgramme = useAssignProgramme()

  const programmes = programmesData?.data || []
  const clients = clientsData?.data || []

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(preselectedTemplateId || '')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [coachNotes, setCoachNotes] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [programmeSearch, setProgrammeSearch] = useState('')

  // Filter clients
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients
    const search = clientSearch.toLowerCase()
    return clients.filter((client) => {
      const name = getClientDisplayName(client).toLowerCase()
      const email = client.email?.toLowerCase() || ''
      return name.includes(search) || email.includes(search)
    })
  }, [clients, clientSearch])

  // Filter programmes
  const filteredProgrammes = useMemo(() => {
    if (!programmeSearch) return programmes
    const search = programmeSearch.toLowerCase()
    return programmes.filter((p) =>
      p.name.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    )
  }, [programmes, programmeSearch])

  // Get selected programme details
  const selectedProgramme = selectedTemplateId
    ? (preselectedProgramme?.id === selectedTemplateId
        ? preselectedProgramme
        : programmes.find((p) => p.id === selectedTemplateId))
    : null

  // Get selected client details
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null

  // Calculate end date
  const endDate = useMemo(() => {
    if (!startDate || !selectedProgramme?.durationWeeks) return null
    const start = new Date(startDate)
    start.setDate(start.getDate() + selectedProgramme.durationWeeks * 7)
    return start.toISOString().split('T')[0]
  }, [startDate, selectedProgramme?.durationWeeks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTemplateId) {
      toast.error('Please select a programme')
      return
    }

    if (!selectedClientId) {
      toast.error('Please select a client')
      return
    }

    if (!startDate) {
      toast.error('Please select a start date')
      return
    }

    try {
      await assignProgramme.mutateAsync({
        templateId: selectedTemplateId,
        clientId: selectedClientId,
        name: selectedProgramme?.name || 'Training Programme',
        content: selectedProgramme?.content || {},
        startDate,
        endDate: endDate || undefined,
        coachNotes: coachNotes.trim() || undefined,
      })

      toast.success('Programme assigned successfully')
      router.push(`/clients/${selectedClientId}/training`)
    } catch (error) {
      console.error('Failed to assign programme:', error)
      toast.error('Failed to assign programme')
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Assign Programme" />

      <div className="p-4 lg:p-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Programme Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Programme</h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={programmeSearch}
                  onChange={(e) => setProgrammeSearch(e.target.value)}
                  placeholder="Search programmes..."
                  className="pl-10"
                />
              </div>

              {/* Programme List */}
              <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
                {filteredProgrammes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Dumbbell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No programmes found</p>
                  </div>
                ) : (
                  filteredProgrammes.map((programme) => (
                    <button
                      key={programme.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(programme.id)}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-colors',
                        selectedTemplateId === programme.id
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{programme.name}</span>
                            {selectedTemplateId === programme.id && (
                              <Check className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          {programme.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {programme.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <ProgrammeTypeBadge type={programme.type} size="sm" />
                            <DifficultyBadge difficulty={programme.difficulty} size="sm" />
                            <span className="text-xs text-muted-foreground">
                              {programme.durationWeeks} weeks
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Client Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Client</h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search clients..."
                  className="pl-10"
                />
              </div>

              {/* Client List */}
              <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
                {isLoadingClients ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <User className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No clients found</p>
                  </div>
                ) : (
                  filteredClients.map((client) => {
                    const displayName = getClientDisplayName(client)
                    const initials = getClientInitials(client)
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => setSelectedClientId(client.id)}
                        className={cn(
                          'w-full rounded-lg border p-3 text-left transition-colors',
                          selectedClientId === client.id
                            ? 'border-amber-500 bg-amber-500/5'
                            : 'border-transparent hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {client.avatarUrl ? (
                            <Image
                              src={client.avatarUrl}
                              alt={displayName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                              {initials || '?'}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{displayName}</span>
                              {selectedClientId === client.id && (
                                <Check className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {client.email}
                            </p>
                          </div>
                          <ClientStatusBadge status={client.status} />
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Assignment Details</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>End Date (Calculated)</Label>
                <div className="mt-1.5 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm">
                  {endDate
                    ? new Date(endDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Select a programme to calculate'}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="coachNotes">Coach Notes (Optional)</Label>
                <textarea
                  id="coachNotes"
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  placeholder="Add any personalised notes or instructions for this client..."
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {selectedProgramme && selectedClient && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
              <h3 className="mb-4 font-semibold text-amber-600">Assignment Summary</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Programme</p>
                  <p className="font-medium">{selectedProgramme.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{getClientDisplayName(selectedClient)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedProgramme.durationWeeks} weeks</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Training Days</p>
                  <p className="font-medium">{selectedProgramme.daysPerWeek} days/week</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignProgramme.isPending || !selectedTemplateId || !selectedClientId}
              className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
            >
              {assignProgramme.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Assign Programme
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AssignProgrammePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <TopBar title="Assign Programme" />
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      }
    >
      <AssignProgrammeContent />
    </Suspense>
  )
}
