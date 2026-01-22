'use client';

import { useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusCards } from '@/components/dashboard/fleet-overview/status-cards';
import { VehicleTable } from '@/components/dashboard/fleet-overview/vehicle-table';
import { AlertsPanel } from '@/components/dashboard/fleet-overview/alerts-panel';
import { useFleetStore, useFleetSummary } from '@/stores/fleet-store';
import { mockFleet } from '@/lib/mock-data';

export default function FleetOverviewPage() {
  const setVehicles = useFleetStore((s) => s.setVehicles);
  const getFilteredVehicles = useFleetStore((s) => s.getFilteredVehicles);
  const searchQuery = useFleetStore((s) => s.searchQuery);
  const setSearchQuery = useFleetStore((s) => s.setSearchQuery);
  const summary = useFleetSummary();

  // Initialize with mock data
  useEffect(() => {
    setVehicles(mockFleet);
  }, [setVehicles]);

  const vehicles = getFilteredVehicles();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fleet Overview</h1>
          <p className="text-muted-foreground">
            Monitor and control your fleet in real-time
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <StatusCards summary={summary} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vehicle Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, or location..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <VehicleTable vehicles={vehicles} />
        </div>

        {/* Alerts Panel */}
        <div>
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}
