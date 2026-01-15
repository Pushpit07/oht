'use client';

import { useState, useRef, useCallback } from 'react';
import { OctagonX } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

interface EmergencyStopButtonProps {
  vehicleId: string;
  onActivate: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const HOLD_DURATION = 2000; // 2 seconds

export function EmergencyStopButton({
  vehicleId,
  onActivate,
  disabled,
  className,
}: EmergencyStopButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const animationFrame = useRef<number>(0);

  const updateProgress = useCallback(() => {
    const elapsed = Date.now() - startTime.current;
    const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
    setProgress(newProgress);

    if (newProgress >= 100) {
      setShowConfirm(true);
      setIsHolding(false);
      setProgress(0);
    } else {
      animationFrame.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const handleMouseDown = () => {
    if (disabled) return;
    setIsHolding(true);
    startTime.current = Date.now();
    animationFrame.current = requestAnimationFrame(updateProgress);
  };

  const handleMouseUp = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    setIsHolding(false);
    setProgress(0);
  };

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await onActivate();
    } finally {
      setIsActivating(false);
      setShowConfirm(false);
    }
  };

  const remainingSeconds = ((HOLD_DURATION - (progress / 100) * HOLD_DURATION) / 1000).toFixed(1);

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        className={cn(
          'relative h-16 w-full overflow-hidden font-bold text-lg',
          isHolding && 'ring-4 ring-red-500/50',
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled}
      >
        {/* Progress overlay */}
        <div
          className="absolute inset-0 bg-red-700 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />

        {/* Button content */}
        <span className="relative z-10 flex flex-col items-center gap-1">
          <span className="flex items-center gap-2">
            <OctagonX className="size-6" />
            EMERGENCY STOP
          </span>
          {isHolding && (
            <span className="text-xs font-normal opacity-80">
              Hold for {remainingSeconds}s
            </span>
          )}
        </span>
      </Button>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <OctagonX className="size-5" />
              Confirm Emergency Stop
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately stop <strong>{vehicleId}</strong>. A manual
              reset will be required to resume operation. This action cannot be
              undone remotely.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleActivate}
              disabled={isActivating}
            >
              {isActivating ? 'Activating...' : 'Activate E-Stop'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
