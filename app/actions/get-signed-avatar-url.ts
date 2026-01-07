'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Generate a signed URL for an avatar stored in Supabase storage.
 * Uses admin client to bypass storage RLS policies.
 */
export async function getSignedAvatarUrl(
  avatarPath: string | null | undefined
): Promise<string | null> {
  if (!avatarPath) return null

  try {
    const adminClient = createAdminClient()

    // The avatar_url might be stored with or without the bucket prefix
    // Strip it if present since we specify the bucket in .from()
    const path = avatarPath.startsWith('avatars/')
      ? avatarPath.slice(8) // Remove 'avatars/'
      : avatarPath

    const { data, error } = await adminClient.storage
      .from('avatars')
      .createSignedUrl(path, 3600) // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error, 'Path:', path)
      return null
    }

    return data?.signedUrl ?? null
  } catch (err) {
    console.error('Failed to generate signed avatar URL:', err)
    return null
  }
}

/**
 * Generate signed URLs for multiple avatars in parallel.
 */
export async function getSignedAvatarUrls(
  avatarPaths: (string | null | undefined)[]
): Promise<(string | null)[]> {
  return Promise.all(avatarPaths.map(getSignedAvatarUrl))
}
