'use client';

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlertsStore } from '@/stores/alerts-store';
import type { OHTVehicle } from '@/types/oht';

interface AISummaryPanelProps {
  vehicle: OHTVehicle;
}

export function AISummaryPanel({ vehicle }: AISummaryPanelProps) {
  const getAlertsByVehicle = useAlertsStore((s) => s.getAlertsByVehicle);
  const vehicleAlerts = getAlertsByVehicle(vehicle.id);

  const summary = useMemo(() => {
    const issues: string[] = [];
    const status: string[] = [];

    // Check for critical states
    if (vehicle.safety.estopActive) {
      issues.push('E-Stop is currently active');
    }

    if (vehicle.safety.collisionSensorTriggered) {
      issues.push('collision sensor has been triggered');
    }

    if (vehicle.safety.connectionStatus === 'lost') {
      issues.push('connection to the vehicle has been lost');
    } else if (vehicle.safety.connectionStatus === 'degraded') {
      issues.push('connection quality is degraded');
    }

    if (vehicle.safety.zoneOccupancy === 'blocked') {
      issues.push('movement is blocked due to zone occupancy');
    } else if (vehicle.safety.zoneOccupancy === 'warning') {
      issues.push('zone occupancy warning detected');
    }

    // Check telemetry concerns
    if (vehicle.telemetry.batteryLevel < 20) {
      issues.push(`battery is critically low at ${vehicle.telemetry.batteryLevel}%`);
    } else if (vehicle.telemetry.batteryLevel < 40) {
      issues.push(`battery is low at ${vehicle.telemetry.batteryLevel}%`);
    }

    if (vehicle.telemetry.motorTemperature > 80) {
      issues.push(`motor temperature is high at ${vehicle.telemetry.motorTemperature}°C`);
    } else if (vehicle.telemetry.motorTemperature > 70) {
      issues.push(`motor temperature is elevated at ${vehicle.telemetry.motorTemperature}°C`);
    }

    if (vehicle.telemetry.gripperStatus === 'error') {
      issues.push('gripper is in error state');
    }

    // Check alerts
    const criticalAlerts = vehicleAlerts.filter((a) => a.severity === 'critical');
    const warningAlerts = vehicleAlerts.filter((a) => a.severity === 'warning');

    if (criticalAlerts.length > 0) {
      issues.push(`${criticalAlerts.length} critical alert${criticalAlerts.length > 1 ? 's' : ''} requiring attention`);
    }

    if (warningAlerts.length > 0) {
      issues.push(`${warningAlerts.length} warning${warningAlerts.length > 1 ? 's' : ''} to review`);
    }

    // Build operational status
    const stateDescriptions: Record<string, string> = {
      idle: 'idle and awaiting instructions',
      moving: 'currently in motion',
      loading: 'performing a loading operation',
      unloading: 'performing an unloading operation',
      error: 'in an error state',
      maintenance: 'undergoing maintenance',
      'e-stopped': 'halted due to emergency stop',
    };

    status.push(stateDescriptions[vehicle.operationalState] || vehicle.operationalState);

    // Add payload info
    if (vehicle.telemetry.loadStatus === 'loaded' && vehicle.payload) {
      status.push(`carrying ${vehicle.payload.type}${vehicle.payload.lotId ? ` (Lot: ${vehicle.payload.lotId})` : ''}`);
    } else if (vehicle.telemetry.loadStatus === 'empty') {
      status.push('no payload loaded');
    }

    // Add task info
    if (vehicle.currentTask) {
      const taskDescriptions: Record<string, string> = {
        transport: `transporting to ${vehicle.currentTask.to || 'destination'}`,
        pickup: `picking up from ${vehicle.currentTask.from || 'location'}`,
        delivery: `delivering to ${vehicle.currentTask.to || 'destination'}`,
        idle: 'no active task',
      };
      status.push(taskDescriptions[vehicle.currentTask.type] || vehicle.currentTask.type);
    }

    // Add position context
    if (vehicle.position.bay) {
      status.push(`located at Bay ${vehicle.position.bay}`);
    }

    // Generate final summary
    let summaryText = '';

    if (vehicle.status === 'critical' || issues.length > 2) {
      summaryText = `Immediate attention required. ${vehicle.name} is ${status[0]}. Issues: ${issues.join('; ')}.`;
    } else if (vehicle.status === 'warning' || issues.length > 0) {
      summaryText = `${vehicle.name} is ${status.slice(0, 2).join(', ')}. Note: ${issues.join('; ')}.`;
    } else if (vehicle.status === 'maintenance') {
      summaryText = `${vehicle.name} is currently ${status[0]}. The vehicle is offline for scheduled maintenance.`;
    } else if (vehicle.status === 'offline') {
      summaryText = `${vehicle.name} is offline and not responding. Last known state: ${status[0]}.`;
    } else {
      // Normal operation
      const statusStr = status.slice(0, 3).join(', ');
      if (vehicle.status === 'active') {
        summaryText = `${vehicle.name} is operating normally. Currently ${statusStr}. All systems nominal with ${vehicle.telemetry.batteryLevel}% battery.`;
      } else {
        summaryText = `${vehicle.name} is ${statusStr}. No issues detected. Battery at ${vehicle.telemetry.batteryLevel}%, motor temp ${vehicle.telemetry.motorTemperature}°C.`;
      }
    }

    return summaryText;
  }, [vehicle, vehicleAlerts]);

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
}
