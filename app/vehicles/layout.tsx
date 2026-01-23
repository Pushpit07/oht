'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Map,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  BarChart3,
} from 'lucide-react';
import { RiRemoteControlLine } from 'react-icons/ri';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertBanner } from '@/components/dashboard/alerts/alert-banner';
import { SidebarUserProfile } from '@/components/auth/sidebar-user-profile';
import { useAlertsStore } from '@/stores/alerts-store';
import { useAuthStore } from '@/stores/auth-store';

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
    name: 'Shift Performance',
    href: '/dashboard/shift-performance',
    icon: BarChart3,
  },
  {
    name: 'Search',
    href: '/dashboard/search',
    icon: Search,
  },
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
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const unacknowledgedCount = useAlertsStore((s) => s.unacknowledgedCount);
  const criticalCount = useAlertsStore((s) => s.criticalCount);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Redirect to login if not authenticated (only after hydration)
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show loading while hydrating or if not authenticated
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            'flex flex-col border-r border-border bg-sidebar transition-all duration-300 overflow-visible',
            collapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            {!collapsed && (
              <Link href="/" className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <RiRemoteControlLine className="size-5 text-primary-foreground" />
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
          <ScrollArea className="flex-1 py-4 overflow-visible">
            <nav className="space-y-1 px-2 overflow-visible">
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
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative overflow-visible',
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
                          collapsed && 'absolute -right-0.5 top-0 size-4 p-0 flex items-center justify-center text-[10px]'
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

          {/* Footer - Settings */}
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

          {/* User Profile */}
          <div className="border-t border-border">
            <SidebarUserProfile collapsed={collapsed} />
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
