'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle, AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShiftSummaryCards } from '@/components/dashboard/shift-performance/shift-summary-cards';
import { PerformanceChart } from '@/components/dashboard/shift-performance/performance-chart';
import { SHIFT_SCHEDULES, getShiftColor } from '@/lib/shift-utils';
import {
  generateShiftPerformances,
  generateRecentResolutions,
  getPerformanceSummary,
} from '@/lib/mock-shift-performance';
import type { ShiftPerformance, AlertResolutionRecord } from '@/types/shift';

export default function ShiftPerformancePage() {
  // State for the random data - regenerated on mount and refresh
  const [shiftPerformances, setShiftPerformances] = useState<ShiftPerformance[]>([]);
  const [recentResolutions, setRecentResolutions] = useState<AlertResolutionRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to regenerate all data
  const refreshData = () => {
    setIsRefreshing(true);
    // Small delay to show refresh animation
    setTimeout(() => {
      setShiftPerformances(generateShiftPerformances());
      setRecentResolutions(generateRecentResolutions(15));
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 300);
  };

  // Generate initial data on mount
  useEffect(() => {
    refreshData();
  }, []);

  // Calculate summary stats
  const summary = useMemo(() => {
    if (shiftPerformances.length === 0) return null;
    return getPerformanceSummary(shiftPerformances);
  }, [shiftPerformances]);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  // Show loading state while data is being generated
  if (shiftPerformances.length === 0 || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Shift Performance</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track problem resolution by shift
            {lastUpdated && (
              <span className="ml-2 text-xs">• Updated {formatTimeAgo(lastUpdated)}</span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`size-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="size-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resolved</p>
              <p className="text-2xl font-bold">{summary.totalResolved}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10">
              <Clock className="size-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Acknowledged</p>
              <p className="text-2xl font-bold">{summary.totalAcknowledged}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="size-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Resolved</p>
              <p className="text-2xl font-bold">{summary.totalCritical}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div
              className="flex size-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${getShiftColor(summary.topPerformer.shiftId)}20` }}
            >
              <TrendingUp
                className="size-6"
                style={{ color: getShiftColor(summary.topPerformer.shiftId) }}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Performer</p>
              <p className="text-2xl font-bold">Shift {summary.topPerformer.shiftId}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Performance by Shift</h2>
        <ShiftSummaryCards performances={shiftPerformances} />
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <PerformanceChart performances={shiftPerformances} />

        {/* Recent Resolutions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Resolutions</CardTitle>
            <CardDescription>
              Latest alerts resolved by workers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {recentResolutions.map((resolution) => {
                const shiftColor = getShiftColor(resolution.resolvedByShift);
                const resolvedTime = new Date(resolution.resolvedAt);
                const resolutionMins = Math.round(resolution.resolutionTimeMs / 60000);

                return (
                  <div
                    key={resolution.alertId}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div
                      className="mt-1 size-2 rounded-full shrink-0"
                      style={{ backgroundColor: shiftColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{resolution.alertTitle}</p>
                      <p className="text-muted-foreground text-xs">
                        {resolution.vehicleName} • Resolved in {resolutionMins} min
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: shiftColor, color: shiftColor }}
                      >
                        Shift {resolution.resolvedByShift}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {resolution.resolvedByName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {resolvedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shift Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {SHIFT_SCHEDULES.map((shift) => (
              <div key={shift.id} className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: shift.color }}
                />
                <span className="text-sm">
                  <span className="font-medium">Shift {shift.id}</span>
                  <span className="text-muted-foreground ml-1">
                    ({shift.name}: {shift.startHour}:00 - {shift.endHour}:00)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
