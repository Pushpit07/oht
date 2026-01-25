'use client';

import { Loader2, VideoOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWHEPConnection, type ConnectionState } from '@/hooks/use-whep-connection';
import { cn } from '@/lib/utils';

interface WHEPVideoPlayerProps {
  url: string;
  className?: string;
  enabled?: boolean;
  showOverlay?: boolean;
}

function ConnectionOverlay({
  state,
  error,
  onRetry,
}: {
  state: ConnectionState;
  error: Error | null;
  onRetry: () => void;
}) {
  if (state === 'connected') return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
      {state === 'connecting' && (
        <>
          <Loader2 className="size-8 animate-spin text-white" />
          <span className="mt-2 text-sm text-white">Connecting...</span>
        </>
      )}

      {state === 'idle' && (
        <>
          <VideoOff className="size-10 text-muted-foreground" />
          <span className="mt-2 text-sm text-muted-foreground">Stream disabled</span>
        </>
      )}

      {(state === 'failed' || state === 'disconnected') && (
        <>
          <VideoOff className="size-10 text-red-400" />
          <span className="mt-2 text-sm text-white">
            {state === 'failed' ? 'Connection Failed' : 'Disconnected'}
          </span>
          {error && (
            <span className="mt-1 text-xs text-gray-400 max-w-[200px] text-center">
              {error.message}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onRetry}
          >
            <RefreshCw className="mr-2 size-3" />
            Retry
          </Button>
        </>
      )}
    </div>
  );
}

export function WHEPVideoPlayer({
  url,
  className,
  enabled = true,
  showOverlay = true,
}: WHEPVideoPlayerProps) {
  const { videoRef, connectionState, error, reconnect } = useWHEPConnection({
    url,
    enabled,
    reconnectOnDisconnect: true,
  });

  return (
    <div className={cn('relative bg-black', className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {showOverlay && (
        <ConnectionOverlay
          state={connectionState}
          error={error}
          onRetry={reconnect}
        />
      )}
    </div>
  );
}
