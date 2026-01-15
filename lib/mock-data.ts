import type { OHTVehicle, OHTStatus, OperationalState, Camera } from '@/types/oht';
import type { Alert, AlertSeverity, AlertCategory } from '@/types/alert';

// Helper to generate random values
const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randomChoice = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// Generate mock cameras for a vehicle
const generateCameras = (vehicleId: string): Camera[] => [
  {
    id: `${vehicleId}-cam-front`,
    label: 'Front Camera',
    position: 'front',
    streamUrl: '/mock-stream/front',
    privacyShieldEnabled: true,
    recording: true,
    status: 'online',
  },
  {
    id: `${vehicleId}-cam-down`,
    label: 'Down Camera',
    position: 'down',
    streamUrl: '/mock-stream/down',
    privacyShieldEnabled: true,
    recording: true,
    status: 'online',
  },
  {
    id: `${vehicleId}-cam-left`,
    label: 'Left Camera',
    position: 'left',
    streamUrl: '/mock-stream/left',
    privacyShieldEnabled: true,
    recording: false,
    status: 'online',
  },
  {
    id: `${vehicleId}-cam-right`,
    label: 'Right Camera',
    position: 'right',
    streamUrl: '/mock-stream/right',
    privacyShieldEnabled: true,
    recording: false,
    status: 'online',
  },
  {
    id: `${vehicleId}-cam-rear`,
    label: 'Rear Camera',
    position: 'rear',
    streamUrl: '/mock-stream/rear',
    privacyShieldEnabled: true,
    recording: false,
    status: 'online',
  },
  {
    id: `${vehicleId}-cam-top`,
    label: 'Top Camera',
    position: 'top',
    streamUrl: '/mock-stream/top',
    privacyShieldEnabled: true,
    recording: false,
    status: 'online',
  },
];

// Generate a single mock vehicle
const generateVehicle = (index: number): OHTVehicle => {
  const id = `OHT-${String(index).padStart(2, '0')}`;
  const statuses: OHTStatus[] = ['active', 'active', 'active', 'idle', 'idle', 'warning', 'critical'];
  const status = randomChoice(statuses);

  const stateByStatus: Record<OHTStatus, OperationalState[]> = {
    active: ['moving', 'loading', 'unloading'],
    idle: ['idle'],
    warning: ['moving', 'idle', 'error'],
    critical: ['error', 'e-stopped'],
    maintenance: ['maintenance'],
    offline: ['idle'],
  };

  const operationalState = randomChoice(stateByStatus[status]);
  const isLoaded = Math.random() > 0.4;
  const bayNumber = Math.floor(randomBetween(1, 24));
  const sectionNumber = Math.floor(randomBetween(1, 8));

  return {
    id,
    name: `Vehicle ${id}`,
    status,
    operationalState,
    position: {
      trackId: `TRACK-${Math.floor(randomBetween(1, 4))}`,
      sectionId: `SECTION-${sectionNumber}`,
      offset: randomBetween(0, 50),
      bay: `Bay ${bayNumber}`,
    },
    telemetry: {
      speed: operationalState === 'moving' ? randomBetween(0.5, 2.5) : 0,
      motorTemperature: status === 'warning' ? randomBetween(75, 85) : randomBetween(45, 65),
      batteryLevel: randomBetween(40, 100),
      gripperStatus: isLoaded ? 'engaged' : 'disengaged',
      loadStatus: isLoaded ? 'loaded' : 'empty',
      payloadWeight: isLoaded ? randomBetween(2, 5) : undefined,
    },
    safety: {
      estopActive: status === 'critical' && operationalState === 'e-stopped',
      collisionSensorTriggered: false,
      zoneOccupancy: status === 'warning' ? 'warning' : 'clear',
      connectionStatus: status === 'offline' ? 'lost' : 'connected',
      lastHeartbeat: Date.now() - randomBetween(0, 1000),
    },
    payload: isLoaded
      ? {
          id: `FOUP-${String(Math.floor(randomBetween(100, 999)))}`,
          type: 'FOUP',
          waferCount: 25,
          lotId: `LOT-2024-${String(Math.floor(randomBetween(1000, 9999)))}`,
        }
      : undefined,
    currentTask: operationalState !== 'idle'
      ? {
          id: `TASK-${Math.floor(randomBetween(1000, 9999))}`,
          type: 'transport',
          from: `ETCH-${Math.floor(randomBetween(1, 8))}`,
          to: `LITH-${Math.floor(randomBetween(1, 6))}`,
          priority: randomChoice(['normal', 'high']),
          status: 'in-progress',
        }
      : undefined,
    taskQueue: [],
    cameras: generateCameras(id),
    lastUpdated: Date.now(),
  };
};

// Generate mock fleet
export const generateMockFleet = (count: number = 12): OHTVehicle[] => {
  return Array.from({ length: count }, (_, i) => generateVehicle(i + 1));
};

// Generate mock alerts
export const generateMockAlerts = (vehicles: OHTVehicle[]): Alert[] => {
  const alerts: Alert[] = [];

  vehicles.forEach((vehicle) => {
    if (vehicle.status === 'critical') {
      alerts.push({
        id: `ALERT-${vehicle.id}-CRIT`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        severity: 'critical',
        category: 'safety',
        code: 'E001',
        title: vehicle.safety.estopActive ? 'Emergency Stop Active' : 'Critical Error',
        message: vehicle.safety.estopActive
          ? `${vehicle.id} emergency stop has been activated. Manual reset required.`
          : `${vehicle.id} is in critical error state. Immediate attention required.`,
        timestamp: Date.now() - randomBetween(0, 300000),
        acknowledged: false,
        resolved: false,
        autoEscalateAfter: 300,
        actions: [
          { id: '1', label: 'Acknowledge', type: 'acknowledge', automatic: false, requiresConfirmation: false },
          { id: '2', label: 'View Vehicle', type: 'notify', automatic: false, requiresConfirmation: false },
        ],
      });
    }

    if (vehicle.status === 'warning') {
      const isMotorTemp = vehicle.telemetry.motorTemperature > 70;
      alerts.push({
        id: `ALERT-${vehicle.id}-WARN`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        severity: 'warning',
        category: isMotorTemp ? 'mechanical' : 'operational',
        code: isMotorTemp ? 'W002' : 'W003',
        title: isMotorTemp ? 'Motor Temperature Warning' : 'Zone Occupancy Warning',
        message: isMotorTemp
          ? `${vehicle.id} motor temperature is ${vehicle.telemetry.motorTemperature.toFixed(1)}°C, approaching threshold.`
          : `${vehicle.id} detected obstruction in travel zone.`,
        timestamp: Date.now() - randomBetween(0, 600000),
        acknowledged: Math.random() > 0.5,
        resolved: false,
        actions: [
          { id: '1', label: 'Acknowledge', type: 'acknowledge', automatic: false, requiresConfirmation: false },
        ],
      });
    }
  });

  // Sort by severity and timestamp
  return alerts.sort((a, b) => {
    const severityOrder: Record<AlertSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
      maintenance: 3,
    };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.timestamp - a.timestamp;
  });
};

// Export default mock data
export const mockFleet = generateMockFleet(12);
export const mockAlerts = generateMockAlerts(mockFleet);
