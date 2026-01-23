// Worker and Authentication Type Definitions

export type ShiftId = 'A' | 'B' | 'C' | 'D' | 'E';

export type WorkerRole = 'operator' | 'supervisor' | 'admin';

export interface Worker {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: WorkerRole;
  shiftId: ShiftId;
  pin: string;
  createdAt: number;
  lastLoginAt?: number;
}

export interface AuthSession {
  worker: Worker;
  loginAt: number;
  expiresAt: number;
}

export interface LoginCredentials {
  employeeId: string;
  pin: string;
}
