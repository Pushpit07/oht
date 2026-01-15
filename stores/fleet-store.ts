import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { OHTVehicle, FleetSummary, ViewMode } from '@/types/oht';

interface FleetState {
  // Data
  vehicles: Map<string, OHTVehicle>;
  vehiclesList: OHTVehicle[];
  selectedVehicleId: string | null;
  viewMode: ViewMode;

  // Computed
  fleetSummary: FleetSummary;

  // Filters
  statusFilter: string[];
  searchQuery: string;

  // Actions
  setVehicles: (vehicles: OHTVehicle[]) => void;
  updateVehicle: (id: string, data: Partial<OHTVehicle>) => void;
  selectVehicle: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setStatusFilter: (statuses: string[]) => void;
  setSearchQuery: (query: string) => void;

  // Computed getters
  getFilteredVehicles: () => OHTVehicle[];
  getVehicleById: (id: string) => OHTVehicle | undefined;
}

const calculateFleetSummary = (vehicles: Map<string, OHTVehicle>): FleetSummary => {
  const summary: FleetSummary = {
    total: 0,
    active: 0,
    idle: 0,
    warning: 0,
    critical: 0,
    offline: 0,
  };

  vehicles.forEach((vehicle) => {
    summary.total++;
    switch (vehicle.status) {
      case 'active':
        summary.active++;
        break;
      case 'idle':
        summary.idle++;
        break;
      case 'warning':
        summary.warning++;
        break;
      case 'critical':
        summary.critical++;
        break;
      case 'offline':
      case 'maintenance':
        summary.offline++;
        break;
    }
  });

  return summary;
};

export const useFleetStore = create<FleetState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    vehicles: new Map(),
    vehiclesList: [],
    selectedVehicleId: null,
    viewMode: 'quick',
    fleetSummary: {
      total: 0,
      active: 0,
      idle: 0,
      warning: 0,
      critical: 0,
      offline: 0,
    },
    statusFilter: [],
    searchQuery: '',

    // Actions
    setVehicles: (vehicles) => {
      const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
      set({
        vehicles: vehicleMap,
        vehiclesList: vehicles,
        fleetSummary: calculateFleetSummary(vehicleMap),
      });
    },

    updateVehicle: (id, data) => {
      set((state) => {
        const vehicles = new Map(state.vehicles);
        const existing = vehicles.get(id);
        if (existing) {
          vehicles.set(id, { ...existing, ...data, lastUpdated: Date.now() });
        }
        const vehiclesList = Array.from(vehicles.values());
        return {
          vehicles,
          vehiclesList,
          fleetSummary: calculateFleetSummary(vehicles),
        };
      });
    },

    selectVehicle: (id) => set({ selectedVehicleId: id }),

    setViewMode: (mode) => set({ viewMode: mode }),

    setStatusFilter: (statuses) => set({ statusFilter: statuses }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    // Computed getters
    getFilteredVehicles: () => {
      const { vehicles, statusFilter, searchQuery } = get();
      let filtered = Array.from(vehicles.values());

      if (statusFilter.length > 0) {
        filtered = filtered.filter((v) => statusFilter.includes(v.status));
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.id.toLowerCase().includes(query) ||
            v.name.toLowerCase().includes(query) ||
            v.position.bay?.toLowerCase().includes(query)
        );
      }

      return filtered;
    },

    getVehicleById: (id) => get().vehicles.get(id),
  }))
);

// Selector hooks for optimized re-renders
export const useSelectedVehicle = () => {
  const selectedId = useFleetStore((s) => s.selectedVehicleId);
  const getVehicle = useFleetStore((s) => s.getVehicleById);
  return selectedId ? getVehicle(selectedId) : undefined;
};

export const useFleetSummary = () => useFleetStore((s) => s.fleetSummary);

export const useViewMode = () => useFleetStore((s) => s.viewMode);
