'use client';

import { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Grip,
  Power,
  PlayCircle,
  Crosshair,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { COMMAND_SEQUENCES, formatDuration } from '@/lib/command-sequences';
import { SequenceExecutionDialog } from './sequence-execution-dialog';
import type { CommandSequence } from '@/types/command-sequence';
import type { OHTVehicle, ControlCommand } from '@/types/oht';

interface CommandSequencePanelProps {
  vehicle: OHTVehicle;
  onCommand: (command: ControlCommand) => Promise<void>;
}

const iconMap: Record<string, LucideIcon> = {
  Wrench: Wrench,
  AlertTriangle: AlertTriangle,
  Grip: Grip,
  Power: Power,
  PlayCircle: PlayCircle,
  Crosshair: Crosshair,
};

const severityColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-600 dark:text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  critical: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const severityBorder: Record<string, string> = {
  low: 'border-green-500/30 hover:border-green-500/50',
  medium: 'border-yellow-500/30 hover:border-yellow-500/50',
  high: 'border-orange-500/30 hover:border-orange-500/50',
  critical: 'border-red-500/30 hover:border-red-500/50',
};

function checkPreconditions(
  sequence: CommandSequence,
  vehicle: OHTVehicle
): { valid: boolean; reason?: string } {
  const { preconditions } = sequence;
  if (!preconditions) return { valid: true };

  if (preconditions.requiresIdle) {
    const isIdle =
      vehicle.operationalState === 'idle' ||
      vehicle.operationalState === 'e-stopped';
    if (!isIdle) {
      return { valid: false, reason: 'Vehicle must be idle' };
    }
  }

  if (preconditions.requiresEstopInactive) {
    if (vehicle.safety.estopActive) {
      return { valid: false, reason: 'E-stop must be inactive' };
    }
  }

  if (preconditions.requiresNoPayload) {
    if (vehicle.payload) {
      return { valid: false, reason: 'Vehicle must have no payload' };
    }
  }

  return { valid: true };
}

export function CommandSequencePanel({
  vehicle,
  onCommand,
}: CommandSequencePanelProps) {
  const [selectedSequence, setSelectedSequence] = useState<CommandSequence | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectSequence = (sequence: CommandSequence) => {
    setSelectedSequence(sequence);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Command Sequences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {COMMAND_SEQUENCES.map((sequence) => {
            const Icon = iconMap[sequence.icon] || Wrench;
            const preconditionCheck = checkPreconditions(sequence, vehicle);

            return (
              <Tooltip key={sequence.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-auto w-full justify-start gap-3 px-3 py-2.5 text-left',
                      severityBorder[sequence.severity],
                      !preconditionCheck.valid && 'opacity-50'
                    )}
                    onClick={() => handleSelectSequence(sequence)}
                    disabled={!preconditionCheck.valid}
                  >
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md',
                        severityColors[sequence.severity]
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sequence.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-5 px-1.5 text-[10px]',
                            severityColors[sequence.severity]
                          )}
                        >
                          {sequence.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{sequence.steps.length} steps</span>
                        <span>•</span>
                        <span>{formatDuration(sequence.estimatedDurationMs)}</span>
                      </div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="font-medium">{sequence.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sequence.description}
                  </p>
                  {!preconditionCheck.valid && (
                    <p className="mt-1 text-xs text-yellow-500">
                      {preconditionCheck.reason}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </CardContent>
      </Card>

      <SequenceExecutionDialog
        sequence={selectedSequence}
        vehicle={vehicle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCommand={onCommand}
      />
    </>
  );
}
