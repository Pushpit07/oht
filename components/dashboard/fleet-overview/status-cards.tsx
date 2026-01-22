'use client';

import { Truck, Play, Pause, AlertTriangle, AlertOctagon, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FleetSummary } from '@/types/oht';

interface StatusCardsProps {
  summary: FleetSummary;
}

const cardConfig = [
  {
    key: 'total',
    label: 'Total Vehicles',
    icon: Truck,
    color: 'text-foreground',
    bgColor: 'bg-muted',
  },
  {
    key: 'active',
    label: 'Active',
    icon: Play,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    key: 'idle',
    label: 'Idle',
    icon: Pause,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    key: 'warning',
    label: 'Warning',
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    key: 'critical',
    label: 'Critical',
    icon: AlertOctagon,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
] as const;

export function StatusCards({ summary }: StatusCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cardConfig.map((config) => {
        const Icon = config.icon;
        const value = summary[config.key];
        const isAlert = config.key === 'warning' || config.key === 'critical';
        const shouldPulse = isAlert && value > 0;

        return (
          <Card
            key={config.key}
            className={cn(
              'relative overflow-hidden transition-all',
              shouldPulse && 'ring-2 ring-offset-2',
              config.key === 'critical' && value > 0 && 'ring-red-500',
              config.key === 'warning' && value > 0 && 'ring-yellow-500'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                  <p className={cn('text-3xl font-bold', config.color)}>
                    {value}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex size-12 items-center justify-center rounded-full',
                    config.bgColor
                  )}
                >
                  <Icon className={cn('size-6', config.color)} />
                </div>
              </div>
            </CardContent>
            {shouldPulse && (
              <div
                className={cn(
                  'absolute inset-0 animate-pulse',
                  config.key === 'critical' ? 'bg-red-500/5' : 'bg-yellow-500/5'
                )}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}
