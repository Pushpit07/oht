'use client';

import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { getShiftName, getShiftColor } from '@/lib/shift-utils';

export function UserMenu() {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
            <User className="size-4" />
          </div>
          <div className="hidden flex-col items-start text-left md:flex">
            <span className="text-sm font-medium">{worker.name}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {worker.role}
            </span>
          </div>
          <Badge
            variant="outline"
            className="ml-1 hidden md:inline-flex"
            style={{ borderColor: shiftColor, color: shiftColor }}
          >
            Shift {worker.shiftId}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{worker.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {worker.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Badge
            variant="outline"
            className="mr-2"
            style={{ borderColor: shiftColor, color: shiftColor }}
          >
            Shift {worker.shiftId}
          </Badge>
          {getShiftName(worker.shiftId)}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <span className="text-muted-foreground">ID: {worker.employeeId}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
