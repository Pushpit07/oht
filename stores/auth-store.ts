import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Worker, AuthSession, ShiftId } from '@/types/worker';
import { mockWorkers } from '@/lib/mock-workers';

interface AuthState {
  // State
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  error: string | null;

  // Actions
  login: (employeeId: string, pin: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;

  // Getters
  getCurrentWorker: () => Worker | null;
  getCurrentShift: () => ShiftId | null;
}

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      error: null,

      // Actions
      login: async (employeeId: string, pin: string) => {
        set({ isLoading: true, error: null });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Find worker by employee ID
        const worker = mockWorkers.find(
          (w) => w.employeeId.toLowerCase() === employeeId.toLowerCase()
        );

        if (!worker) {
          set({ error: 'Employee ID not found', isLoading: false });
          return false;
        }

        if (worker.pin !== pin) {
          set({ error: 'Invalid PIN', isLoading: false });
          return false;
        }

        const now = Date.now();
        const session: AuthSession = {
          worker: {
            ...worker,
            lastLoginAt: now,
          },
          loginAt: now,
          expiresAt: now + SESSION_DURATION,
        };

        set({
          session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      },

      logout: () => {
        set({
          session: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },

      // Getters
      getCurrentWorker: () => {
        const session = get().session;
        if (!session) return null;

        // Check if session has expired
        if (Date.now() > session.expiresAt) {
          get().logout();
          return null;
        }

        return session.worker;
      },

      getCurrentShift: () => {
        const worker = get().getCurrentWorker();
        return worker?.shiftId ?? null;
      },
    }),
    {
      name: 'oht-auth',
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selector hooks
export const useCurrentWorker = () => {
  const getCurrentWorker = useAuthStore((s) => s.getCurrentWorker);
  return getCurrentWorker();
};

export const useCurrentShift = () => {
  const getCurrentShift = useAuthStore((s) => s.getCurrentShift);
  return getCurrentShift();
};

export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);

export const useHasHydrated = () => useAuthStore((s) => s.hasHydrated);
