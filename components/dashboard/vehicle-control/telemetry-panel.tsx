'use client';

import {
  Gauge,
  Thermometer,
  Battery,
  Grip,
  Package,
  MapPin,
  Navigation,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OHTVehicle } from '@/types/oht';

interface TelemetryPanelProps {
  vehicle: OHTVehicle;
}

interface TelemetryItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical';
  progress?: number;
}

function TelemetryItem({
  icon: Icon,
  label,
  value,
  unit,
  status = 'normal',
  progress,
}: TelemetryItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          status === 'normal' && 'bg-muted',
          status === 'warning' && 'bg-yellow-500/10',
          status === 'critical' && 'bg-red-500/10'
        )}
      >
        <Icon
          className={cn(
            'size-5',
            status === 'normal' && 'text-muted-foreground',
            status === 'warning' && 'text-yellow-500',
            status === 'critical' && 'text-red-500'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              'text-lg font-semibold tabular-nums',
              status === 'warning' && 'text-yellow-500',
              status === 'critical' && 'text-red-500'
            )}
          >
            {value}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {progress !== undefined && (
          <Progress
            value={progress}
            className={cn(
              'mt-1 h-1.5',
              status === 'warning' && '[&>div]:bg-yellow-500',
              status === 'critical' && '[&>div]:bg-red-500'
            )}
          />
        )}
      </div>
    </div>
  );
}

export function TelemetryPanel({ vehicle }: TelemetryPanelProps) {
  const { telemetry, position, operationalState } = vehicle;

  // Determine status based on thresholds
  const tempStatus =
    telemetry.motorTemperature > 80
      ? 'critical'
      : telemetry.motorTemperature > 70
        ? 'warning'
        : 'normal';

  const batteryStatus =
    telemetry.batteryLevel < 20
      ? 'critical'
      : telemetry.batteryLevel < 40
        ? 'warning'
        : 'normal';

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Vehicle Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position */}
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="size-4" />
            <span>Current Position</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Bay:</span>{' '}
              <span className="font-medium">{position.bay}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Track:</span>{' '}
              <span className="font-medium">{position.trackId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Section:</span>{' '}
              <span className="font-medium">{position.sectionId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Offset:</span>{' '}
              <span className="font-medium tabular-nums">
                {position.offset.toFixed(1)}m
              </span>
            </div>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Operational State</span>
          <Badge
            variant={
              operationalState === 'error' || operationalState === 'e-stopped'
                ? 'destructive'
                : 'secondary'
            }
            className="capitalize"
          >
            {operationalState}
          </Badge>
        </div>

        {/* Telemetry Items */}
        <div className="space-y-4">
          <TelemetryItem
            icon={Gauge}
            label="Speed"
            value={telemetry.speed.toFixed(1)}
            unit="m/s"
          />

          <TelemetryItem
            icon={Thermometer}
            label="Motor Temperature"
            value={telemetry.motorTemperature.toFixed(0)}
            unit="°C"
            status={tempStatus}
            progress={(telemetry.motorTemperature / 100) * 100}
          />

          <TelemetryItem
            icon={Battery}
            label="Battery Level"
            value={telemetry.batteryLevel.toFixed(0)}
            unit="%"
            status={batteryStatus}
            progress={telemetry.batteryLevel}
          />

          <TelemetryItem
            icon={Grip}
            label="Gripper Status"
            value={telemetry.gripperStatus === 'engaged' ? 'Engaged' : 'Disengaged'}
            status={telemetry.gripperStatus === 'error' ? 'critical' : 'normal'}
          />

          <TelemetryItem
            icon={Package}
            label="Load Status"
            value={
              telemetry.loadStatus === 'loaded'
                ? `Loaded (${telemetry.payloadWeight?.toFixed(1) || '?'} kg)`
                : 'Empty'
            }
          />
        </div>

        {/* Payload Info */}
        {vehicle.payload && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Package className="size-4" />
              Payload Details
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>{' '}
                <span className="font-medium">{vehicle.payload.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>{' '}
                <span className="font-medium">{vehicle.payload.type}</span>
              </div>
              {vehicle.payload.waferCount && (
                <div>
                  <span className="text-muted-foreground">Wafers:</span>{' '}
                  <span className="font-medium">{vehicle.payload.waferCount}</span>
                </div>
              )}
              {vehicle.payload.lotId && (
                <div>
                  <span className="text-muted-foreground">Lot:</span>{' '}
                  <span className="font-medium">{vehicle.payload.lotId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Task */}
        {vehicle.currentTask && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Navigation className="size-4" />
              Current Task
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Route:</span>
                <span className="font-medium">
                  {vehicle.currentTask.from} → {vehicle.currentTask.to}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">Priority:</span>
                <Badge
                  variant={
                    vehicle.currentTask.priority === 'critical'
                      ? 'destructive'
                      : vehicle.currentTask.priority === 'high'
                        ? 'default'
                        : 'secondary'
                  }
                  className="capitalize"
                >
                  {vehicle.currentTask.priority}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
