'use client';

import { Shield, ShieldAlert, ShieldX, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { SafetyStatus } from '@/types/oht';

interface SafetyBadgeProps {
  safety: SafetyStatus;
  className?: string;
}

export function SafetyBadge({ safety, className }: SafetyBadgeProps) {
  const getStatusConfig = () => {
    if (safety.estopActive) {
      return {
        variant: 'destructive' as const,
        icon: ShieldX,
        label: 'E-STOP Active',
        description: 'Emergency stop is active. Manual reset required.',
      };
    }

    if (safety.collisionSensorTriggered) {
      return {
        variant: 'destructive' as const,
        icon: ShieldAlert,
        label: 'Collision Alert',
        description: 'Collision sensor has been triggered.',
      };
    }

    if (safety.zoneOccupancy === 'blocked') {
      return {
        variant: 'destructive' as const,
        icon: ShieldAlert,
        label: 'Zone Blocked',
        description: 'Travel zone is blocked.',
      };
    }

    if (safety.zoneOccupancy === 'warning') {
      return {
        variant: 'secondary' as const,
        icon: ShieldAlert,
        label: 'Zone Warning',
        description: 'Obstruction detected in travel zone.',
      };
    }

    return {
      variant: 'secondary' as const,
      icon: Shield,
      label: 'Safe',
      description: 'All safety systems nominal.',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={config.variant} className={cn('gap-1', className)}>
          <Icon className="size-3" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface ConnectionBadgeProps {
  status: SafetyStatus['connectionStatus'];
  className?: string;
}

export function ConnectionBadge({ status, className }: ConnectionBadgeProps) {
  const config = {
    connected: {
      variant: 'secondary' as const,
      icon: Wifi,
      label: 'Connected',
      color: 'text-green-500',
    },
    degraded: {
      variant: 'secondary' as const,
      icon: Wifi,
      label: 'Degraded',
      color: 'text-yellow-500',
    },
    lost: {
      variant: 'destructive' as const,
      icon: WifiOff,
      label: 'Disconnected',
      color: 'text-red-500',
    },
  }[status];

  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={config.variant} className={cn('gap-1', className)}>
          <Icon className={cn('size-3', config.color)} />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Connection Status: {config.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
