'use client';
import dynamic from 'next/dynamic';
import { QuoteTimerProvider } from '@/components/x-assets/QuoteTimerContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { XAssetsPageSkeleton } from '@/components/skeletons/x-assets-page-skeleton';

// Dynamic imports with Next.js - using content-aware skeletons
const TokenChart = dynamic(
  () => import('@/components/x-assets/TokenChart').then(mod => ({ default: mod.TokenChart })),
  {
    loading: () => (
      <Card className="flex h-full flex-col justify-between gap-6 bg-card p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex h-64 w-full items-center justify-center">
          <div className="w-full space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-12" />
            ))}
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </Card>
    ),
    ssr: false,
  }
);

const TokenSwapCard = dynamic(
  () => import('@/components/x-assets/TokenSwapCard').then(mod => ({ default: mod.TokenSwapCard })),
  {
    loading: () => (
      <Card className="flex h-full flex-col gap-6 bg-card p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="ml-auto h-8 w-24" />
            </div>
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="ml-auto h-8 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    ),
    ssr: false,
  }
);

const TradesTable = dynamic(
  () => import('../explorer/data-table').then(mod => ({ default: mod.TradesTable })),
  {
    loading: () => (
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 py-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    ),
    ssr: false,
  }
);

// Old skeleton components removed - now using inline content-aware skeletons

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
