import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

/**
 * Generate a signed URL for an avatar stored in Supabase storage.
 * Returns null if the path is empty or if there's an error.
 *
 * Note: avatar_url in the database is stored as "avatars/filename.jpg"
 * but createSignedUrl expects just "filename.jpg" since we specify the bucket.
 */
export async function getSignedAvatarUrl(
  avatarPath: string | null | undefined
): Promise<string | null> {
  if (!avatarPath) return null

  // Strip the bucket prefix if present
  const path = avatarPath.replace('avatars/', '')

  const { data } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, 3600) // 1 hour expiry

  return data?.signedUrl ?? null
}

/**
 * Generate signed URLs for multiple avatars in parallel.
 */
export async function getSignedAvatarUrls(
  avatarPaths: (string | null | undefined)[]
): Promise<(string | null)[]> {
  return Promise.all(avatarPaths.map(getSignedAvatarUrl))
}
