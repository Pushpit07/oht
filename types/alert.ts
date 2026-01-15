// Alert Type Definitions

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'maintenance';

export type AlertCategory =
  | 'safety'
  | 'mechanical'
  | 'communication'
  | 'operational'
  | 'environmental';

export interface Alert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  severity: AlertSeverity;
  category: AlertCategory;
  code: string;
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolved: boolean;
  resolvedAt?: number;
  autoEscalateAfter?: number; // seconds
  actions: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'estop' | 'pause' | 'notify' | 'acknowledge' | 'dismiss';
  automatic: boolean;
  requiresConfirmation: boolean;
}

export interface AlertFilter {
  severities?: AlertSeverity[];
  categories?: AlertCategory[];
  vehicleIds?: string[];
  acknowledged?: boolean;
  resolved?: boolean;
  timeRange?: {
    start: number;
    end: number;
  };
}
