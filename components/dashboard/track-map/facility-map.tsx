'use client';

import { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { OHTVehicle } from '@/types/oht';

interface FacilityMapProps {
  vehicles: OHTVehicle[];
  onVehicleClick?: (vehicleId: string) => void;
  selectedVehicleId?: string | null;
}

// Mock track layout - in production this would come from configuration
const tracks = [
  // Main horizontal tracks
  { id: 'TRACK-1', x1: 50, y1: 100, x2: 750, y2: 100 },
  { id: 'TRACK-2', x1: 50, y1: 200, x2: 750, y2: 200 },
  { id: 'TRACK-3', x1: 50, y1: 300, x2: 750, y2: 300 },
  { id: 'TRACK-4', x1: 50, y1: 400, x2: 750, y2: 400 },
  // Vertical connectors
  { id: 'CONN-1', x1: 150, y1: 100, x2: 150, y2: 400 },
  { id: 'CONN-2', x1: 350, y1: 100, x2: 350, y2: 400 },
  { id: 'CONN-3', x1: 550, y1: 100, x2: 550, y2: 400 },
  { id: 'CONN-4', x1: 700, y1: 100, x2: 700, y2: 400 },
];

// Mock bay locations
const bays = [
  { id: 'Bay 1', x: 100, y: 80, track: 'TRACK-1' },
  { id: 'Bay 2', x: 200, y: 80, track: 'TRACK-1' },
  { id: 'Bay 3', x: 300, y: 80, track: 'TRACK-1' },
  { id: 'Bay 4', x: 400, y: 80, track: 'TRACK-1' },
  { id: 'Bay 5', x: 500, y: 80, track: 'TRACK-1' },
  { id: 'Bay 6', x: 600, y: 80, track: 'TRACK-1' },
  { id: 'Bay 7', x: 100, y: 180, track: 'TRACK-2' },
  { id: 'Bay 8', x: 200, y: 180, track: 'TRACK-2' },
  { id: 'Bay 9', x: 300, y: 180, track: 'TRACK-2' },
  { id: 'Bay 10', x: 400, y: 180, track: 'TRACK-2' },
  { id: 'Bay 11', x: 500, y: 180, track: 'TRACK-2' },
  { id: 'Bay 12', x: 600, y: 180, track: 'TRACK-2' },
  { id: 'Bay 13', x: 100, y: 280, track: 'TRACK-3' },
  { id: 'Bay 14', x: 200, y: 280, track: 'TRACK-3' },
  { id: 'Bay 15', x: 300, y: 280, track: 'TRACK-3' },
  { id: 'Bay 16', x: 400, y: 280, track: 'TRACK-3' },
  { id: 'Bay 17', x: 500, y: 280, track: 'TRACK-3' },
  { id: 'Bay 18', x: 600, y: 280, track: 'TRACK-3' },
  { id: 'Bay 19', x: 100, y: 420, track: 'TRACK-4' },
  { id: 'Bay 20', x: 200, y: 420, track: 'TRACK-4' },
  { id: 'Bay 21', x: 300, y: 420, track: 'TRACK-4' },
  { id: 'Bay 22', x: 400, y: 420, track: 'TRACK-4' },
  { id: 'Bay 23', x: 500, y: 420, track: 'TRACK-4' },
  { id: 'Bay 24', x: 600, y: 420, track: 'TRACK-4' },
];

const statusColors = {
  active: '#22c55e',
  idle: '#3b82f6',
  warning: '#eab308',
  critical: '#ef4444',
  maintenance: '#a855f7',
  offline: '#6b7280',
};

function getVehiclePosition(vehicle: OHTVehicle): { x: number; y: number } {
  // Map vehicle position to SVG coordinates based on track and bay
  const bayMatch = bays.find((b) => b.id === vehicle.position.bay);
  if (bayMatch) {
    return { x: bayMatch.x, y: bayMatch.y + 20 };
  }

  // Fallback: position along track based on offset
  const trackIndex = parseInt(vehicle.position.trackId.split('-')[1]) || 1;
  const y = 100 * trackIndex;
  const x = 50 + (vehicle.position.offset / 50) * 700;
  return { x: Math.min(x, 750), y };
}

export function FacilityMap({
  vehicles,
  onVehicleClick,
  selectedVehicleId,
}: FacilityMapProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border bg-card">
      {/* Controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-8"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2))}
            >
              <ZoomIn className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Zoom In</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-8"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            >
              <ZoomOut className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Zoom Out</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-8"
              onClick={() => setZoom(1)}
            >
              <Maximize2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Reset Zoom</TooltipContent>
        </Tooltip>
      </div>

      {/* Legend */}
      <div className="absolute left-4 top-4 z-10 rounded-lg bg-background/80 p-3 backdrop-blur">
        <div className="text-xs font-medium mb-2">Status</div>
        <div className="space-y-1">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 800 500"
        className="h-full w-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/20"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Tracks */}
        {tracks.map((track) => (
          <line
            key={track.id}
            x1={track.x1}
            y1={track.y1}
            x2={track.x2}
            y2={track.y2}
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted-foreground/40"
            strokeLinecap="round"
          />
        ))}

        {/* Bays */}
        {bays.map((bay) => (
          <g key={bay.id}>
            <rect
              x={bay.x - 15}
              y={bay.y - 10}
              width="30"
              height="20"
              rx="2"
              fill="currentColor"
              className="text-muted"
            />
            <text
              x={bay.x}
              y={bay.y + 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {bay.id.replace('Bay ', 'B')}
            </text>
          </g>
        ))}

        {/* Vehicles */}
        {vehicles.map((vehicle) => {
          const pos = getVehiclePosition(vehicle);
          const isSelected = selectedVehicleId === vehicle.id;
          const color = statusColors[vehicle.status];

          return (
            <g
              key={vehicle.id}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => onVehicleClick?.(vehicle.id)}
            >
              {/* Selection ring */}
              {isSelected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="18"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  className="animate-pulse"
                />
              )}

              {/* Vehicle marker */}
              <circle cx={pos.x} cy={pos.y} r="12" fill={color} />

              {/* Vehicle ID */}
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                className="fill-white text-[8px] font-bold pointer-events-none"
              >
                {vehicle.id.replace('OHT-', '')}
              </text>

              {/* Direction indicator for moving vehicles */}
              {vehicle.telemetry.speed > 0 && (
                <polygon
                  points={`${pos.x + 16},${pos.y} ${pos.x + 22},${pos.y - 4} ${pos.x + 22},${pos.y + 4}`}
                  fill={color}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
