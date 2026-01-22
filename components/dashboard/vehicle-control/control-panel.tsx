'use client';

import { useState } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  Home,
  ChevronLeft,
  ChevronRight,
  Square,
  Grip,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmergencyStopButton } from '@/components/shared/emergency-stop-button';
import { cn } from '@/lib/utils';
import type { OHTVehicle, ControlCommand } from '@/types/oht';

interface ControlPanelProps {
  vehicle: OHTVehicle;
  onCommand: (command: ControlCommand) => Promise<void>;
  className?: string;
}

export function ControlPanel({ vehicle, onCommand, className }: ControlPanelProps) {
  const [manualSpeed, setManualSpeed] = useState(50);
  const [isExecuting, setIsExecuting] = useState<ControlCommand | null>(null);

  const handleCommand = async (command: ControlCommand) => {
    setIsExecuting(command);
    try {
      await onCommand(command);
    } finally {
      setIsExecuting(null);
    }
  };

  const isEsopActive = vehicle.safety.estopActive;
  const isPaused =
    vehicle.operationalState === 'idle' ||
    vehicle.operationalState === 'e-stopped';

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base">Control Panel</CardTitle>
        {isEsopActive && (
          <span className="text-xs font-medium text-red-500">E-Stop Active</span>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {/* Emergency Stop */}
        <EmergencyStopButton
          vehicleId={vehicle.id}
          onActivate={() => handleCommand('estop')}
          disabled={isEsopActive}
        />

        {/* Primary Controls */}
        <div className="grid grid-cols-4 gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="h-9"
                onClick={() => handleCommand('pause')}
                disabled={isPaused || isExecuting !== null}
              >
                <Pause className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pause Vehicle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="h-9"
                onClick={() => handleCommand('resume')}
                disabled={!isPaused || isEsopActive || isExecuting !== null}
              >
                <Play className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Resume Operation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="h-9"
                onClick={() => handleCommand('reset')}
                disabled={!isEsopActive || isExecuting !== null}
              >
                <RotateCcw className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset E-Stop</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="h-9"
                onClick={() => handleCommand('home')}
                disabled={isEsopActive || isExecuting !== null}
              >
                <Home className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Return to Home</TooltipContent>
          </Tooltip>
        </div>

        <Separator />

        {/* Manual Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Manual Controls</span>
            <span className="text-xs text-muted-foreground">
              Requires authorization
            </span>
          </div>

          {/* Movement Controls */}
          <div className="grid grid-cols-3 gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 text-xs"
                  onMouseDown={() => handleCommand('manual-reverse')}
                  onMouseUp={() => handleCommand('manual-stop')}
                  onMouseLeave={() => handleCommand('manual-stop')}
                  disabled={isEsopActive || isExecuting !== null}
                >
                  <ChevronLeft className="size-4" />
                  Reverse
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Reverse (Hold)</TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              className="h-8 text-xs"
              onClick={() => handleCommand('manual-stop')}
              disabled={isEsopActive}
            >
              <Square className="size-4" />
              Stop
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 text-xs"
                  onMouseDown={() => handleCommand('manual-forward')}
                  onMouseUp={() => handleCommand('manual-stop')}
                  onMouseLeave={() => handleCommand('manual-stop')}
                  disabled={isEsopActive || isExecuting !== null}
                >
                  Forward
                  <ChevronRight className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Forward (Hold)</TooltipContent>
            </Tooltip>
          </div>

          {/* Speed Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Manual Speed</span>
              <span className="text-xs font-medium tabular-nums">
                {manualSpeed}%
              </span>
            </div>
            <Slider
              value={[manualSpeed]}
              onValueChange={([value]) => setManualSpeed(value)}
              max={100}
              step={10}
              disabled={isEsopActive}
            />
          </div>

          {/* Gripper Controls */}
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => handleCommand('gripper-open')}
                  disabled={
                    isEsopActive ||
                    vehicle.telemetry.gripperStatus === 'disengaged' ||
                    isExecuting !== null
                  }
                >
                  <Grip className="mr-1 size-3" />
                  Open Gripper
                </Button>
              </TooltipTrigger>
              <TooltipContent>Release payload gripper</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => handleCommand('gripper-close')}
                  disabled={
                    isEsopActive ||
                    vehicle.telemetry.gripperStatus === 'engaged' ||
                    isExecuting !== null
                  }
                >
                  <Grip className="mr-1 size-3" />
                  Close Gripper
                </Button>
              </TooltipTrigger>
              <TooltipContent>Engage payload gripper</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
