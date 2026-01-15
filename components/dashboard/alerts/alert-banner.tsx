'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAlertsStore, useCriticalAlerts } from '@/stores/alerts-store';
import { mockAlerts } from '@/lib/mock-data';

export function AlertBanner() {
  const setAlerts = useAlertsStore((s) => s.setAlerts);
  const acknowledgeAlert = useAlertsStore((s) => s.acknowledgeAlert);
  const criticalAlerts = useCriticalAlerts();

  // Initialize with mock alerts
  useEffect(() => {
    setAlerts(mockAlerts);
  }, [setAlerts]);

  // Get the most critical unacknowledged alert
  const topAlert = criticalAlerts.find((a) => !a.acknowledged);

  if (!topAlert) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-sm',
        'bg-destructive text-destructive-foreground',
        'animate-pulse'
      )}
    >
      <AlertTriangle className="size-5 shrink-0" />
      <span className="font-medium">{topAlert.vehicleId}:</span>
      <span className="flex-1 truncate">{topAlert.title}</span>
      <Link
        href={`/vehicles/${topAlert.vehicleId}`}
        className="flex items-center gap-1 font-medium hover:underline"
      >
        View
        <ChevronRight className="size-4" />
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 text-destructive-foreground hover:bg-destructive-foreground/20"
        onClick={() => acknowledgeAlert(topAlert.id, 'operator')}
      >
        <X className="size-4" />
        <span className="sr-only">Acknowledge</span>
      </Button>
    </div>
  );
}
