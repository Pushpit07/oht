'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CameraGrid } from '@/components/dashboard/vehicle-control/camera-grid';
import { TelemetryPanel } from '@/components/dashboard/vehicle-control/telemetry-panel';
import { ControlPanel } from '@/components/dashboard/vehicle-control/control-panel';
import { CommandSequencePanel } from '@/components/dashboard/vehicle-control/command-sequence-panel';
import { StatusIndicator } from '@/components/shared/status-indicator';
import { SafetyBadge, ConnectionBadge } from '@/components/shared/safety-badge';
import { ViewModeToggle } from '@/components/shared/view-mode-toggle';
import { useFleetStore } from '@/stores/fleet-store';
import { mockFleet } from '@/lib/mock-data';
import type { ControlCommand } from '@/types/oht';

export default function VehicleControlPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;
  const [isLoading, setIsLoading] = useState(true);

  const setVehicles = useFleetStore((s) => s.setVehicles);
  const getVehicleById = useFleetStore((s) => s.getVehicleById);
  const updateVehicle = useFleetStore((s) => s.updateVehicle);

  // Initialize with mock data
  useEffect(() => {
    setVehicles(mockFleet);
    setIsLoading(false);
  }, [setVehicles]);

  const vehicle = getVehicleById(vehicleId);

  const handleCommand = async (command: ControlCommand) => {
    // Simulate command execution
    console.log(`Executing command: ${command} on vehicle ${vehicleId}`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update vehicle state based on command (mock implementation)
    if (command === 'estop') {
      updateVehicle(vehicleId, {
        status: 'critical',
        operationalState: 'e-stopped',
        safety: {
          ...vehicle!.safety,
          estopActive: true,
        },
        telemetry: {
          ...vehicle!.telemetry,
          speed: 0,
        },
      });
    } else if (command === 'reset') {
      updateVehicle(vehicleId, {
        status: 'idle',
        operationalState: 'idle',
        safety: {
          ...vehicle!.safety,
          estopActive: false,
        },
      });
    } else if (command === 'pause') {
      updateVehicle(vehicleId, {
        operationalState: 'idle',
        telemetry: {
          ...vehicle!.telemetry,
          speed: 0,
        },
      });
    } else if (command === 'resume') {
      updateVehicle(vehicleId, {
        status: 'active',
        operationalState: 'moving',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Vehicle not found</h2>
          <p className="mt-2 text-muted-foreground">
            The vehicle {vehicleId} could not be found.
          </p>
          <Button className="mt-4" onClick={() => router.push('/vehicles')}>
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/vehicles">
                <ChevronLeft className="size-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <StatusIndicator status={vehicle.status} size="lg" />
              <div>
                <h1 className="text-xl font-bold">{vehicle.id}</h1>
                <p className="text-sm text-muted-foreground">{vehicle.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SafetyBadge safety={vehicle.safety} />
              <ConnectionBadge status={vehicle.safety.connectionStatus} />
              <Badge variant="outline" className="capitalize">
                {vehicle.operationalState}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ViewModeToggle />
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Camera Grid - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <CameraGrid cameras={vehicle.cameras} vehicleId={vehicle.id} />
            <CommandSequencePanel vehicle={vehicle} onCommand={handleCommand} />
          </div>

          {/* Right Sidebar - Telemetry & Controls */}
          <div className="space-y-4">
            <TelemetryPanel vehicle={vehicle} />
            <ControlPanel vehicle={vehicle} onCommand={handleCommand} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
