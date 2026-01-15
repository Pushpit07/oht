'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FacilityMap } from '@/components/dashboard/track-map/facility-map';
import { VehicleInfoPanel } from '@/components/dashboard/track-map/vehicle-info-panel';
import { useFleetStore, useFleetSummary } from '@/stores/fleet-store';
import { mockFleet } from '@/lib/mock-data';

export default function TrackMapPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const setVehicles = useFleetStore((s) => s.setVehicles);
  const vehicles = useFleetStore((s) => s.vehiclesList);
  const getVehicleById = useFleetStore((s) => s.getVehicleById);
  const summary = useFleetSummary();

  useEffect(() => {
    setVehicles(mockFleet);
  }, [setVehicles]);

  const selectedVehicle = selectedVehicleId
    ? getVehicleById(selectedVehicleId)
    : null;

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Track Map</h1>
            <p className="text-sm text-muted-foreground">
              Real-time facility overview with {summary.total} vehicles
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-green-500" />
                <span>{summary.active} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-blue-500" />
                <span>{summary.idle} Idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-yellow-500" />
                <span>{summary.warning} Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500" />
                <span>{summary.critical} Critical</span>
              </div>
            </div>

            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="relative flex-1 p-4">
          <FacilityMap
            vehicles={vehicles}
            onVehicleClick={setSelectedVehicleId}
            selectedVehicleId={selectedVehicleId}
          />

          <VehicleInfoPanel
            vehicle={selectedVehicle || null}
            onClose={() => setSelectedVehicleId(null)}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
