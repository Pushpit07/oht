'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Grid2X2, List, Eye, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusIndicator } from '@/components/shared/status-indicator';
import { SafetyBadge, ConnectionBadge } from '@/components/shared/safety-badge';
import { useFleetStore } from '@/stores/fleet-store';
import { mockFleet } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { OHTVehicle, OHTStatus } from '@/types/oht';

type ViewType = 'grid' | 'list';

function VehicleCard({ vehicle }: { vehicle: OHTVehicle }) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:ring-2 hover:ring-primary/50',
        vehicle.status === 'critical' && 'ring-2 ring-red-500',
        vehicle.status === 'warning' && 'ring-2 ring-yellow-500'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusIndicator status={vehicle.status} size="lg" />
            <div>
              <h3 className="font-semibold">{vehicle.id}</h3>
              <p className="text-sm text-muted-foreground">{vehicle.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/vehicles/${vehicle.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium">{vehicle.position.bay}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Speed</span>
            <span className="font-medium tabular-nums">
              {vehicle.telemetry.speed.toFixed(1)} m/s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payload</span>
            <span className="font-medium">
              {vehicle.payload ? vehicle.payload.id : 'Empty'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Motor Temp</span>
            <span
              className={cn(
                'font-medium tabular-nums',
                vehicle.telemetry.motorTemperature > 70 && 'text-yellow-500',
                vehicle.telemetry.motorTemperature > 80 && 'text-red-500'
              )}
            >
              {vehicle.telemetry.motorTemperature.toFixed(0)}°C
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Battery</span>
            <span className="font-medium tabular-nums">
              {vehicle.telemetry.batteryLevel.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <SafetyBadge safety={vehicle.safety} />
          <ConnectionBadge status={vehicle.safety.connectionStatus} />
        </div>

        {vehicle.currentTask && (
          <div className="mt-4 rounded-lg bg-muted p-2 text-xs">
            <div className="text-muted-foreground">Current Task</div>
            <div className="font-medium">
              {vehicle.currentTask.from} → {vehicle.currentTask.to}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VehiclesPage() {
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [statusFilter, setStatusFilter] = useState<OHTStatus | 'all'>('all');

  const setVehicles = useFleetStore((s) => s.setVehicles);
  const getFilteredVehicles = useFleetStore((s) => s.getFilteredVehicles);
  const searchQuery = useFleetStore((s) => s.searchQuery);
  const setSearchQuery = useFleetStore((s) => s.setSearchQuery);
  const fleetSetStatusFilter = useFleetStore((s) => s.setStatusFilter);

  useEffect(() => {
    setVehicles(mockFleet);
  }, [setVehicles]);

  useEffect(() => {
    if (statusFilter === 'all') {
      fleetSetStatusFilter([]);
    } else {
      fleetSetStatusFilter([statusFilter]);
    }
  }, [statusFilter, fleetSetStatusFilter]);

  const vehicles = getFilteredVehicles();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">
            Manage and monitor individual OHT vehicles
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as OHTStatus | 'all')}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="idle">Idle</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={viewType === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="size-8"
            onClick={() => setViewType('grid')}
          >
            <Grid2X2 className="size-4" />
          </Button>
          <Button
            variant={viewType === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="size-8"
            onClick={() => setViewType('list')}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Vehicle Grid/List */}
      {vehicles.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No vehicles found</p>
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}`}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <StatusIndicator status={vehicle.status} size="lg" />
              <div className="flex-1">
                <div className="font-medium">{vehicle.id}</div>
                <div className="text-sm text-muted-foreground">
                  {vehicle.position.bay}
                </div>
              </div>
              <div className="text-right text-sm">
                <div>{vehicle.telemetry.speed.toFixed(1)} m/s</div>
                <div className="text-muted-foreground">
                  {vehicle.telemetry.motorTemperature.toFixed(0)}°C
                </div>
              </div>
              <div className="flex gap-2">
                <SafetyBadge safety={vehicle.safety} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
