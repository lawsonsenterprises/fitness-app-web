import { createClient } from '@/lib/supabase/client'

const TIER_LIMITS = {
  logger: 3,
  coachBrain: 10,
  coachPayPlus: 10,
}

const GLOBAL_DAILY_LIMIT = 80

export type UserTier = 'logger' | 'coachBrain' | 'coachPayPlus'
export type VideoType = 'musclewiki' | 'youtube'
export type Platform = 'ios' | 'web'

export interface CanWatchResult {
  canWatch: boolean
  reason?: string
}

/**
 * Check if user can watch a video based on their tier and daily limits
 * YouTube videos are always allowed (no API cost)
 * MuscleWiki videos count toward tier-based daily limits
 */
export async function canWatchVideo(
  userId: string,
  tier: UserTier,
  videoType: VideoType
): Promise<CanWatchResult> {
  // YouTube videos always allowed (no API cost)
  if (videoType === 'youtube') {
    return { canWatch: true }
  }

  const supabase = createClient()

  // Check user's daily usage for MuscleWiki videos
  const today = new Date().toISOString().split('T')[0]

  const { count: userCount, error: userError } = await supabase
    .from('video_usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('video_type', 'musclewiki')
    .gte('watched_at', `${today}T00:00:00Z`)
    .lte('watched_at', `${today}T23:59:59Z`)

  if (userError) {
    console.error('Error checking user video usage:', userError)
    // Fail open - allow video if we can't check usage
    return { canWatch: true }
  }

  const userLimit = TIER_LIMITS[tier]

  if ((userCount || 0) >= userLimit) {
    return {
      canWatch: false,
      reason: 'You have reached your daily video limit. Existing cached videos still play.',
    }
  }

  // Check global daily limit (across all users)
  const { count: globalCount, error: globalError } = await supabase
    .from('video_usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('video_type', 'musclewiki')
    .gte('watched_at', `${today}T00:00:00Z`)
    .lte('watched_at', `${today}T23:59:59Z`)

  if (globalError) {
    console.error('Error checking global video usage:', globalError)
    // Fail open - allow video if we can't check usage
    return { canWatch: true }
  }

  if ((globalCount || 0) >= GLOBAL_DAILY_LIMIT) {
    return {
      canWatch: false,
      reason: 'We are pausing new video downloads today. You can still use the written steps below.',
    }
  }

  return { canWatch: true }
}

/**
 * Track a video watch in the database
 * This should be called BEFORE the video loads to count against limits
 */
export async function trackVideoWatch(
  userId: string,
  exerciseId: string,
  videoType: VideoType,
  platform: Platform
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('video_usage_tracking').insert({
    user_id: userId,
    exercise_id: exerciseId,
    video_type: videoType,
    platform: platform,
  })

  if (error) {
    console.error('Error tracking video watch:', error)
    // Non-fatal - continue even if tracking fails
  }
}

/**
 * Get user's remaining video count for today
 */
export async function getRemainingVideos(
  userId: string,
  tier: UserTier
): Promise<number> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { count, error } = await supabase
    .from('video_usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('video_type', 'musclewiki')
    .gte('watched_at', `${today}T00:00:00Z`)
    .lte('watched_at', `${today}T23:59:59Z`)

  if (error) {
    console.error('Error getting remaining videos:', error)
    return TIER_LIMITS[tier]
  }

  const used = count || 0
  const limit = TIER_LIMITS[tier]
  return Math.max(0, limit - used)
}
