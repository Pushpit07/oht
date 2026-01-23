'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Camera, CameraPosition } from '@/types/oht';

interface OHTModelProps {
  cameras: Camera[];
  selectedCameraId?: string;
  onCameraSelect?: (cameraId: string) => void;
}

// Camera position coordinates on the SVG model (relative positions)
const cameraPositions: Record<CameraPosition, { x: number; y: number; rotation: number }> = {
  front: { x: 100, y: 20, rotation: 0 },
  rear: { x: 100, y: 180, rotation: 180 },
  down: { x: 100, y: 100, rotation: 0 },
};

interface CameraMarkerProps {
  camera: Camera;
  position: { x: number; y: number; rotation: number };
  isSelected: boolean;
  onClick: () => void;
}

function CameraMarker({ camera, position, isSelected, onClick }: CameraMarkerProps) {
  const isOnline = camera.status === 'online';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g
          className="cursor-pointer"
          transform={`translate(${position.x}, ${position.y})`}
          onClick={onClick}
        >
          {/* Pulsing selection ring */}
          {isSelected && (
            <circle
              cx="0"
              cy="0"
              r="16"
              className="fill-none stroke-primary stroke-2 animate-pulse"
            />
          )}
          {/* Outer glow/shadow for depth */}
          <circle
            cx="0"
            cy="0"
            r="12"
            className={cn(
              'transition-all duration-200',
              isOnline
                ? 'fill-primary/20'
                : 'fill-muted-foreground/10'
            )}
          />
          {/* Main marker circle */}
          <circle
            cx="0"
            cy="0"
            r="8"
            className={cn(
              'transition-colors duration-200',
              isOnline
                ? isSelected
                  ? 'fill-primary stroke-primary-foreground stroke-2'
                  : 'fill-primary/90 stroke-primary-foreground/50 stroke-1 hover:fill-primary'
                : 'fill-muted-foreground/60 stroke-muted stroke-1'
            )}
          />
          {/* Center dot */}
          <circle
            cx="0"
            cy="0"
            r="3"
            className={cn(
              'transition-colors',
              isOnline ? 'fill-primary-foreground' : 'fill-muted'
            )}
          />
          {/* Recording indicator - small red dot */}
          {camera.recording && (
            <circle
              cx="6"
              cy="-6"
              r="3"
              className="fill-red-500 animate-pulse"
            />
          )}
          {/* Direction arrow for directional cameras */}
          {camera.position !== 'down' && (
            <g transform={`rotate(${position.rotation})`}>
              <path
                d="M 0 -14 L -4 -10 L 4 -10 Z"
                className={cn(
                  'transition-colors',
                  isOnline
                    ? isSelected
                      ? 'fill-primary'
                      : 'fill-primary/70'
                    : 'fill-muted-foreground/50'
                )}
              />
            </g>
          )}
        </g>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex flex-col gap-1">
        <span className="font-medium">{camera.label}</span>
        <span className={cn('text-xs', isOnline ? 'text-green-500' : 'text-muted-foreground')}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {camera.recording && <span className="text-xs text-red-500">Recording</span>}
      </TooltipContent>
    </Tooltip>
  );
}

export function OHTModel({ cameras, selectedCameraId, onCameraSelect }: OHTModelProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Vehicle Camera Positions</CardTitle>
      </CardHeader>
      <CardContent className="overflow-visible">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 overflow-visible">
          <svg
            viewBox="-20 -20 240 240"
            className="h-[280px] w-[280px] md:h-[380px] md:w-[380px] shrink-0 overflow-visible"
            aria-label="Vehicle model with camera positions"
          >
            {/* Vehicle Body - Top-down view */}
            <defs>
              <linearGradient id="ohtBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="[stop-color:hsl(var(--muted))]" />
                <stop offset="100%" className="[stop-color:hsl(var(--muted-foreground)/0.3)]" />
              </linearGradient>
              <linearGradient id="ohtTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" className="[stop-color:hsl(var(--primary)/0.2)]" />
                <stop offset="100%" className="[stop-color:hsl(var(--primary)/0.1)]" />
              </linearGradient>
            </defs>

            {/* Main body outline */}
            <rect
              x="50"
              y="35"
              width="100"
              height="130"
              rx="8"
              className="fill-[url(#ohtBody)] stroke-border stroke-2"
            />

            {/* Top housing (gripper area) */}
            <rect
              x="60"
              y="45"
              width="80"
              height="40"
              rx="4"
              className="fill-[url(#ohtTop)] stroke-border"
            />

            {/* Gripper mechanism */}
            <rect x="75" y="55" width="50" height="20" rx="2" className="fill-muted-foreground/30" />
            <line
              x1="100"
              y1="55"
              x2="100"
              y2="75"
              className="stroke-muted-foreground/50 stroke-2"
            />

            {/* Rail guide slots */}
            <rect x="45" y="90" width="10" height="30" rx="2" className="fill-muted-foreground/40" />
            <rect x="145" y="90" width="10" height="30" rx="2" className="fill-muted-foreground/40" />

            {/* Motor housing */}
            <rect
              x="65"
              y="120"
              width="70"
              height="35"
              rx="4"
              className="fill-muted-foreground/20 stroke-border"
            />

            {/* Wheels/drive indicators */}
            <circle cx="75" cy="137" r="8" className="fill-muted-foreground/50" />
            <circle cx="125" cy="137" r="8" className="fill-muted-foreground/50" />

            {/* Direction indicator (front arrow) */}
            <path
              d="M 100 25 L 95 32 L 105 32 Z"
              className="fill-primary/60"
            />

            {/* Camera markers */}
            {cameras.map((camera) => {
              const position = cameraPositions[camera.position];
              if (!position) return null;

              return (
                <CameraMarker
                  key={camera.id}
                  camera={camera}
                  position={position}
                  isSelected={camera.id === selectedCameraId}
                  onClick={() => onCameraSelect?.(camera.id)}
                />
              );
            })}
          </svg>

          {/* Camera legend - below on mobile, right side on desktop */}
          <div className="flex flex-row md:flex-col gap-2 text-sm">
            {cameras.map((camera) => (
              <button
                key={camera.id}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 md:px-4 md:py-3 text-left transition-colors md:min-w-[120px]',
                  camera.id === selectedCameraId
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted/50 hover:bg-muted'
                )}
                onClick={() => onCameraSelect?.(camera.id)}
              >
                <span
                  className={cn(
                    'size-2.5 rounded-full',
                    camera.status === 'online' ? 'bg-green-500' : 'bg-muted-foreground'
                  )}
                />
                <span className="capitalize font-medium text-xs md:text-sm">{camera.position}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
