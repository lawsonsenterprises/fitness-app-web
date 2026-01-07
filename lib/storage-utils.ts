import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

/**
 * Generate a signed URL for an avatar stored in Supabase storage.
 * Returns null if the path is empty or if there's an error.
 */
export async function getSignedAvatarUrl(
  avatarPath: string | null | undefined
): Promise<string | null> {
  if (!avatarPath) return null

  const { data } = await supabase.storage
    .from('avatars')
    .createSignedUrl(avatarPath, 3600) // 1 hour expiry

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
