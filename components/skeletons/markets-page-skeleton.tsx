import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MarketsPageSkeleton() {
  return (
    <div className="flex h-full w-full max-w-5xl flex-col items-stretch gap-2 p-2 md:py-12">
      {/* Analytics Card Skeleton */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      </Card>

      {/* Markets Header Card */}
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center">
          <Skeleton className="mb-2 h-6 w-20" />
          <Skeleton className="h-4 w-64" />
        </section>
      </Card>

      {/* Mobile Cards Skeleton */}
      <div className="flex flex-col gap-2 pb-[4.5rem] md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-2 p-4">
            <div className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="mt-4 h-10 w-full" />
          </Card>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <Card className="hidden py-4 md:block">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 px-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Table Rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-3" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
