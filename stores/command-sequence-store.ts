import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  SequenceExecution,
  SequenceExecutionStatus,
  CommandStepStatus,
  SequenceExecutionResult,
} from '@/types/command-sequence';

interface CommandSequenceState {
  // Current execution state
  currentExecution: SequenceExecution | null;
  executionHistory: SequenceExecutionResult[];

  // Actions
  startExecution: (sequenceId: string, vehicleId: string, totalSteps: number) => void;
  updateStepStatus: (stepId: string, status: CommandStepStatus) => void;
  advanceStep: () => void;
  completeExecution: (success: boolean, error?: string) => void;
  cancelExecution: () => void;
  resetExecution: () => void;

  // Getters
  isExecuting: () => boolean;
  getStepStatus: (stepId: string) => CommandStepStatus;
}

export const useCommandSequenceStore = create<CommandSequenceState>()(
  subscribeWithSelector((set, get) => ({
    currentExecution: null,
    executionHistory: [],

    startExecution: (sequenceId, vehicleId, totalSteps) => {
      const stepStatuses = new Map<string, CommandStepStatus>();
      set({
        currentExecution: {
          sequenceId,
          vehicleId,
          status: 'executing',
          currentStepIndex: 0,
          stepStatuses,
          startedAt: Date.now(),
        },
      });
    },

    updateStepStatus: (stepId, status) => {
      set((state) => {
        if (!state.currentExecution) return state;
        const stepStatuses = new Map(state.currentExecution.stepStatuses);
        stepStatuses.set(stepId, status);
        return {
          currentExecution: {
            ...state.currentExecution,
            stepStatuses,
          },
        };
      });
    },

    advanceStep: () => {
      set((state) => {
        if (!state.currentExecution) return state;
        return {
          currentExecution: {
            ...state.currentExecution,
            currentStepIndex: state.currentExecution.currentStepIndex + 1,
          },
        };
      });
    },

    completeExecution: (success, error) => {
      const { currentExecution } = get();
      if (!currentExecution) return;

      const result: SequenceExecutionResult = {
        success,
        sequenceId: currentExecution.sequenceId,
        vehicleId: currentExecution.vehicleId,
        completedSteps: currentExecution.currentStepIndex,
        totalSteps: currentExecution.stepStatuses.size,
        error,
        duration: Date.now() - (currentExecution.startedAt || Date.now()),
      };

      set((state) => ({
        currentExecution: {
          ...state.currentExecution!,
          status: success ? 'completed' : 'failed',
          completedAt: Date.now(),
          error,
        },
        executionHistory: [result, ...state.executionHistory].slice(0, 50),
      }));
    },

    cancelExecution: () => {
      set((state) => ({
        currentExecution: state.currentExecution
          ? { ...state.currentExecution, status: 'cancelled' as SequenceExecutionStatus }
          : null,
      }));
    },

    resetExecution: () => {
      set({ currentExecution: null });
    },

    isExecuting: () => {
      const { currentExecution } = get();
      return currentExecution?.status === 'executing';
    },

    getStepStatus: (stepId) => {
      const { currentExecution } = get();
      return currentExecution?.stepStatuses.get(stepId) || 'pending';
    },
  }))
);

// Selector hooks
export const useCurrentExecution = () =>
  useCommandSequenceStore((s) => s.currentExecution);

export const useIsExecuting = () => {
  const execution = useCommandSequenceStore((s) => s.currentExecution);
  return execution?.status === 'executing';
};
