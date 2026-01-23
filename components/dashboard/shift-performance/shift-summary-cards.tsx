'use client';

import { CheckCircle, Clock, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ShiftPerformance } from '@/types/shift';
import { getShiftName, getShiftColor, getShiftTimeRange, isShiftActive } from '@/lib/shift-utils';

interface ShiftSummaryCardsProps {
  performances: ShiftPerformance[];
}

export function ShiftSummaryCards({ performances }: ShiftSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {performances.map((perf) => {
        const shiftColor = getShiftColor(perf.shiftId);
        const isActive = isShiftActive(perf.shiftId);
        const totalResolved = perf.alertsResolved;
        const totalAcknowledged = perf.alertsAcknowledged;

        return (
          <Card
            key={perf.shiftId}
            className="relative overflow-hidden"
            style={{ borderTopColor: shiftColor, borderTopWidth: '3px' }}
          >
            {isActive && (
              <div className="absolute right-2 top-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">
                  Active
                </Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span style={{ color: shiftColor }}>Shift {perf.shiftId}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {getShiftTimeRange(perf.shiftId)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resolved Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Resolved</span>
                </div>
                <span className="text-2xl font-bold">{totalResolved}</span>
              </div>

              {/* Acknowledged Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Acknowledged</span>
                </div>
                <span className="text-2xl font-bold">{totalAcknowledged}</span>
              </div>

              {/* Severity Breakdown */}
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2">By Severity</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <AlertOctagon className="size-3 text-red-500" />
                    <span>{perf.criticalResolved} critical</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="size-3 text-yellow-500" />
                    <span>{perf.warningResolved} warning</span>
                  </div>
                </div>
              </div>

              {/* Avg Resolution Time */}
              {perf.averageResolutionTimeMs > 0 && (
                <div className="text-xs text-muted-foreground">
                  Avg resolution: {Math.round(perf.averageResolutionTimeMs / 60000)} min
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
