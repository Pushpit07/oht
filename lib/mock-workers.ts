// Mock Worker Data for Development

import type { Worker, ShiftId } from '@/types/worker';

export const mockWorkers: Worker[] = [
  // Shift A - Morning (6:00 - 14:00)
  {
    id: 'W001',
    employeeId: 'EMP001',
    name: 'John Smith',
    email: 'john.smith@infineon.com',
    role: 'operator',
    shiftId: 'A',
    pin: '1234',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W002',
    employeeId: 'EMP002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@infineon.com',
    role: 'supervisor',
    shiftId: 'A',
    pin: '1234',
    createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W003',
    employeeId: 'EMP003',
    name: 'Mike Chen',
    email: 'mike.chen@infineon.com',
    role: 'operator',
    shiftId: 'A',
    pin: '1234',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },

  // Shift B - Afternoon (14:00 - 22:00)
  {
    id: 'W004',
    employeeId: 'EMP004',
    name: 'Emily Davis',
    email: 'emily.davis@infineon.com',
    role: 'operator',
    shiftId: 'B',
    pin: '1234',
    createdAt: Date.now() - 80 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W005',
    employeeId: 'EMP005',
    name: 'Robert Wilson',
    email: 'robert.wilson@infineon.com',
    role: 'supervisor',
    shiftId: 'B',
    pin: '1234',
    createdAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W006',
    employeeId: 'EMP006',
    name: 'Lisa Martinez',
    email: 'lisa.martinez@infineon.com',
    role: 'operator',
    shiftId: 'B',
    pin: '1234',
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },

  // Shift C - Night (22:00 - 6:00)
  {
    id: 'W007',
    employeeId: 'EMP007',
    name: 'David Brown',
    email: 'david.brown@infineon.com',
    role: 'operator',
    shiftId: 'C',
    pin: '1234',
    createdAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W008',
    employeeId: 'EMP008',
    name: 'Jennifer Taylor',
    email: 'jennifer.taylor@infineon.com',
    role: 'supervisor',
    shiftId: 'C',
    pin: '1234',
    createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W009',
    employeeId: 'EMP009',
    name: 'Chris Anderson',
    email: 'chris.anderson@infineon.com',
    role: 'operator',
    shiftId: 'C',
    pin: '1234',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },

  // Shift D - Flex A (8:00 - 16:00)
  {
    id: 'W010',
    employeeId: 'EMP010',
    name: 'Amanda Lee',
    email: 'amanda.lee@infineon.com',
    role: 'operator',
    shiftId: 'D',
    pin: '1234',
    createdAt: Date.now() - 70 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W011',
    employeeId: 'EMP011',
    name: 'Kevin Garcia',
    email: 'kevin.garcia@infineon.com',
    role: 'operator',
    shiftId: 'D',
    pin: '1234',
    createdAt: Date.now() - 55 * 24 * 60 * 60 * 1000,
  },

  // Shift E - Flex B (12:00 - 20:00)
  {
    id: 'W012',
    employeeId: 'EMP012',
    name: 'Michelle Rodriguez',
    email: 'michelle.rodriguez@infineon.com',
    role: 'operator',
    shiftId: 'E',
    pin: '1234',
    createdAt: Date.now() - 85 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W013',
    employeeId: 'EMP013',
    name: 'James Thompson',
    email: 'james.thompson@infineon.com',
    role: 'supervisor',
    shiftId: 'E',
    pin: '1234',
    createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'W014',
    employeeId: 'EMP014',
    name: 'Nicole White',
    email: 'nicole.white@infineon.com',
    role: 'operator',
    shiftId: 'E',
    pin: '1234',
    createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
  },

  // Admin user
  {
    id: 'W015',
    employeeId: 'ADMIN',
    name: 'System Admin',
    email: 'admin@infineon.com',
    role: 'admin',
    shiftId: 'A',
    pin: '0000',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
  },
];

export const getWorkerById = (id: string): Worker | undefined => {
  return mockWorkers.find((w) => w.id === id);
};

export const getWorkersByShift = (shiftId: ShiftId): Worker[] => {
  return mockWorkers.filter((w) => w.shiftId === shiftId);
};
