'use client';
import { Card } from '@/components/ui/card';
import { TradesTable } from './data-table';
import { TradesProvider } from '@/providers/trades-provider';

export default function ExplorerPage() {
  return (
    <div className="flex h-full w-full max-w-5xl flex-col items-stretch gap-2 p-2 md:py-12">
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center">
          <h2 className="text-lg font-semibold">Explorer</h2>
          <p className="text-sm text-muted-foreground">
            Real-time view of ongoing trades happening on the platform. Data updates live via
            WebSocket.
          </p>
        </section>
      </Card>
      <TradesTable />
    </div>
  );
}
