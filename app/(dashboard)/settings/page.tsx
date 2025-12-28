'use client'

import { useState, useEffect } from 'react'
import { Camera, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  credentials: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramHandle: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileSettingsPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      businessName: '',
      bio: '',
      credentials: '',
      websiteUrl: '',
      instagramHandle: '',
    },
  })

  // Fetch profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          reset({
            firstName: profile.first_name || user?.user_metadata?.first_name || '',
            lastName: profile.last_name || user?.user_metadata?.last_name || '',
            email: user?.email || '',
            businessName: profile.business_name || '',
            bio: profile.bio || '',
            credentials: profile.qualifications?.join(', ') || '',
            websiteUrl: profile.website_url || '',
            instagramHandle: profile.social_links?.instagram || '',
          })
        } else {
          // Use user metadata if no profile exists
          reset({
            firstName: user?.user_metadata?.first_name || '',
            lastName: user?.user_metadata?.last_name || '',
            email: user?.email || '',
            businessName: '',
            bio: '',
            credentials: '',
            websiteUrl: '',
            instagramHandle: '',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id, user?.email, user?.user_metadata, supabase, reset])

  const onSubmit = handleSubmit(async (data) => {
    if (!user?.id) return

    setIsSubmitting(true)
    try {
      // Update Supabase Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
        },
      })

      if (authError) throw authError

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          business_name: data.businessName || null,
          bio: data.bio || null,
          qualifications: data.credentials ? data.credentials.split(',').map(q => q.trim()) : [],
          website_url: data.websiteUrl || null,
          social_links: {
            instagram: data.instagramHandle || null,
          },
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
      setIsSubmitting(false)
    }
  })

  const initials =
    (user?.user_metadata?.first_name?.[0] || '') +
    (user?.user_metadata?.last_name?.[0] || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile photo section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Profile Photo</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          This will be displayed on your profile and in messages
        </p>

        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-2xl font-bold text-background">
              {initials || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-amber-500 text-white shadow-lg transition-transform hover:scale-105">
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

      {/* Profile form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold">Personal Information</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Your basic profile details
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                First Name
              </label>
              <Input
                {...register('firstName')}
                className={cn(errors.firstName && 'border-red-500')}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Last Name</label>
              <Input
                {...register('lastName')}
                className={cn(errors.lastName && 'border-red-500')}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <Input
                {...register('email')}
                type="email"
                className={cn(errors.email && 'border-red-500')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold">Business Details</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Information visible to your clients
          </p>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Business Name
              </label>
              <Input
                {...register('businessName')}
                placeholder="e.g., Elite Fitness Coaching"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Credentials
              </label>
              <Input
                {...register('credentials')}
                placeholder="e.g., NASM-CPT, Precision Nutrition Coach"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Your certifications and qualifications
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Bio</label>
              <textarea
                {...register('bio')}
                rows={4}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm',
                  'focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
                  'resize-none'
                )}
                placeholder="Tell your clients about yourself, your approach, and what makes your coaching unique..."
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold">Social Links</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Connect your social profiles
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Website</label>
              <Input
                {...register('websiteUrl')}
                type="url"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Instagram Handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  {...register('instagramHandle')}
                  className="pl-8"
                  placeholder="yourhandle"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting}
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
