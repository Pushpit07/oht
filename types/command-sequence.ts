import type { ControlCommand } from './oht';

// Execution status for individual commands in a sequence
export type CommandStepStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';

// Overall sequence execution status
export type SequenceExecutionStatus =
  | 'idle'
  | 'confirming'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Severity/risk level of a sequence
export type SequenceSeverity = 'low' | 'medium' | 'high' | 'critical';

// Individual command step within a sequence
export interface CommandStep {
  id: string;
  command: ControlCommand;
  label: string;
  description?: string;
  delayAfterMs?: number;
  skipOnError?: boolean;
  expectedDurationMs?: number;
}

// Pre-configured command sequence definition
export interface CommandSequence {
  id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'recovery' | 'calibration' | 'diagnostic';
  severity: SequenceSeverity;
  icon: string;
  steps: CommandStep[];
  estimatedDurationMs: number;
  warningMessage?: string;
  preconditions?: {
    requiresIdle?: boolean;
    requiresEstopInactive?: boolean;
    requiresNoPayload?: boolean;
  };
}

// Runtime state for an executing sequence
export interface SequenceExecution {
  sequenceId: string;
  vehicleId: string;
  status: SequenceExecutionStatus;
  currentStepIndex: number;
  stepStatuses: Map<string, CommandStepStatus>;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

// Result of a sequence execution
export interface SequenceExecutionResult {
  success: boolean;
  sequenceId: string;
  vehicleId: string;
  completedSteps: number;
  totalSteps: number;
  failedStepId?: string;
  error?: string;
  duration: number;
}
