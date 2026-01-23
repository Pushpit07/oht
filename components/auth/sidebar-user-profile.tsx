'use client';

import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth-store';
import { getShiftColor, getShiftTimeRange } from '@/lib/shift-utils';
import { cn } from '@/lib/utils';

interface SidebarUserProfileProps {
  collapsed: boolean;
}

export function SidebarUserProfile({ collapsed }: SidebarUserProfileProps) {
  const router = useRouter();
  const { getCurrentWorker, logout } = useAuthStore();
  const worker = getCurrentWorker();

  if (!worker) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const shiftColor = getShiftColor(worker.shiftId);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex size-9 items-center justify-center rounded-full bg-sidebar-accent cursor-default">
              <User className="size-4 text-sidebar-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col gap-1">
            <p className="font-medium">{worker.name}</p>
            <p className="text-xs text-muted-foreground">Shift {worker.shiftId} - {getShiftTimeRange(worker.shiftId)}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-sidebar-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Sign Out</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
          <User className="size-5 text-sidebar-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {worker.name}
          </p>
          <p className="text-xs text-muted-foreground truncate capitalize">
            {worker.role}
          </p>
        </div>
      </div>

      {/* Shift Badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: shiftColor, color: shiftColor }}
        >
          Shift {worker.shiftId}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {getShiftTimeRange(worker.shiftId)}
        </span>
      </div>

      {/* Employee ID */}
      <p className="text-xs text-muted-foreground">
        ID: {worker.employeeId}
      </p>

      {/* Logout Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 size-4" />
        Sign Out
      </Button>
    </div>
  );
}
