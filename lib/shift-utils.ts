// Shift Schedule Definitions and Utilities

import type { ShiftSchedule, ShiftId } from '@/types/shift';

export const SHIFT_SCHEDULES: ShiftSchedule[] = [
  { id: 'A', name: 'Morning', startHour: 6, endHour: 14, color: '#3B82F6' },
  { id: 'B', name: 'Afternoon', startHour: 14, endHour: 22, color: '#10B981' },
  { id: 'C', name: 'Night', startHour: 22, endHour: 6, color: '#8B5CF6' },
  { id: 'D', name: 'Flex A', startHour: 8, endHour: 16, color: '#F59E0B' },
  { id: 'E', name: 'Flex B', startHour: 12, endHour: 20, color: '#EF4444' },
];

export const getShiftById = (id: ShiftId): ShiftSchedule | undefined => {
  return SHIFT_SCHEDULES.find((s) => s.id === id);
};

export const getShiftColor = (id: ShiftId): string => {
  return getShiftById(id)?.color ?? '#6B7280';
};

export const getShiftName = (id: ShiftId): string => {
  const shift = getShiftById(id);
  return shift ? `Shift ${shift.id} - ${shift.name}` : `Shift ${id}`;
};

export const getShiftTimeRange = (id: ShiftId): string => {
  const shift = getShiftById(id);
  if (!shift) return '';

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${period}`;
  };

  return `${formatHour(shift.startHour)} - ${formatHour(shift.endHour)}`;
};

export const getCurrentShiftByTime = (): ShiftId | null => {
  const now = new Date();
  const hour = now.getHours();

  // Check each shift to see if current hour falls within it
  // Priority: A, B, C (main shifts), then D, E (flex shifts)
  for (const shift of SHIFT_SCHEDULES) {
    if (shift.startHour < shift.endHour) {
      // Normal shift (e.g., 6-14)
      if (hour >= shift.startHour && hour < shift.endHour) {
        return shift.id;
      }
    } else {
      // Overnight shift (e.g., 22-6)
      if (hour >= shift.startHour || hour < shift.endHour) {
        return shift.id;
      }
    }
  }

  return 'A'; // Default fallback
};

export const isShiftActive = (shiftId: ShiftId): boolean => {
  const shift = getShiftById(shiftId);
  if (!shift) return false;

  const hour = new Date().getHours();

  if (shift.startHour < shift.endHour) {
    return hour >= shift.startHour && hour < shift.endHour;
  } else {
    return hour >= shift.startHour || hour < shift.endHour;
  }
};

export const getAllShiftIds = (): ShiftId[] => {
  return SHIFT_SCHEDULES.map((s) => s.id);
};
