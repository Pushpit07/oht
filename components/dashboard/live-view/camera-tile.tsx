'use client';

import Link from 'next/link';
import { Video, VideoOff, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/shared/status-indicator';
import { cn } from '@/lib/utils';
import type { OHTVehicle } from '@/types/oht';

interface CameraTileProps {
  vehicle: OHTVehicle;
  onRemove?: () => void;
  className?: string;
}

export function CameraTile({ vehicle, onRemove, className }: CameraTileProps) {
  const mainCamera = vehicle.cameras.find((c) => c.position === 'front') || vehicle.cameras[0];
  const isOnline = mainCamera?.status === 'online';
  const hasAlert = vehicle.status === 'warning' || vehicle.status === 'critical';

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-lg border bg-card',
        hasAlert && 'ring-2',
        vehicle.status === 'critical' && 'ring-red-500',
        vehicle.status === 'warning' && 'ring-yellow-500',
        className
      )}
    >
      {/* Camera Feed */}
      <div className="relative aspect-video bg-muted">
        {isOnline ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <div className="text-center">
              <Video className="mx-auto size-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Live Feed</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <VideoOff className="size-10 text-muted-foreground/50" />
          </div>
        )}

        {/* Status overlay */}
        <div className="absolute left-2 top-2 flex items-center gap-2">
          <StatusIndicator status={vehicle.status} size="md" />
          <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {vehicle.id}
          </span>
        </div>

        {/* Alert indicator */}
        {hasAlert && (
          <div className="absolute right-2 top-2">
            <Badge
              variant={vehicle.status === 'critical' ? 'destructive' : 'secondary'}
              className="gap-1"
            >
              <AlertTriangle className="size-3" />
              {vehicle.status === 'critical' ? 'Critical' : 'Warning'}
            </Badge>
          </div>
        )}

        {/* Remove button */}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 size-6 bg-black/50 text-white hover:bg-black/70"
            onClick={onRemove}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between border-t p-2">
        <div className="text-xs">
          <div className="font-medium">{vehicle.position.bay}</div>
          <div className="text-muted-foreground">
            {vehicle.telemetry.speed.toFixed(1)} m/s
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/vehicles/${vehicle.id}`}>
            <ExternalLink className="mr-1 size-3" />
            Open
          </Link>
        </Button>
      </div>
    </div>
  );
}
