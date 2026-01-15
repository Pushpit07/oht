'use client';

import { useState } from 'react';
import { Video, VideoOff, Maximize2, Shield, Circle, Grid2X2, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useViewMode } from '@/stores/fleet-store';
import type { Camera } from '@/types/oht';

interface CameraGridProps {
  cameras: Camera[];
  vehicleId: string;
}

interface CameraTileProps {
  camera: Camera;
  isMain?: boolean;
  onClick?: () => void;
  className?: string;
}

function CameraTile({ camera, isMain, onClick, className }: CameraTileProps) {
  const isOnline = camera.status === 'online';

  return (
    <div
      className={cn(
        'relative aspect-video overflow-hidden rounded-lg bg-muted cursor-pointer',
        'ring-2 ring-transparent hover:ring-primary/50 transition-all',
        isMain && 'ring-primary',
        className
      )}
      onClick={onClick}
    >
      {/* Camera feed placeholder - replace with actual video stream */}
      {isOnline ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
          <div className="text-center">
            <Video className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">{camera.label}</p>
            <p className="text-xs text-muted-foreground/70">Live Feed</p>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <VideoOff className="size-8 text-muted-foreground/50" />
        </div>
      )}

      {/* Camera label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-2">
        <span className="text-xs font-medium text-white">{camera.label}</span>
      </div>

      {/* Recording indicator */}
      {camera.recording && (
        <div className="absolute right-2 top-2">
          <Badge variant="destructive" className="gap-1 text-xs">
            <Circle className="size-2 fill-current animate-pulse" />
            REC
          </Badge>
        </div>
      )}

      {/* Privacy shield indicator */}
      {camera.privacyShieldEnabled && (
        <div className="absolute left-2 top-2">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Shield className="size-3" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Privacy Shield Active</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Expand button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 bottom-8 size-6 bg-black/50 text-white hover:bg-black/70"
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Open fullscreen modal
        }}
      >
        <Maximize2 className="size-3" />
      </Button>
    </div>
  );
}

export function CameraGrid({ cameras, vehicleId }: CameraGridProps) {
  const viewMode = useViewMode();
  const [selectedCameraId, setSelectedCameraId] = useState(cameras[0]?.id);
  const [layout, setLayout] = useState<'grid' | 'main'>('grid');

  // In quick mode, only show front and down cameras
  const displayCameras =
    viewMode === 'quick'
      ? cameras.filter((c) => c.position === 'front' || c.position === 'down')
      : cameras;

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base">Camera Feeds</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Shield className="size-3" />
            Privacy Shield: Active
          </Badge>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={layout === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="size-7"
                  onClick={() => setLayout('grid')}
                >
                  <Grid2X2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid Layout</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={layout === 'main' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="size-7"
                  onClick={() => setLayout('main')}
                >
                  <LayoutTemplate className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Main + Thumbnails</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {layout === 'grid' ? (
          <div
            className={cn(
              'grid gap-2',
              viewMode === 'quick' ? 'grid-cols-2' : 'grid-cols-3'
            )}
          >
            {displayCameras.map((camera) => (
              <CameraTile
                key={camera.id}
                camera={camera}
                isMain={camera.id === selectedCameraId}
                onClick={() => setSelectedCameraId(camera.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 grid-rows-3 gap-2">
            {/* Main view */}
            {selectedCamera && (
              <CameraTile
                camera={selectedCamera}
                isMain
                className="col-span-3 row-span-3"
              />
            )}
            {/* Thumbnails */}
            <div className="col-span-1 row-span-3 flex flex-col gap-2">
              {displayCameras
                .filter((c) => c.id !== selectedCameraId)
                .slice(0, 3)
                .map((camera) => (
                  <CameraTile
                    key={camera.id}
                    camera={camera}
                    onClick={() => setSelectedCameraId(camera.id)}
                    className="flex-1"
                  />
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
