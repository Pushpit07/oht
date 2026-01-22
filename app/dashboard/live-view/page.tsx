'use client';

import { useEffect, useState } from 'react';
import { Grid2X2, Grid3X3, LayoutGrid, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CameraTile } from '@/components/dashboard/live-view/camera-tile';
import { VehicleSelector } from '@/components/dashboard/live-view/vehicle-selector';
import { useFleetStore } from '@/stores/fleet-store';
import { mockFleet } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type GridLayout = '2x2' | '3x3' | '2x3';

const layoutConfig: Record<GridLayout, { cols: string; max: number }> = {
  '2x2': { cols: 'grid-cols-2', max: 4 },
  '2x3': { cols: 'grid-cols-3', max: 6 },
  '3x3': { cols: 'grid-cols-3', max: 9 },
};

export default function LiveViewPage() {
  const [layout, setLayout] = useState<GridLayout>('2x2');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  const setVehicles = useFleetStore((s) => s.setVehicles);
  const vehicles = useFleetStore((s) => s.vehiclesList);

  useEffect(() => {
    setVehicles(mockFleet);
  }, [setVehicles]);

  // Auto-select vehicles with alerts first
  useEffect(() => {
    if (selectedVehicleIds.length === 0 && vehicles.length > 0) {
      const alertVehicles = vehicles
        .filter((v) => v.status === 'critical' || v.status === 'warning')
        .map((v) => v.id);
      const otherVehicles = vehicles
        .filter((v) => v.status !== 'critical' && v.status !== 'warning')
        .map((v) => v.id);
      const initial = [...alertVehicles, ...otherVehicles].slice(
        0,
        layoutConfig[layout].max
      );
      setSelectedVehicleIds(initial);
    }
  }, [vehicles, selectedVehicleIds.length, layout]);

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      }
      if (prev.length >= layoutConfig[layout].max) {
        return prev;
      }
      return [...prev, vehicleId];
    });
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) => prev.filter((id) => id !== vehicleId));
  };

  const selectedVehicles = selectedVehicleIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter(Boolean);

  const alertCount = selectedVehicles.filter(
    (v) => v && (v.status === 'critical' || v.status === 'warning')
  ).length;

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Live Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Monitor multiple vehicles simultaneously
            </p>
          </div>

          <div className="flex items-center gap-4">
            {alertCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="size-3" />
                {alertCount} Alert{alertCount > 1 ? 's' : ''}
              </Badge>
            )}

            {/* Layout Selector */}
            <div className="flex items-center gap-1 rounded-lg border p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={layout === '2x2' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="size-8"
                    onClick={() => setLayout('2x2')}
                  >
                    <Grid2X2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>2x2 Grid (4 vehicles)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={layout === '2x3' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="size-8"
                    onClick={() => setLayout('2x3')}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>2x3 Grid (6 vehicles)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={layout === '3x3' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="size-8"
                    onClick={() => setLayout('3x3')}
                  >
                    <Grid3X3 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>3x3 Grid (9 vehicles)</TooltipContent>
              </Tooltip>
            </div>

            <VehicleSelector
              vehicles={vehicles}
              selectedIds={selectedVehicleIds}
              onSelect={handleSelectVehicle}
              maxSelections={layoutConfig[layout].max}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-4">
          {selectedVehicles.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No vehicles selected for monitoring
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Add Vehicle" to start monitoring
                </p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-4 h-full',
                layoutConfig[layout].cols,
                layout === '2x2' && 'grid-rows-2',
                layout === '2x3' && 'grid-rows-2',
                layout === '3x3' && 'grid-rows-3'
              )}
            >
              {selectedVehicles.map(
                (vehicle) =>
                  vehicle && (
                    <CameraTile
                      key={vehicle.id}
                      vehicle={vehicle}
                      onRemove={() => handleRemoveVehicle(vehicle.id)}
                    />
                  )
              )}
              {/* Empty slots */}
              {Array.from({
                length: layoutConfig[layout].max - selectedVehicles.length,
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted"
                >
                  <span className="text-sm text-muted-foreground">
                    Empty Slot
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
