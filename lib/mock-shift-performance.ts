// Mock Shift Performance Data Generator
// Generates random performance data on each call

import type { ShiftPerformance, AlertResolutionRecord } from '@/types/shift';
import type { ShiftId } from '@/types/worker';
import type { AlertSeverity } from '@/types/alert';
import { SHIFT_SCHEDULES } from '@/lib/shift-utils';
import { mockWorkers, getWorkersByShift } from '@/lib/mock-workers';
import { formatVehicleId } from '@/lib/constants';

// Helper functions
const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomChoice = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// Alert titles for generating mock resolutions
const alertTitles: Record<AlertSeverity, string[]> = {
  critical: [
    'Emergency Stop Active',
    'Motor Failure Detected',
    'Communication Lost',
    'Safety Zone Breach',
    'Collision Detected',
  ],
  warning: [
    'Motor Temperature Warning',
    'Battery Low Warning',
    'Zone Occupancy Warning',
    'Sensor Degradation',
    'Speed Deviation',
  ],
  info: [
    'Task Completed',
    'Calibration Complete',
    'System Update Available',
    'Route Optimization Applied',
  ],
  maintenance: [
    'Scheduled Maintenance Due',
    'Battery Health Check',
    'Sensor Calibration Required',
    'Wheel Alignment Check',
  ],
};

const alertCodes: Record<AlertSeverity, string[]> = {
  critical: ['E001', 'E002', 'E003', 'E004', 'E005'],
  warning: ['W001', 'W002', 'W003', 'W004', 'W005'],
  info: ['I001', 'I002', 'I003', 'I004'],
  maintenance: ['M001', 'M002', 'M003', 'M004'],
};

/**
 * Generate random shift performance data
 * Called on each page load to produce different values
 */
export function generateShiftPerformances(): ShiftPerformance[] {
  return SHIFT_SCHEDULES.map((shift): ShiftPerformance => {
    // Generate random counts with some variation between shifts
    // Morning and afternoon shifts typically have more activity
    const baseMultiplier = ['A', 'B'].includes(shift.id) ? 1.3 :
                          ['D', 'E'].includes(shift.id) ? 1.1 : 0.9;

    const criticalResolved = randomBetween(2, 8);
    const warningResolved = randomBetween(8, 25);
    const infoResolved = randomBetween(5, 15);
    const maintenanceResolved = randomBetween(3, 12);

    const totalResolved = Math.round(
      (criticalResolved + warningResolved + infoResolved + maintenanceResolved) * baseMultiplier
    );

    // Acknowledged is typically higher than resolved (some alerts get acknowledged but not resolved yet)
    const acknowledgedExtra = randomBetween(5, 15);
    const totalAcknowledged = totalResolved + acknowledgedExtra;

    // Average resolution time between 5-45 minutes (in milliseconds)
    const avgResolutionTime = randomBetween(5, 45) * 60 * 1000;

    return {
      shiftId: shift.id,
      alertsResolved: totalResolved,
      alertsAcknowledged: totalAcknowledged,
      criticalResolved: Math.round(criticalResolved * baseMultiplier),
      warningResolved: Math.round(warningResolved * baseMultiplier),
      infoResolved: Math.round(infoResolved * baseMultiplier),
      maintenanceResolved: Math.round(maintenanceResolved * baseMultiplier),
      averageResolutionTimeMs: avgResolutionTime,
    };
  });
}

/**
 * Generate mock recent resolution records
 * Creates realistic-looking resolution history
 */
export function generateRecentResolutions(count: number = 15): AlertResolutionRecord[] {
  const resolutions: AlertResolutionRecord[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Pick a random shift and worker from that shift
    const shift = randomChoice(SHIFT_SCHEDULES);
    const shiftWorkers = getWorkersByShift(shift.id);
    const worker = shiftWorkers.length > 0
      ? randomChoice(shiftWorkers)
      : randomChoice(mockWorkers);

    // Pick a random severity (weighted towards warning/info)
    const severityWeights: AlertSeverity[] = [
      'critical',
      'warning', 'warning', 'warning',
      'info', 'info',
      'maintenance', 'maintenance',
    ];
    const severity = randomChoice(severityWeights);

    // Generate random vehicle
    const vehicleNum = randomBetween(1, 12);
    const vehicleId = formatVehicleId(vehicleNum);

    // Time spread over last 8 hours
    const resolvedAt = now - randomBetween(0, 8 * 60 * 60 * 1000);
    const resolutionTime = randomBetween(3, 60) * 60 * 1000; // 3-60 minutes

    resolutions.push({
      alertId: `ALERT-${vehicleId}-${Date.now()}-${i}`,
      alertTitle: randomChoice(alertTitles[severity]),
      vehicleId,
      vehicleName: `Vehicle ${vehicleId}`,
      severity,
      resolvedBy: worker.id,
      resolvedByName: worker.name,
      resolvedByShift: shift.id,
      resolvedAt,
      resolutionTimeMs: resolutionTime,
    });
  }

  // Sort by resolution time (most recent first)
  return resolutions.sort((a, b) => b.resolvedAt - a.resolvedAt);
}

/**
 * Get summary statistics from performances
 */
export function getPerformanceSummary(performances: ShiftPerformance[]) {
  const totalResolved = performances.reduce((sum, p) => sum + p.alertsResolved, 0);
  const totalAcknowledged = performances.reduce((sum, p) => sum + p.alertsAcknowledged, 0);
  const totalCritical = performances.reduce((sum, p) => sum + p.criticalResolved, 0);

  const topPerformer = performances.reduce(
    (top, p) => (p.alertsResolved > (top?.alertsResolved ?? 0) ? p : top),
    performances[0]
  );

  const avgResolutionTime = performances.reduce((sum, p) => sum + p.averageResolutionTimeMs, 0) / performances.length;

  return {
    totalResolved,
    totalAcknowledged,
    totalCritical,
    topPerformer,
    avgResolutionTime,
    activeShifts: SHIFT_SCHEDULES.length,
  };
}
