import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function XAssetsPageSkeleton() {
  return (
    <div className="flex h-full w-full max-w-7xl flex-col items-stretch gap-4 p-2 md:py-12">
      <div className="mx-auto grid w-full gap-4 md:grid-cols-[1fr_400px]">
        {/* Token Chart Skeleton */}
        <Card className="flex h-full flex-col justify-between gap-6 bg-card p-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Chart Area */}
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

          {/* Chart Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-12" />
              ))}
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </Card>

        {/* Token Swap Card Skeleton */}
        <Card className="flex h-full flex-col gap-6 bg-card p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-6" />
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
          </div>

          {/* Token Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto h-8 w-24" />
              </div>
            </div>

            {/* Swap Arrow */}
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

          {/* Swap Button */}
          <Skeleton className="h-12 w-full" />

          {/* Slippage Settings */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        </Card>
      </div>

      {/* Trades Table Skeleton */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Table Rows */}
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
    </div>
  );
}
