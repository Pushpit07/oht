'use client';

import {
  Gauge,
  Thermometer,
  Battery,
  Grip,
  Package,
  MapPin,
  Navigation,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OHTVehicle, SteeringOrientation } from '@/types/oht';

interface TelemetryPanelProps {
  vehicle: OHTVehicle;
}

interface TelemetryItemProps {
  icon: LucideIcon;
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

// 7-segment display digit component
function SevenSegmentDigit({ digit }: { digit: number }) {
  // Segment map: [a, b, c, d, e, f, g] - top, top-right, bottom-right, bottom, bottom-left, top-left, middle
  const segmentMap: Record<number, boolean[]> = {
    0: [true, true, true, true, true, true, false],
    1: [false, true, true, false, false, false, false],
    2: [true, true, false, true, true, false, true],
    3: [true, true, true, true, false, false, true],
    4: [false, true, true, false, false, true, true],
    5: [true, false, true, true, false, true, true],
    6: [true, false, true, true, true, true, true],
    7: [true, true, true, false, false, false, false],
    8: [true, true, true, true, true, true, true],
    9: [true, true, true, true, false, true, true],
  };

  const segments = segmentMap[digit] || segmentMap[0];
  const onColor = 'bg-red-500';
  const offColor = 'bg-red-500/20';

  return (
    <div className="relative w-6 h-10">
      {/* Segment A - top horizontal */}
      <div className={cn('absolute top-0 left-1 w-4 h-1 rounded-sm', segments[0] ? onColor : offColor)} />
      {/* Segment B - top right vertical */}
      <div className={cn('absolute top-1 right-0 w-1 h-4 rounded-sm', segments[1] ? onColor : offColor)} />
      {/* Segment C - bottom right vertical */}
      <div className={cn('absolute bottom-1 right-0 w-1 h-4 rounded-sm', segments[2] ? onColor : offColor)} />
      {/* Segment D - bottom horizontal */}
      <div className={cn('absolute bottom-0 left-1 w-4 h-1 rounded-sm', segments[3] ? onColor : offColor)} />
      {/* Segment E - bottom left vertical */}
      <div className={cn('absolute bottom-1 left-0 w-1 h-4 rounded-sm', segments[4] ? onColor : offColor)} />
      {/* Segment F - top left vertical */}
      <div className={cn('absolute top-1 left-0 w-1 h-4 rounded-sm', segments[5] ? onColor : offColor)} />
      {/* Segment G - middle horizontal */}
      <div className={cn('absolute top-1/2 left-1 w-4 h-1 rounded-sm -translate-y-1/2', segments[6] ? onColor : offColor)} />
    </div>
  );
}

// OHT Display emulation showing 5 digits
function OHTDisplayPanel({ displayCode }: { displayCode: [number, number, number, number, number] }) {
  return (
    <div className="rounded-lg bg-neutral-900 p-4 border border-neutral-800">
      <div className="text-xs text-neutral-500 mb-2 text-center">OHT Status Display</div>
      <div className="flex items-center justify-center gap-2 bg-neutral-950 rounded px-3 py-2">
        {displayCode.map((digit, index) => (
          <SevenSegmentDigit key={index} digit={digit} />
        ))}
      </div>
      <div className="text-[10px] text-neutral-500 mt-2 text-center font-mono">
        CODE: {displayCode.join('')}
      </div>
    </div>
  );
}

// Steering orientation indicator
function SteeringIndicator({ orientation, angle }: { orientation: SteeringOrientation; angle: number }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <div className="text-xs text-muted-foreground mb-2 text-center">Steering Orientation</div>
      <div className="flex items-center justify-center gap-4">
        {/* Steering wheel visualization */}
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            {/* Outer ring */}
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted-foreground/30" />
            {/* Steering wheel with rotation */}
            <g transform={`rotate(${angle}, 32, 32)`}>
              {/* Wheel rim */}
              <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" />
              {/* Spokes */}
              <line x1="32" y1="8" x2="32" y2="24" stroke="currentColor" strokeWidth="3" className="text-primary" strokeLinecap="round" />
              <line x1="12" y1="44" x2="24" y2="36" stroke="currentColor" strokeWidth="3" className="text-primary" strokeLinecap="round" />
              <line x1="52" y1="44" x2="40" y2="36" stroke="currentColor" strokeWidth="3" className="text-primary" strokeLinecap="round" />
              {/* Center hub */}
              <circle cx="32" cy="32" r="6" fill="currentColor" className="text-primary" />
            </g>
          </svg>
        </div>
        {/* Direction and angle info */}
        <div className="text-center">
          <div className="text-lg font-semibold capitalize">{orientation}</div>
          <div className="text-sm text-muted-foreground tabular-nums">
            {angle > 0 ? '+' : ''}{angle.toFixed(1)}°
          </div>
        </div>
      </div>
      {/* Direction arrows */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className={cn(
          'text-xs px-2 py-1 rounded',
          orientation === 'left' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
        )}>
          ← LEFT
        </div>
        <div className={cn(
          'text-xs px-2 py-1 rounded',
          orientation === 'straight' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
        )}>
          ↑ STRAIGHT
        </div>
        <div className={cn(
          'text-xs px-2 py-1 rounded',
          orientation === 'right' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
        )}>
          RIGHT →
        </div>
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
        {/* OHT Display and Steering - Side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OHTDisplayPanel displayCode={telemetry.displayCode} />
          <SteeringIndicator
            orientation={telemetry.steeringOrientation}
            angle={telemetry.steeringAngle}
          />
        </div>

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
