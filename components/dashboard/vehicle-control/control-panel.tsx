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
}

export function ControlPanel({ vehicle, onCommand }: ControlPanelProps) {
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
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emergency Stop */}
        <EmergencyStopButton
          vehicleId={vehicle.id}
          onActivate={() => handleCommand('estop')}
          disabled={isEsopActive}
        />

        {/* Primary Controls */}
        <div className="grid grid-cols-4 gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="h-12"
                onClick={() => handleCommand('pause')}
                disabled={isPaused || isExecuting !== null}
              >
                <Pause className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pause Vehicle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="h-12"
                onClick={() => handleCommand('resume')}
                disabled={!isPaused || isEsopActive || isExecuting !== null}
              >
                <Play className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Resume Operation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="h-12"
                onClick={() => handleCommand('reset')}
                disabled={!isEsopActive || isExecuting !== null}
              >
                <RotateCcw className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset E-Stop</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="h-12"
                onClick={() => handleCommand('home')}
                disabled={isEsopActive || isExecuting !== null}
              >
                <Home className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Return to Home</TooltipContent>
          </Tooltip>
        </div>

        <Separator />

        {/* Manual Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Manual Controls</span>
            <span className="text-xs text-muted-foreground">
              Requires authorization
            </span>
          </div>

          {/* Movement Controls */}
          <div className="grid grid-cols-3 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12"
                  onMouseDown={() => handleCommand('manual-reverse')}
                  onMouseUp={() => handleCommand('manual-stop')}
                  onMouseLeave={() => handleCommand('manual-stop')}
                  disabled={isEsopActive || isExecuting !== null}
                >
                  <ChevronLeft className="size-5" />
                  Reverse
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Reverse (Hold)</TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              className="h-12"
              onClick={() => handleCommand('manual-stop')}
              disabled={isEsopActive}
            >
              <Square className="size-5" />
              Stop
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12"
                  onMouseDown={() => handleCommand('manual-forward')}
                  onMouseUp={() => handleCommand('manual-stop')}
                  onMouseLeave={() => handleCommand('manual-stop')}
                  disabled={isEsopActive || isExecuting !== null}
                >
                  Forward
                  <ChevronRight className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Forward (Hold)</TooltipContent>
            </Tooltip>
          </div>

          {/* Speed Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Manual Speed</span>
              <span className="text-sm font-medium tabular-nums">
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
          <div className="grid grid-cols-2 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => handleCommand('gripper-open')}
                  disabled={
                    isEsopActive ||
                    vehicle.telemetry.gripperStatus === 'disengaged' ||
                    isExecuting !== null
                  }
                >
                  <Grip className="mr-2 size-4" />
                  Open Gripper
                </Button>
              </TooltipTrigger>
              <TooltipContent>Release payload gripper</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => handleCommand('gripper-close')}
                  disabled={
                    isEsopActive ||
                    vehicle.telemetry.gripperStatus === 'engaged' ||
                    isExecuting !== null
                  }
                >
                  <Grip className="mr-2 size-4" />
                  Close Gripper
                </Button>
              </TooltipTrigger>
              <TooltipContent>Engage payload gripper</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Status Indicator */}
        {isEsopActive && (
          <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm">
            <span className="font-medium text-red-500">
              Emergency Stop is Active
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Manual reset required to resume operation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
