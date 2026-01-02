'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Camera } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'

export default function AthleteProfileSettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    height: '',
  })

  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setIsFetching(false)
        return
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile({
          firstName: data?.first_name || user?.user_metadata?.first_name || '',
          lastName: data?.last_name || user?.user_metadata?.last_name || '',
          email: user?.email || '',
          dateOfBirth: data?.date_of_birth || '',
          height: data?.height?.toString() || '',
        })
      } catch {
        setProfile({
          firstName: user?.user_metadata?.first_name || '',
          lastName: user?.user_metadata?.last_name || '',
          email: user?.email || '',
          dateOfBirth: '',
          height: '',
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [user?.id, user?.email, user?.user_metadata, supabase])

  const handleSaveProfile = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Update Supabase Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          full_name: `${profile.firstName} ${profile.lastName}`,
        },
      })

      if (authError) throw authError

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          date_of_birth: profile.dateOfBirth || null,
          height: profile.height ? parseInt(profile.height) : null,
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      toast.success('Profile updated', {
        description: 'Your changes have been saved.',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile', {
        description: 'Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Profile Photo</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          This will be displayed on your profile and in messages
        </p>

        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-500 text-2xl font-bold text-white">
              {initials || 'A'}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-lg transition-transform hover:scale-105">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <Button variant="outline" size="sm">
              Upload Photo
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG or WebP. Max 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Personal Information</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Your basic profile details
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">First Name</label>
            <Input
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Last Name</label>
            <Input
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Contact your coach to update your email address
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Date of Birth</label>
            <Input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Height (cm)</label>
            <Input
              type="number"
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: e.target.value })}
              placeholder="e.g., 180"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
