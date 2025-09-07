import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ReservesPageSkeleton() {
  return (
    <div className="flex h-full w-full max-w-5xl flex-col items-stretch gap-2 p-2 md:py-12">
      {/* Reserves Header Card */}
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center">
          <Skeleton className="mb-2 h-6 w-20" />
          <Skeleton className="h-4 w-96" />
        </section>
      </Card>

      {/* Reserves Table Skeleton */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 border-b py-3 last:border-b-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
