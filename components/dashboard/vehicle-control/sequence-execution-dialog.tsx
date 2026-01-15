'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  SkipForward,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/command-sequences';
import { useCommandSequenceStore } from '@/stores/command-sequence-store';
import type { CommandSequence, CommandStepStatus } from '@/types/command-sequence';
import type { OHTVehicle, ControlCommand } from '@/types/oht';

interface SequenceExecutionDialogProps {
  sequence: CommandSequence | null;
  vehicle: OHTVehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (command: ControlCommand) => Promise<void>;
}

const severityColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

function StepStatusIcon({ status }: { status: CommandStepStatus }) {
  switch (status) {
    case 'executing':
      return <Loader2 className="size-4 animate-spin text-blue-500" />;
    case 'completed':
      return <CheckCircle2 className="size-4 text-green-500" />;
    case 'failed':
      return <XCircle className="size-4 text-red-500" />;
    case 'skipped':
      return <SkipForward className="size-4 text-muted-foreground" />;
    default:
      return <Circle className="size-4 text-muted-foreground" />;
  }
}

export function SequenceExecutionDialog({
  sequence,
  vehicle,
  open,
  onOpenChange,
  onCommand,
}: SequenceExecutionDialogProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionComplete, setExecutionComplete] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [stepStatuses, setStepStatuses] = useState<Map<string, CommandStepStatus>>(
    new Map()
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [startTime, setStartTime] = useState<number | null>(null);

  const {
    startExecution,
    updateStepStatus,
    advanceStep,
    completeExecution,
    resetExecution,
  } = useCommandSequenceStore();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open && sequence) {
      setIsExecuting(false);
      setExecutionComplete(false);
      setExecutionError(null);
      setStepStatuses(new Map());
      setCurrentStepIndex(-1);
      setStartTime(null);
    }
  }, [open, sequence]);

  const executeSequence = useCallback(async () => {
    if (!sequence) return;

    setIsExecuting(true);
    setStartTime(Date.now());
    startExecution(sequence.id, vehicle.id, sequence.steps.length);

    const newStatuses = new Map<string, CommandStepStatus>();
    sequence.steps.forEach((step) => newStatuses.set(step.id, 'pending'));
    setStepStatuses(newStatuses);

    for (let i = 0; i < sequence.steps.length; i++) {
      const step = sequence.steps[i];
      setCurrentStepIndex(i);

      // Update status to executing
      newStatuses.set(step.id, 'executing');
      setStepStatuses(new Map(newStatuses));
      updateStepStatus(step.id, 'executing');

      try {
        // Execute the command
        await onCommand(step.command);

        // Mark as completed
        newStatuses.set(step.id, 'completed');
        setStepStatuses(new Map(newStatuses));
        updateStepStatus(step.id, 'completed');
        advanceStep();

        // Wait for delay if specified
        if (step.delayAfterMs && i < sequence.steps.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, step.delayAfterMs));
        }
      } catch (error) {
        if (step.skipOnError) {
          newStatuses.set(step.id, 'skipped');
          setStepStatuses(new Map(newStatuses));
          updateStepStatus(step.id, 'skipped');
          advanceStep();
        } else {
          newStatuses.set(step.id, 'failed');
          setStepStatuses(new Map(newStatuses));
          updateStepStatus(step.id, 'failed');

          const errorMessage =
            error instanceof Error ? error.message : 'Command failed';
          setExecutionError(`Step "${step.label}" failed: ${errorMessage}`);
          setIsExecuting(false);
          setExecutionComplete(true);
          completeExecution(false, errorMessage);
          return;
        }
      }
    }

    setIsExecuting(false);
    setExecutionComplete(true);
    completeExecution(true);
  }, [
    sequence,
    vehicle.id,
    onCommand,
    startExecution,
    updateStepStatus,
    advanceStep,
    completeExecution,
  ]);

  const handleClose = () => {
    resetExecution();
    onOpenChange(false);
  };

  if (!sequence) return null;

  const progress =
    currentStepIndex >= 0
      ? ((currentStepIndex + (isExecuting ? 0.5 : 1)) / sequence.steps.length) * 100
      : 0;

  const elapsedTime = startTime ? Date.now() - startTime : 0;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {executionComplete ? (
              executionError ? (
                <XCircle className="size-5 text-red-500" />
              ) : (
                <CheckCircle2 className="size-5 text-green-500" />
              )
            ) : (
              <AlertTriangle className="size-5 text-yellow-500" />
            )}
            {sequence.name}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>{sequence.description}</p>

              {!isExecuting && !executionComplete && (
                <>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', severityColors[sequence.severity])}
                  >
                    {sequence.severity.toUpperCase()} RISK
                  </Badge>

                  {sequence.warningMessage && (
                    <div className="rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
                      <strong>Warning:</strong> {sequence.warningMessage}
                    </div>
                  )}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Steps List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {isExecuting
                ? `Executing step ${currentStepIndex + 1} of ${sequence.steps.length}`
                : executionComplete
                  ? executionError
                    ? 'Execution failed'
                    : 'Execution complete'
                  : `${sequence.steps.length} commands to execute`}
            </span>
            <span className="text-muted-foreground">
              {executionComplete
                ? `${Math.round(elapsedTime / 1000)}s`
                : formatDuration(sequence.estimatedDurationMs)}
            </span>
          </div>

          {(isExecuting || executionComplete) && (
            <Progress value={progress} className="h-2" />
          )}

          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
            {sequence.steps.map((step, index) => {
              const status = stepStatuses.get(step.id) || 'pending';
              const isActive = index === currentStepIndex && isExecuting;

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive && 'bg-blue-500/10',
                    status === 'completed' && 'text-muted-foreground',
                    status === 'failed' && 'bg-red-500/10'
                  )}
                >
                  <StepStatusIcon status={status} />
                  <span className="flex-1">{step.label}</span>
                  {step.skipOnError && status === 'pending' && (
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  )}
                </div>
              );
            })}
          </div>

          {executionError && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {executionError}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {!isExecuting && !executionComplete && (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  executeSequence();
                }}
                className={cn(
                  sequence.severity === 'critical' &&
                    'bg-red-600 hover:bg-red-700',
                  sequence.severity === 'high' &&
                    'bg-orange-600 hover:bg-orange-700'
                )}
              >
                Execute Sequence
              </AlertDialogAction>
            </>
          )}

          {isExecuting && (
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Executing...
            </Button>
          )}

          {executionComplete && (
            <Button onClick={handleClose}>
              {executionError ? 'Close' : 'Done'}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
