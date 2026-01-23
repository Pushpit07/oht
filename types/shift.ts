// Shift Type Definitions

import type { ShiftId } from './worker';
import type { AlertSeverity } from './alert';

export type { ShiftId };

export interface ShiftSchedule {
  id: ShiftId;
  name: string;
  startHour: number; // 0-23
  endHour: number; // 0-23
  color: string;
}

export interface ShiftPerformance {
  shiftId: ShiftId;
  alertsResolved: number;
  alertsAcknowledged: number;
  criticalResolved: number;
  warningResolved: number;
  infoResolved: number;
  maintenanceResolved: number;
  averageResolutionTimeMs: number;
}

export interface AlertResolutionRecord {
  alertId: string;
  alertTitle: string;
  vehicleId: string;
  vehicleName: string;
  severity: AlertSeverity;
  resolvedBy: string;
  resolvedByName: string;
  resolvedByShift: ShiftId;
  resolvedAt: number;
  resolutionTimeMs: number;
}
