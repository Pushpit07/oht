'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { VEHICLE_ID_PREFIX, QUICK_ACCESS_VEHICLES, formatVehicleId } from '@/lib/constants';

export default function SearchPage() {
  const [vehicleId, setVehicleId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!vehicleId.trim()) {
      setError('Please enter a Vehicle ID');
      return;
    }

    // Normalize the input - add prefix if not present
    let normalizedId = vehicleId.trim().toUpperCase();
    const prefix = `${VEHICLE_ID_PREFIX}-`;
    if (!normalizedId.startsWith(prefix)) {
      // Check if it's just a number
      if (/^\d+$/.test(normalizedId)) {
        normalizedId = formatVehicleId(normalizedId);
      } else {
        normalizedId = `${prefix}${normalizedId}`;
      }
    }

    router.push(`/vehicles/${normalizedId}`);
  };

  return (
    <div className="flex h-full min-h-full items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Search Vehicles</h1>
          <p className="text-muted-foreground">
            Enter a Vehicle ID to access its control panel
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
                  placeholder={`Enter Vehicle ID (e.g., ${VEHICLE_ID_PREFIX}-01 or 01)`}
                  value={vehicleId}
                  onChange={(e) => {
                    setVehicleId(e.target.value);
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
            {QUICK_ACCESS_VEHICLES.map((id) => (
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
      </div>
    </div>
  );
}
