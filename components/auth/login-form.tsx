'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, clearError } = useAuthStore();
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(employeeId, pin);
    if (success) {
      router.push('/dashboard');
    } else {
      const errorMessage = useAuthStore.getState().error;
      if (errorMessage) {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input
          id="employeeId"
          type="text"
          placeholder="e.g., EMP001"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pin">PIN</Label>
        <Input
          id="pin"
          type="password"
          placeholder="Enter your PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
          maxLength={6}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="mr-2 size-4" />
            Sign In
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Demo credentials: EMP001 / 1234
      </p>
    </form>
  );
}
