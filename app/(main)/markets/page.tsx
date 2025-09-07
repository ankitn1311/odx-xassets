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

// Dynamic imports with Next.js
const DataTable = dynamic(
  () => import('../x-assets/data-table').then(mod => ({ default: mod.DataTable })),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
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
    loading: () => <Skeleton className="h-32 w-full" />,
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
