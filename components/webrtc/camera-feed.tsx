'use client';

import { WHEPVideoPlayer } from './whep-video-player';
import { buildWHEPUrl } from '@/lib/webrtc-config';
import { getCameraStreamName } from '@/lib/camera-mapping';
import { cn } from '@/lib/utils';
import type { Camera } from '@/types/oht';

interface CameraFeedProps {
  camera: Camera;
  className?: string;
  showLabel?: boolean;
  enabled?: boolean;
}

export function CameraFeed({
  camera,
  className,
  showLabel = true,
  enabled = true,
}: CameraFeedProps) {
  // Use whepStreamName if provided, otherwise derive from position
  const streamName = camera.whepStreamName || getCameraStreamName(camera.position);
  const whepUrl = buildWHEPUrl(streamName);

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <WHEPVideoPlayer
        url={whepUrl}
        enabled={enabled && camera.status !== 'offline'}
        className="h-full w-full"
      />

      {/* Recording indicator */}
      {camera.recording && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded bg-red-600/90 px-2 py-1 z-20">
          <span className="size-2 animate-pulse rounded-full bg-white" />
          <span className="text-xs font-medium text-white">REC</span>
        </div>
      )}

      {/* Privacy Shield indicator */}
      {camera.privacyShieldEnabled && (
        <div className="absolute top-3 right-3 rounded bg-blue-600/90 px-2 py-1 z-20">
          <span className="text-xs font-medium text-white">PRIVACY</span>
        </div>
      )}

      {/* Camera label */}
      {showLabel && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-3 z-20">
          <span className="text-sm font-medium text-white">{camera.label}</span>
        </div>
      )}
    </div>
  );
}
