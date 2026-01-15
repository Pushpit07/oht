'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, AlertOctagon, Info, Wrench, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAlertsStore } from '@/stores/alerts-store';
import type { Alert, AlertSeverity } from '@/types/alert';

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  critical: { icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  maintenance: { icon: Wrench, color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg p-3 transition-colors',
        config.bg,
        !alert.acknowledged && 'ring-1 ring-inset',
        alert.severity === 'critical' && !alert.acknowledged && 'ring-red-500/50',
        alert.severity === 'warning' && !alert.acknowledged && 'ring-yellow-500/50'
      )}
    >
      <Icon className={cn('size-5 shrink-0 mt-0.5', config.color)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/vehicles/${alert.vehicleId}`}
            className="font-medium hover:underline"
          >
            {alert.vehicleId}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{alert.title}</p>
      </div>
      {!alert.acknowledged && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => onAcknowledge(alert.id)}
        >
          <Check className="size-4" />
          <span className="sr-only">Acknowledge</span>
        </Button>
      )}
    </div>
  );
}

export function AlertsPanel() {
  const alerts = useAlertsStore((s) => s.activeAlerts);
  const acknowledgeAlert = useAlertsStore((s) => s.acknowledgeAlert);

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id, 'operator');
  };

  const displayAlerts = alerts.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Active Alerts</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/alerts">
            View All
            <ChevronRight className="ml-1 size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {displayAlerts.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No active alerts
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {displayAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
