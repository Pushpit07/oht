import type { CommandSequence } from '@/types/command-sequence';

export const COMMAND_SEQUENCES: CommandSequence[] = [
  {
    id: 'prep-maintenance',
    name: 'Prep for Maintenance',
    description:
      'Safely prepares the vehicle for hands-on maintenance by stopping all movement, opening the gripper, and clearing errors.',
    category: 'maintenance',
    severity: 'high',
    icon: 'Wrench',
    estimatedDurationMs: 4500,
    warningMessage:
      'This will stop the vehicle and open the gripper. Ensure no payload is at risk of falling.',
    preconditions: {
      requiresNoPayload: true,
    },
    steps: [
      {
        id: 'pm-1',
        command: 'estop',
        label: 'Activate Emergency Stop',
        description: 'Immediately halts all vehicle movement',
        delayAfterMs: 1000,
        expectedDurationMs: 500,
      },
      {
        id: 'pm-2',
        command: 'gripper-open',
        label: 'Open Gripper',
        description: 'Releases gripper mechanism for inspection',
        delayAfterMs: 1500,
        expectedDurationMs: 1000,
      },
      {
        id: 'pm-3',
        command: 'reset',
        label: 'Reset E-Stop',
        description: 'Clears emergency stop state after gripper operation',
        delayAfterMs: 500,
        expectedDurationMs: 500,
      },
    ],
  },
  {
    id: 'emergency-recovery',
    name: 'Emergency Recovery',
    description:
      'Recovers vehicle from an error state by resetting systems and returning to idle.',
    category: 'recovery',
    severity: 'critical',
    icon: 'AlertTriangle',
    estimatedDurationMs: 3000,
    warningMessage:
      'This will reset all error states. Verify vehicle surroundings are clear before proceeding.',
    steps: [
      {
        id: 'er-1',
        command: 'manual-stop',
        label: 'Stop All Movement',
        description: 'Ensures vehicle is stationary',
        delayAfterMs: 500,
        expectedDurationMs: 200,
      },
      {
        id: 'er-2',
        command: 'reset',
        label: 'Reset Systems',
        description: 'Clears error states and emergency stop',
        delayAfterMs: 1000,
        expectedDurationMs: 500,
      },
      {
        id: 'er-3',
        command: 'pause',
        label: 'Enter Paused State',
        description: 'Vehicle enters safe paused state awaiting operator input',
        delayAfterMs: 500,
        expectedDurationMs: 300,
      },
    ],
  },
  {
    id: 'gripper-cycle-test',
    name: 'Gripper Cycle Test',
    description: 'Tests gripper mechanism by performing a full open-close cycle.',
    category: 'diagnostic',
    severity: 'medium',
    icon: 'Grip',
    estimatedDurationMs: 5000,
    warningMessage: 'Gripper will cycle. Ensure no obstructions in gripper path.',
    preconditions: {
      requiresIdle: true,
      requiresNoPayload: true,
    },
    steps: [
      {
        id: 'gc-1',
        command: 'pause',
        label: 'Pause Operations',
        description: 'Ensure vehicle is stationary for test',
        delayAfterMs: 500,
        expectedDurationMs: 200,
      },
      {
        id: 'gc-2',
        command: 'gripper-open',
        label: 'Open Gripper',
        description: 'Fully open gripper mechanism',
        delayAfterMs: 1500,
        expectedDurationMs: 1000,
      },
      {
        id: 'gc-3',
        command: 'gripper-close',
        label: 'Close Gripper',
        description: 'Fully close gripper mechanism',
        delayAfterMs: 1500,
        expectedDurationMs: 1000,
      },
      {
        id: 'gc-4',
        command: 'resume',
        label: 'Resume Operations',
        description: 'Return to normal operational state',
        delayAfterMs: 500,
        expectedDurationMs: 300,
      },
    ],
  },
  {
    id: 'safe-shutdown',
    name: 'Safe Shutdown',
    description:
      'Prepares vehicle for extended downtime or power-off by returning home and stopping safely.',
    category: 'maintenance',
    severity: 'medium',
    icon: 'Power',
    estimatedDurationMs: 8000,
    warningMessage: 'Vehicle will return to home position and enter shutdown state.',
    preconditions: {
      requiresEstopInactive: true,
    },
    steps: [
      {
        id: 'ss-1',
        command: 'pause',
        label: 'Pause Current Task',
        description: 'Interrupts any active task',
        delayAfterMs: 500,
        expectedDurationMs: 200,
      },
      {
        id: 'ss-2',
        command: 'gripper-open',
        label: 'Release Payload',
        description: 'Opens gripper if payload is held',
        delayAfterMs: 1500,
        skipOnError: true,
        expectedDurationMs: 1000,
      },
      {
        id: 'ss-3',
        command: 'home',
        label: 'Return to Home',
        description: 'Navigate to home/dock position',
        delayAfterMs: 4000,
        expectedDurationMs: 3000,
      },
      {
        id: 'ss-4',
        command: 'estop',
        label: 'Engage Safety Stop',
        description: 'Final safety stop for shutdown',
        delayAfterMs: 500,
        expectedDurationMs: 500,
      },
    ],
  },
  {
    id: 'quick-resume',
    name: 'Quick Resume',
    description:
      'Quickly returns vehicle to operational state from paused or error conditions.',
    category: 'recovery',
    severity: 'low',
    icon: 'PlayCircle',
    estimatedDurationMs: 2000,
    warningMessage: 'Vehicle will resume autonomous operation. Ensure path is clear.',
    preconditions: {
      requiresEstopInactive: true,
    },
    steps: [
      {
        id: 'qr-1',
        command: 'reset',
        label: 'Clear Any Errors',
        description: 'Reset any lingering error states',
        delayAfterMs: 500,
        skipOnError: true,
        expectedDurationMs: 300,
      },
      {
        id: 'qr-2',
        command: 'resume',
        label: 'Resume Operations',
        description: 'Return to active autonomous operation',
        delayAfterMs: 500,
        expectedDurationMs: 300,
      },
    ],
  },
  {
    id: 'calibration-position',
    name: 'Calibration Position',
    description:
      'Moves vehicle to calibration/service position for sensor alignment or inspection.',
    category: 'calibration',
    severity: 'medium',
    icon: 'Crosshair',
    estimatedDurationMs: 6000,
    warningMessage: 'Vehicle will move to calibration position. Ensure area is clear.',
    preconditions: {
      requiresNoPayload: true,
      requiresEstopInactive: true,
    },
    steps: [
      {
        id: 'cp-1',
        command: 'pause',
        label: 'Pause Current Operation',
        description: 'Stop any active tasks',
        delayAfterMs: 500,
        expectedDurationMs: 200,
      },
      {
        id: 'cp-2',
        command: 'gripper-open',
        label: 'Open Gripper',
        description: 'Ensure gripper is in neutral position',
        delayAfterMs: 1000,
        skipOnError: true,
        expectedDurationMs: 800,
      },
      {
        id: 'cp-3',
        command: 'home',
        label: 'Navigate to Calibration Point',
        description: 'Move to designated calibration position',
        delayAfterMs: 3000,
        expectedDurationMs: 2500,
      },
      {
        id: 'cp-4',
        command: 'pause',
        label: 'Hold Position',
        description: 'Maintain position for calibration',
        delayAfterMs: 500,
        expectedDurationMs: 200,
      },
    ],
  },
];

export function getSequenceById(id: string): CommandSequence | undefined {
  return COMMAND_SEQUENCES.find((seq) => seq.id === id);
}

export function getSequencesByCategory(
  category: CommandSequence['category']
): CommandSequence[] {
  return COMMAND_SEQUENCES.filter((seq) => seq.category === category);
}

export function formatDuration(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  return seconds < 60 ? `~${seconds}s` : `~${Math.ceil(seconds / 60)}m`;
}
