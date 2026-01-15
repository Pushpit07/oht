'use client';

import { useState } from 'react';
import { Plus, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusIndicator } from '@/components/shared/status-indicator';
import { cn } from '@/lib/utils';
import type { OHTVehicle } from '@/types/oht';

interface VehicleSelectorProps {
  vehicles: OHTVehicle[];
  selectedIds: string[];
  onSelect: (vehicleId: string) => void;
  maxSelections?: number;
}

export function VehicleSelector({
  vehicles,
  selectedIds,
  onSelect,
  maxSelections = 9,
}: VehicleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.position.bay?.toLowerCase().includes(search.toLowerCase())
  );

  const canAddMore = selectedIds.length < maxSelections;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" disabled={!canAddMore}>
          <Plus className="mr-2 size-4" />
          Add Vehicle
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select Vehicles to Monitor</SheetTitle>
          <SheetDescription>
            Choose up to {maxSelections} vehicles. {selectedIds.length} selected.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedIds.includes(vehicle.id);
                const canSelect = isSelected || canAddMore;

                return (
                  <button
                    key={vehicle.id}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted',
                      !canSelect && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => canSelect && onSelect(vehicle.id)}
                    disabled={!canSelect}
                  >
                    <StatusIndicator status={vehicle.status} size="md" />
                    <div className="flex-1">
                      <div className="font-medium">{vehicle.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.position.bay}
                      </div>
                    </div>
                    {isSelected && <Check className="size-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
