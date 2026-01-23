'use client';

import { useEffect, useState } from 'react';
import { Search, AlertTriangle, AlertOctagon, Check, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { AlertList } from '@/components/dashboard/alerts/alert-list';
import { useAlertsStore } from '@/stores/alerts-store';
import { useAuthStore } from '@/stores/auth-store';
import { mockAlerts } from '@/lib/mock-data';
import type { AlertSeverity } from '@/types/alert';

type FilterTab = 'all' | 'unacknowledged' | 'acknowledged' | 'resolved';

export default function AlertsPage() {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const setAlerts = useAlertsStore((s) => s.setAlerts);
  const alerts = useAlertsStore((s) => s.alerts);
  const activeAlerts = useAlertsStore((s) => s.activeAlerts);
  const acknowledgeAlert = useAlertsStore((s) => s.acknowledgeAlert);
  const resolveAlert = useAlertsStore((s) => s.resolveAlert);
  const unacknowledgedCount = useAlertsStore((s) => s.unacknowledgedCount);
  const criticalCount = useAlertsStore((s) => s.criticalCount);
  const warningCount = useAlertsStore((s) => s.warningCount);

  const getCurrentWorker = useAuthStore((s) => s.getCurrentWorker);
  const currentWorker = getCurrentWorker();

  useEffect(() => {
    setAlerts(mockAlerts);
  }, [setAlerts]);

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter((alert) => {
    // Tab filter
    if (filterTab === 'unacknowledged' && (alert.acknowledged || alert.resolved)) {
      return false;
    }
    if (filterTab === 'acknowledged' && (!alert.acknowledged || alert.resolved)) {
      return false;
    }
    if (filterTab === 'resolved' && !alert.resolved) {
      return false;
    }

    // Severity filter
    if (severityFilter !== 'all' && alert.severity !== severityFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alert.vehicleId.toLowerCase().includes(query) ||
        alert.title.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id, currentWorker?.id ?? 'unknown', currentWorker?.shiftId);
  };

  const handleResolve = (id: string) => {
    resolveAlert(id, currentWorker?.id, currentWorker?.shiftId);
  };

  const handleAcknowledgeAll = () => {
    alerts
      .filter((a) => !a.acknowledged && !a.resolved)
      .forEach((a) => acknowledgeAlert(a.id, currentWorker?.id ?? 'unknown', currentWorker?.shiftId));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alert Center</h1>
          <p className="text-muted-foreground">
            Manage and acknowledge system alerts
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleAcknowledgeAll}
          disabled={unacknowledgedCount === 0}
        >
          <Check className="mr-2 size-4" />
          Acknowledge All ({unacknowledgedCount})
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertOctagon className="size-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertTriangle className="size-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold">{warningCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-orange-500/10">
              <Clock className="size-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unacknowledged</p>
              <p className="text-2xl font-bold">{unacknowledgedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
              <Check className="size-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold">{activeAlerts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Tabs
          value={filterTab}
          onValueChange={(v) => setFilterTab(v as FilterTab)}
        >
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unacknowledged">
              Unacknowledged
              {unacknowledgedCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unacknowledgedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={severityFilter}
          onValueChange={(v) => setSeverityFilter(v as AlertSeverity | 'all')}
        >
          <TabsList>
            <TabsTrigger value="all">All Severity</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Alert List */}
      <AlertList
        alerts={filteredAlerts}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}
