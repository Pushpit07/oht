'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ShiftPerformance } from '@/types/shift';
import { SHIFT_SCHEDULES } from '@/lib/shift-utils';

interface PerformanceChartProps {
  performances: ShiftPerformance[];
}

export function PerformanceChart({ performances }: PerformanceChartProps) {
  const chartData = SHIFT_SCHEDULES.map((shift) => {
    const perf = performances.find((p) => p.shiftId === shift.id);
    return {
      name: `Shift ${shift.id}`,
      resolved: perf?.alertsResolved ?? 0,
      acknowledged: perf?.alertsAcknowledged ?? 0,
      fill: shift.color,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Comparison</CardTitle>
        <CardDescription>
          Alerts resolved and acknowledged by each shift
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar
                dataKey="resolved"
                name="Resolved"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="acknowledged"
                name="Acknowledged"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
