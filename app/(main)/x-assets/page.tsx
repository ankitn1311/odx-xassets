'use client';
import dynamic from 'next/dynamic';
import { QuoteTimerProvider } from '@/components/x-assets/QuoteTimerContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Dynamic imports with Next.js (better than React.lazy)
const TokenChart = dynamic(
  () => import('@/components/x-assets/TokenChart').then(mod => ({ default: mod.TokenChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Disable SSR for client-only components
  }
);

const TokenSwapCard = dynamic(
  () => import('@/components/x-assets/TokenSwapCard').then(mod => ({ default: mod.TokenSwapCard })),
  {
    loading: () => <SwapCardSkeleton />,
    ssr: false,
  }
);

const TradesTable = dynamic(
  () => import('../explorer/data-table').then(mod => ({ default: mod.TradesTable })),
  {
    loading: () => <TableSkeleton />,
    ssr: false,
  }
);

// Loading skeleton components
const ChartSkeleton = () => (
  <Card className="flex h-full flex-col justify-between gap-6 bg-card p-6">
    <div className="flex items-center gap-2">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex min-w-0 flex-col">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-1 h-4 w-24" />
      </div>
    </div>
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col items-start">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-1 h-4 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-8 w-12" />
      </div>
    </div>
    <div className="flex-1">
      <Skeleton className="h-64 w-full" />
    </div>
  </Card>
);

const SwapCardSkeleton = () => (
  <Card className="h-full bg-card py-4">
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between px-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="flex-1 px-4">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </Card>
);

const TableSkeleton = () => (
  <Card className="py-4">
    <div className="px-4 pb-4">
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="space-y-4 px-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-12 rounded" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-1 text-right">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default function XAssets() {
  return (
    <QuoteTimerProvider>
      <div className="flex h-full w-full max-w-7xl flex-col items-stretch gap-4 p-2 md:py-12">
        <div className="mx-auto grid w-full gap-4 md:grid-cols-[1fr_400px]">
          <TokenChart />
          <TokenSwapCard />
        </div>
        <TradesTable pageSize={10} type="user" />
      </div>
    </QuoteTimerProvider>
  );
}
