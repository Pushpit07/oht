'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TelemetryPanel } from '@/components/dashboard/vehicle-control/telemetry-panel';
import { ControlPanel } from '@/components/dashboard/vehicle-control/control-panel';
import { CommandSequencePanel } from '@/components/dashboard/vehicle-control/command-sequence-panel';
import { OHTModel } from '@/components/dashboard/vehicle-control/oht-model';
import { VehicleAlertsPanel } from '@/components/dashboard/vehicle-control/vehicle-alerts-panel';
import { StatusIndicator } from '@/components/shared/status-indicator';
import { SafetyBadge, ConnectionBadge } from '@/components/shared/safety-badge';
import { useFleetStore } from '@/stores/fleet-store';
import { mockFleet } from '@/lib/mock-data';
import type { ControlCommand } from '@/types/oht';

export default function VehicleControlPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>();

  const setVehicles = useFleetStore((s) => s.setVehicles);
  const getVehicleById = useFleetStore((s) => s.getVehicleById);
  const updateVehicle = useFleetStore((s) => s.updateVehicle);

  // Initialize with mock data
  useEffect(() => {
    setVehicles(mockFleet);
    setIsLoading(false);
  }, [setVehicles]);

  const vehicle = getVehicleById(vehicleId);

  // Initialize selected camera when vehicle loads
  useEffect(() => {
    if (vehicle && !selectedCameraId) {
      setSelectedCameraId(vehicle.cameras[0]?.id);
    }
  }, [vehicle, selectedCameraId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setVehicles(mockFleet);
    setIsRefreshing(false);
  };

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
    } else if (command === 'home') {
      updateVehicle(vehicleId, {
        status: 'active',
        operationalState: 'moving',
        telemetry: {
          ...vehicle!.telemetry,
          speed: 1.5,
        },
      });
    } else if (command === 'manual-forward') {
      updateVehicle(vehicleId, {
        status: 'active',
        operationalState: 'moving',
        telemetry: {
          ...vehicle!.telemetry,
          speed: 0.5,
        },
      });
    } else if (command === 'manual-reverse') {
      updateVehicle(vehicleId, {
        status: 'active',
        operationalState: 'moving',
        telemetry: {
          ...vehicle!.telemetry,
          speed: -0.5,
        },
      });
    } else if (command === 'manual-stop') {
      updateVehicle(vehicleId, {
        telemetry: {
          ...vehicle!.telemetry,
          speed: 0,
        },
      });
    } else if (command === 'gripper-open') {
      updateVehicle(vehicleId, {
        telemetry: {
          ...vehicle!.telemetry,
          gripperStatus: 'disengaged',
        },
      });
    } else if (command === 'gripper-close') {
      updateVehicle(vehicleId, {
        telemetry: {
          ...vehicle!.telemetry,
          gripperStatus: 'engaged',
        },
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
          <div className="flex flex-wrap items-center gap-4">
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
            <div className="flex flex-wrap items-center gap-2">
              <SafetyBadge safety={vehicle.safety} />
              <ConnectionBadge status={vehicle.safety.connectionStatus} />
              <Badge variant="outline" className="capitalize">
                {vehicle.operationalState}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Control Panel Section - Camera Feeds and Controls in 2x2 grid on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column - First two cameras stacked */}
          <div className="flex flex-col gap-4">
            {vehicle.cameras.slice(0, 2).map((camera) => (
              <div
                key={camera.id}
                className="relative aspect-video rounded-lg bg-muted overflow-hidden"
              >
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10">
                  <div className="text-center">
                    <p className="text-lg font-medium">{camera.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {camera.status === 'online' ? 'Live Feed' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 p-3">
                  <span className="text-sm font-medium text-white">{camera.label}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Right column - Third camera at top, Control Panel below */}
          <div className="flex flex-col gap-4">
            {vehicle.cameras.slice(2, 3).map((camera) => (
              <div
                key={camera.id}
                className="relative aspect-video rounded-lg bg-muted overflow-hidden"
              >
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10">
                  <div className="text-center">
                    <p className="text-lg font-medium">{camera.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {camera.status === 'online' ? 'Live Feed' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 p-3">
                  <span className="text-sm font-medium text-white">{camera.label}</span>
                </div>
              </div>
            ))}
            <div className="flex-1">
              <ControlPanel vehicle={vehicle} onCommand={handleCommand} className="h-full" />
            </div>
          </div>
        </div>

        {/* Recent Alerts, Vehicle Camera Positions, and Command Sequences */}
        <div className="grid gap-4 lg:grid-cols-3 *:h-full">
          <VehicleAlertsPanel vehicleId={vehicle.id} />
          <OHTModel
            cameras={vehicle.cameras}
            selectedCameraId={selectedCameraId}
            onCameraSelect={setSelectedCameraId}
          />
          <CommandSequencePanel vehicle={vehicle} onCommand={handleCommand} />
        </div>

        {/* Telemetry Panel */}
        <TelemetryPanel vehicle={vehicle} />
      </div>
    </TooltipProvider>
  );
}
