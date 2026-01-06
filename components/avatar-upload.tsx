'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface AvatarUploadProps {
  avatarUrl: string | null
  initials: string
  onUploadComplete?: (newAvatarUrl: string) => void
}

export function AvatarUpload({ avatarUrl, initials, onUploadComplete }: AvatarUploadProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Get signed URL for avatar (private bucket)
  useEffect(() => {
    async function getSignedUrl() {
      if (!avatarUrl) {
        setSignedUrl(null)
        return
      }

      // Extract path from full path (avatars/user_id/avatar.jpg -> user_id/avatar.jpg)
      const path = avatarUrl.replace('avatars/', '')

      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(path, 3600) // 1 hour expiry

      if (error) {
        console.error('Error getting signed URL:', error)
        setSignedUrl(null)
      } else {
        setSignedUrl(data.signedUrl)
      }
    }

    getSignedUrl()
  }, [avatarUrl, supabase])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPG, PNG, or WebP image.',
      })
      return
    }

    // Validate file size (2MB)
    if (file.size > 2097152) {
      toast.error('File too large', {
        description: 'Please upload an image smaller than 2MB.',
      })
      return
    }

    setIsUploading(true)

    try {
      // Resize and compress image
      const resizedFile = await resizeImage(file)

      // Generate path: avatars/{user_id}/avatar_{timestamp}.jpg
      const timestamp = Date.now()
      const extension = file.type.split('/')[1]
      const filePath = `${user.id}/avatar_${timestamp}.${extension}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, resizedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Update profile with new avatar_url
      const fullPath = `avatars/${filePath}`
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: fullPath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Set preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(resizedFile)

      toast.success('Avatar uploaded', {
        description: 'Your profile photo has been updated.',
      })

      onUploadComplete?.(fullPath)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Upload failed', {
        description: 'Failed to upload avatar. Please try again.',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Resize image to max 512px while maintaining aspect ratio
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Calculate new dimensions (max 512px)
          let width = img.width
          let height = img.height
          const maxSize = 512

          if (width > height && width > maxSize) {
            height = (height / width) * maxSize
            width = maxSize
          } else if (height > maxSize) {
            width = (width / height) * maxSize
            height = maxSize
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'))
                return
              }
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(resizedFile)
            },
            'image/jpeg',
            0.8
          )
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const displayUrl = previewUrl || signedUrl

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-2xl font-bold text-background">
            {initials || 'U'}
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-amber-500 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          JPG, PNG or WebP. Max 2MB.
        </p>
      </div>
    </div>
  )
}
