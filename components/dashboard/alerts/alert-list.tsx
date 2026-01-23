'use client';

import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Wrench,
  Check,
  ExternalLink,
  Clock,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Alert, AlertSeverity } from '@/types/alert';

interface AlertListProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof AlertTriangle; color: string; bg: string; badge: string }
> = {
  critical: {
    icon: AlertOctagon,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    badge: 'destructive',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    badge: 'secondary',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    badge: 'secondary',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    badge: 'secondary',
  },
};

export function AlertList({ alerts, onAcknowledge, onResolve }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <Check className="mx-auto size-12 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">No alerts to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-28">Severity</TableHead>
            <TableHead className="w-24">Vehicle</TableHead>
            <TableHead>Alert</TableHead>
            <TableHead className="w-40">Time</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <TableRow
                key={alert.id}
                className={cn(
                  !alert.acknowledged && config.bg,
                  alert.resolved && 'opacity-60'
                )}
              >
                <TableCell>
                  <Icon className={cn('size-5', config.color)} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={config.badge as 'destructive' | 'secondary'}
                    className="capitalize"
                  >
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/vehicles/${alert.vehicleId}`}
                    className="font-medium hover:underline"
                  >
                    {alert.vehicleId}
                  </Link>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {alert.message}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="size-3 text-muted-foreground" />
                    <span title={format(alert.timestamp, 'PPpp')}>
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {alert.resolved ? (
                    <Badge variant="outline" className="text-green-500">
                      Resolved
                    </Badge>
                  ) : alert.acknowledged ? (
                    <Badge variant="outline">Acknowledged</Badge>
                  ) : (
                    <Badge variant="destructive">Unacknowledged</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!alert.acknowledged && !alert.resolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        <Check className="mr-1 size-3" />
                        Ack
                      </Button>
                    )}
                    {!alert.resolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/vehicles/${alert.vehicleId}`}>
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
