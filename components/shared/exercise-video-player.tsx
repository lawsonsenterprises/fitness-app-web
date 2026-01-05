'use client'

import { useState } from 'react'
import { Play, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  canWatchVideo,
  trackVideoWatch,
  type UserTier,
  type VideoType,
} from '@/lib/video-limits'

interface ExerciseVideoPlayerProps {
  exerciseId: string
  videoUrl: string
  videoType: VideoType
  userId: string
  tier: UserTier
  className?: string
}

/**
 * Exercise video player with tier-based usage limits
 * - YouTube videos: Unlimited, embedded via iframe
 * - MuscleWiki videos: Tier-based daily limits (Logger: 3, Premium: 10)
 */
export function ExerciseVideoPlayer({
  exerciseId,
  videoUrl,
  videoType,
  userId,
  tier,
  className,
}: ExerciseVideoPlayerProps) {
  const [canPlay, setCanPlay] = useState<boolean | null>(null)
  const [limitMessage, setLimitMessage] = useState<string>('')
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const handlePlay = async () => {
    if (hasPlayed) return // Already tracked and playing

    setIsChecking(true)

    try {
      const result = await canWatchVideo(userId, tier, videoType)

      if (!result.canWatch) {
        setCanPlay(false)
        setLimitMessage(result.reason || 'Video limit reached')
        setIsChecking(false)
        return
      }

      setCanPlay(true)
      setHasPlayed(true)

      // Track the play (before video loads)
      await trackVideoWatch(userId, exerciseId, videoType, 'web')
    } catch (error) {
      console.error('Error handling video play:', error)
      // Fail open - allow video even if tracking fails
      setCanPlay(true)
      setHasPlayed(true)
    } finally {
      setIsChecking(false)
    }
  }

  // YouTube videos: Embed directly, no limits
  if (videoType === 'youtube') {
    const youtubeId = extractYouTubeId(videoUrl)
    if (!youtubeId) {
      return (
        <div className={cn('aspect-video bg-muted rounded-lg flex items-center justify-center', className)}>
          <p className="text-sm text-muted-foreground">Invalid YouTube URL</p>
        </div>
      )
    }

    return (
      <div className={cn('aspect-video rounded-lg overflow-hidden', className)}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  // MuscleWiki videos: Check tier limits before playing
  return (
    <div className={cn('aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden', className)}>
      {/* Play button (before checking limits) */}
      {canPlay === null && !isChecking && (
        <button
          onClick={handlePlay}
          className="flex flex-col items-center gap-3 transition-transform hover:scale-105"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
            <Play className="h-8 w-8 ml-1" fill="currentColor" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {tier === 'logger' ? 'Preview available' : 'Tap to play'}
          </span>
        </button>
      )}

      {/* Checking state */}
      {isChecking && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-muted-foreground">Loading video...</span>
        </div>
      )}

      {/* Limit reached */}
      {canPlay === false && (
        <div className="text-center p-6 max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-foreground mb-2">Daily limit reached</p>
          <p className="text-xs text-muted-foreground">{limitMessage}</p>
        </div>
      )}

      {/* Video player */}
      {canPlay === true && (
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        >
          <track kind="captions" />
        </video>
      )}
    </div>
  )
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}
