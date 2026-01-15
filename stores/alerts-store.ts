import { create } from 'zustand';
import type { Alert, AlertSeverity, AlertFilter } from '@/types/alert';

interface AlertsState {
  // Data
  alerts: Alert[];
  activeAlerts: Alert[];
  criticalAlerts: Alert[];

  // Computed counts
  unacknowledgedCount: number;
  criticalCount: number;
  warningCount: number;

  // Filters
  filter: AlertFilter;

  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, data: Partial<Alert>) => void;
  acknowledgeAlert: (id: string, operatorId: string) => void;
  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  setFilter: (filter: Partial<AlertFilter>) => void;
  clearFilter: () => void;

  // Getters
  getFilteredAlerts: () => Alert[];
  getAlertsByVehicle: (vehicleId: string) => Alert[];
  getActiveAlerts: () => Alert[];
}

const defaultFilter: AlertFilter = {
  severities: undefined,
  categories: undefined,
  vehicleIds: undefined,
  acknowledged: undefined,
  resolved: false,
};

const calculateDerivedState = (alerts: Alert[]) => {
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  return {
    activeAlerts,
    criticalAlerts,
    unacknowledgedCount: activeAlerts.filter((a) => !a.acknowledged).length,
    criticalCount: criticalAlerts.length,
    warningCount: activeAlerts.filter((a) => a.severity === 'warning').length,
  };
};

export const useAlertsStore = create<AlertsState>((set, get) => ({
  // Initial state
  alerts: [],
  activeAlerts: [],
  criticalAlerts: [],
  unacknowledgedCount: 0,
  criticalCount: 0,
  warningCount: 0,
  filter: defaultFilter,

  // Actions
  setAlerts: (alerts) => {
    const derived = calculateDerivedState(alerts);
    set({ alerts, ...derived });
  },

  addAlert: (alert) => {
    set((state) => {
      const alerts = [alert, ...state.alerts];
      const derived = calculateDerivedState(alerts);
      return { alerts, ...derived };
    });
  },

  updateAlert: (id, data) => {
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id ? { ...a, ...data } : a
      );
      const derived = calculateDerivedState(alerts);
      return { alerts, ...derived };
    });
  },

  acknowledgeAlert: (id, operatorId) => {
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              acknowledged: true,
              acknowledgedBy: operatorId,
              acknowledgedAt: Date.now(),
            }
          : a
      );
      const derived = calculateDerivedState(alerts);
      return { alerts, ...derived };
    });
  },

  resolveAlert: (id) => {
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id
          ? { ...a, resolved: true, resolvedAt: Date.now() }
          : a
      );
      const derived = calculateDerivedState(alerts);
      return { alerts, ...derived };
    });
  },

  dismissAlert: (id) => {
    set((state) => {
      const alerts = state.alerts.filter((a) => a.id !== id);
      const derived = calculateDerivedState(alerts);
      return { alerts, ...derived };
    });
  },

  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }));
  },

  clearFilter: () => set({ filter: defaultFilter }),

  // Getters
  getFilteredAlerts: () => {
    const { alerts, filter } = get();
    let filtered = [...alerts];

    if (filter.severities && filter.severities.length > 0) {
      filtered = filtered.filter((a) =>
        filter.severities!.includes(a.severity)
      );
    }

    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter((a) =>
        filter.categories!.includes(a.category)
      );
    }

    if (filter.vehicleIds && filter.vehicleIds.length > 0) {
      filtered = filtered.filter((a) =>
        filter.vehicleIds!.includes(a.vehicleId)
      );
    }

    if (filter.acknowledged !== undefined) {
      filtered = filtered.filter((a) => a.acknowledged === filter.acknowledged);
    }

    if (filter.resolved !== undefined) {
      filtered = filtered.filter((a) => a.resolved === filter.resolved);
    }

    if (filter.timeRange) {
      filtered = filtered.filter(
        (a) =>
          a.timestamp >= filter.timeRange!.start &&
          a.timestamp <= filter.timeRange!.end
      );
    }

    return filtered.sort((a, b) => {
      // Sort by severity first, then by timestamp
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
  },

  getAlertsByVehicle: (vehicleId) => {
    return get().alerts.filter((a) => a.vehicleId === vehicleId && !a.resolved);
  },

  getActiveAlerts: () => {
    return get().alerts.filter((a) => !a.resolved);
  },
}));

// Selector hooks
export const useUnacknowledgedCount = () =>
  useAlertsStore((s) => s.unacknowledgedCount);

export const useCriticalAlerts = () =>
  useAlertsStore((s) => s.criticalAlerts);
