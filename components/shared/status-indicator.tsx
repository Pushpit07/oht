'use client';

import { cn } from '@/lib/utils';
import type { OHTStatus, OperationalState } from '@/types/oht';

interface StatusIndicatorProps {
  status: OHTStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<OHTStatus, { color: string; label: string; pulse?: boolean }> = {
  active: { color: 'bg-green-500', label: 'Active' },
  idle: { color: 'bg-blue-500', label: 'Idle' },
  warning: { color: 'bg-yellow-500', label: 'Warning', pulse: true },
  critical: { color: 'bg-red-500', label: 'Critical', pulse: true },
  maintenance: { color: 'bg-purple-500', label: 'Maintenance' },
  offline: { color: 'bg-gray-500', label: 'Offline' },
};

const sizeConfig = {
  sm: 'size-2',
  md: 'size-3',
  lg: 'size-4',
};

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'rounded-full',
          config.color,
          sizeConfig[size],
          config.pulse && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}

interface OperationalStateIndicatorProps {
  state: OperationalState;
  className?: string;
}

const operationalStateConfig: Record<OperationalState, { icon: string; label: string }> = {
  idle: { icon: '⏸', label: 'Idle' },
  moving: { icon: '▶', label: 'Moving' },
  loading: { icon: '⬇', label: 'Loading' },
  unloading: { icon: '⬆', label: 'Unloading' },
  error: { icon: '⚠', label: 'Error' },
  maintenance: { icon: '🔧', label: 'Maintenance' },
  'e-stopped': { icon: '🛑', label: 'E-Stopped' },
};

export function OperationalStateIndicator({
  state,
  className,
}: OperationalStateIndicatorProps) {
  const config = operationalStateConfig[state];

  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      {config.label}
    </span>
  );
}
