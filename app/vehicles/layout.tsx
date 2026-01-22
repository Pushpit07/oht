'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  MonitorPlay,
  Map,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertBanner } from '@/components/dashboard/alerts/alert-banner';
import { useAlertsStore } from '@/stores/alerts-store';

const navigation = [
  {
    name: 'Alerts',
    href: '/dashboard',
    icon: Bell,
  },
  {
    name: 'Fleet Overview',
    href: '/dashboard/fleet-overview',
    icon: LayoutDashboard,
  },
  {
    name: 'Search',
    href: '/dashboard/search',
    icon: Search,
  },
  // {
  //   name: 'Vehicles',
  //   href: '/vehicles',
  //   icon: Truck,
  // },
  // {
  //   name: 'Live View',
  //   href: '/dashboard/live-view',
  //   icon: MonitorPlay,
  // },
  {
    name: 'Track Map',
    href: '/dashboard/track-map',
    icon: Map,
  },
];

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const unacknowledgedCount = useAlertsStore((s) => s.unacknowledgedCount);
  const criticalCount = useAlertsStore((s) => s.criticalCount);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            'flex flex-col border-r border-border bg-sidebar transition-all duration-300',
            collapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            {!collapsed && (
              <Link href="/" className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <Truck className="size-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-sidebar-foreground">
                  Remotify
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-sidebar-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                const showBadge = item.href === '/dashboard' && unacknowledgedCount > 0;

                const navItem = (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                    {showBadge && (
                      <Badge
                        variant={criticalCount > 0 ? 'destructive' : 'default'}
                        className={cn(
                          'ml-auto',
                          collapsed && 'absolute -right-1 -top-1 size-5 p-0 flex items-center justify-center text-xs'
                        )}
                      >
                        {unacknowledgedCount}
                      </Badge>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return navItem;
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors',
                    collapsed && 'justify-center'
                  )}
                >
                  <Settings className="size-5" />
                  {!collapsed && <span>Settings</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>Settings</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Alert Banner */}
          <AlertBanner />

          {/* Page content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
