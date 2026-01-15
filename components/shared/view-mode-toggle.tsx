'use client';

import { Monitor, Grid2X2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFleetStore, useViewMode } from '@/stores/fleet-store';
import type { ViewMode } from '@/types/oht';

interface ViewModeToggleProps {
  className?: string;
}

export function ViewModeToggle({ className }: ViewModeToggleProps) {
  const viewMode = useViewMode();
  const setViewMode = useFleetStore((s) => s.setViewMode);

  return (
    <div className={cn('flex items-center gap-1 rounded-lg bg-muted p-1', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === 'quick' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setViewMode('quick')}
          >
            <Monitor className="size-4" />
            <span className="hidden sm:inline">Quick</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Quick View (2 cameras)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === 'full' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setViewMode('full')}
          >
            <Grid2X2 className="size-4" />
            <span className="hidden sm:inline">Full</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Full View (6 cameras, 360°)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
