'use client';

import Link from 'next/link';
import { X, ExternalLink, MapPin, Gauge, Thermometer, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusIndicator } from '@/components/shared/status-indicator';
import { SafetyBadge } from '@/components/shared/safety-badge';
import { cn } from '@/lib/utils';
import type { OHTVehicle } from '@/types/oht';

interface VehicleInfoPanelProps {
  vehicle: OHTVehicle | null;
  onClose: () => void;
}

export function VehicleInfoPanel({ vehicle, onClose }: VehicleInfoPanelProps) {
  if (!vehicle) return null;

  const tempStatus =
    vehicle.telemetry.motorTemperature > 80
      ? 'critical'
      : vehicle.telemetry.motorTemperature > 70
        ? 'warning'
        : 'normal';

  return (
    <div className="absolute right-4 bottom-4 z-10 w-80 rounded-lg border bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <StatusIndicator status={vehicle.status} size="md" />
          <span className="font-semibold">{vehicle.id}</span>
          <Badge variant="outline" className="capitalize">
            {vehicle.operationalState}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="size-6" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Safety Status */}
        <div className="flex gap-2">
          <SafetyBadge safety={vehicle.safety} />
        </div>

        {/* Position */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Position:</span>
          <span className="font-medium">{vehicle.position.bay}</span>
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Gauge className="size-3" />
              Speed
            </div>
            <div className="font-semibold tabular-nums">
              {vehicle.telemetry.speed.toFixed(1)} m/s
            </div>
          </div>

          <div className="rounded-lg bg-muted p-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Thermometer className="size-3" />
              Motor Temp
            </div>
            <div
              className={cn(
                'font-semibold tabular-nums',
                tempStatus === 'warning' && 'text-yellow-500',
                tempStatus === 'critical' && 'text-red-500'
              )}
            >
              {vehicle.telemetry.motorTemperature.toFixed(0)}°C
            </div>
          </div>
        </div>

        {/* Battery */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Battery className="size-3" />
              Battery
            </span>
            <span className="font-medium">
              {vehicle.telemetry.batteryLevel.toFixed(0)}%
            </span>
          </div>
          <Progress value={vehicle.telemetry.batteryLevel} className="h-2" />
        </div>

        {/* Current Task */}
        {vehicle.currentTask && (
          <div className="rounded-lg border p-2 text-sm">
            <div className="text-xs text-muted-foreground mb-1">Current Task</div>
            <div className="font-medium">
              {vehicle.currentTask.from} → {vehicle.currentTask.to}
            </div>
          </div>
        )}

        {/* Payload */}
        {vehicle.payload && (
          <div className="rounded-lg border p-2 text-sm">
            <div className="text-xs text-muted-foreground mb-1">Payload</div>
            <div className="font-medium">{vehicle.payload.id}</div>
            {vehicle.payload.lotId && (
              <div className="text-xs text-muted-foreground">
                Lot: {vehicle.payload.lotId}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3">
        <Button className="w-full" asChild>
          <Link href={`/vehicles/${vehicle.id}`}>
            <ExternalLink className="mr-2 size-4" />
            Open Control Panel
          </Link>
        </Button>
      </div>
    </div>
  );
}
