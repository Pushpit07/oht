// Vehicle ID prefix used throughout the application
export const VEHICLE_ID_PREFIX = 'OHT';

// Helper to format a vehicle ID with the prefix
export const formatVehicleId = (number: number | string): string => {
  const num = typeof number === 'string' ? number : String(number).padStart(2, '0');
  return `${VEHICLE_ID_PREFIX}-${num}`;
};

// Helper to extract the number portion from a vehicle ID
export const extractVehicleNumber = (vehicleId: string): string => {
  return vehicleId.replace(`${VEHICLE_ID_PREFIX}-`, '');
};

// Default quick access vehicle IDs
export const QUICK_ACCESS_VEHICLES = [
  formatVehicleId(1),
  formatVehicleId(2),
  formatVehicleId(3),
  formatVehicleId(4),
];
