// OHT (Overhead Hoist Transport) Type Definitions

export type OHTStatus = 'active' | 'idle' | 'warning' | 'critical' | 'maintenance' | 'offline';

export type OperationalState =
  | 'idle'
  | 'moving'
  | 'loading'
  | 'unloading'
  | 'error'
  | 'maintenance'
  | 'e-stopped';

export type GripperStatus = 'engaged' | 'disengaged' | 'error';

export type LoadStatus = 'empty' | 'loaded';

export interface Position {
  trackId: string;
  sectionId: string;
  offset: number; // meters from section start
  bay?: string;
}

export interface Telemetry {
  speed: number; // m/s
  motorTemperature: number; // Celsius
  batteryLevel: number; // 0-100
  gripperStatus: GripperStatus;
  loadStatus: LoadStatus;
  payloadWeight?: number; // kg
}

export interface SafetyStatus {
  estopActive: boolean;
  collisionSensorTriggered: boolean;
  zoneOccupancy: 'clear' | 'warning' | 'blocked';
  connectionStatus: 'connected' | 'degraded' | 'lost';
  lastHeartbeat: number; // timestamp
}

export interface Payload {
  id: string;
  type: 'FOUP' | 'SMIF' | 'other';
  waferCount?: number;
  lotId?: string;
}

export interface Task {
  id: string;
  type: 'transport' | 'pickup' | 'delivery' | 'idle';
  from?: string;
  to?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'queued' | 'in-progress' | 'completed' | 'failed';
}

export type CameraPosition = 'front' | 'down' | 'left' | 'right' | 'rear' | 'top';

export interface Camera {
  id: string;
  label: string;
  position: CameraPosition;
  streamUrl?: string;
  privacyShieldEnabled: boolean;
  recording: boolean;
  status: 'online' | 'offline' | 'error';
}

export interface OHTVehicle {
  id: string;
  name: string;
  status: OHTStatus;
  operationalState: OperationalState;
  position: Position;
  telemetry: Telemetry;
  safety: SafetyStatus;
  payload?: Payload;
  currentTask?: Task;
  taskQueue: Task[];
  cameras: Camera[];
  lastUpdated: number;
}

export interface FleetSummary {
  total: number;
  active: number;
  idle: number;
  warning: number;
  critical: number;
  offline: number;
}

// View mode for switching between Quick (2 cameras) and Full (4-6 cameras) view
export type ViewMode = 'quick' | 'full';

// Control command types
export type ControlCommand =
  | 'estop'
  | 'pause'
  | 'resume'
  | 'reset'
  | 'home'
  | 'manual-forward'
  | 'manual-reverse'
  | 'manual-stop'
  | 'gripper-open'
  | 'gripper-close';

export interface ControlRequest {
  vehicleId: string;
  command: ControlCommand;
  operatorId: string;
  reason?: string;
  parameters?: Record<string, unknown>;
}
