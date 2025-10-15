'use client';
import { Card } from '@/components/ui/card';
import { TradesTable } from './data-table';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function ExplorerPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['trades', 'explorer'] });
    setIsRefreshing(false);
  };

  return (
    <div className="flex h-full w-full max-w-5xl flex-col items-stretch gap-2 p-2 md:py-12">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <section className="flex h-full flex-col justify-center">
            <h2 className="text-lg font-semibold">Explorer</h2>
            <p className="text-sm text-muted-foreground">
              View recent trades taking place on the platform.
            </p>
          </section>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isRefreshing}
            isLoading={isRefreshing}
          >
            <RefreshCwIcon />
          </Button>
        </div>
      </Card>
      <TradesTable type="explorer" />
    </div>
  );
}
