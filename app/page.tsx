'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Truck, ArrowRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const [ohtId, setOhtId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ohtId.trim()) {
      setError('Please enter an OHT ID');
      return;
    }

    // Normalize the input - add OHT- prefix if not present
    let normalizedId = ohtId.trim().toUpperCase();
    if (!normalizedId.startsWith('OHT-')) {
      // Check if it's just a number
      if (/^\d+$/.test(normalizedId)) {
        normalizedId = `OHT-${normalizedId.padStart(2, '0')}`;
      } else {
        normalizedId = `OHT-${normalizedId}`;
      }
    }

    router.push(`/vehicles/${normalizedId}`);
  };

  const quickAccessVehicles = ['OHT-01', 'OHT-02', 'OHT-03', 'OHT-04'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <Truck className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">OHT Monitor</h1>
              <p className="text-xs text-muted-foreground">Infineon</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 size-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">OHT Control Hub</h2>
            <p className="text-muted-foreground">
              Enter an OHT ID to access its control panel
            </p>
          </div>

          {/* Search Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter OHT ID (e.g., OHT-01 or 01)"
                    value={ohtId}
                    onChange={(e) => {
                      setOhtId(e.target.value);
                      setError('');
                    }}
                    className="pl-12 h-14 text-lg"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full h-12 text-lg">
                  Go to Vehicle
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Quick Access
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickAccessVehicles.map((id) => (
                <Button
                  key={id}
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/vehicles/${id}`)}
                >
                  {id}
                </Button>
              ))}
            </div>
          </div>

          {/* Dashboard Link */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Or go to the full dashboard →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          OHT Monitoring System - Infineon
        </div>
      </footer>
    </div>
  );
}
