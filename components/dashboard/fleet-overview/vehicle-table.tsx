'use client';

import Link from 'next/link';
import { Eye, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/shared/status-indicator';
import { cn } from '@/lib/utils';
import type { OHTVehicle } from '@/types/oht';

interface VehicleTableProps {
  vehicles: OHTVehicle[];
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">ID</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-32">Payload</TableHead>
            <TableHead className="w-24">Speed</TableHead>
            <TableHead>Current Task</TableHead>
            <TableHead className="w-24 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No vehicles found
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle) => (
              <TableRow
                key={vehicle.id}
                className={cn(
                  vehicle.status === 'critical' && 'bg-red-500/5',
                  vehicle.status === 'warning' && 'bg-yellow-500/5'
                )}
              >
                <TableCell className="font-medium">{vehicle.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={vehicle.status} size="sm" />
                    <span className="text-sm capitalize">{vehicle.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{vehicle.position.bay}</div>
                    <div className="text-muted-foreground">
                      {vehicle.position.trackId} / {vehicle.position.sectionId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {vehicle.payload ? (
                    <Badge variant="secondary">{vehicle.payload.id}</Badge>
                  ) : (
                    <span className="text-muted-foreground">Empty</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="tabular-nums">
                    {vehicle.telemetry.speed.toFixed(1)} m/s
                  </span>
                </TableCell>
                <TableCell>
                  {vehicle.currentTask ? (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {vehicle.currentTask.from} → {vehicle.currentTask.to}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Idle</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <Eye className="mr-1 size-4" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
