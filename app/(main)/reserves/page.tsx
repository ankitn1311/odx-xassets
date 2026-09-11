'use client';
import dynamic from 'next/dynamic';
import { ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ReservesTable = dynamic(
  () => import('./reservers-table').then(mod => ({ default: mod.ReservesTable })),
  {
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    ),
    ssr: false,
  }
);

export default function ReservesPage() {
  return (
    <div className="flex h-full w-full max-w-6xl flex-col items-stretch gap-4 px-4 py-4 md:py-8">
      <header className="flex flex-col gap-4 px-1 pt-2 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium tracking-[-0.02em]">Proof of reserves</h1>
          <p className="max-w-[640px] text-sm text-muted-foreground">
            Every xAsset is a receipt for an asset held in custody. Units minted onchain are
            shown for each one.
          </p>
        </div>
        <span className="inline-flex h-9 items-center gap-1.5 self-start rounded-lg bg-secondary px-3 text-sm">
          <ShieldCheck className="h-4 w-4 text-success" />
          Custodied by Safeheron
        </span>
      </header>
      <ReservesTable />
    </div>
  );
}
