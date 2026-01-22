'use client';

import { useEffect } from 'react';
import { AlertTriangle, AlertOctagon, Info, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAlertsStore } from '@/stores/alerts-store';
import { mockAlerts } from '@/lib/mock-data';
import type { Alert, AlertSeverity } from '@/types/alert';

interface VehicleAlertsPanelProps {
  vehicleId: string;
}

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  critical: { icon: AlertOctagon, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  maintenance: { icon: Clock, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
};

function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

function AlertItem({ alert }: { alert: Alert }) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-start gap-3 rounded-lg p-3', config.bgColor)}>
      <div className={cn('mt-0.5', config.color)}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{alert.title}</span>
          <Badge variant="outline" className="text-xs shrink-0">
            {alert.code}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {alert.message}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>{formatTimestamp(alert.timestamp)}</span>
          {alert.acknowledged && (
            <Badge variant="secondary" className="text-xs">
              Acknowledged
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function VehicleAlertsPanel({ vehicleId }: VehicleAlertsPanelProps) {
  const setAlerts = useAlertsStore((s) => s.setAlerts);
  const alerts = useAlertsStore((s) => s.alerts);

  // Initialize alerts if not already loaded
  useEffect(() => {
    if (alerts.length === 0) {
      setAlerts(mockAlerts);
    }
  }, [alerts.length, setAlerts]);

  // Get alerts for this vehicle first, sorted by timestamp (most recent first)
  const vehicleSpecificAlerts = alerts
    .filter((a) => a.vehicleId === vehicleId)
    .sort((a, b) => b.timestamp - a.timestamp);

  // If we have fewer than 2 vehicle-specific alerts, supplement with other recent alerts
  let vehicleAlerts = vehicleSpecificAlerts.slice(0, 3);

  if (vehicleAlerts.length < 2) {
    const otherAlerts = alerts
      .filter((a) => a.vehicleId !== vehicleId)
      .sort((a, b) => b.timestamp - a.timestamp);

    const needed = Math.min(3, 2 + (3 - vehicleAlerts.length)) - vehicleAlerts.length;
    const supplementalAlerts = otherAlerts.slice(0, needed);
    vehicleAlerts = [...vehicleAlerts, ...supplementalAlerts].slice(0, 3);
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Recent Alerts</span>
          {vehicleAlerts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {vehicleAlerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vehicleAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10 mb-2">
              <Info className="size-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">No recent alerts</p>
            <p className="text-xs text-muted-foreground mt-1">This vehicle is operating normally</p>
          </div>
        ) : (
          <div className="space-y-2">
            {vehicleAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
