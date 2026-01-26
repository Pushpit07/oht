'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { RiRemoteControlLine } from 'react-icons/ri';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { useAuthStore } from '@/stores/auth-store';
import { getCurrentShiftByTime, getShiftName, getShiftTimeRange } from '@/lib/shift-utils';
import Beams from '@/components/Beams';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const currentShift = getCurrentShiftByTime();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If authenticated, don't show login form (will redirect)
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Beams Background */}
      <div className="absolute inset-0">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary">
              <RiRemoteControlLine className="size-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">CamsOnaBox</h1>
              <p className="text-neutral-400">OHT Fleet Management</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Sign In</CardTitle>
              <CardDescription>
                Enter your employee ID and PIN to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          {/* Current Shift Indicator */}
          {currentShift && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
              <Clock className="size-4" />
              <span>
                Current: {getShiftName(currentShift)} ({getShiftTimeRange(currentShift)})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
