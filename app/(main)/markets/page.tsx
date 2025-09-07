'use client';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useMemo } from 'react';
import { useMarketsColumns } from './markets-columns';
import { useRouter } from 'nextjs-toploader/app';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { tokenConvert } from '@/hooks/mutations/use-trade-quote';
import Image from 'next/image';
import { MarketsPageSkeleton } from '@/components/skeletons/markets-page-skeleton';

// Dynamic imports with Next.js - using content-aware skeletons
const DataTable = dynamic(
  () => import('../x-assets/data-table').then(mod => ({ default: mod.DataTable })),
  {
    loading: () => (
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
    ),
    ssr: false,
  }
);

const PriceDisplay = dynamic(
  () => import('./price-display').then(mod => ({ default: mod.PriceDisplay })),
  {
    loading: () => <Skeleton className="h-4 w-16" />,
    ssr: false,
  }
);

const PriceChangeDisplay = dynamic(
  () => import('./price-change-display').then(mod => ({ default: mod.PriceChangeDisplay })),
  {
    loading: () => <Skeleton className="h-3 w-12" />,
    ssr: false,
  }
);

const AnalyticsCard = dynamic(
  () => import('./analytics-card').then(mod => ({ default: mod.AnalyticsCard })),
  {
    loading: () => (
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
    ),
    ssr: false,
  }
);

export default function MarketsPage() {
  const { allTokens = [] } = useTokenSwapStore();
  const columns = useMarketsColumns();

  const router = useRouter();

  const tableData = useMemo(
    () =>
      allTokens?.map(tokenPair => ({
        tokenName: tokenConvert[tokenPair.TokenB.Name as keyof typeof tokenConvert],
        tokenSymbol: tokenPair.TokenB.Name,
        address: tokenPair.TokenB.Address,
        image: `/images/tokens/${tokenPair.TokenB.Name}.png`,
      })) || [],
    [allTokens]
  );

  return (
    <div className="flex h-full w-full max-w-5xl flex-col items-stretch gap-2 p-2 md:py-12">
      <AnalyticsCard />

      <Card className="p-4">
        <section className="flex h-full flex-col justify-center">
          <h2 className="text-lg font-semibold">Markets</h2>
          <p className="text-sm text-muted-foreground">
            Explore available xAssets and start trading with ease.
          </p>
        </section>
      </Card>
      <div className="flex flex-col gap-2 pb-[4.5rem] md:hidden">
        {tableData.length ? (
          tableData.map((row, idx) => (
            <Card key={row.address || idx} className="flex flex-col gap-2 p-4">
              <div className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={row.image}
                    alt={row.tokenSymbol}
                    className="h-10 w-10"
                    width={40}
                    height={40}
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">{row.tokenName}</span>
                    <span className="text-xs text-muted-foreground">{row.tokenSymbol}</span>
                  </div>
                </div>
                {/* <div className="mt-2 flex items-center gap-2">
                    <SmallPriceChart tokenName={row.tokenName} />
                  </div> */}
                <div className="flex flex-col items-end gap-1">
                  <PriceDisplay tokenSymbol={row.tokenSymbol} className="text-base font-semibold" />
                  <PriceChangeDisplay tokenSymbol={row.tokenSymbol} className="text-xs" />
                </div>
              </div>

              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => router.push(`/x-assets?selected-token=${row.address}`)}
              >
                Trade
              </Button>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground">No results.</div>
        )}
      </div>
      <Card className="hidden py-4 md:block">
        <DataTable columns={columns as any} data={tableData} />
      </Card>
    </div>
  );
}
